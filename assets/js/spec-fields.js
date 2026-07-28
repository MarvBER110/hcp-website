/* Kompetenzfelder (Spezialisierungen): Tab-Leiste 01–04 schaltet die Panels um.
   Markup: #fields > .fields__rail (role=tablist) + .fields__panels (role=tabpanel je Feld). */
(function () {
  var root = document.getElementById("fields");
  if (!root) return;

  var tabs = Array.prototype.slice.call(root.querySelectorAll(".fields__tab"));
  var panels = Array.prototype.slice.call(root.querySelectorAll(".fields__panel"));

  function activate(idx) {
    tabs.forEach(function (tab, i) {
      var on = i === idx;
      tab.classList.toggle("is-active", on);
      tab.setAttribute("aria-selected", on ? "true" : "false");
    });
    panels.forEach(function (panel, i) {
      var on = i === idx;
      panel.classList.toggle("is-active", on);
      panel.hidden = !on;
    });
  }

  tabs.forEach(function (tab, i) {
    tab.addEventListener("click", function () { activate(i); });
    // Pfeiltasten: links/rechts durch die Felder (Barrierefreiheit)
    tab.addEventListener("keydown", function (e) {
      var dir = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
      if (!dir) return;
      e.preventDefault();
      var next = (i + dir + tabs.length) % tabs.length;
      activate(next);
      tabs[next].focus();
    });
  });
})();

/* Zoom-Overlay: Klick auf ein Kompetenzfeld-Panel öffnet die Detail-Ansicht
   (gleiche Mechanik wie das Team-Overlay: Backdrop, ESC, Scroll-Sperre). */
(function () {
  "use strict";

  var modal = document.getElementById("fields-modal");
  if (!modal) return;

  var numEl   = modal.querySelector(".fields-modal__num");
  var titleEl = modal.querySelector(".fields-modal__title");
  var descEl  = modal.querySelector(".fields-modal__desc");
  var cardsEl = modal.querySelector(".fields-modal__cards");
  var closeBtn = modal.querySelector(".member-modal__close");
  var lastFocused = null;
  var closeTimer = null;

  // Baut aus einem <li> („Rollenname" + verstecktem .fields__roledesc)
  // eine Karte mit Bild-Platzhalter, Titel und Kurztext.
  function roleCard(li) {
    var desc = li.querySelector(".fields__roledesc");
    var name = (li.childNodes[0] ? li.childNodes[0].textContent : li.textContent).trim();
    var card = document.createElement("article");
    card.className = "fields-modal__card";
    card.innerHTML =
      '<div class="media fields-modal__media"><span class="media__label">Bild folgt</span></div>' +
      "<h4></h4><p></p>";
    card.querySelector("h4").textContent = name;
    card.querySelector("p").textContent = desc ? desc.textContent.trim() : "";
    return card;
  }

  function open(panel) {
    var ghost = panel.querySelector(".fields__ghost");
    var h3    = panel.querySelector(".fields__intro h3");
    var p     = panel.querySelector(".fields__intro p");
    var items = panel.querySelectorAll(".fields__list li");

    numEl.textContent   = ghost ? ghost.textContent.trim() : "";
    titleEl.textContent = h3 ? h3.textContent.trim() : "";
    descEl.textContent  = p ? p.textContent.trim() : "";
    cardsEl.innerHTML   = "";
    Array.prototype.forEach.call(items, function (li) {
      cardsEl.appendChild(roleCard(li));
    });

    lastFocused = document.activeElement;
    if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; }
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    cardsEl.scrollTop = 0;

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
    if (!modal.hidden && e.target.closest("[data-close]")) { close(); return; }
    var panel = e.target.closest(".fields__panel");
    if (panel && !panel.hidden) open(panel);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !modal.hidden) close();
  });
})();
