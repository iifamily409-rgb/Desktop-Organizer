/* ==========================================================================
   Copilot mascot — CSS 3D, no libraries, progressive enhancement only.
   Markup ships in the page; without JS the mascot is a static ornament.
   ========================================================================== */
(function () {
  "use strict";

  var root = document.getElementById("mascot");
  if (!root) return;

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var canPointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var stage = root.querySelector("[data-mascot-stage]");
  var shell = root.querySelector("[data-mascot-shell]");
  var eyes = root.querySelectorAll("[data-mascot-eye]");
  var bubble = root.querySelector("[data-mascot-bubble]");
  var HIDE_KEY = "do-mascot-hidden";
  var GREET_KEY = "do-mascot-greeted";

  if (window.localStorage && window.localStorage.getItem(HIDE_KEY) === "1") {
    root.hidden = true;
    root.classList.add("is-off");
  }

  /* ---------- Speech ---------- */
  var sayTimer = null;
  var lastSay = "";

  function say(text, hold) {
    if (!bubble || root.hidden) return;
    bubble.textContent = text;
    root.classList.add("is-talking");
    lastSay = text;
    window.clearTimeout(sayTimer);
    sayTimer = window.setTimeout(function () {
      root.classList.remove("is-talking");
    }, hold || 4200);
  }

  function mood(name, ms) {
    root.classList.remove("mood-happy", "mood-think", "mood-look", "mood-wave");
    void root.offsetWidth;
    root.classList.add("mood-" + name);
    window.setTimeout(function () {
      root.classList.remove("mood-" + name);
    }, ms || 1200);
  }

  /* ---------- Context-aware hints ---------- */
  var HINTS = {
    home: "Welcome to Desktop Organizer",
    copilot: "Try @Downloads or press Ctrl + K",
    features: "Hover a card — they animate",
    screenshots: "This is what the app actually looks like",
    how: "Four steps, then it runs itself",
    providers: "Seven provider profiles, keys stay local",
    palette: "Ctrl + K works on this site too",
    metrics: "Numbers are samples, not telemetry",
    download: "v1.0.2 is ready to install",
    changelog: "v1.0.2 reworked the whole AI layer",
    faq: "I can help you find answers",
    trust: "Local first, private by default",
    documentation: "Need help? Start here",
    privacy: "Short version: nothing leaves your PC",
    terms: "Back up before your first big run",
    issues: "SmartScreen is the one open issue",
    default: "Press Ctrl + K any time"
  };

  var currentKey = "";

  function announce(key, force) {
    var next = HINTS[key] || HINTS.default;
    if (!force && (key === currentKey || next === lastSay)) return;
    currentKey = key;
    say(next);
    mood("look", 900);
  }

  if ("IntersectionObserver" in window) {
    var watched = document.querySelectorAll("[data-mascot-key]");
    var seen = {};
    var spy = new IntersectionObserver(function (entries) {
      var best = null;
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          seen[e.target.getAttribute("data-mascot-key")] = true;
          if (!best || e.intersectionRatio > best.intersectionRatio) best = e;
        }
      });
      if (best) announce(best.target.getAttribute("data-mascot-key"));
    }, { threshold: [0.25, 0.6], rootMargin: "-12% 0px -35% 0px" });
    Array.prototype.forEach.call(watched, function (el) { spy.observe(el); });
  }

  /* ---------- Pointer following ---------- */
  var target = { x: 0, y: 0 };
  var eased = { x: 0, y: 0 };
  var running = false;
  var blinkTimer = null;

  function onPointer(e) {
    if (!canPointer || reduceMotion || root.hidden) return;
    var w = window.innerWidth || 1;
    var h = window.innerHeight || 1;
    target.x = (e.clientX / w) * 2 - 1;
    target.y = (e.clientY / h) * 2 - 1;
    if (!running) start();
  }

  function start() {
    running = true;
    window.requestAnimationFrame(tick);
  }

  function tick() {
    if (document.hidden) { running = false; return; }
    eased.x += (target.x - eased.x) * 0.07;
    eased.y += (target.y - eased.y) * 0.07;
    if (stage) {
      stage.style.transform =
        "rotateY(" + (eased.x * 16).toFixed(2) + "deg) rotateX(" + (-eased.y * 11).toFixed(2) + "deg)";
    }
    Array.prototype.forEach.call(eyes, function (eye) {
      eye.style.setProperty("--mx", (eased.x * 3.4).toFixed(2) + "px");
      eye.style.setProperty("--my", (eased.y * 2.6).toFixed(2) + "px");
    });
    window.requestAnimationFrame(tick);
  }

  if (!reduceMotion) {
    window.addEventListener("pointermove", onPointer, { passive: true });
    start();

    (function blink() {
      blinkTimer = window.setTimeout(function () {
        root.classList.add("is-blink");
        window.setTimeout(function () { root.classList.remove("is-blink"); }, 130);
        blink();
      }, 2600 + Math.random() * 3400);
    })();
  }

  /* ---------- Scroll reactions: glance with the motion ---------- */
  var lastY = window.pageYOffset;
  var scrollCooldown = false;

  window.addEventListener("scroll", function () {
    if (reduceMotion || scrollCooldown) { lastY = window.pageYOffset; return; }
    var delta = window.pageYOffset - lastY;
    lastY = window.pageYOffset;
    if (Math.abs(delta) < 24) return;
    scrollCooldown = true;
    root.classList.toggle("is-glance-up", delta < 0);
    mood("look", 700);
    window.setTimeout(function () { root.classList.remove("is-glance-up"); }, 700);
    window.setTimeout(function () { scrollCooldown = false; }, 900);
  }, { passive: true });

  /* ---------- Hover + click reactions ---------- */
  document.addEventListener("pointerover", function (e) {
    var hit = e.target.closest ? e.target.closest("[data-mascot-react]") : null;
    if (!hit) return;
    mood("happy", 900);
    var hint = hit.getAttribute("data-mascot-react");
    if (hint && hint !== "auto") say(hint, 2600);
  }, { passive: true });

  document.addEventListener("click", function (e) {
    var dl = e.target.closest ? e.target.closest('a[download], [data-mascot-download]') : null;
    if (dl) {
      mood("think", 1400);
      say("Grabbing v1.0.2 — check your downloads", 3600);
      return;
    }
    if (e.target.closest && e.target.closest("#mascot")) {
      mood("wave", 1800);
      say("Hey. Ctrl + K if you want the palette.", 3200);
    }
  });

  /* ---------- Keyboard easter eggs ---------- */
  var konamiBuffer = "";

  document.addEventListener("keydown", function (e) {
    if (e.key === "k" && (e.ctrlKey || e.metaKey)) {
      window.setTimeout(function () { mood("think", 700); }, 40);
      return;
    }
    if (e.key === "Escape") return;
    konamiBuffer = (konamiBuffer + e.key).slice(-11);
    if (konamiBuffer.indexOf("ahmedcoder") > -1) {
      mood("wave", 2600);
      say("Built by Ahmed-Coder. Nice find.", 4200);
      konamiBuffer = "";
    }
  });

  /* ---------- First visit wave ---------- */
  var greeted = window.localStorage && window.localStorage.getItem(GREET_KEY);
  if (!greeted) {
    window.setTimeout(function () {
      mood("wave", 2600);
      say(HINTS.home, 5000);
      if (window.localStorage) window.localStorage.setItem(GREET_KEY, "1");
    }, 1400);
  } else {
    window.setTimeout(function () { announce(currentKey || "default", false); }, 2200);
  }

  /* ---------- Long-press to hide (tasteful escape hatch) ---------- */
  var pressTimer = null;

  root.addEventListener("pointerdown", function () {
    pressTimer = window.setTimeout(function () {
      root.hidden = true;
      root.classList.add("is-off");
      if (window.localStorage) window.localStorage.setItem(HIDE_KEY, "1");
    }, 1200);
  });
  ["pointerup", "pointerleave", "pointercancel"].forEach(function (evt) {
    root.addEventListener(evt, function () { window.clearTimeout(pressTimer); });
  });

  /* ---------- Shared hook for the rest of the site ---------- */
  window.DOmascot = { say: say, mood: mood, reveal: function () {
    root.hidden = false;
    root.classList.remove("is-off");
    if (window.localStorage) window.localStorage.setItem(HIDE_KEY, "0");
    say("Back. Press Ctrl + K any time.", 3200);
  } };

  document.addEventListener("visibilitychange", function () {
    if (!document.hidden && !reduceMotion && !running) start();
  });
})();
