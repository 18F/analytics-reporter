# cg-egress-proxy

The source for this project is here: https://github.com/GSA-TTS/cg-egress-proxy

The source was adapted for use in the analytics.usa.gov project. Content below
is from the original source.

## Why this project

Compromised applications are often used to exfiltrate data, participate in [DoS](https://www.cisa.gov/uscert/ncas/tips/ST04-015) attacks, directly exploit other services, or phone home for additional nefarious commands. When you block unexpected egress traffic from your system, you mitigate the potential damage that would result from a compromised app, and help keep other systems secure.

The app in this repository implements controlled egress traffic for applications running on [cloud.gov](https://cloud.gov), and should work on other [Cloud Foundry](https://cloudfoundry.org)-based platforms as well.

**Note:**
>This project is not currently officially supported by the cloud.gov team due to the diveristy of use-cases and complexity of configurations possible. The cloud.gov support team cannot guarantee that they can assist in debugging the use of this proxy, and can only assist in the use of this proxy to users under an official support package with cloud.gov.

<details>
<summary>Want to know about NIST 800-53 SC-7? Click here...</summary>

### Hello Compliance and security nerds!

Creators of of US federal systems are [required](https://csrc.nist.gov/projects/risk-management/fisma-background) to implement baseline [security and privacy controls](https://csrc.nist.gov/publications/detail/sp/800-53/rev-5/final) appropriate to the system's [sensitivity](https://www.nist.gov/privacy-framework/fips-199). [Control SC-7](https://csrc.nist.gov/Projects/risk-management/sp800-53-controls/release-search#!/control?version=5.1&number=sc-7) includes this text:

> Connect to external networks or systems only through managed interfaces consisting of boundary protection devices arranged in accordance with an organizational security and privacy architecture.

Deploying this egress proxy in front of your cloud.gov application will help you meet this requirement!

<!-- assorted keywords: nist rmf 800-53 fisma fedramp sc-7 gsa boundary egress -->
</details>

---

## Deployment architecture

```mermaid
    C4Context
      title controlled egress proxy for Cloud Foundry spaces
      Boundary(system, "system boundary") {
          Boundary(trusted_local_egress, "egress-controlled space", "trusted-local-egress ASG") {
            System(application, "Application", "main application logic")
          }

          Boundary(public_egress, "egress-permitted space", "public-egress ASG") {
            System(https_proxy, "web egress proxy", "proxy for HTTP/S connections")
          }
      }

      Boundary(external_boundary, "external boundary") {
        System(external_service, "external service", "service that the application relies on")
      }

      Rel(application, https_proxy, "makes request", "HTTP/S")
      Rel(https_proxy, external_service, "proxies request", "HTTP/S")
```

## Deploying the proxy by hand

Copy and edit the vars.yml-sample settings file. (Convention is to name it after your app.)

```bash
$ cp vars.yml-sample vars.myapp.yml
$ $EDITOR vars.myapp.yml
```

The values for proxydeny and proxyallow should consist of the relevant entries for your app, separated by spaces or newlines. Entries can be hostnames, IPs, or ranges for both, and can be expressed in many different forms. For examples, see [the upstream documentation](https://github.com/caddyserver/forwardproxy/blob/caddy2/README.md#caddyfile-syntax-server-configuration).

Deploy the proxy in a neighboring space with public egress. (Or optionally deploy it in another org altogether.)

```bash
$ cf target -s prod-egress [-o otherorg]
$ cf push --vars-file vars.myapp.yml
```

Enable your client to connect to the proxy. [Port 61443 implicitly terminates TLS for the proxy.](https://docs.cloudfoundry.org/concepts/understand-cf-networking.html#securing-traffic)

```bash
cf target -s prod [-o yourorg]
cf add-network-policy app myproxy --protocol tcp --port 61443 -s prod-egress [-o otherorg]
```

Help your app find the the proxy.

    $ cf set-env http_proxy  'https://user:pass@myproxy.app.internal:61443'
    $ cf set-env https_proxy 'https://user:pass@myproxy.app.internal:61443'

Note that setting the environment variables this way is only for convenience. You may see credentials appear in log or `cf env` output, for example.

It's better if you use one of these other options:
1. Use a [user-provided service](https://docs.cloudfoundry.org/devguide/services/user-provided.html) to provide the URLs to your app.
2. Use the [`.profile`](https://docs.cloudfoundry.org/devguide/deploy-apps/deploy-app.html#profile) to set these variables during your app's initialization.
    ```bash
    #!/bin/bash
    export http_proxy="https://user:pass@myproxy.app.internal:61443"
    export https_proxy="https://user:pass@myproxy.app.internal:61443"
    ```

## Accounting for multiple internal apps that need to talk to one another internally

If you have multiple applications (e.g., an API and a front-end client) that each have a proxy in front of them, you will also need to configure them to explicitly not use the proxy to ensure that container-to-container traffic is permitted via the network policies you have set up.

In addition to the `http_proxy` and `http_proxy` environment variables, you'll also need to set the `no_proxy` environment variable in your app's initialization:
    ```bash
    #!/bin/bash
    export http_proxy="https://user:pass@myproxy.app.internal:61443"
    export https_proxy="https://user:pass@myproxy.app.internal:61443"
    export no_proxy="apps.internal"
    ```

Setting `no_proxy` to `apps.internal` will enable your apps to properly connect to one another within the platform; they'll automatically handle the ports and such.

Please see [this GitLab article for more information about `no_proxy`](https://about.gitlab.com/blog/2021/01/27/we-need-to-talk-no-proxy/) and the state of HTTP proxy configuration in general.

## Automatically deploying proxies for multiple apps

The `bin/cf-deployproxy` utility is used to automate the process of setting up a proxy for each app that may need one, following some simple conventions. You can specify deny and allow lists tailored for each application. The utility reads a file called `<app>.deny.acl` for denied entries, and a file called `<app>.allow.acl` for allowed entries. The tool will create these files if they don't exist, and is safe to run multiple times. If you have a lot of apps to set up, just run the tool once, and then edit the files that are created and run it again.

To learn more about how to use this tool, just run it!

```bash
$ bin/cf-deployproxy -h
```

### Proxying S3 Bucket access
The deployment utility will also automatically ensure that apps can reach the domain corresponding to any S3 bucket services that are bound to them.

*_Note:_* The AWS CLI `aws s3` subcommand cannot be configured with the platform-provided CA bundle, and rejects the certificate presented by the proxy! This means you can't use `aws s3` with the proxy. (We've filed [an upstream issue](https://github.com/aws/aws-cli/issues/6664) to attempt resolve that.)

You can still use S3 through the proxy, but since you can't use the AWS CLI, you have to take care of adding the content of the files in `$CF_SYSTEM_CERT_PATH/*` to the CA trust store for your application on your own. We've looked up examples of doing that for [Go](https://forfuncsake.github.io/post/2017/08/trust-extra-ca-cert-in-go-app/), [Python](https://appdividend.com/2020/06/19/python-certifi-example-how-to-use-ssl-certificate-in-python/), [Ruby](https://docs.ruby-lang.org/en/2.4.0/OpenSSL/X509/Store.html), [PHP](https://stackoverflow.com/a/70318246), and [Java](https://stackoverflow.com/a/62508063).

## Troubleshooting

Test that curl connects properly from your application's container.

```bash
# Get a shell inside the app
$ cf ssh app -t -c "/tmp/lifecycle/launcher /home/vcap/app /bin/bash"

# Use curl to test that the container can reach things it should
$ curl http://allowedhost:allowedport
[...response from allowedhost...] # allowed

$ curl https://allowedhost:allowedport
[...response from allowedhost...] # allowed

# Use curl to test that the container can't reach things it shouldn't
$ curl http://allowedhost:deniedport
curl: (56) Received HTTP code 403 from proxy after CONNECT # denied

$ curl http://deniedhost:allowedport
curl: (56) Received HTTP code 403 from proxy after CONNECT # denied

$ curl https://allowedhost:deniedport
curl: (56) Received HTTP code 403 from proxy after CONNECT # denied

$ curl https://deniedhost:allowedport
curl: (56) Received HTTP code 403 from proxy after CONNECT # denied
```

If that all looks OK: Remember, your app must implicitly or explicitly make use of use the `https_proxy` environment variable when making connections to an allowedhost. Are you sure it's doing that?

If not, then it's time to see if connections are properly allowed/denied from the proxy itself. Test that it works by SSH'ing and allowing the `.profile` to load.

```bash
# Set up the exact same environment used by the proxy
$ cf ssh myapp -t -c "/tmp/lifecycle/launcher /home/vcap/app /bin/bash"

  # Within the resulting shell...
  $ curl https://allowedhost
  [...response from allowedhost...] # allowed

  $ curl https://notallowedhost
  curl: (56) Received HTTP code 403 from proxy after CONNECT  # denied

  # If something doesn't seem to be working right, add the -I and -v flags
  $ curl -I -v https://deniedhost
  [...pretty straightforward rejection from the proxy right after CONNECT...]
  $ curl -I -v https://allowedhost
  [...debugging info...]
```

If that _doesn't_ look OK: You may be using the proxy in a new or unexpected way, or you may have found a bug. Please file an issue or otherwise contact the project's maintainers!

## How it works

- The proxy runs [Caddy V2](https://caddyserver.com)
  - Caddy is compiled to include the [forwardproxy](https://github.com/caddyserver/forwardproxy/tree/caddy2) plugin
  - `.profile` creates `deny.acl` and `allow.acl` files based on environment variables.
  - Caddy's `forward_proxy` directive refers to those files with `deny_file` and `allow_file`.
- Caddy listens on one port: $PORT
  - Caddy is configured to use the c2c certificate for terminating TLS.
  - After TLS termination, Caddy sees plaintext for the _inital_ client connection, until it receives `CONNECT`. After that exchange, per the proxying spec:
  - It CAN   see the content of requests to http://  destinations
  - It CAN'T see the content of requests to https:// destinations
    - The TLS exchange between the client and destination happens post-`CONNECT` directly over a TCP tunnel. Caddy just sends and receives the bytes.
- An `apps.internal` route makes the proxy resolveable by other applications.
- Apps cannot actually send bytes to the proxy's port without an explicit `cf add-network-policy app proxy --protocol tcp --port 61443 -s proxy-space -o proxy-org`.
- An appropriate network policy can only be created by someone with SpaceDeveloper permissions in both the source and destination space.

## For local development

A custom Caddy binary with a forward-proxy plugin is included in the `proxy/` directory. If you ever need to rebuild the Caddy binary yourself locally, run:

```bash
$ make
```


## Local testing

1. Run `docker compose build`. If running on an ARM machine, such as an Apple Silicon Mac, run `docker compose build --build-arg GOARCH=arm`
1. Run `docker compose up`
1. Test allowed and denied destinations and ports (TODO: This should just run a script inside the container):
    ```bash
    docker-compose exec caddy curl https://allowedhost:allowedport # (allowed) PASS
    docker-compose exec caddy curl https://allowedhost:deniedport # (denied) PASS
    docker-compose exec caddy curl https://deniedhost:allowedport # (denied) PASS
    ```
1. Run `docker compose down`

### If you want to hand test using your browser...
_NOTE: This information is out of date, and needs updating... PRs welcome!_

Caddy is configured to listen on port 8080, using certificates signed with its own root CA. This means you WILL see cert errors if you set `https_proxy=https://localhost:443` as the proxy for your local client. To avoid that, you can add Caddy's internal root CA certificate to the CA bundle for either your client, or your OS. However, be prepared for the fact that this certificate changes every time you `docker compose up`!

The root CA certificate is in the Caddy container at `/data/caddy/pki/authorities/local/root.crt`. Grab it by running
```bash
docker compose cp caddy:/data/caddy/pki/authorities/local/root.crt .`
```

Add the root CA certificate for your client (TODO: Finish researching and add all the links):
- windows (system wide):
- linux (system wide):
- mac (system wide):
- Firefox:
- Chrome:
- IE9+:
- curl: Set flag `--proxy-cacert filename`

_Note:_ We may be able to [eliminate the hurdles of testing with TLS locally](https://github.com/caddyserver/caddy/issues/3021) in the future.

## Contributing

See [CONTRIBUTING](CONTRIBUTING.md) for additional information.

## Public domain

This project is in the worldwide [public domain](LICENSE.md). As stated in [CONTRIBUTING](CONTRIBUTING.md):

> This project is in the public domain within the United States, and copyright and related rights in the work worldwide are waived through the [CC0 1.0 Universal public domain dedication](https://creativecommons.org/publicdomain/zero/1.0/).
>
> All contributions to this project will be released under the CC0 dedication. By submitting a pull request, you are agreeing to comply with this waiver of copyright interest.
