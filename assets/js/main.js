/* ──────────────────────────────────────────────────────────────────────
   Sprachhilfe fuer die englischen Seiten unter /en/.
   HCP_T("deutscher Text") liefert auf lang="en" die englische Fassung,
   sonst unveraendert den deutschen Text. Dadurch bleiben die deutschen
   Seiten exakt wie bisher.
   Diese Datei wird auf jeder Seite als erste geladen.
   ────────────────────────────────────────────────────────────────────── */
window.HCP_T = (function () {
  "use strict";
  var EN = {
    /* Navigation */
    "Menü öffnen": "Open menu",
    "Menü schließen": "Close menu",
    /* Stellenliste */
    "Die Stellenangebote konnten nicht geladen werden.": "The openings could not be loaded.",
    "Für die gewählten Kriterien sind derzeit keine Stellen ausgeschrieben.":
      "There are currently no openings matching your criteria.",
    "Verbindung zur Datenbank nicht möglich. Bitte später erneut versuchen.":
      "Could not connect to the database. Please try again later.",
    "Stellenangebote werden geladen …": "Loading openings …",
    "Zum Stellenangebot": "View position",
    "Alle Bundesländer": "All federal states",
    /* Stellendetail und Bewerbung */
    "Stellenangebot": "Position",
    "Bewerbung wird übermittelt …": "Submitting your application …",
    "Bitte ausfüllen: ": "Please complete: ",
    "Bitte maximal 5 zusätzliche Dateien.": "Please attach no more than 5 additional files.",
    "Die Bewerbung konnte nicht gesendet werden. Bitte versuchen Sie es später erneut.":
      "Your application could not be sent. Please try again later.",
    "Senden derzeit nicht möglich (Berechtigung). Bitte kontaktieren Sie uns direkt.":
      "Sending is currently unavailable. Please contact us directly.",
    /* Kontaktformular */
    "Bitte maximal 3 Dateien anhängen.": "Please attach no more than 3 files.",
    "Die Nachricht konnte nicht gesendet werden. Bitte versuchen Sie es später erneut.":
      "Your message could not be sent. Please try again later.",
    "Ihre Nachricht wird gesendet …": "Sending your message …",
    "Senden derzeit nicht möglich. Bitte kontaktieren Sie uns direkt per E-Mail.":
      "Sending is currently unavailable. Please contact us directly by email.",
    "Verbindung nicht möglich. Bitte später erneut versuchen.":
      "Could not connect. Please try again later."
  };
  var isEnglish = document.documentElement.getAttribute("lang") === "en";
  return function (text) {
    return (isEnglish && EN[text]) ? EN[text] : text;
  };
})();

/* Holmes Consulting Partners — minimal interactions.
   Scope: mobile navigation toggle only (no decorative effects). */
(function () {
  "use strict";

  var toggle = document.getElementById("nav-toggle");
  var nav = document.getElementById("primary-nav");
  if (!toggle || !nav) return;

  function setOpen(open) {
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", HCP_T(open ? "Menü schließen" : "Menü öffnen"));
  }

  toggle.addEventListener("click", function () {
    setOpen(!nav.classList.contains("is-open"));
  });

  // Close the menu after selecting a link (mobile).
  nav.addEventListener("click", function (e) {
    if (e.target.closest(".nav__link")) setOpen(false);
  });

  // Reset state when resizing back to desktop.
  window.addEventListener("resize", function () {
    if (window.innerWidth > 1000) setOpen(false);   /* Umschaltpunkt wie im CSS */
  });
})();

/* Team-Mitglied — Zoom-/Detail-Overlay (Modal auf derselben Seite).
   Öffnet bei Klick auf „mehr erfahren" ([data-member-more]); befüllt sich
   aus der jeweiligen .team__card (Name, Rolle, Foto, vollständige Bio). */
(function () {
  "use strict";

  var modal = document.getElementById("member-modal");
  if (!modal) return;

  var dialog  = modal.querySelector(".member-modal__dialog");
  var imgEl   = modal.querySelector(".member-modal__img");
  var nameEl  = modal.querySelector(".member-modal__name");
  var roleEl  = modal.querySelector(".member-modal__role");
  var bioEl   = modal.querySelector(".member-modal__bio");
  var closeBtn = modal.querySelector(".member-modal__close");
  var lastFocused = null;
  var closeTimer = null;

  function text(card, sel) {
    var el = card.querySelector(sel);
    return el ? el.textContent.trim() : "";
  }

  function open(card) {
    var img  = card.querySelector(".team__photo img");
    var full = card.querySelector(".team__full");

    nameEl.textContent = text(card, ".team__name");
    roleEl.textContent = text(card, ".team__role");
    if (img) {
      imgEl.setAttribute("src", img.getAttribute("src") || "");
      imgEl.setAttribute("alt", img.getAttribute("alt") || "");
    }
    bioEl.innerHTML = full ? full.innerHTML : "";

    lastFocused = document.activeElement;
    if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; }
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    if (dialog) dialog.scrollTop = 0;

    // Zwei Frames warten → CSS-Transition (Zoom + Fade) greift sauber.
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { modal.classList.add("is-open"); });
    });
    if (closeBtn) closeBtn.focus();
  }

  function close() {
    if (modal.hidden) return;
    modal.classList.remove("is-open");
    document.body.style.overflow = "";
    closeTimer = setTimeout(function () { modal.hidden = true; }, 320);
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  document.addEventListener("click", function (e) {
    var trigger = e.target.closest("[data-member-more]");
    if (trigger) {
      e.preventDefault();
      var card = trigger.closest(".team__card");
      if (card) open(card);
      return;
    }
    if (!modal.hidden && e.target.closest("[data-close]")) close();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !modal.hidden) close();
  });
})();
