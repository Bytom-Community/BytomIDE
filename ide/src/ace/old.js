// editor.getSession().setMode('ace/mode/javascript')
// ace.define('ace/mode/custom', ['require', 'exports', 'ace/lib/oop', 'ace/mode/text', 'ace/mode/custom_highlight_rules'], (acequire, exports) => {
//     const oop = acequire('ace/lib/oop');
//     const TextMode = acequire('ace/mode/text').Mode;
//     const CustomHighlightRules = acequire('ace/mode/custom_highlight_rules').CustomHighlightRules;
//     var Mode = function() {
//         this.HighlightRules = CustomHighlightRules
//     };
//     oop.inherits(Mode, TextMode); // ACE's way of doing inheritance
//     exports.Mode = Mode; // eslint-disable-line no-param-reassign
// })

// ace.define('ace/mode/custom_highlight_rules', ['require', 'exports', 'ace/lib/oop', 'ace/mode/text_highlight_rules'], (acequire, exports) => {
//     const oop = acequire('ace/lib/oop');
//     const TextHighlightRules = acequire('ace/mode/text_highlight_rules').TextHighlightRules;
//     console.log('TextHighlightRules', TextHighlightRules)
//     const CustomHighlightRules = function CustomHighlightRules() {
//       var textRules = new TextHighlightRules().getRules();
//       var keywordMapper = this.createKeywordMapper({
//         "variable.language":
//             "Array|Boolean|Date|Function|Iterator|Number|Object|RegExp|String|Proxy|"  + // Constructors
//             "Namespace|QName|XML|XMLList|"                                             + // E4X
//             "ArrayBuffer|Float32Array|Float64Array|Int16Array|Int32Array|Int8Array|"   +
//             "Uint16Array|Uint32Array|Uint8Array|Uint8ClampedArray|"                    +
//             "Error|EvalError|InternalError|RangeError|ReferenceError|StopIteration|"   + // Errors
//             "SyntaxError|TypeError|URIError|"                                          +
//             "decodeURI|decodeURIComponent|encodeURI|encodeURIComponent|eval|isFinite|" + // Non-constructor functions
//             "isNaN|parseFloat|parseInt|"                                               +
//             "JSON|Math|"                                                               + // Other
//             "this|arguments|prototype|window|document"                                 , // Pseudo
//         "keyword":
//             "const|yield|import|get|set|async|await|" +
//             "break|case|catch|continue|default|delete|do|else|finally|for|function|" +
//             "if|in|of|instanceof|new|return|switch|throw|try|typeof|let|var|while|with|debugger|" +
//             "__parent__|__count__|escape|unescape|with|__proto__|" +
//             "class|enum|extends|super|export|implements|private|public|interface|package|protected|static",
//         "storage.type":
//             "const|let|var|function",
//         "constant.language":
//             "null|Infinity|NaN|undefined",
//         "support.function":
//             "alert",
//         "constant.language.boolean": "true|false"
//     }, "identifier");
//        this.$rules = textRules
//        this.$rules['no_regex'] = [
//            {
//                token: keywordMapper,
//                regex: "[a-zA-Z\\$_\u00a1-\uffff][a-zA-Z\\d\\$_\u00a1-\uffff]*",
//            }
//        ]
//        console.log('this.$rules', this.$rules)
//     };
//     oop.inherits(CustomHighlightRules, TextHighlightRules);
//     exports.CustomHighlightRules = CustomHighlightRules;
// })