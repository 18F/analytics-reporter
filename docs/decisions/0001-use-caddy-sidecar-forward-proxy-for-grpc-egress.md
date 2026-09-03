---
title: "Use a Caddy sidecar forward proxy for gRPC egress through the cloud.gov egress proxy"
status: "proposed"
date: "2026-09-02"
decision_makers: ["Shelley Nason"]
category: "Deployment and Infrastructure"
nist_controls: ["SC-7", "SC-8", "SC-13", "CM-2", "CM-6", "SR-3", "SR-11"]
impact_level: "moderate"
ato_relevance: "yes-boundary"
risk_treatment: "mitigate"
---

# Use a Caddy sidecar forward proxy for gRPC egress through the cloud.gov egress proxy

## Context and Problem Statement

The `analytics-reporter-consumer` application runs in a cloud.gov space with
public egress removed (`cf unbind-security-group public_networks_egress`, see
`README.md`), so all outbound traffic must traverse the shared
`analytics-egress-proxy`. TLS to that egress proxy is mandated. However, the
consumer's Google Analytics client reaches `analyticsdata.googleapis.com` over
gRPC, and `@grpc/grpc-js` **refuses to use a proxy whose URL scheme is not
plaintext `http:`** — so the application cannot satisfy both constraints
directly. We need a way for gRPC traffic to egress over a TLS-protected hop to
the proxy.

## Decision Drivers

- **Mandated transport encryption to the egress proxy** (SC-8). Plaintext
  `http://` to the proxy is not acceptable, even though the tunnelled payload is
  itself TLS to Google.
- **Boundary protection** (SC-7). The space has no public egress; all traffic
  must route through the authorized proxy, and any configuration that silently
  bypasses it is a boundary-integrity failure.
- **No silent failure modes.** A configuration that appears to work but actually
  bypasses the proxy is worse than one that fails loudly.
- **Minimize added components and supply-chain surface** (SR-3, laziness ladder
  per `CODING_PRACTICES.md` §13.1.1) — prefer no new binary if a library-level
  option exists.
- **Credentials must not leak into logs** (SC-28, AU-3). The proxy handles
  `PROXY_USERNAME`/`PROXY_PASSWORD`.

## Considered Options

1. **Point `grpc-js` directly at the egress proxy over TLS** (`https://` in
   `HTTPS_PROXY`) — no new components.
2. **Use the Google client's REST/HTTP1.1 fallback** (`fallback: true`) so
   requests go through `gaxios`, which supports `https://` proxies — no new
   components.
3. **nginx sidecar as forward proxy** — widely deployed, familiar operationally.
4. **Caddy sidecar forward proxy** (`xcaddy` build with
   `caddyserver/forwardproxy`) — accepts plaintext `CONNECT` on localhost and
   re-originates to the egress proxy over TLS.

## Decision Outcome

Chosen option: **Option 4 — Caddy sidecar forward proxy**, because it is the
only option that satisfies "gRPC requires a plaintext-`http:` `CONNECT` proxy"
and "the hop to the egress proxy must be TLS" simultaneously. The sidecar exists
specifically to perform that scheme translation.

Options 1–3 were each empirically ruled out. The evidence is recorded below
because all three are plausible-looking paths that a future maintainer is likely
to re-attempt.

### Why Option 1 fails

`@grpc/grpc-js` rejects any non-plaintext proxy scheme outright:

```js
// node_modules/@grpc/grpc-js/build/src/http_proxy.js
if (proxyUrl.protocol !== 'http:') {
    log(ERROR, `"${proxyUrl.protocol}" scheme not supported in proxy URI`);
    return {};
}
```

