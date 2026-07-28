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
    toggle.setAttribute("aria-label", open ? "Menü schließen" : "Menü öffnen");
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
    if (window.innerWidth > 900) setOpen(false);
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
