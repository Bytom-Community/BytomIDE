require("./equity-doc-highlight")
require("./outdent")
require("./folding")
require("./equity-highlight-rules")
require("../../lib/worker-equity")
const config = require("../utils/config.js").config()
ace.define("ace/mode/equity", ["require", "exports", "module", "ace/lib/oop", "ace/mode/text", "ace/mode/equity_highlight_rules", "ace/mode/matching_brace_outdent", "ace/worker/worker_client", "ace/mode/behaviour/cstyle", "ace/mode/folding/cstyle"], function (require, exports, module) {
  "use strict";
  var oop = require("../lib/oop");
  var TextMode = require("./text").Mode;
  var EquityHighlightRules = require("./equity_highlight_rules").EquityHighlightRules;
  var MatchingBraceOutdent = require("./matching_brace_outdent").MatchingBraceOutdent;
  var WorkerClient = require("../worker/worker_client").WorkerClient;
  var CstyleBehaviour = require("./behaviour/cstyle").CstyleBehaviour;
  var CStyleFoldMode = require("./folding/cstyle").FoldMode;

  var Mode = function () {
    this.HighlightRules = EquityHighlightRules;

    this.$outdent = new MatchingBraceOutdent();
    this.$behaviour = new CstyleBehaviour();
    this.foldingRules = new CStyleFoldMode();
  };
  oop.inherits(Mode, TextMode);

  (function () {

    this.lineCommentStart = "//";
    this.blockComment = {
      start: "/*",
      end: "*/"
    };
    this.$quotes = {
      '"': '"',
      "'": "'",
      "`": "`"
    };

    this.getNextLineIndent = function (state, line, tab) {
      var indent = this.$getIndent(line);

      var tokenizedLine = this.getTokenizer().getLineTokens(line, state);
      var tokens = tokenizedLine.tokens;
      var endState = tokenizedLine.state;

      if (tokens.length && tokens[tokens.length - 1].type == "comment") {
        return indent;
      }

      if (state == "start" || state == "no_regex") {
        var match = line.match(/^.*(?:\bcase\b.*:|[\{\(\[])\s*$/);
        if (match) {
          indent += tab;
        }
      } else if (state == "doc-start") {
        if (endState == "start" || endState == "no_regex") {
          return "";
        }
        var match = line.match(/^\s*(\/?)\*/);
        if (match) {
          if (match[1]) {
            indent += " ";
          }
          indent += "* ";
        }
      }

      return indent;
    };

    this.checkOutdent = function (state, line, input) {
      return this.$outdent.checkOutdent(line, input);
    };

    this.autoOutdent = function (state, doc, row) {
      this.$outdent.autoOutdent(doc, row);
    };

    this.createWorker = function (session) {
      console.log('usl', `${config.baseUrl}:${config.port}/lib/worker-equity.js`)
      var worker = new WorkerClient(["ace"], "ace/mode/equity_worker", "EquityWorker", `${config.baseUrl}:${config.port}/lib/worker-equity.js`);
      worker.attachToDocument(session.getDocument());

      worker.on("annotate", function (results) {
        session.setAnnotations(results.data);
      });

      worker.on("terminate", function () {
        session.clearAnnotations();
      });

      return worker;
    };

    this.$id = "ace/mode/equity";
  }).call(Mode.prototype);

  exports.Mode = Mode;
});
(function () {
  ace.require(["ace/mode/equity"], function (m) {
    if (typeof module == "object" && typeof exports == "object" && module) {
      module.exports = m;
    }
  });
})();