Still present in the current `@grpc/grpc-js` 1.14.4. Note that grpc-js *does*
support proxy **authentication** — it parses userinfo and sends
`Proxy-Authorization: Basic` — so credentials are not the obstacle; only the
scheme is. This is the same wall hit by commit `4f40a5c` ("Use TLS for
connection to egress proxy"), which was reverted in `1bc2593`.

### Why Option 2 fails

`google-gax`'s REST fallback passes its own hardcoded HTTP agent on every
request:

```js
// google-gax/build/src/fallbackServiceStub.js
let agentOption = null;                       // :63
if (isNodeJS()) { ... agentOption = (parsedUrl) => { ... }; }   // :69
...
agent: agentOption || undefined,              // :128
```

and `gaxios` checks `opts.agent` **before** consulting `HTTPS_PROXY`:

```js
// gaxios/build/cjs/src/gaxios.js
if (opts.agent) {
    // don't do any of the following options - use the user-provided agent.
} else if (proxy && this.#urlMayUseProxy(...)) {
    opts.agent = new HttpsProxyAgent(proxy, ...)
}
```

A caller-supplied agent short-circuits proxy handling entirely, so
`fallback: true` **silently bypasses the egress proxy**. Verified live against a
local listener registered as `HTTPS_PROXY`, using the project's current pinned
tree (`@google-analytics/data` 6.1.0 → `google-gax` 5.0.8, per commit `cdd664f`):

```
fallback: true  (REST/HTTP1.1)
  error:     { "error": { "code": 401, "message": "Request had invalid
             authentication credentials. Expected ..." } }
  proxy saw: (nothing — proxy bypassed)

default         (gRPC)
  error:     14 UNAVAILABLE: No connection established...
  proxy saw: CONNECT analyticsdata.googleapis.com:443 HTTP/1.1
```

The REST path returned a real HTTP 401 from Google's servers while the stub
proxy observed zero traffic — proof the request reached
`analyticsdata.googleapis.com` directly. The gRPC path in the same run issued a
correct `CONNECT`, confirming the harness was sound.

This is not fixable by upgrading. The dependency was upgraded from `^4.12.0` to
`^6.1.0` in commit `cdd664f` while this decision was being drafted, and the
behavior is unchanged — the offending code is byte-identical (same lines, same
line numbers) across `google-gax` 5.0.8, 6.0.x, and 6.1.0. The bug lives one
layer below `@google-analytics/data`, so its major-version bumps do not affect
it. Versions checked:

| `@google-analytics/data` | resolved `google-gax` | REST fallback honors proxy? |
|---|---|---|
| 4.12.0 (previous pin) | 4.4.1 | No — `node-fetch` v2, no proxy support at all |
| **6.1.0 (current pin, `cdd664f`)** | **5.0.8** | **No — hardcoded agent (verified live)** |
| 7.0.0 (`latest`) | 6.1.0 | No — hardcoded agent (verified live) |

The previous pin was worse still: `google-gax` 4.4.1 predates `gaxios` entirely
and calls `node-fetch` v2 with no `agent`, and `node-fetch` v2 has no proxy
support whatsoever. The current pin at least routes through `gaxios`, which
*has* proxy support — it is simply short-circuited by the hardcoded agent. That
leaves a plausible upstream fix path (see Follow-Up Work), but nothing
actionable today.

`@google-analytics/data` 7.0.0 was also evaluated and rejected as a remedy: it
resolves `google-gax` ^6.0.0 → 6.1.0, which carries the identical defect. It
additionally declares `engines: { node: ">=22" }`; the project runs Node 22
(`.nvmrc`, `package.json` `engines`), so it is compatible, but it offers no
benefit for this problem.

### Why Option 3 fails

gRPC proxying requires the proxy to implement HTTP `CONNECT`
(`http_proxy.js:209` issues `method: 'CONNECT'`). nginx's `proxy_pass` is a
*reverse* proxy bound to a fixed upstream and has no `CONNECT` support; a
`CONNECT` request returns 405. The `stream` module does not help either — it
forwards blindly to one preconfigured upstream, so it cannot relay the
client-named `CONNECT` target nor perform proxy authentication.
`CONNECT` support exists only via the third-party
`ngx_http_proxy_connect_module`, which requires **recompiling nginx from patched
source** — strictly worse supply-chain posture than a supported `xcaddy` build
for the same capability.

### Implementation

- `cg-egress-proxy/caddy` — vendored `xcaddy` build (see provenance below).
- `cg-egress-proxy/Caddyfile` — listens on a localhost port, `forward_proxy`
  with `upstream https://$PROXY_USERNAME:$PROXY_PASSWORD@$PROXY_FQDN:$PROXY_PORT`.
- `manifest.consumer.yml` — adds `binary_buildpack` alongside
  `nodejs_buildpack` and a `grpc-proxy` sidecar on the `web` process.
- `deploy/consumer.js` — sets `HTTPS_PROXY` / `https_proxy` to
  `http://localhost:<port>` (lowercase form required by `grpc-js`, see
  `http_proxy.js`).

`newrelic.js` intentionally continues to point at the egress proxy directly over
`https://`, because the New Relic agent supports HTTPS proxies natively and does
not need the sidecar.

### Binary provenance

The vendored binary is **byte-identical to `proxy/caddy` at tag `v1.1.1` of
[GSA-TTS/cg-egress-proxy](https://github.com/GSA-TTS/cg-egress-proxy)** — the
cloud.gov egress proxy itself, which is also Caddy + `forwardproxy`. Confirmed by
git blob hash and size:

```
our blob hash:              ba8ed4f8e8ca2c09016958004406100e3478287c
theirs (proxy/caddy@v1.1.1): ba8ed4f8e8ca2c09016958004406100e3478287c
our size:  48234658          theirs: 48234658
```

It is a **custom `xcaddy` build**, not a stock Caddy release — `forward_proxy` is
not in the standard Caddy distribution. Independently extracted from the binary:

| Property | Value |
|---|---|
| Upstream source | `GSA-TTS/cg-egress-proxy` `v1.1.1`, path `proxy/caddy` |
| Git blob hash | `ba8ed4f8e8ca2c09016958004406100e3478287c` |
| Caddy | `caddy/v2@v2.11.4` (current upstream latest at time of writing) |
| Plugin | `caddyserver/forwardproxy@v0.0.0-20260321230143-0aab84dad` |
| Go toolchain | `go1.26.5` |
| Target | ELF 64-bit, x86-64 (`e_machine=62`) — matches `cflinuxfs4` |
| Size | 48,234,658 bytes |
| SHA-256 | `3f6074a3b6c7731bbc57d28cca0bfdb45396dcc5d7fda67b74fadcbdc3a2bc5b` |

Verify a replacement binary with:

```bash
sha256sum cg-egress-proxy/caddy   # must match the SHA-256 above
git hash-object cg-egress-proxy/caddy   # compare to upstream proxy/caddy blob
```

#### Why vendored rather than fetched at deploy time

`GSA-TTS/cg-egress-proxy` releases publish **no binary assets** (`"assets": []`);
the binary lives in their git tree. Fetching would therefore mean either pulling
the full source tarball or a raw file at a pinned ref — neither avoids storing a
48 MB artifact somewhere, it only moves *where*. Vendoring keeps deploys hermetic
and adds no build-time network dependency to clear against CI egress policy.

If this is ever revisited, note that their releases are `"immutable": false` and
git tags are movable, so pinning to a tag is **not** content pinning. A fetch
must pin to a commit SHA or verify the SHA-256 above and fail the build on
mismatch — otherwise a reviewed binary is traded for an unreviewed download.

Note also that `binary_buildpack` does **not** fetch anything — it makes an
already-pushed binary runnable. The binary must be present at `cf push` time
either way. It must have the executable bit set in git (mode `100755`); mode
`100644` causes the sidecar to fail with permission denied.

#### Update trigger

Upstream automates rebuilds of this binary (release notes for `v1.1.0` include
"Update caddy binary for main" by `github-actions[bot]` and "Rebuild caddy for
2.11 branch") and runs `govulncheck` with SARIF upload against it. The repository
also carries `renovate.json` and `.allstar`.

This project's own tooling will **not** detect staleness in this binary:
Dependabot and `@snyk/protect` are npm-ecosystem tools and do not inspect a
checked-in ELF binary. The update signal must therefore come from watching
`GSA-TTS/cg-egress-proxy` releases. See Follow-Up Work.

### Positive Consequences

- TLS is preserved on the hop to the egress proxy, satisfying the mandate.
- gRPC traffic egresses through the authorized proxy; no boundary bypass.
- Google client libraries need no patching or `node_modules` modification.
- Failure mode is loud — if the sidecar is down, connections are refused
  rather than silently routed around the proxy.
- The binary is the same artifact the cloud.gov platform team builds, scans with
  `govulncheck`, and rebuilds automatically — so its maintenance and validation
  are inherited rather than owned by this project.

### Negative Consequences

- Adds a second process to the application container, with its own lifecycle
  and failure mode.
- Vendors a 48 MB binary (~16 MB compressed) into git history, growing the
  repository roughly 40% against the current 39 MB `.git` (`size-pack`
  36.6 MiB). This cost is paid permanently, on every clone, including the
  five `actions/checkout` invocations across `ci.yml` and `deploy.yml`.
- Requires a second buildpack (`binary_buildpack`), increasing deploy
  complexity.
- Credentials transit the sidecar's configuration, so Caddy log verbosity must
  be managed carefully.
- The binary is architecture-specific (x86-64) and must be rebuilt if the
  cloud.gov stack changes.
- **Repurposing risk:** upstream builds `proxy/caddy` for the egress proxy
  *server* role; this project reuses it as a client-side sidecar. The same
  `forward_proxy` capability serves both, so it works today — but the build is
  maintained for a different use case. If upstream ever drops `forwardproxy`
  from their build, this sidecar breaks with no notice. This coupling is
  accepted deliberately in exchange for inheriting their build and scanning.

### Compliance Consequences

- **SC-8 (Transmission Confidentiality)** — satisfied for the app-to-proxy hop.
  Localhost-only plaintext between the app process and its sidecar does not
  leave the container network namespace.
- **SC-7 (Boundary Protection)** — all egress continues through the authorized
  proxy. Requires the existing `cf add-network-policy` on the proxy port.
- **SR-3 / SR-11 (Supply Chain / Component Authenticity)** — a vendored
  third-party binary enters the boundary. Authenticity is established by
  byte-identity with `GSA-TTS/cg-egress-proxy` `v1.1.1` `proxy/caddy` (blob
  `ba8ed4f`) plus the SHA-256 in the provenance table; both MUST be re-verified
  on any replacement. Because the artifact originates from the GSA-TTS platform
  team rather than an arbitrary third party, and is `govulncheck`-scanned
  upstream, the supply-chain posture is stronger than an ad-hoc build — but this
  project still carries no automated staleness detection for it (see Follow-Up
  Work). The binary should be added to SBOM generation.
- **AU-3 (Content of Audit Records)** — Caddy `debug` logging MUST NOT be
  enabled in deployed environments, as the sidecar handles `PROXY_PASSWORD` and
  cloud.gov stdout is forwarded to the log drain.
- **CM-2 / CM-6 (Baseline / Configuration Settings)** — the sidecar and its port
  variable become part of the consumer app's baseline; the port variable name
  must match across `manifest.consumer.yml`, `deploy/consumer.js`,
  `cg-egress-proxy/Caddyfile`, and the deploy workflows.
- **ATO package** — the authorization boundary description should note the
  sidecar as an in-container egress component.

## Follow-Up Work

Tracked separately from this decision:

- **Create the `LOCAL_PROXY_PORT` repository variable.** All four `deploy.yml`
  call sites now reference `${{ vars.LOCAL_PROXY_PORT }}`. If the variable does
  not exist, GitHub renders it as an empty string, `envsubst` produces
  `LOCAL_PROXY_PORT: ` in the manifest, and the app's proxy URL becomes
  `http://localhost:` — a silent runtime failure, not a deploy error. The value
  must be a free localhost port not otherwise used by the app.
- Add `/.idea` to the root `.gitignore`. Note that JetBrains writes its own
  `.idea/.gitignore`, but it covers only `workspace.xml`, `httpRequests/`, and
  `dataSources/` — `misc.xml`, `modules.xml`, `analytics-reporter.iml`, and
  `codeStyles/` remain untracked-and-committable (`git check-ignore -v
  .idea/misc.xml` confirms not ignored).
- **Watch `GSA-TTS/cg-egress-proxy` releases** as the update trigger for the
  vendored binary. This project's Dependabot and `@snyk/protect` are
  npm-ecosystem tools and will never flag a stale ELF binary, so without an
  explicit watch this artifact silently ages. Options: subscribe to release
  notifications, or add a Renovate/Dependabot rule against that repository. On
  each upstream release, re-run the two verification commands in the provenance
  section and update the table.
- Consider filing an upstream issue against `googleapis/gax-nodejs`: the
  hardcoded keepalive agent in `fallbackServiceStub.js` makes the REST transport
  unusable behind a proxy. If accepted upstream, `fallback: true` would become a
  viable way to retire this sidecar entirely. Not actionable in this repository.

Resolved while this decision was in draft:

- ~~Reconcile the proxy port variable name across the four referencing files~~ —
  all four now agree on `LOCAL_PROXY_PORT` (`manifest.consumer.yml:35`,
  `deploy/consumer.js:9`, `cg-egress-proxy/Caddyfile:9`,
  `.github/workflows/deploy.yml:44,75`).
- ~~`deploy.yml` declares `LOCAL_PROXY_PORT` as required but callers omit it~~ —
  all four call sites now pass it: `ci.yml:87,117,147` (dev/staging/production)
  and `manual_deploy_to_dev.yml:20`. Verified by programmatically diffing
  `deploy.yml`'s `workflow_call` input contract against every caller's `with:`
  block — no missing required inputs, no undeclared inputs, no missing required
  secrets.
- ~~Remove `debug` from `cg-egress-proxy/Caddyfile`~~ — removed; the global
  options block now specifies only `level INFO`. The AU-3 concern above still
  applies to any future re-enabling of debug logging, since the sidecar's config
  embeds `PROXY_PASSWORD`.
- ~~Delete the commented-out proxy block in `deploy/consumer.js`~~ — removed;
  replaced by an explanatory comment at `deploy/consumer.js:8`.
- ~~Decide whether to vendor the binary or fetch it at deploy time~~ — decided in
  favour of vendoring; rationale recorded under Binary provenance above.
- ~~`package-lock.json` / `node_modules` drift~~ — closed by commit `cdd664f`,
  which moved `package.json` to `^6.1.0`, matching the installed tree. Verified:
  `package.json ^6.1.0` → lock `6.1.0` → `node_modules` `6.1.0`.

## Links

- `README.md` — cloud.gov space setup, `unbind-security-group`, network policies
- `docs/development_and_deployment_process.md` — deployment model
- Commits `4f40a5c` (TLS attempt), `1bc2593` (revert), `65466bc` / `25ab7b4`
  (New Relic proxy configuration), `cdd664f` (`@google-analytics/data` upgrade
  to `^6.1.0`, which does not change the conclusion above)
- [GSA-TTS/cg-egress-proxy](https://github.com/GSA-TTS/cg-egress-proxy) — the
  cloud.gov egress proxy, itself Caddy + `forwardproxy`; source of the vendored
  binary (tag `v1.1.1`, path `proxy/caddy`)
- NIST SP 800-53 Rev 5: SC-7, SC-8, SC-13, CM-2, CM-6, SR-3, SR-11
