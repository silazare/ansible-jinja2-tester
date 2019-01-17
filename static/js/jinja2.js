define("ace/mode/jinja2", ['ace/ace', "ace/lib/oop", "ace/mode/text", "ace/mode/folding/cstyle"], function(require, exports, module) {
"use strict";

var text_highlight_rules = require('ace/mode/text_highlight_rules');
var TextHighlightRules = text_highlight_rules.TextHighlightRules;

var Jinja2HighlightRules = function() {
    // regexp must not have capturing parentheses. Use (?:) instead.
    // regexps are ordered -> the first match is used

    this.$rules = {
        start: [{
            token: [
                "entity.other.jinja.delimiter.tag",
                "comment.block.jinja.raw",
                "keyword.control.jinja",
                "comment.block.jinja.raw",
                "entity.other.jinja.delimiter.tag"
            ],
            regex: /({%)(\s*)(raw)(\s*)(%})/,
            push: [{
                token: [
                    "entity.other.jinja.delimiter.tag",
                    "comment.block.jinja.raw",
                    "keyword.control.jinja",
                    "comment.block.jinja.raw",
                    "entity.other.jinja.delimiter.tag"
                ],
                regex: /({%)(\s*)(endraw)(\s*)(%})/,
                next: "pop"
            }, {
                defaultToken: "comment.block.jinja.raw"
            }]
        }, {
            token: "entity.other.jinja.delimiter.comment",
            regex: /{#-?/,
            push: [{
                token: "entity.other.jinja.delimiter.comment",
                regex: /-?#}/,
                next: "pop"
            }, {
                defaultToken: "comment.block.jinja"
            }]
        }, {
            token: "entity.other.jinja.delimiter.variable",
            regex: /{{-?/,
            push: [{
                token: "entity.other.jinja.delimiter.variable",
                regex: /-?}}/,
                next: "pop"
            }, {
                include: "#expression"
            }, {
                defaultToken: "meta.scope.jinja.variable"
            }]
        }, {
            token: "entity.other.jinja.delimiter.tag",
            regex: /{%-?/,
            push: [{
                token: "entity.other.jinja.delimiter.tag",
                regex: /-?%}/,
                next: "pop"
            }, {
                include: "#expression"
            }, {
                defaultToken: "meta.scope.jinja.tag"
            }]
        }],
        "#escaped_char": [{
            token: "constant.character.escape.hex.jinja",
            regex: /\\x[0-9A-F]{2}/
        }],
        "#escaped_unicode_char": [{
            token: [
                "constant.character.escape.unicode.16-bit-hex.jinja",
                "constant.character.escape.unicode.32-bit-hex.jinja",
                "constant.character.escape.unicode.name.jinja"
            ],
            regex: /(\\U[0-9A-Fa-f]{8})|(\\u[0-9A-Fa-f]{4})|(\\N\{[a-zA-Z ]+\})/
        }],
        "#expression": [{
            token: [
                "text",
                "keyword.control.jinja",
                "text",
                "variable.other.jinja.block"
            ],
            regex: /(\s*\b)(block)(\s+)([a-zA-Z_][a-zA-Z0-9_]*)\b/
        }, {
            token: [
                "text",
                "keyword.control.jinja",
                "text",
                "variable.other.jinja.filter"
            ],
            regex: /(\s*\b)(filter)(\s+)([a-zA-Z_][a-zA-Z0-9_]*)\b/
        }, {
            token: [
                "text",
                "keyword.control.jinja",
                "text",
                "variable.other.jinja.test"
            ],
            regex: /(\s*\b)(is)(\s+)([a-zA-Z_][a-zA-Z0-9_]*)\b/
        },
        {
            token: "keyword.control.jinja",
            regex: /\b(?:for|endfor|raw|endraw|macro|endmacro|call|endcall|filter|endfilter|set|extends|include|from|block|endblock|and|else|if|in|import|not|or|recursive|with(?:out)?\s+context)\b/
        },
        {
            token: "constant.language.jinja",
            regex: /\b(?:true|false|none)\b/
        }, {
            token: "variable.language.jinja",
            regex: /\b(?:loop|super|self|varargs|kwargs)\b/
        }, {
            token: "variable.other.jinja",
            regex: /[a-zA-Z_][a-zA-Z0-9_]*/
        }, {
            token: "keyword.operator.arithmetic.jinja",
            regex: /\+|\-|\*\*|\*|\/\/|\/|%/
        }, {
            token: [
                "punctuation.other.jinja",
                "variable.other.jinja.filter"
            ],
            regex: /(\|)([a-zA-Z_][a-zA-Z0-9_]*)/
        }, {
            token: [
                "punctuation.other.jinja",
                "variable.other.jinja.attribute"
            ],
            regex: /(\.)([a-zA-Z_][a-zA-Z0-9_]*)/
        }, {
            token: "punctuation.other.jinja",
            regex: /\[/,
            push: [{
                token: "punctuation.other.jinja",
                regex: /\]/,
                next: "pop"
            }, {
                include: "#expression"
            }]
        }, {
            token: "punctuation.other.jinja",
            regex: /\(/,
            push: [{
                token: "punctuation.other.jinja",
                regex: /\)/,
                next: "pop"
            }, {
                include: "#expression"
            }]
        }, {
            token: "punctuation.other.jinja",
            regex: /\{/,
            push: [{
                token: "punctuation.other.jinja",
                regex: /\}/,
                next: "pop"
            }, {
                include: "#expression"
            }]
        }, {
            token: "punctuation.other.jinja",
            regex: /\.|:|\||,/
        }, {
            token: "keyword.operator.comparison.jinja",
            regex: /==|<=|=>|<|>|!=/
        }, {
            token: "keyword.operator.assignment.jinja",
            regex: /=/
        }, {
            token: "punctuation.definition.string.begin.jinja",
            regex: /"/,
            push: [{
                token: "punctuation.definition.string.end.jinja",
                regex: /"/,
                next: "pop"
            }, {
                include: "#string"
            }, {
                defaultToken: "string.quoted.double.jinja"
            }]
        }, {
            token: "punctuation.definition.string.begin.jinja",
            regex: /'/,
            push: [{
                token: "punctuation.definition.string.end.jinja",
                regex: /'/,
                next: "pop"
            }, {
                include: "#string"
            }, {
                defaultToken: "string.quoted.single.jinja"
            }]
        }, {
            token: "punctuation.definition.regexp.begin.jinja",
            regex: /@\//,
            push: [{
                token: "punctuation.definition.regexp.end.jinja",
                regex: /\//,
                next: "pop"
            }, {
                include: "#simple_escapes"
            }, {
                defaultToken: "string.regexp.jinja"
            }]
        }],
        "#simple_escapes": [{
            token: [
                "constant.character.escape.newline.jinja",
                "constant.character.escape.backlash.jinja",
                "constant.character.escape.double-quote.jinja",
                "constant.character.escape.single-quote.jinja",
                "constant.character.escape.bell.jinja",
                "constant.character.escape.backspace.jinja",
                "constant.character.escape.formfeed.jinja",
                "constant.character.escape.linefeed.jinja",
                "constant.character.escape.return.jinja",
                "constant.character.escape.tab.jinja",
                "constant.character.escape.vertical-tab.jinja"
            ],
            regex: /(\\$)|(\\\\)|(\\\")|(\\')|(\\a)|(\\b)|(\\f)|(\\n)|(\\r)|(\\t)|(\\v)/
        }],
        "#string": [{
            include: "#simple_escapes"
        }, {
            include: "#escaped_char"
        }, {
            include: "#escaped_unicode_char"
        }]
    }

    this.normalizeRules();
};

Jinja2HighlightRules.metaData = {
    fileTypes: [],
    foldingStartMarker: "({%\\s*(block|filter|for|if|macro|raw|call))",
    foldingStopMarker: "({%\\s*(endblock|endfilter|endfor|endif|endmacro|endraw|endcall)\\s*%})",
    name: "Jinja Templates",
    scopeName: "source.jinja"
}

var oop = require("ace/lib/oop");
oop.inherits(Jinja2HighlightRules, TextHighlightRules);

exports.Jinja2HighlightRules = Jinja2HighlightRules;

var TextMode = require("ace/mode/text").Mode;
var FoldMode = require("ace/mode/folding/cstyle").FoldMode;

var Mode = function() {
    this.HighlightRules = Jinja2HighlightRules;
    this.foldingRules = new FoldMode();
};
oop.inherits(Mode, TextMode);

(function() {
    // this.lineCommentStart = ""{#-?"";
    // this.blockComment = {start: ""/*"", end: ""*/""};
    // Extra logic goes here.
    this.$id = "ace/mode/jinja2"
}).call(Mode.prototype);

exports.Mode = Mode;
});

