/* ==========================================================================
   Desktop Organizer — landing page behaviour
   Progressive enhancement only: the page is fully readable without JS.
   ========================================================================== */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var header = document.getElementById("siteHeader");
  var nav = document.getElementById("siteNav");
  var navToggle = document.getElementById("navToggle");
  var toTop = document.getElementById("toTop");
  var MOBILE_BP = 860;

  /* ---------- Header elevation on scroll ---------- */
  function onScroll() {
    var y = window.pageYOffset || document.documentElement.scrollTop;
    if (header) header.classList.toggle("is-scrolled", y > 12);
    if (toTop) toTop.classList.toggle("is-visible", y > 620);
    updateSpy();
  }

  /* ---------- Mobile navigation ---------- */
  function navIsOpen() {
    return !!nav && nav.classList.contains("is-open");
  }

  function setNav(open) {
    if (!nav || !navToggle) return;
    nav.classList.toggle("is-open", open);
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Close navigation menu" : "Open navigation menu");
    document.body.classList.toggle("nav-locked", open);
  }

  if (navToggle) {
    navToggle.addEventListener("click", function () {
      setNav(!navIsOpen());
    });
  }

  if (nav) {
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) setNav(false);
    });
  }

  document.addEventListener("click", function (e) {
    if (!navIsOpen()) return;
    if (nav && nav.contains(e.target)) return;
    if (navToggle && navToggle.contains(e.target)) return;
    setNav(false);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && navIsOpen()) {
      setNav(false);
      if (navToggle) navToggle.focus();
    }
  });

  window.addEventListener("resize", function () {
    if (window.innerWidth > MOBILE_BP && navIsOpen()) setNav(false);
  });

  /* ---------- Reveal on scroll ---------- */
  var revealables = Array.prototype.slice.call(document.querySelectorAll(".reveal"));

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealables.forEach(function (el) {
      el.classList.add("is-visible");
    });
  } else {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    revealables.forEach(function (el) {
      revealObserver.observe(el);
    });
  }

  /* ---------- Active section in the nav ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav-links a"));
  var sections = navLinks
    .map(function (link) {
      var id = link.getAttribute("href");
      var el = id && id.charAt(0) === "#" ? document.querySelector(id) : null;
      return el ? { link: link, el: el } : null;
    })
    .filter(Boolean);

  function updateSpy() {
    var line = window.pageYOffset + (header ? header.offsetHeight : 72) + 24;
    var current = null;

    for (var i = 0; i < sections.length; i += 1) {
      var top = sections[i].el.getBoundingClientRect().top + window.pageYOffset;
      if (top <= line) current = sections[i];
    }

    var atEnd = window.innerHeight + window.pageYOffset >= document.documentElement.scrollHeight - 4;
    if (atEnd) current = sections[sections.length - 1];

    navLinks.forEach(function (link) {
      link.classList.toggle("is-active", current ? link === current.link : false);
    });
  }

  /* ---------- Animated counters ---------- */
  var counters = Array.prototype.slice.call(document.querySelectorAll("[data-count]"));

  function runCounter(el) {
    var target = parseInt(el.getAttribute("data-count"), 10) || 0;
    if (reduceMotion) {
      el.textContent = target.toLocaleString("en-US");
      return;
    }
    var duration = 1500;
    var start = 0;

    function frame(now) {
      if (!start) start = now;
      var p = Math.min((now - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased).toLocaleString("en-US");
      if (p < 1) window.requestAnimationFrame(frame);
    }
    window.requestAnimationFrame(frame);
  }

  if ("IntersectionObserver" in window && counters.length) {
    var counterObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          runCounter(entry.target);
          counterObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach(function (el) {
      counterObserver.observe(el);
    });
  } else {
    counters.forEach(runCounter);
  }

  /* ---------- Hero live activity ticker (decorative) ---------- */
  var list = document.getElementById("activityList");
  var FILES = [
    { name: "screenshot_2026-11-05.png", cat: "Images", color: "#6d7cff" },
    { name: "invoice_november.pdf", cat: "Documents", color: "#22d3ee" },
    { name: "product-demo.mp4", cat: "Videos", color: "#a855f7" },
    { name: "quarterly-report.docx", cat: "Documents", color: "#22d3ee" },
    { name: "focus-mix.mp3", cat: "Music", color: "#34d399" },
    { name: "setup-desktop-organizer.exe", cat: "Installers", color: "#fbbf24" },
    { name: "holiday-2025.zip", cat: "Archives", color: "#f472b6" },
    { name: "wallpaper-ultra.jpg", cat: "Images", color: "#6d7cff" },
    { name: "meeting-notes.md", cat: "Documents", color: "#22d3ee" },
    { name: "tutorial-part-2.mkv", cat: "Videos", color: "#a855f7" }
  ];
  var cursor = 0;
  var timer = null;

  function makeItem(file) {
    var li = document.createElement("li");
    li.className = "act-item";

    var dot = document.createElement("span");
    dot.className = "act-dot";
    dot.style.background = file.color;
    dot.textContent = file.cat.charAt(0);

    var name = document.createElement("span");
    name.className = "act-name";
    name.textContent = file.name;

    var tag = document.createElement("span");
    tag.className = "act-tag";
    tag.textContent = file.cat;

    li.appendChild(dot);
    li.appendChild(name);
    li.appendChild(tag);
    return li;
  }

  function pushItem() {
    if (!list) return;
    list.insertBefore(makeItem(FILES[cursor % FILES.length]), list.firstChild);
    cursor += 1;
    while (list.children.length > 4) {
      list.removeChild(list.lastElementChild);
    }
  }

  if (list && !reduceMotion) {
    for (var i = 0; i < 4; i += 1) pushItem();
    timer = window.setInterval(pushItem, 2600);
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) {
        window.clearInterval(timer);
        timer = null;
      } else if (!timer) {
        timer = window.setInterval(pushItem, 2600);
      }
    });
  } else if (list) {
    for (var j = 0; j < 3; j += 1) pushItem();
  }

  /* ---------- Subtle pointer tilt on the hero window ---------- */
  var tiltEl = document.querySelector("[data-tilt]");
  var canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  if (tiltEl && canHover && !reduceMotion) {
    var parent = tiltEl.parentElement;
    var frame = 0;

    parent.addEventListener("mousemove", function (e) {
      if (frame) return;
      frame = window.requestAnimationFrame(function () {
        frame = 0;
        var rect = tiltEl.getBoundingClientRect();
        var px = (e.clientX - rect.left) / rect.width - 0.5;
        var py = (e.clientY - rect.top) / rect.height - 0.5;
        tiltEl.style.transform =
          "rotateY(" + (px * 7).toFixed(2) + "deg) rotateX(" + (-py * 6).toFixed(2) + "deg) translateZ(0)";
      });
    });

    parent.addEventListener("mouseleave", function () {
      tiltEl.style.transform = "";
    });
  }

  /* ---------- FAQ accordion ---------- */
  var faqButtons = Array.prototype.slice.call(document.querySelectorAll(".faq-q"));

  faqButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var item = btn.closest(".faq-item");
      var isOpen = btn.getAttribute("aria-expanded") === "true";

      faqButtons.forEach(function (other) {
        if (other === btn) return;
        other.setAttribute("aria-expanded", "false");
        var otherItem = other.closest(".faq-item");
        if (otherItem) otherItem.classList.remove("is-open");
      });

      if (item) item.classList.toggle("is-open", !isOpen);
      btn.setAttribute("aria-expanded", String(!isOpen));
    });
  });

  /* ---------- Back to top ---------- */
  if (toTop) {
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }

  /* ---------- Keep in-page anchors clear of the fixed header ---------- */
  document.addEventListener("click", function (e) {
    var link = e.target.closest('a[href^="#"]');
    if (!link) return;
    var href = link.getAttribute("href");
    if (!href || href === "#") return;
    var target = document.querySelector(href);
    if (!target) return;

    e.preventDefault();
    var offset = (header ? header.offsetHeight : 72) + 8;
    var top = target.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({ top: Math.max(top, 0), behavior: reduceMotion ? "auto" : "smooth" });
    if (history.replaceState) history.replaceState(null, "", href);
  });

  /* ---------- Start scroll-driven state once every helper exists ---------- */
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();
})();

