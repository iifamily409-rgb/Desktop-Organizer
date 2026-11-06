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
