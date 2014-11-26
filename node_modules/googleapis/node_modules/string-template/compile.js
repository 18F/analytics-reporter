var template = require("./index")
var escape = require("js-string-escape")

var nargs = /\{[0-9a-zA-Z]+\}/g

var replaceTemplate =
"    var args\n" +
"    var result\n" +
"    if (arguments.length === 1 && typeof arguments[0] === \"object\") {\n" +
"        args = arguments[0]\n" +
"    } else {\n" +
"        args = arguments" +
"    }\n\n" +
"    if (!args || !(\"hasOwnProperty\" in args)) {\n" +
"       args = {}\n" +
"    }\n\n" +
"    return {0}"

var literalTemplate = "\"{0}\""
var argTemplate = "(result = args.hasOwnProperty(\"{0}\") ? " +
    "args[\"{0}\"] : null, \n        " +
    "(result === null || result === undefined) ? \"\" : result)"

module.exports = compile

function compile(string, inline) {
    var replacements = string.match(nargs)
    var interleave = string.split(nargs)
    var replace = []

    for (var i = 0; i < interleave.length; i++) {
        var current = interleave[i];
        var replacement = replacements[i];
        var escapeLeft = current.charAt(current.length - 1)
        var escapeRight = (interleave[i + 1] || "").charAt(0)

        if (replacement) {
            replacement = replacement.substring(1, replacement.length - 1)
        }

        if (escapeLeft === "{" && escapeRight === "}") {
            replace.push(current + replacement)
        } else {
            replace.push(current);
            if (replacement) {
                replace.push({ name: replacement })
            }
        }
    }

    replace = replace.reduce(function (prev, curr) {
        if (String(curr) === curr) {
            var top = prev[prev.length - 1]

            if (String(top) === top) {
                prev[prev.length - 1] = top + curr
            } else {
                prev.push(curr)
            }
        } else {
            prev.push(curr)
        }

        return prev
    }, [""])

    if (inline) {
        var replaceCode = replace.map(inlineConcat).join(" +\n    ")
        var compiledSource = template(replaceTemplate, replaceCode)
        return new Function(compiledSource)
    }

    return function template() {
        var args

        if (arguments.length === 1 && typeof arguments[0] === "object") {
            args = arguments[0]
        } else {
            args = arguments
        }

        if (!args || !("hasOwnProperty" in args)) {
            args = {}
        }

        var result = []

        for (var i = 0; i < replace.length; i++) {
            if (i % 2 === 0) {
                result.push(replace[i])
            } else {
                var argName = replace[i].name
                var arg = args.hasOwnProperty(argName) ? args[argName] : null
                if (arg !== null || arg !== undefined) {
                    result.push(arg)
                }
            }
        }

        return result.join("")
    }
}

function inlineConcat(token) {
    if (String(token) === token) {
        return template(literalTemplate, escape(token))
    } else {
        return template(argTemplate, escape(token.name))
    }
}