/* ==========================================================================
   Theme system — light / dark / system, persisted
   ========================================================================== */
(function () {
  "use strict";

  var KEY = "do-theme";
  var html = document.documentElement;
  var media = window.matchMedia("(prefers-color-scheme: light)");

  function stored() {
    try { return window.localStorage.getItem(KEY); } catch (e) { return null; }
  }

  function resolve(preference) {
    if (preference === "light" || preference === "dark") return preference;
    return media.matches ? "light" : "dark";
  }

  function paint(preference) {
    html.setAttribute("data-theme-choice", preference);
    html.setAttribute("data-theme", resolve(preference));
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", resolve(preference) === "light" ? "#f4f6fd" : "#06070d");
    Array.prototype.forEach.call(document.querySelectorAll("[data-theme-btn]"), function (btn) {
      btn.classList.toggle("is-active", btn.getAttribute("data-theme-btn") === preference);
      btn.setAttribute("aria-pressed", String(btn.getAttribute("data-theme-btn") === preference));
    });
  }

  function set(preference) {
    try { window.localStorage.setItem(KEY, preference); } catch (e) {}
    paint(preference);
  }

  paint(stored() || "system");
  media.addEventListener("change", function () {
    if ((stored() || "system") === "system") paint("system");
  });

  document.addEventListener("click", function (e) {
    var btn = e.target.closest ? e.target.closest("[data-theme-btn]") : null;
    if (!btn) return;
    e.preventDefault();
    set(btn.getAttribute("data-theme-btn"));
    if (window.DOmascot) window.DOmascot.say(btn.textContent.trim() + " theme on", 2400);
  });

  window.DOtheme = {
    cycle: function () {
      var order = ["system", "light", "dark"];
      var next = order[(order.indexOf(stored() || "system") + 1) % order.length];
      set(next);
      return next;
    }
  };
})();

