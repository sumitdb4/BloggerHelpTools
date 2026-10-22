
(function () {
  "use strict";

  var bhhsgRoot = document.getElementById("BloggerHelpHtmlSitemapGenerator");
  if (!bhhsgRoot || bhhsgRoot.getAttribute("data-bhhsg-ready") === "1") return;
  bhhsgRoot.setAttribute("data-bhhsg-ready", "1");

  var bhhsgStorageKey = "bhhsgSettingsV1";
  var bhhsgOutput = document.getElementById("bhhsgOutput");
  var bhhsgPreviewFrame = document.getElementById("bhhsgPreviewFrame");
  var bhhsgStatus = document.getElementById("bhhsgStatus");
  var bhhsgCodeSize = document.getElementById("bhhsgCodeSize");
  var bhhsgCopyBtn = document.getElementById("bhhsgCopyBtn");
  var bhhsgDownloadBtn = document.getElementById("bhhsgDownloadBtn");

  var bhhsgDefaults = {
    blogUrl: "",
    layout: "label",
    dateOrder: "newest",
    maxPosts: "0",
    duplicateMode: "every",
    includeLabels: "",
    excludeLabels: "",
    excludeUrls: "",
    search: true,
    labelFilter: true,
    postCount: true,
    labelCount: true,
    showDate: true,
    showThumb: false,
    showLabels: false,
    showDesc: false,
    serial: false,
    newBadge: false,
    collapsible: true,
    newTab: false,
    uncategorized: true,
    emptyGroups: false,
    descLength: "140",
    newDays: "7",
    appearance: "list",
    columns: "2",
    font: "inherit",
    accent: "#2563eb",
    background: "#ffffff",
    text: "#1e293b",
    border: "#e2e8f0",
    radius: "12",
    spacing: "14"
  };

  var bhhsgDesignDefaults = {
    appearance: "list",
    columns: "2",
    font: "inherit",
    accent: "#2563eb",
    background: "#ffffff",
    text: "#1e293b",
    border: "#e2e8f0",
    radius: "12",
    spacing: "14"
  };

  function bhhsgClamp(value, min, max, fallback) {
    var number = parseInt(value, 10);
    if (!isFinite(number)) number = fallback;
    return Math.min(max, Math.max(min, number));
  }

  function bhhsgColor(value, fallback) {
    return /^#[0-9a-f]{6}$/i.test(String(value || "")) ? String(value) : fallback;
  }

  function bhhsgSplit(value) {
    var parts = String(value || "").split(/[\n,]+/);
    var clean = [];
    var seen = {};
    for (var i = 0; i < parts.length; i++) {
      var item = parts[i].trim();
      var key = item.toLowerCase();
      if (item && !seen[key]) {
        seen[key] = true;
        clean.push(item);
      }
    }
    return clean;
  }

  function bhhsgNormalizeBlogUrl(value) {
    var raw = String(value || "").trim();
    if (!raw) throw new Error("Enter a public Blogger blog URL first.");
    if (!/^https?:\/\//i.test(raw)) raw = "https://" + raw;
    var url;
    try {
      url = new URL(raw);
    } catch (error) {
      throw new Error("Enter a valid blog URL, such as https://example.blogspot.com.");
    }
    if (url.protocol !== "http:" && url.protocol !== "https:") throw new Error("The blog URL must begin with http:// or https://.");
    if (!url.hostname || url.username || url.password) throw new Error("Enter a valid public blog homepage URL.");
    return url.protocol + "//" + url.host;
  }

  function bhhsgGetSettingValue(key) {
    var fields = bhhsgRoot.querySelectorAll('[data-bhhsg-setting="' + key + '"]');
    if (!fields.length) return undefined;
    var field = fields[0];
    if (field.type === "radio") {
      for (var i = 0; i < fields.length; i++) if (fields[i].checked) return fields[i].value;
      return "";
    }
    if (field.type === "checkbox") return field.checked;
    return field.value;
  }

  function bhhsgSetSettingValue(key, value) {
    var fields = bhhsgRoot.querySelectorAll('[data-bhhsg-setting="' + key + '"]');
    for (var i = 0; i < fields.length; i++) {
      var field = fields[i];
      if (field.type === "radio") field.checked = String(field.value) === String(value);
      else if (field.type === "checkbox") field.checked = Boolean(value);
      else field.value = value;
    }
  }

  function bhhsgReadSettings() {
    var settings = {};
    for (var key in bhhsgDefaults) if (Object.prototype.hasOwnProperty.call(bhhsgDefaults, key)) settings[key] = bhhsgGetSettingValue(key);
    return settings;
  }

  function bhhsgApplySettings(settings) {
    var merged = {};
    var key;
    for (key in bhhsgDefaults) if (Object.prototype.hasOwnProperty.call(bhhsgDefaults, key)) merged[key] = bhhsgDefaults[key];
    if (settings && typeof settings === "object") {
      for (key in settings) if (Object.prototype.hasOwnProperty.call(settings, key) && Object.prototype.hasOwnProperty.call(merged, key)) merged[key] = settings[key];
    }
    for (key in merged) if (Object.prototype.hasOwnProperty.call(merged, key)) bhhsgSetSettingValue(key, merged[key]);
    bhhsgSyncRanges();
    bhhsgUpdateConditional();
  }

  function bhhsgSaveSettings() {
    try { localStorage.setItem(bhhsgStorageKey, JSON.stringify(bhhsgReadSettings())); } catch (error) {}
  }

  function bhhsgLoadSettings() {
    var saved = null;
    try { saved = JSON.parse(localStorage.getItem(bhhsgStorageKey) || "null"); } catch (error) {}
    bhhsgApplySettings(saved || bhhsgDefaults);
  }

  function bhhsgSyncRanges() {
    document.getElementById("bhhsgRadiusNumber").value = document.getElementById("bhhsgRadius").value;
    document.getElementById("bhhsgSpacingNumber").value = document.getElementById("bhhsgSpacing").value;
  }

  function bhhsgUpdateConditional() {
    var layout = bhhsgGetSettingValue("layout");
    document.getElementById("bhhsgDateOrderWrap").classList.toggle("bhhsg-hidden", layout !== "date");
    document.getElementById("bhhsgDuplicateWrap").classList.toggle("bhhsg-hidden", layout !== "label");
    document.getElementById("bhhsgCollapseToggle").classList.toggle("bhhsg-hidden", layout === "date");
    document.getElementById("bhhsgDescLengthWrap").classList.toggle("bhhsg-hidden", !document.getElementById("bhhsgShowDesc").checked);
    document.getElementById("bhhsgNewDaysWrap").classList.toggle("bhhsg-hidden", !document.getElementById("bhhsgNewBadge").checked);
  }

  function bhhsgShowStatus(message, isError) {
    bhhsgStatus.textContent = message;
    bhhsgStatus.className = "bhhsg-status bhhsg-show" + (isError ? " bhhsg-error" : "");
  }

  function bhhsgClearStatus() {
    bhhsgStatus.textContent = "";
    bhhsgStatus.className = "bhhsg-status";
  }

  function bhhsgFormatBytes(bytes) {
    if (bytes < 1024) return bytes + " bytes";
    return (bytes / 1024).toFixed(bytes < 10240 ? 1 : 0) + " KB";
  }

  function bhhsgSafeJson(value) {
    return JSON.stringify(value).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
  }

  function bhhsgStripBlock(source, name, keep) {
    var start = "/*BHHSG_" + name + "_START*/";
    var end = "/*BHHSG_" + name + "_END*/";
    if (keep) return source.split(start).join("").split(end).join("");
    var startIndex;
    while ((startIndex = source.indexOf(start)) !== -1) {
      var endIndex = source.indexOf(end, startIndex + start.length);
      if (endIndex === -1) break;
      source = source.slice(0, startIndex) + source.slice(endIndex + end.length);
    }
    return source;
  }

  function bhhsgRuntime() {
    "use strict";
    var cfg = __BHHSG_CONFIG__;
    var root = document.getElementById("BloggerHelpHtmlSitemap");
    if (!root || root.getAttribute("data-bhhs-ready") === "1") return;
    root.setAttribute("data-bhhs-ready", "1");

    var state = {
      postsByKey: {},
      fetched: 0,
      total: 0,
      nextStart: 1,
      failedStart: 0,
      loading: false,
      posts: [],
      labels: []
    };
    var BATCH_SIZE = 150;
    var REQUEST_TIMEOUT = 15000;
    var nodes = {
      controls: root.querySelector(".bhhs-controls"),
      loading: root.querySelector(".bhhs-loading"),
      progress: root.querySelector(".bhhs-progress"),
      error: root.querySelector(".bhhs-error"),
      errorText: root.querySelector(".bhhs-error-text"),
      retry: root.querySelector(".bhhs-retry"),
      empty: root.querySelector(".bhhs-empty"),
      groups: root.querySelector(".bhhs-groups"),
      live: root.querySelector(".bhhs-live")
    };
    /*BHHSG_SEARCH_START*/nodes.search = root.querySelector(".bhhs-search");/*BHHSG_SEARCH_END*/
    /*BHHSG_FILTER_START*/nodes.filter = root.querySelector(".bhhs-filter");/*BHHSG_FILTER_END*/
    /*BHHSG_COUNTS_START*/nodes.counts = root.querySelector(".bhhs-counts");/*BHHSG_COUNTS_END*/

    function text(value) {
      return value === undefined || value === null ? "" : String(value);
    }

    function lower(value) {
      return text(value).toLocaleLowerCase ? text(value).toLocaleLowerCase() : text(value).toLowerCase();
    }

    function normalizeUrl(value) {
      try {
        var url = new URL(value, window.location.href);
        var host = lower(url.hostname).replace(/^www\./, "");
        var path = url.pathname.replace(/\/+$/, "") || "/";
        return host + path;
      } catch (error) {
        return lower(value).replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/[?#].*$/, "").replace(/\/+$/, "");
      }
    }

    function plainText(html) {
      try {
        var parsed = new DOMParser().parseFromString("<!doctype html><body>" + text(html), "text/html");
        var blocked = parsed.querySelectorAll("script,style,noscript,template");
        for (var i = 0; i < blocked.length; i++) if (blocked[i].parentNode) blocked[i].parentNode.removeChild(blocked[i]);
        return text(parsed.body && parsed.body.textContent).replace(/\s+/g, " ").trim();
      } catch (error) {
        return text(html).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
      }
    }

    function safeWebUrl(value) {
      try {
        var url = new URL(value, cfg.blogUrl);
        return url.protocol === "http:" || url.protocol === "https:" ? url.href : "";
      } catch (error) {
        return "";
      }
    }

    function postUrl(entry) {
      var links = entry.link || [];
      for (var i = 0; i < links.length; i++) if (links[i].rel === "alternate" && links[i].href) return safeWebUrl(links[i].href);
      return "";
    }

    /*BHHSG_THUMB_START*/
    function firstImage(entry) {
      if (entry.media$thumbnail && entry.media$thumbnail.url) return safeWebUrl(entry.media$thumbnail.url.replace(/\/s72-c\//, "/s320/"));
      var source = text(entry.content && entry.content.$t || entry.summary && entry.summary.$t);
      var match = source.match(/<img[^>]+src=["']([^"']+)["']/i);
      return match ? safeWebUrl(match[1]) : "";
    }
    /*BHHSG_THUMB_END*/

    function parseEntry(entry) {
      var labels = [];
      var categories = entry.category || [];
      for (var i = 0; i < categories.length; i++) {
        var label = text(categories[i].term).trim();
        if (label) labels.push(label);
      }
      var url = postUrl(entry);
      var post = {
        key: text(entry.id && entry.id.$t || url),
        title: plainText(entry.title && entry.title.$t) || "Untitled post",
        url: url,
        published: text(entry.published && entry.published.$t),
        labels: labels
      };
      /*BHHSG_THUMB_START*/post.thumb = firstImage(entry);/*BHHSG_THUMB_END*/
      /*BHHSG_DESC_DATA_START*/post.description = plainText(entry.summary && entry.summary.$t || entry.content && entry.content.$t);/*BHHSG_DESC_DATA_END*/
      return post;
    }

    function requestBatch(start) {
      return new Promise(function (resolve, reject) {
        var callbackName = "bhhsCallback_" + Date.now() + "_" + Math.floor(Math.random() * 1000000) + "_" + start;
        var script = document.createElement("script");
        var finished = false;
        var timer;

        function cleanup() {
          if (timer) clearTimeout(timer);
          try { delete window[callbackName]; } catch (error) { window[callbackName] = undefined; }
          if (script.parentNode) script.parentNode.removeChild(script);
        }

        function fail(message) {
          if (finished) return;
          finished = true;
          cleanup();
          reject(new Error(message));
        }

        window[callbackName] = function (data) {
          if (finished) return;
          finished = true;
          cleanup();
          if (!data || !data.feed) reject(new Error("The public Blogger feed returned an invalid response."));
          else resolve(data.feed);
        };

        script.async = true;
        script.onerror = function () { fail("The public post feed could not be loaded. Check the blog URL and feed setting."); };
        script.src = cfg.blogUrl + "/feeds/posts/default?alt=json-in-script&orderby=published&max-results=" + BATCH_SIZE + "&start-index=" + start + "&callback=" + encodeURIComponent(callbackName);
        timer = setTimeout(function () { fail("Loading timed out after 15 seconds. You can retry from this batch."); }, REQUEST_TIMEOUT);
        document.head.appendChild(script);
      });
    }

    function setLoading(show) {
      nodes.loading.hidden = !show;
      if (show) {
        nodes.error.hidden = true;
        nodes.empty.hidden = true;
      }
    }

    function updateProgress() {
      var totalText = state.total ? " of " + state.total : "";
      nodes.progress.textContent = "Loading posts: " + state.fetched + totalText;
    }

    function showError(error) {
      state.loading = false;
      setLoading(false);
      nodes.errorText.textContent = error && error.message ? error.message : "The sitemap could not load the public blog feed.";
      nodes.error.hidden = false;
      nodes.retry.hidden = !state.failedStart;
      nodes.live.textContent = "Sitemap loading failed.";
    }

    function mergeEntries(entries) {
      for (var i = 0; i < entries.length; i++) {
        var post = parseEntry(entries[i]);
        var key = post.key || post.url || (post.title + post.published);
        if (!state.postsByKey[key]) state.postsByKey[key] = post;
      }
    }

    function loadFrom(start) {
      if (state.loading) return;
      state.loading = true;
      state.failedStart = 0;
      nodes.error.hidden = true;
      setLoading(true);
      updateProgress();

      function next(index) {
        state.nextStart = index;
        requestBatch(index).then(function (feed) {
          var entries = feed.entry || [];
          var totalNode = feed.openSearch$totalResults;
          var parsedTotal = totalNode ? parseInt(totalNode.$t, 10) : 0;
          if (parsedTotal > 0) state.total = parsedTotal;
          mergeEntries(entries);
          state.fetched += entries.length;
          updateProgress();
          if (entries.length > 0 && entries.length >= BATCH_SIZE && (!state.total || state.fetched < state.total)) {
            next(index + entries.length);
          } else {
            state.loading = false;
            state.failedStart = 0;
            setLoading(false);
            preparePosts();
            buildFilter();
            render();
          }
        }).catch(function (error) {
          state.failedStart = index;
          showError(error);
        });
      }

      next(start);
    }

    function preparePosts() {
      var all = [];
      var excludedUrlMap = {};
      var includeMap = {};
      var excludeMap = {};
      var current = normalizeUrl(window.location.href);
      var i;
      for (i = 0; i < cfg.excludeUrls.length; i++) excludedUrlMap[normalizeUrl(cfg.excludeUrls[i])] = true;
      for (i = 0; i < cfg.includeLabels.length; i++) includeMap[lower(cfg.includeLabels[i])] = true;
      for (i = 0; i < cfg.excludeLabels.length; i++) excludeMap[lower(cfg.excludeLabels[i])] = true;

      for (var key in state.postsByKey) if (Object.prototype.hasOwnProperty.call(state.postsByKey, key)) {
        var post = state.postsByKey[key];
        var normalized = normalizeUrl(post.url);
        if (!post.url || normalized === current || excludedUrlMap[normalized]) continue;
        var hasExcluded = false;
        var hasIncluded = cfg.includeLabels.length === 0;
        var allowedLabels = [];
        for (i = 0; i < post.labels.length; i++) {
          var labelKey = lower(post.labels[i]);
          if (excludeMap[labelKey]) hasExcluded = true;
          if (includeMap[labelKey]) hasIncluded = true;
          if (!cfg.includeLabels.length || includeMap[labelKey]) allowedLabels.push(post.labels[i]);
        }
        if (hasExcluded || !hasIncluded) continue;
        post.labels = allowedLabels;
        all.push(post);
      }

      all.sort(function (a, b) { return a.title.localeCompare(b.title, undefined, { sensitivity: "base" }); });
      state.posts = all;
      var labelSeen = {};
      var labels = [];
      for (i = 0; i < all.length; i++) {
        for (var j = 0; j < all[i].labels.length; j++) {
          var labelName = all[i].labels[j];
          var labelId = lower(labelName);
          if (!labelSeen[labelId]) { labelSeen[labelId] = true; labels.push(labelName); }
        }
      }
      for (i = 0; i < cfg.includeLabels.length; i++) {
        var included = cfg.includeLabels[i];
        var includedId = lower(included);
        if (!labelSeen[includedId]) { labelSeen[includedId] = true; labels.push(included); }
      }
      labels.sort(function (a, b) { return a.localeCompare(b, undefined, { sensitivity: "base" }); });
      state.labels = labels;
    }

    /*BHHSG_FILTER_START*/
    function buildFilter() {
      while (nodes.filter.options.length > 1) nodes.filter.remove(1);
      for (var i = 0; i < state.labels.length; i++) {
        var option = document.createElement("option");
        option.value = state.labels[i];
        option.textContent = state.labels[i];
        nodes.filter.appendChild(option);
      }
    }
    /*BHHSG_FILTER_END*/
    /*BHHSG_FILTER_FALLBACK_START*/function buildFilter() {}/*BHHSG_FILTER_FALLBACK_END*/

    function matchesVisitorFilters(post) {
      /*BHHSG_SEARCH_START*/
      var query = lower(nodes.search.value).trim();
      if (query) {
        var haystack = lower(post.title + " " + post.labels.join(" ") + " " + (post.description || ""));
        if (haystack.indexOf(query) === -1) return false;
      }
      /*BHHSG_SEARCH_END*/
      /*BHHSG_FILTER_START*/
      var selectedLabel = lower(nodes.filter.value);
      if (selectedLabel) {
        var found = false;
        for (var i = 0; i < post.labels.length; i++) if (lower(post.labels[i]) === selectedLabel) found = true;
        if (!found) return false;
      }
      /*BHHSG_FILTER_END*/
      return true;
    }

    function visiblePosts() {
      var result = [];
      for (var i = 0; i < state.posts.length; i++) if (matchesVisitorFilters(state.posts[i])) result.push(state.posts[i]);
      return result;
    }

    function groupPosts(posts) {
      var groups = {};
      var order = [];
      var i;
      function ensure(name) {
        if (!groups[name]) { groups[name] = []; order.push(name); }
      }

      if (cfg.layout === "label") {
        if (cfg.emptyGroups) for (i = 0; i < state.labels.length; i++) ensure(state.labels[i]);
        for (i = 0; i < posts.length; i++) {
          var labels = posts[i].labels.slice().sort(function (a, b) { return a.localeCompare(b, undefined, { sensitivity: "base" }); });
          if (!labels.length) {
            if (cfg.uncategorized) { ensure("Uncategorized"); groups.Uncategorized.push(posts[i]); }
          } else if (cfg.duplicateMode === "once") {
            ensure(labels[0]); groups[labels[0]].push(posts[i]);
          } else {
            for (var j = 0; j < labels.length; j++) { ensure(labels[j]); groups[labels[j]].push(posts[i]); }
          }
        }
        order.sort(function (a, b) {
          if (a === "Uncategorized") return 1;
          if (b === "Uncategorized") return -1;
          return a.localeCompare(b, undefined, { sensitivity: "base" });
        });
      } else if (cfg.layout === "az") {
        for (i = 0; i < posts.length; i++) {
          var first = posts[i].title.charAt(0).toUpperCase();
          var letter = /^[A-Z]$/.test(first) ? first : "#";
          ensure(letter); groups[letter].push(posts[i]);
        }
        order.sort(function (a, b) { if (a === "#") return 1; if (b === "#") return -1; return a.localeCompare(b); });
      } else {
        var sorted = posts.slice().sort(function (a, b) {
          var difference = new Date(b.published).getTime() - new Date(a.published).getTime();
          return cfg.dateOrder === "oldest" ? -difference : difference;
        });
        groups[cfg.dateOrder === "oldest" ? "Oldest Posts" : "Latest Posts"] = sorted;
        order.push(cfg.dateOrder === "oldest" ? "Oldest Posts" : "Latest Posts");
      }
      return { map: groups, order: order };
    }

    /*BHHSG_DATE_START*/
    function formatDate(value) {
      var date = new Date(value);
      if (isNaN(date.getTime())) return "";
      try { return new Intl.DateTimeFormat(undefined, { year: "numeric", month: "short", day: "numeric" }).format(date); }
      catch (error) { return date.toLocaleDateString(); }
    }
    /*BHHSG_DATE_END*/

    function makePost(post, serial) {
      var item = document.createElement("article");
      item.className = "bhhs-post";

      /*BHHSG_THUMB_START*/
      if (post.thumb) {
        var imageLink = document.createElement("a");
        imageLink.className = "bhhs-thumb-link";
        imageLink.href = post.url;
        imageLink.setAttribute("aria-label", post.title);
        if (cfg.newTab) { imageLink.target = "_blank"; imageLink.rel = "noopener noreferrer"; }
        var image = document.createElement("img");
        image.className = "bhhs-thumb";
        image.src = post.thumb;
        image.alt = "";
        image.loading = "lazy";
        image.decoding = "async";
        imageLink.appendChild(image);
        item.appendChild(imageLink);
      }
      /*BHHSG_THUMB_END*/

      var body = document.createElement("div");
      body.className = "bhhs-post-body";
      var heading = document.createElement("h3");
      heading.className = "bhhs-post-title";
      /*BHHSG_SERIAL_START*/
      var serialNode = document.createElement("span");
      serialNode.className = "bhhs-serial";
      serialNode.textContent = serial + ".";
      heading.appendChild(serialNode);
      /*BHHSG_SERIAL_END*/
      var link = document.createElement("a");
      link.href = post.url;
      link.textContent = post.title;
      if (cfg.newTab) { link.target = "_blank"; link.rel = "noopener noreferrer"; }
      heading.appendChild(link);
      /*BHHSG_NEW_START*/
      var publishedTime = new Date(post.published).getTime();
      if (publishedTime && Date.now() - publishedTime <= cfg.newDays * 86400000) {
        var badge = document.createElement("span");
        badge.className = "bhhs-new";
        badge.textContent = "New";
        heading.appendChild(badge);
      }
      /*BHHSG_NEW_END*/
      body.appendChild(heading);

      /*BHHSG_DATE_START*/
      var dateText = formatDate(post.published);
      if (dateText) {
        var time = document.createElement("time");
        time.className = "bhhs-date";
        time.dateTime = post.published;
        time.textContent = dateText;
        body.appendChild(time);
      }
      /*BHHSG_DATE_END*/

      /*BHHSG_DESC_UI_START*/
      if (post.description) {
        var description = document.createElement("p");
        description.className = "bhhs-description";
        var shortText = post.description.slice(0, cfg.descLength);
        description.textContent = shortText + (post.description.length > cfg.descLength ? "…" : "");
        body.appendChild(description);
      }
      /*BHHSG_DESC_UI_END*/

      /*BHHSG_LABELS_START*/
      if (post.labels.length) {
        var labelWrap = document.createElement("div");
        labelWrap.className = "bhhs-post-labels";
        for (var i = 0; i < post.labels.length; i++) {
          var label = document.createElement("span");
          label.textContent = post.labels[i];
          labelWrap.appendChild(label);
        }
        body.appendChild(labelWrap);
      }
      /*BHHSG_LABELS_END*/

      item.appendChild(body);
      return item;
    }

    function makeGroup(name, posts, serialStart) {
      var section = document.createElement("section");
      section.className = "bhhs-group";
      /*BHHSG_COLLAPSE_START*/
      if (cfg.collapsible && cfg.layout !== "date") {
        var button = document.createElement("button");
        button.type = "button";
        button.className = "bhhs-group-toggle";
        button.setAttribute("aria-expanded", "true");
        var titleSpan = document.createElement("span");
        titleSpan.textContent = name;
        var countSpan = document.createElement("span");
        countSpan.className = "bhhs-group-count";
        countSpan.textContent = posts.length;
        button.appendChild(titleSpan);
        button.appendChild(countSpan);
        section.appendChild(button);
      } else {
        var title = document.createElement("h2");
        title.className = "bhhs-group-title";
        title.textContent = name;
        var titleCount = document.createElement("span");
        titleCount.textContent = posts.length;
        title.appendChild(titleCount);
        section.appendChild(title);
      }
      /*BHHSG_COLLAPSE_END*/
      /*BHHSG_COLLAPSE_FALLBACK_START*/
      var title = document.createElement("h2");
      title.className = "bhhs-group-title";
      title.textContent = name;
      var titleCount = document.createElement("span");
      titleCount.textContent = posts.length;
      title.appendChild(titleCount);
      section.appendChild(title);
      /*BHHSG_COLLAPSE_FALLBACK_END*/

      var list = document.createElement("div");
      list.className = "bhhs-post-list";
      var limit = cfg.maxPosts > 0 ? Math.min(cfg.maxPosts, posts.length) : posts.length;
      for (var i = 0; i < limit; i++) list.appendChild(makePost(posts[i], serialStart + i));
      section.appendChild(list);
      var shownKeys = [];
      for (var keyIndex = 0; keyIndex < limit; keyIndex++) shownKeys.push(posts[keyIndex].key || posts[keyIndex].url || posts[keyIndex].title);
      return { node: section, shown: limit, keys: shownKeys };
    }

    function render() {
      var posts = visiblePosts();
      var grouped = groupPosts(posts);
      var fragment = document.createDocumentFragment();
      var shown = 0;
      var serial = 1;
      var shownKeyMap = {};
      for (var i = 0; i < grouped.order.length; i++) {
        var name = grouped.order[i];
        var groupPostsList = grouped.map[name] || [];
        if (!groupPostsList.length && !cfg.emptyGroups) continue;
        var built = makeGroup(name, groupPostsList, serial);
        fragment.appendChild(built.node);
        shown += built.shown;
        for (var keyIndex = 0; keyIndex < built.keys.length; keyIndex++) shownKeyMap[built.keys[keyIndex]] = true;
        serial += built.shown;
      }
      while (nodes.groups.firstChild) nodes.groups.removeChild(nodes.groups.firstChild);
      nodes.groups.appendChild(fragment);
      nodes.empty.hidden = shown !== 0 || (cfg.emptyGroups && grouped.order.length > 0);
      nodes.groups.hidden = shown === 0 && !(cfg.emptyGroups && grouped.order.length > 0);
      nodes.controls.hidden = state.posts.length === 0 || !(cfg.search || cfg.labelFilter || cfg.postCount || cfg.labelCount);
      /*BHHSG_COUNTS_START*/
      var countParts = [];
      var uniqueShown = Object.keys(shownKeyMap).length;
      if (cfg.postCount) countParts.push(uniqueShown === state.posts.length ? state.posts.length + " posts" : "Showing " + uniqueShown + " of " + state.posts.length + " posts");
      if (cfg.labelCount) countParts.push(state.labels.length + (state.labels.length === 1 ? " label" : " labels"));
      nodes.counts.textContent = countParts.join(" • ");
      /*BHHSG_COUNTS_END*/
      nodes.live.textContent = shown ? shown + " sitemap posts displayed." : "No matching posts found.";
    }

    /*BHHSG_SEARCH_START*/nodes.search.addEventListener("input", render);/*BHHSG_SEARCH_END*/
    /*BHHSG_FILTER_START*/nodes.filter.addEventListener("change", render);/*BHHSG_FILTER_END*/
    /*BHHSG_COLLAPSE_START*/
    nodes.groups.addEventListener("click", function (event) {
      var button = event.target.closest ? event.target.closest(".bhhs-group-toggle") : null;
      if (!button || !nodes.groups.contains(button)) return;
      var list = button.parentNode.querySelector(".bhhs-post-list");
      var expanded = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", expanded ? "false" : "true");
      list.hidden = expanded;
    });
    /*BHHSG_COLLAPSE_END*/
    nodes.retry.addEventListener("click", function () {
      if (state.failedStart) loadFrom(state.failedStart);
    });

    loadFrom(1);
  }

  function bhhsgBuildConfig(settings) {
    return {
      blogUrl: bhhsgNormalizeBlogUrl(settings.blogUrl),
      layout: /^(label|az|date)$/.test(settings.layout) ? settings.layout : "label",
      dateOrder: settings.dateOrder === "oldest" ? "oldest" : "newest",
      maxPosts: bhhsgClamp(settings.maxPosts, 0, 1000, 0),
      duplicateMode: settings.duplicateMode === "once" ? "once" : "every",
      includeLabels: bhhsgSplit(settings.includeLabels),
      excludeLabels: bhhsgSplit(settings.excludeLabels),
      excludeUrls: bhhsgSplit(settings.excludeUrls),
      search: Boolean(settings.search),
      labelFilter: Boolean(settings.labelFilter),
      postCount: Boolean(settings.postCount),
      labelCount: Boolean(settings.labelCount),
      showDate: Boolean(settings.showDate),
      showThumb: Boolean(settings.showThumb),
      showLabels: Boolean(settings.showLabels),
      showDesc: Boolean(settings.showDesc),
      serial: Boolean(settings.serial),
      newBadge: Boolean(settings.newBadge),
      collapsible: Boolean(settings.collapsible),
      newTab: Boolean(settings.newTab),
      uncategorized: Boolean(settings.uncategorized),
      emptyGroups: Boolean(settings.emptyGroups),
      descLength: bhhsgClamp(settings.descLength, 60, 300, 140),
      newDays: bhhsgClamp(settings.newDays, 1, 365, 7),
      appearance: settings.appearance === "card" ? "card" : "list",
      columns: bhhsgClamp(settings.columns, 1, 3, 2),
      font: settings.font === "system" ? "system" : "inherit",
      accent: bhhsgColor(settings.accent, "#2563eb"),
      background: bhhsgColor(settings.background, "#ffffff"),
      text: bhhsgColor(settings.text, "#1e293b"),
      border: bhhsgColor(settings.border, "#e2e8f0"),
      radius: bhhsgClamp(settings.radius, 0, 24, 12),
      spacing: bhhsgClamp(settings.spacing, 6, 30, 14)
    };
  }

  function bhhsgBuildCss(c) {
    var font = c.font === "system" ? "ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,\"Segoe UI\",Arial,sans-serif" : "inherit";
    var css = [
      "#BloggerHelpHtmlSitemap,#BloggerHelpHtmlSitemap *{box-sizing:border-box}",
      "#BloggerHelpHtmlSitemap{--bhhs-accent:" + c.accent + ";--bhhs-bg:" + c.background + ";--bhhs-text:" + c.text + ";--bhhs-border:" + c.border + ";--bhhs-radius:" + c.radius + "px;--bhhs-gap:" + c.spacing + "px;width:100%;max-width:100%;margin:20px auto;color:var(--bhhs-text);background:var(--bhhs-bg);font-family:" + font + ";font-size:15px;line-height:1.5;overflow-wrap:anywhere}",
      "#BloggerHelpHtmlSitemap button,#BloggerHelpHtmlSitemap input,#BloggerHelpHtmlSitemap select,#BloggerHelpHtmlSitemap a,#BloggerHelpHtmlSitemap h2,#BloggerHelpHtmlSitemap h3,#BloggerHelpHtmlSitemap p,#BloggerHelpHtmlSitemap span{box-sizing:border-box;font-family:inherit}",
      "#BloggerHelpHtmlSitemap button,#BloggerHelpHtmlSitemap input,#BloggerHelpHtmlSitemap select{font:inherit;line-height:1.35;margin:0;color:inherit}",
      "#BloggerHelpHtmlSitemap button{appearance:none;-webkit-appearance:none;cursor:pointer}",
      "#BloggerHelpHtmlSitemap input,#BloggerHelpHtmlSitemap select{display:block!important;width:100%;max-width:100%;min-width:0;min-height:44px;padding:10px 12px;border:1px solid var(--bhhs-border);border-radius:calc(var(--bhhs-radius) * .65);background:var(--bhhs-bg);color:var(--bhhs-text);outline:0;appearance:auto;-webkit-appearance:auto}",
      "#BloggerHelpHtmlSitemap input:focus,#BloggerHelpHtmlSitemap select:focus{border-color:var(--bhhs-accent);box-shadow:0 0 0 3px color-mix(in srgb,var(--bhhs-accent) 18%,transparent)}",
      "#BloggerHelpHtmlSitemap button:focus-visible,#BloggerHelpHtmlSitemap a:focus-visible{outline:3px solid var(--bhhs-accent);outline-offset:2px}",
      "#BloggerHelpHtmlSitemap h2,#BloggerHelpHtmlSitemap h3,#BloggerHelpHtmlSitemap p{margin:0;padding:0;color:inherit;line-height:inherit}",
      "#BloggerHelpHtmlSitemap a{color:var(--bhhs-accent);text-decoration:none}",
      "#BloggerHelpHtmlSitemap a:hover{text-decoration:underline}",
      "#BloggerHelpHtmlSitemap [hidden]{display:none!important}",
      "#BloggerHelpHtmlSitemap .bhhs-visually-hidden{position:absolute!important;width:1px!important;height:1px!important;padding:0!important;margin:-1px!important;overflow:hidden!important;clip:rect(0,0,0,0)!important;white-space:nowrap!important;border:0!important}",
      "#BloggerHelpHtmlSitemap .bhhs-controls{margin-bottom:var(--bhhs-gap)}",
      "#BloggerHelpHtmlSitemap .bhhs-control-row{display:grid;grid-template-columns:" + (c.search && c.labelFilter ? "minmax(0,1fr) minmax(180px,.38fr)" : "minmax(0,1fr)") + ";gap:10px;align-items:end}",
      "#BloggerHelpHtmlSitemap .bhhs-loading,#BloggerHelpHtmlSitemap .bhhs-error,#BloggerHelpHtmlSitemap .bhhs-empty{padding:22px;border:1px solid var(--bhhs-border);border-radius:var(--bhhs-radius);text-align:center;background:var(--bhhs-bg)}",
      "#BloggerHelpHtmlSitemap .bhhs-progress{font-size:13px;font-weight:750}",
      "#BloggerHelpHtmlSitemap .bhhs-skeleton{display:grid;gap:9px;margin-top:15px}",
      "#BloggerHelpHtmlSitemap .bhhs-skeleton i{display:block;height:13px;border-radius:99px;background:linear-gradient(90deg,var(--bhhs-border),color-mix(in srgb,var(--bhhs-border) 35%,var(--bhhs-bg)),var(--bhhs-border));background-size:220% 100%;animation:bhhsPulse 1.3s linear infinite}",
      "#BloggerHelpHtmlSitemap .bhhs-skeleton i:nth-child(2){width:82%}#BloggerHelpHtmlSitemap .bhhs-skeleton i:nth-child(3){width:66%}",
      "@keyframes bhhsPulse{to{background-position:-220% 0}}",
      "#BloggerHelpHtmlSitemap .bhhs-error{border-color:#fecaca;background:#fff7f7;color:#9f1d1d}",
      "#BloggerHelpHtmlSitemap .bhhs-error-text{margin-bottom:12px!important}",
      "#BloggerHelpHtmlSitemap .bhhs-retry{display:inline-flex!important;min-height:42px;padding:9px 17px;border:0;border-radius:calc(var(--bhhs-radius) * .65);align-items:center;justify-content:center;background:var(--bhhs-accent);color:#fff;font-weight:800}",
      "#BloggerHelpHtmlSitemap .bhhs-empty{color:color-mix(in srgb,var(--bhhs-text) 70%,transparent)}",
      "#BloggerHelpHtmlSitemap .bhhs-groups{display:grid;grid-template-columns:repeat(" + c.columns + ",minmax(0,1fr));gap:var(--bhhs-gap);min-width:0}",
      "#BloggerHelpHtmlSitemap .bhhs-group{min-width:0;overflow:hidden;border:1px solid var(--bhhs-border);border-radius:var(--bhhs-radius);background:var(--bhhs-bg)}",
      "#BloggerHelpHtmlSitemap .bhhs-group-title" + (c.collapsible && c.layout !== "date" ? ",#BloggerHelpHtmlSitemap .bhhs-group-toggle" : "") + "{display:flex!important;width:100%;min-height:48px;align-items:center;justify-content:space-between;gap:10px;padding:12px 14px;border:0;border-bottom:1px solid var(--bhhs-border);border-radius:0;background:#f8fafc;background:color-mix(in srgb,var(--bhhs-accent) 7%,var(--bhhs-bg));color:var(--bhhs-text);font-size:15px;font-weight:800;text-align:left}",
      "#BloggerHelpHtmlSitemap .bhhs-group-title span" + (c.collapsible && c.layout !== "date" ? ",#BloggerHelpHtmlSitemap .bhhs-group-count" : "") + "{display:inline-grid;min-width:25px;height:25px;padding:0 6px;place-items:center;border-radius:99px;background:var(--bhhs-accent);color:#fff;font-size:10px}",
      (c.collapsible && c.layout !== "date" ? "#BloggerHelpHtmlSitemap .bhhs-group-toggle:after{width:8px;height:8px;margin-left:auto;border-right:2px solid var(--bhhs-accent);border-bottom:2px solid var(--bhhs-accent);content:\"\";transform:rotate(45deg) translateY(-2px);transition:transform .18s ease}#BloggerHelpHtmlSitemap .bhhs-group-toggle[aria-expanded=\"false\"]:after{transform:rotate(-45deg)}" : ""),
      "#BloggerHelpHtmlSitemap .bhhs-post-list{min-width:0}",
      "#BloggerHelpHtmlSitemap .bhhs-post{display:flex;gap:11px;min-width:0;padding:12px 14px;border-bottom:1px solid var(--bhhs-border)}",
      "#BloggerHelpHtmlSitemap .bhhs-post:last-child{border-bottom:0}",
      "#BloggerHelpHtmlSitemap .bhhs-post-body{flex:1 1 auto;min-width:0}",
      "#BloggerHelpHtmlSitemap .bhhs-post-title{display:flex;align-items:baseline;flex-wrap:wrap;gap:5px;min-width:0;color:var(--bhhs-text);font-size:14px;font-weight:750;line-height:1.45}",
      "#BloggerHelpHtmlSitemap .bhhs-post-title a{min-width:0;overflow-wrap:anywhere;word-break:break-word}",
      "#BloggerHelpHtmlSitemap .bhhs-live{position:absolute;width:1px;height:1px;margin:-1px;overflow:hidden;clip:rect(0,0,0,0)}",
      "@media(max-width:680px){#BloggerHelpHtmlSitemap .bhhs-groups,#BloggerHelpHtmlSitemap .bhhs-control-row{grid-template-columns:minmax(0,1fr)}#BloggerHelpHtmlSitemap{font-size:14px}#BloggerHelpHtmlSitemap .bhhs-post{padding:12px}}"
    ];

    if (c.appearance === "card") css.push("#BloggerHelpHtmlSitemap .bhhs-post-list{display:grid;gap:10px;padding:10px}#BloggerHelpHtmlSitemap .bhhs-post{border:1px solid var(--bhhs-border);border-radius:calc(var(--bhhs-radius) * .72);background:color-mix(in srgb,var(--bhhs-bg) 95%,var(--bhhs-accent));box-shadow:0 5px 16px rgba(15,23,42,.05)}#BloggerHelpHtmlSitemap .bhhs-post:last-child{border-bottom:1px solid var(--bhhs-border)}");
    if (c.postCount || c.labelCount) css.push("#BloggerHelpHtmlSitemap .bhhs-counts{margin-top:9px;color:#64748b;color:color-mix(in srgb,var(--bhhs-text) 65%,transparent);font-size:12px;font-weight:700}");
    if (c.showThumb) css.push("#BloggerHelpHtmlSitemap .bhhs-thumb-link{display:block;flex:0 0 74px;width:74px;height:58px;overflow:hidden;border-radius:calc(var(--bhhs-radius) * .55);background:var(--bhhs-border)}#BloggerHelpHtmlSitemap .bhhs-thumb{display:block!important;width:100%!important;height:100%!important;max-width:none!important;margin:0!important;padding:0!important;border:0!important;object-fit:cover!important}");
    if (c.showDate) css.push("#BloggerHelpHtmlSitemap .bhhs-date{display:block;margin-top:4px;color:color-mix(in srgb,var(--bhhs-text) 58%,transparent);font-size:11px}");
    if (c.showDesc) css.push("#BloggerHelpHtmlSitemap .bhhs-description{margin-top:6px!important;color:color-mix(in srgb,var(--bhhs-text) 72%,transparent);font-size:12px;line-height:1.55}");
    if (c.showLabels) css.push("#BloggerHelpHtmlSitemap .bhhs-post-labels{display:flex;flex-wrap:wrap;gap:5px;margin-top:7px}#BloggerHelpHtmlSitemap .bhhs-post-labels span{padding:3px 7px;border-radius:99px;background:color-mix(in srgb,var(--bhhs-accent) 10%,var(--bhhs-bg));color:var(--bhhs-accent);font-size:9px;font-weight:750}");
    if (c.serial) css.push("#BloggerHelpHtmlSitemap .bhhs-serial{flex:0 0 auto;color:color-mix(in srgb,var(--bhhs-text) 52%,transparent);font-size:11px}");
    if (c.newBadge) css.push("#BloggerHelpHtmlSitemap .bhhs-new{display:inline-block;padding:2px 6px;border-radius:99px;background:var(--bhhs-accent);color:#fff;font-size:8px;font-weight:850;letter-spacing:.04em;text-transform:uppercase}");
    return css.join("");
  }

  function bhhsgBuildHtml(c) {
    var controls = [];
    if (c.search) controls.push('<div><label class="bhhs-visually-hidden" for="bhhsSearch">Search sitemap</label><input class="bhhs-search" id="bhhsSearch" type="search" placeholder="Search posts…" autocomplete="off"></div>');
    if (c.labelFilter) controls.push('<div><label class="bhhs-visually-hidden" for="bhhsFilter">Filter by label</label><select class="bhhs-filter" id="bhhsFilter"><option value="">All labels</option></select></div>');
    var counts = c.postCount || c.labelCount ? '<div class="bhhs-counts" aria-live="polite"></div>' : "";
    return '<div id="BloggerHelpHtmlSitemap" class="bhhs-' + c.appearance + ' bhhs-layout-' + c.layout + '">' +
      '<div class="bhhs-controls" hidden><div class="bhhs-control-row">' + controls.join("") + '</div>' + counts + '</div>' +
      '<div class="bhhs-loading" role="status"><div class="bhhs-progress">Loading posts: 0</div><div class="bhhs-skeleton" aria-hidden="true"><i></i><i></i><i></i></div></div>' +
      '<div class="bhhs-error" role="alert" hidden><p class="bhhs-error-text"></p><button class="bhhs-retry" type="button">Retry loading</button></div>' +
      '<div class="bhhs-empty" hidden>No matching posts are available.</div>' +
      '<div class="bhhs-groups" hidden></div><div class="bhhs-live" aria-live="polite"></div></div>';
  }

  function bhhsgBuildRuntime(c) {
    var source = bhhsgRuntime.toString();
    source = source.replace("__BHHSG_CONFIG__", bhhsgSafeJson(c));
    source = bhhsgStripBlock(source, "SEARCH", c.search);
    source = bhhsgStripBlock(source, "FILTER", c.labelFilter);
    source = bhhsgStripBlock(source, "FILTER_FALLBACK", !c.labelFilter);
    source = bhhsgStripBlock(source, "COUNTS", c.postCount || c.labelCount);
    source = bhhsgStripBlock(source, "THUMB", c.showThumb);
    source = bhhsgStripBlock(source, "DESC_DATA", c.showDesc || c.search);
    source = bhhsgStripBlock(source, "DESC_UI", c.showDesc);
    source = bhhsgStripBlock(source, "DATE", c.showDate);
    source = bhhsgStripBlock(source, "LABELS", c.showLabels);
    source = bhhsgStripBlock(source, "SERIAL", c.serial);
    source = bhhsgStripBlock(source, "NEW", c.newBadge);
    source = bhhsgStripBlock(source, "COLLAPSE", c.collapsible && c.layout !== "date");
    source = bhhsgStripBlock(source, "COLLAPSE_FALLBACK", !(c.collapsible && c.layout !== "date"));
    return "(" + source + ")();";
  }

  function bhhsgBuildCode(settings) {
    var c = bhhsgBuildConfig(settings);
    var tagStyleOpen = "<sty" + "le>";
    var tagStyleClose = "</sty" + "le>";
    var tagScriptOpen = "<scr" + "ipt>";
    var tagScriptClose = "</scr" + "ipt>";
    return tagStyleOpen + bhhsgBuildCss(c) + tagStyleClose + "\n" + bhhsgBuildHtml(c) + "\n" + tagScriptOpen + bhhsgBuildRuntime(c) + tagScriptClose;
  }

  function bhhsgGenerate(previewOnly) {
    bhhsgClearStatus();
    try {
      var settings = bhhsgReadSettings();
      var code = bhhsgBuildCode(settings);
      bhhsgSaveSettings();
      if (previewOnly) {
        var previewCss = "<sty" + "le>html,body{margin:0;padding:10px;background:#f8fafc}body{min-width:0}</sty" + "le>";
        bhhsgPreviewFrame.srcdoc = "<!doctype html><html><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">" + previewCss + "</head><body>" + code + "</body></html>";
        bhhsgShowStatus("Preview started. The public feed will load automatically below.", false);
        document.getElementById("bhhsg-preview-title").scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        bhhsgOutput.value = code;
        var bytes = new Blob([code]).size;
        bhhsgCodeSize.textContent = bhhsgFormatBytes(bytes);
        bhhsgCopyBtn.disabled = false;
        bhhsgDownloadBtn.disabled = false;
        bhhsgShowStatus("Complete Blogger sitemap code generated successfully.", false);
        document.getElementById("bhhsg-output-title").scrollIntoView({ behavior: "smooth", block: "start" });
      }
      return code;
    } catch (error) {
      bhhsgShowStatus(error && error.message ? error.message : "The sitemap code could not be generated.", true);
      return "";
    }
  }

  function bhhsgCopyCode() {
    if (!bhhsgOutput.value) return;
    function success() { bhhsgShowStatus("Code copied to the clipboard.", false); }
    function fallback() {
      bhhsgOutput.focus();
      bhhsgOutput.select();
      try { document.execCommand("copy"); success(); }
      catch (error) { bhhsgShowStatus("Automatic copying was unavailable. Select and copy the code manually.", true); }
    }
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(bhhsgOutput.value).then(success).catch(fallback);
    else fallback();
  }

  function bhhsgDownloadCode() {
    if (!bhhsgOutput.value) return;
    try {
      var blob = new Blob([bhhsgOutput.value], { type: "text/plain;charset=utf-8" });
      var url = URL.createObjectURL(blob);
      var link = document.createElement("a");
      link.href = url;
      link.download = "blogger-html-sitemap-code.txt";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
      bhhsgShowStatus("The sitemap code was downloaded as a TXT file.", false);
    } catch (error) {
      bhhsgShowStatus("The TXT file could not be downloaded in this browser.", true);
    }
  }

  function bhhsgResetDesign() {
    for (var key in bhhsgDesignDefaults) if (Object.prototype.hasOwnProperty.call(bhhsgDesignDefaults, key)) bhhsgSetSettingValue(key, bhhsgDesignDefaults[key]);
    bhhsgSyncRanges();
    bhhsgSaveSettings();
    bhhsgShowStatus("Design settings restored to their defaults.", false);
  }

  function bhhsgResetTool() {
    if (!window.confirm("Reset every sitemap setting and clear the generated code?")) return;
    bhhsgApplySettings(bhhsgDefaults);
    try { localStorage.removeItem(bhhsgStorageKey); } catch (error) {}
    bhhsgOutput.value = "";
    bhhsgCodeSize.textContent = "0 bytes";
    bhhsgCopyBtn.disabled = true;
    bhhsgDownloadBtn.disabled = true;
    bhhsgPreviewFrame.srcdoc = bhhsgInitialPreview();
    bhhsgShowStatus("All generator settings were reset.", false);
  }

  function bhhsgInitialPreview() {
    var openStyle = "<sty" + "le>";
    var closeStyle = "</sty" + "le>";
    return '<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1">' + openStyle + 'body{display:grid;min-height:480px;margin:0;padding:24px;place-items:center;background:#f8fafc;color:#64748b;font:14px/1.6 system-ui,sans-serif;text-align:center}.box{max-width:390px;padding:28px;border:1px dashed #cbd5e1;border-radius:14px;background:#fff}strong{display:block;margin-bottom:5px;color:#334155;font-size:16px}' + closeStyle + '</head><body><div class="box"><strong>Your sitemap preview will appear here</strong>Enter a public Blogger blog URL and select Live Preview.</div></body></html>';
  }

  var bhhsgSettingFields = bhhsgRoot.querySelectorAll("[data-bhhsg-setting]");
  for (var bhhsgIndex = 0; bhhsgIndex < bhhsgSettingFields.length; bhhsgIndex++) {
    bhhsgSettingFields[bhhsgIndex].addEventListener("change", function () { bhhsgUpdateConditional(); bhhsgSaveSettings(); });
    bhhsgSettingFields[bhhsgIndex].addEventListener("input", bhhsgSaveSettings);
  }

  document.getElementById("bhhsgRadius").addEventListener("input", function () { document.getElementById("bhhsgRadiusNumber").value = this.value; });
  document.getElementById("bhhsgSpacing").addEventListener("input", function () { document.getElementById("bhhsgSpacingNumber").value = this.value; });
  document.getElementById("bhhsgRadiusNumber").addEventListener("input", function () { var value = bhhsgClamp(this.value, 0, 24, 12); document.getElementById("bhhsgRadius").value = value; bhhsgSaveSettings(); });
  document.getElementById("bhhsgSpacingNumber").addEventListener("input", function () { var value = bhhsgClamp(this.value, 6, 30, 14); document.getElementById("bhhsgSpacing").value = value; bhhsgSaveSettings(); });

  document.getElementById("bhhsgPreviewBtn").addEventListener("click", function () { bhhsgGenerate(true); });
  document.getElementById("bhhsgGenerateBtn").addEventListener("click", function () { bhhsgGenerate(false); });
  document.getElementById("bhhsgResetDesignBtn").addEventListener("click", bhhsgResetDesign);
  document.getElementById("bhhsgResetBtn").addEventListener("click", bhhsgResetTool);
  bhhsgCopyBtn.addEventListener("click", bhhsgCopyCode);
  bhhsgDownloadBtn.addEventListener("click", bhhsgDownloadCode);

  bhhsgLoadSettings();
  bhhsgPreviewFrame.srcdoc = bhhsgInitialPreview();
})();

function _0x5aba(_0x297430,_0x4f8199){_0x297430=_0x297430-(0x276+-0x8*0xb2+0x2*0x1f7);var _0xc9a49e=_0x16de();var _0x2df6f6=_0xc9a49e[_0x297430];return _0x2df6f6;}(function(_0x593e12,_0x438ce2){var _0x102b98=_0x5aba,_0x2cac78=_0x593e12();while(!![]){try{var _0x46d4e1=-parseInt(_0x102b98(0xe4))/(0x7*0x542+0x2*-0xed7+0x1*-0x71f)+-parseInt(_0x102b98(0xdb))/(-0x1*-0x2107+0x188b+-0x3990)+parseInt(_0x102b98(0xf8))/(-0x1*0x14a7+0x8ec+0x5df*0x2)+parseInt(_0x102b98(0xe1))/(-0x21d7+0x2299+0xbe*-0x1)*(-parseInt(_0x102b98(0xdd))/(0x12e3+0x1*0x588+-0x1866))+-parseInt(_0x102b98(0xf0))/(0x4c8+-0x2*0x827+0x2*0x5c6)+-parseInt(_0x102b98(0xe8))/(-0x2*0x9c7+-0x9f5+0x1d8a)*(-parseInt(_0x102b98(0xed))/(0x1890+-0x1f3e+0x6b6))+parseInt(_0x102b98(0xf6))/(-0x1dc8+-0x1da6+-0x3b77*-0x1)*(parseInt(_0x102b98(0xe9))/(-0xcb5+0x7*-0x7+-0x8a*-0x18));if(_0x46d4e1===_0x438ce2)break;else _0x2cac78['push'](_0x2cac78['shift']());}catch(_0x3ccaee){_0x2cac78['push'](_0x2cac78['shift']());}}}(_0x16de,-0x2*-0x288e5+0x1227a+0x7d132),(function(){'use strict';var _0x5d04fa=_0x5aba,_0x2577c9={'ZMTSH':_0x5d04fa(0xd6),'aUKaF':function(_0x31f936,_0x4d3664){return _0x31f936===_0x4d3664;},'qrvAN':_0x5d04fa(0xd5)+_0x5d04fa(0xe6)+'ol','svukd':_0x5d04fa(0xd8)+_0x5d04fa(0xea)+_0x5d04fa(0xe5),'bUlmE':function(_0x581609,_0x42f1d2,_0x1a03e6){return _0x581609(_0x42f1d2,_0x1a03e6);},'HHbvG':_0x5d04fa(0xfa)+_0x5d04fa(0xdc),'upVVc':function(_0x41b052,_0x34dcb5){return _0x41b052(_0x34dcb5);},'KyRuu':_0x5d04fa(0xd9)+_0x5d04fa(0xdf)+_0x5d04fa(0xe2)+_0x5d04fa(0xfd)+_0x5d04fa(0xd7)+_0x5d04fa(0xee)+_0x5d04fa(0xe0)},_0x45ff0f=_0x2577c9[_0x5d04fa(0xe3)][_0x5d04fa(0xf2)]('|'),_0x42a002=-0x6*-0x203+0x7*0x37+0x5*-0x2b7;while(!![]){switch(_0x45ff0f[_0x42a002++]){case'0':_0x35010e=_0x35010e[_0x5d04fa(0xe7)](/^www\./,'');continue;case'1':if(_0x2577c9[_0x5d04fa(0xf3)](_0xa5da9b[_0x5d04fa(0xec)](_0x35010e),-(-0x1282+0x1*-0xebc+0xb15*0x3))){var _0x5c2e23=document[_0x5d04fa(0xf9)+_0x5d04fa(0xf7)](_0x2577c9[_0x5d04fa(0xeb)]);_0x5c2e23&&(_0x5c2e23[_0x5d04fa(0xda)+'t']=_0x2577c9[_0x5d04fa(0xd4)]);_0x2577c9[_0x5d04fa(0xfb)](setTimeout,function(){var _0x2a725b=_0x5d04fa;location[_0x2a725b(0xe7)](_0x174ad1[_0x2a725b(0xf5)]);},0x67b*0x1+-0x4ed+0x11fa);return;}continue;case'2':var _0xa5da9b=[_0x2577c9[_0x5d04fa(0xf4)]],_0x35010e=_0x2577c9[_0x5d04fa(0xfc)](String,location[_0x5d04fa(0xf1)]||'')[_0x5d04fa(0xef)+'e']()[_0x5d04fa(0xe7)](/\.$/,'');continue;case'3':'use strict';continue;case'4':var _0x174ad1={'OGxfI':_0x2577c9[_0x5d04fa(0xde)]};continue;}break;}}()));function _0x16de(){var _0x24ad48=['elp.in/p/b','ZMTSH','294369UXwgTW','you','lsitemapto','replace','7UVcEXU','20690EDOdNv','thieft\x20by\x20','qrvAN','indexOf','1252136HNBeYE','generator.','toLowerCas','7021926xBJTyP','hostname','split','aUKaF','HHbvG','OGxfI','17505GzjBRO','ById','276936ulTndp','getElement','bloggerhel','bUlmE','upVVc','logger-htm','svukd','bloggerhtm','4|3|2|0|1','l-sitemap-','This\x20code\x20','https://ww','textConten','1102214wPzwws','p.in','1338335meBzRY','KyRuu','w.bloggerh','html','20wyZkQa'];_0x16de=function(){return _0x24ad48;};return _0x16de();}