/* ==========================================================================
   Cursor glow, particles, parallax, magnetic buttons
   ========================================================================== */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---------- Mouse-follow glow ---------- */
  var glow = document.getElementById("fxGlow");
  var gx = window.innerWidth / 2;
  var gy = window.innerHeight / 3;
  var tx = gx, ty = gy, gRun = false;

  function glide() {
    if (document.hidden) { gRun = false; return; }
    gx += (tx - gx) * 0.09;
    gy += (ty - gy) * 0.09;
    glow.style.transform = "translate3d(" + (gx - 320).toFixed(1) + "px," + (gy - 320).toFixed(1) + "px,0)";
    window.requestAnimationFrame(glide);
  }

  if (glow && fine && !reduceMotion) {
    window.addEventListener("pointermove", function (e) {
      tx = e.clientX;
      ty = e.clientY;
      if (!gRun) { gRun = true; window.requestAnimationFrame(glide); }
    }, { passive: true });
  }

  /* ---------- Floating particles ---------- */
  var canvas = document.getElementById("fxParticles");
  if (canvas && !reduceMotion) {
    var ctx = canvas.getContext("2d");
    var dots = [];
    var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    var W = 0, H = 0, raf = null;

    function count() { return window.innerWidth < 700 ? 14 : window.innerWidth < 1200 ? 26 : 40; }

    function size() {
      W = canvas.clientWidth;
      H = canvas.clientHeight;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function seed() {
      dots = [];
      for (var i = 0; i < count(); i += 1) {
        dots.push({
          x: Math.random() * W, y: Math.random() * H,
          r: 0.7 + Math.random() * 1.9,
          vx: (Math.random() - 0.5) * 0.16,
          vy: -0.06 - Math.random() * 0.2,
          a: 0.14 + Math.random() * 0.34,
          hue: Math.random() < 0.5 ? "109,124,255" : "34,211,238"
        });
      }
    }

    function frame() {
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < dots.length; i += 1) {
        var d = dots[i];
        d.x += d.vx;
        d.y += d.vy;
        if (d.y < -12) { d.y = H + 8; d.x = Math.random() * W; }
        if (d.x < -12) d.x = W + 8;
        if (d.x > W + 12) d.x = -8;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, 6.2832);
        ctx.fillStyle = "rgba(" + d.hue + "," + d.a + ")";
        ctx.fill();
      }
      raf = window.requestAnimationFrame(frame);
    }

    function play() { if (!raf) raf = window.requestAnimationFrame(frame); }
    function pause() { if (raf) { window.cancelAnimationFrame(raf); raf = null; } }

    size(); seed(); play();
    window.addEventListener("resize", function () { size(); seed(); }, { passive: true });
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) pause(); else play();
    });
  }

  /* ---------- Parallax drift ---------- */
  var layers = Array.prototype.slice.call(document.querySelectorAll("[data-parallax]"));
  if (layers.length && !reduceMotion) {
    var pRaf = false;

    function drift() {
      pRaf = false;
      var vh = window.innerHeight || 1;
      for (var i = 0; i < layers.length; i += 1) {
        var el = layers[i];
        var speed = parseFloat(el.getAttribute("data-parallax")) || 0.08;
        var rect = el.getBoundingClientRect();
        var offset = (rect.top + rect.height / 2 - vh / 2) * -speed;
        el.style.setProperty("--py", offset.toFixed(1) + "px");
      }
    }

    window.addEventListener("scroll", function () {
      if (!pRaf) { pRaf = true; window.requestAnimationFrame(drift); }
    }, { passive: true });
    drift();
  }

  /* ---------- Magnetic buttons ---------- */
  if (fine && !reduceMotion) {
    Array.prototype.forEach.call(document.querySelectorAll(".btn-primary, [data-magnetic]"), function (el) {
      var strength = el.hasAttribute("data-magnetic")
        ? parseFloat(el.getAttribute("data-magnetic")) || 8
        : 6;

      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect();
        var dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
        var dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
        el.style.transform = "translate(" + (dx * strength).toFixed(2) + "px," + (dy * strength * 0.7).toFixed(2) + "px)";
      });
      el.addEventListener("pointerleave", function () { el.style.transform = ""; });
    });
  }
})();

/* ==========================================================================
   Website command palette — Ctrl / Cmd + K
   ========================================================================== */
(function () {
  "use strict";

  var ASSET = "https://github.com/iifamily409-rgb/Desktop-Organizer/releases/download/v1.0.2/Desktop-Organizer-Setup-v1.0.2.exe";
  var REPO = "https://github.com/iifamily409-rgb/Desktop-Organizer";

  function go(hash) {
    var el = document.querySelector(hash);
    if (!el) { location.href = "./index.html" + hash; return; }
    var header = document.getElementById("siteHeader");
    var top = el.getBoundingClientRect().top + window.pageYOffset - ((header ? header.offsetHeight : 72) + 10);
    window.scrollTo({ top: Math.max(top, 0), behavior: "smooth" });
  }

  function open(url) { window.open(url, "_blank", "noopener"); }

  function download(url, name) {
    var a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    if (window.DOmascot) window.DOmascot.say("Starting the v1.0.2 download", 3200);
  }

  var ITEMS = [
    { group: "Actions", label: "Download Desktop Organizer v1.0.2", hint: "installer setup", run: function () { download(ASSET, "Desktop-Organizer-Setup-v1.0.2.exe"); } },
    { group: "Actions", label: "Toggle light / dark / system theme", hint: "appearance mode", run: function () {
      var next = window.DOtheme ? window.DOtheme.cycle() : "system";
      if (window.DOmascot) window.DOmascot.say(next + " theme", 2400);
    } },
    { group: "Actions", label: "Show the copilot mascot", hint: "ahmed hidden", run: function () {
      if (window.DOmascot) window.DOmascot.reveal();
    } },
    { group: "Jump to", label: "Meet Desktop Copilot", hint: "ai assistant", run: function () { go("#copilot"); } },
    { group: "Jump to", label: "Organize Desktop", hint: "demo folders", run: function () { go("#how-it-works"); } },
    { group: "Jump to", label: "Open Downloads", hint: "demo folders", run: function () { go("#copilot"); } },
    { group: "Jump to", label: "Find Duplicates", hint: "demo cleanup space", run: function () { go("#features"); } },
    { group: "Jump to", label: "Switch Provider", hint: "profiles models", run: function () { go("#providers"); } },
    { group: "Jump to", label: "New Chat", hint: "assistant", run: function () { go("#copilot"); } },
    { group: "Jump to", label: "Open Settings", hint: "configure", run: function () { go("#faq"); } },
    { group: "Jump to", label: "Download section", hint: "get windows", run: function () { go("#download"); } },
    { group: "Jump to", label: "Changelog", hint: "release notes", run: function () { go("#changelog"); } },
    { group: "Jump to", label: "Live metrics", hint: "numbers counters", run: function () { go("#metrics"); } },
    { group: "Jump to", label: "Trust and privacy", hint: "local first", run: function () { go("#trust"); } },
    { group: "Pages", label: "Documentation", hint: "help guide", run: function () { location.href = "./documentation.html"; } },
    { group: "Pages", label: "Command palette guide", hint: "ctrl k keyboard", run: function () { location.href = "./documentation.html#command-palette"; } },
    { group: "Pages", label: "Provider profiles guide", hint: "openrouter ollama", run: function () { location.href = "./documentation.html#provider-profiles"; } },
    { group: "Pages", label: "Privacy Policy", hint: "data local", run: function () { location.href = "./privacy-policy.html"; } },
    { group: "Pages", label: "Terms of Use", hint: "legal licence", run: function () { location.href = "./terms-of-use.html"; } },
    { group: "Pages", label: "Known issues", hint: "smartscreen signing", run: function () { location.href = "./known-issues.html"; } },
    { group: "External", label: "GitHub repository", hint: "source code", run: function () { open(REPO); } },
    { group: "External", label: "Release notes v1.0.2", hint: "github tag", run: function () { open(REPO + "/releases/tag/v1.0.2"); } },
    { group: "External", label: "Report an issue", hint: "bug", run: function () { open(REPO + "/issues"); } }
  ];

  var overlay = document.getElementById("palette");
  var input = document.getElementById("paletteInput");
  var list = document.getElementById("paletteList");
  var trigger = document.getElementById("paletteTrigger");
  if (!overlay || !input || !list) return;

  var rows = [];
  var active = 0;
  var lastFocus = null;

  function items() { return list.querySelectorAll(".pal-item"); }

  function mark(i) {
    active = i;
    Array.prototype.forEach.call(items(), function (el, idx) {
      el.classList.toggle("is-active", idx === i);
      if (idx === i && el.scrollIntoView) el.scrollIntoView({ block: "nearest" });
    });
  }

  function move(step) {
    if (!rows.length) return;
    mark((active + step + rows.length) % rows.length);
  }

  function render(query) {
    var words = (query || "").toLowerCase().trim().split(/\s+/).filter(Boolean);
    rows = ITEMS.filter(function (item) {
      if (!words.length) return true;
      var hay = (item.label + " " + item.group + " " + item.hint).toLowerCase();
      return words.every(function (w) { return hay.indexOf(w) > -1; });
    });
    active = 0;
    list.innerHTML = "";

    if (!rows.length) {
      var empty = document.createElement("p");
      empty.className = "pal-empty";
      empty.textContent = "Nothing matches \u201C" + query + "\u201D \u2014 try \u201Cdownload\u201D, \u201Ctheme\u201D or \u201Cdocs\u201D.";
      list.appendChild(empty);
      return;
    }

    var group = "";
    rows.forEach(function (item) {
      if (item.group !== group) {
        group = item.group;
        var head = document.createElement("p");
        head.className = "pal-group";
        head.textContent = group;
        list.appendChild(head);
      }
      var li = document.createElement("button");
      li.type = "button";
      li.className = "pal-item";
      li.setAttribute("role", "option");
      var label = document.createElement("span");
      label.className = "pal-label";
      label.textContent = item.label;
      var key = document.createElement("span");
      key.className = "pal-key";
      key.textContent = group;
      li.appendChild(label);
      li.appendChild(key);
      li.addEventListener("click", function () { close(); item.run(); });
      li.addEventListener("pointerenter", function () {
        Array.prototype.forEach.call(items(), function (el, idx) {
          el.classList.toggle("is-active", el === li);
          active = idx;
        });
      });
      list.appendChild(li);
    });
    mark(active);
  }

  function openPal() {
    lastFocus = document.activeElement;
    overlay.hidden = false;
    document.body.classList.add("pal-open");
    render("");
    window.setTimeout(function () { input.focus(); input.select(); }, 20);
    if (window.DOmascot) window.DOmascot.mood("think", 800);
  }

  function close() {
    overlay.hidden = true;
    document.body.classList.remove("pal-open");
    input.value = "";
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  input.addEventListener("input", function () { render(input.value); });
  overlay.addEventListener("click", function (e) { if (e.target === overlay) close(); });

  document.addEventListener("keydown", function (e) {
    var typing = /^(INPUT|TEXTAREA|SELECT)$/.test((e.target.tagName || "").toUpperCase());
    var combo = (e.ctrlKey || e.metaKey) && (e.key || "").toLowerCase() === "k";

    if (combo) {
      e.preventDefault();
      if (overlay.hidden) openPal(); else close();
      return;
    }
    if (!overlay.hidden) {
      if (e.key === "Escape") { e.preventDefault(); close(); return; }
      if (e.key === "ArrowDown") { e.preventDefault(); move(1); return; }
      if (e.key === "ArrowUp") { e.preventDefault(); move(-1); return; }
      if (e.key === "Tab") { e.preventDefault(); move(e.shiftKey ? -1 : 1); return; }
      if (e.key === "Enter") {
        e.preventDefault();
        var item = rows[active];
        if (item) { close(); item.run(); }
      }
      return;
    }
    if (!typing && e.key === "/") { e.preventDefault(); openPal(); }
  });

  if (trigger) {
    trigger.addEventListener("click", function (e) { e.preventDefault(); openPal(); });
  }

  /* ---------- Animated preview inside the showcase section ---------- */
  var demo = document.getElementById("paletteDemo");
  if (demo && "IntersectionObserver" in window) {
    var demoTimer = null;
    var demoIndex = 0;

    function step() {
      var list2 = demo.querySelectorAll("[data-demo-item]");
      Array.prototype.forEach.call(list2, function (el) { el.classList.remove("is-active"); });
      var current = list2[demoIndex % list2.length];
      if (current) current.classList.add("is-active");
      demoIndex += 1;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      step();
    } else {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            if (!demoTimer) { step(); demoTimer = window.setInterval(step, 1900); }
          } else if (demoTimer) {
            window.clearInterval(demoTimer);
            demoTimer = null;
          }
        });
      }, { threshold: 0.35 }).observe(demo);
    }
  }
})();
