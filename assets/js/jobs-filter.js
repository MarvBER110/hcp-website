/* Stellenangebote — client-seitiger Regions-Schnellfilter.
   Rein visuell: blendet Region-Gruppen anhand der Chips ein/aus und
   aktualisiert die Anzahl. Die echte Datenanbindung folgt mit Supabase
   (dann rendert ein Loader die Karten in #jobs-container und dieses
   Skript wird durch die Supabase-Query-Logik ersetzt/erweitert). */
(function () {
  var chips = document.querySelectorAll(".jobs-regionchips .chip");
  var groups = document.querySelectorAll("#jobs-container .jobs-group");
  var countEl = document.getElementById("job-count");
  var regionSelect = document.getElementById("filter-region");

  /* ---- Karussell pro Region: Pfeile blättern seitenweise ---------------- */
  function initCarousel(group) {
    var track = group.querySelector(".carousel__track");
    var nav = group.querySelector(".carousel__nav");
    if (!track || !nav) return;
    var prev = nav.querySelector('[data-dir="prev"]');
    var next = nav.querySelector('[data-dir="next"]');

    function maxScroll() { return track.scrollWidth - track.clientWidth; }

    function update() {
      // Keine Navigation nötig, wenn alles in eine Ansicht passt (≤ 3 Karten)
      if (maxScroll() < 4) { nav.hidden = true; return; }
      nav.hidden = false;
      if (prev) prev.disabled = track.scrollLeft <= 2;
      if (next) next.disabled = track.scrollLeft >= maxScroll() - 2;
    }

    function page(dir) {
      // eine "Seite" = eine Karte + Abstand, mal sichtbarer Kartenzahl
      var card = track.querySelector(".job");
      var step = card ? (card.getBoundingClientRect().width + 24) : track.clientWidth;
      var visible = Math.max(1, Math.round(track.clientWidth / step));
      track.scrollBy({ left: dir * step * visible, behavior: "smooth" });
    }

    if (prev) prev.addEventListener("click", function () { page(-1); });
    if (next) next.addEventListener("click", function () { page(1); });
    track.addEventListener("scroll", function () { window.requestAnimationFrame(update); });
    window.addEventListener("resize", update);
    update();
    // nach Reveal/Layoutwechsel erneut messen
    group.__carouselUpdate = update;
  }

  groups.forEach(initCarousel);

  if (!chips.length || !groups.length) return;

  function countVisibleJobs() {
    var n = 0;
    groups.forEach(function (g) {
      if (g.style.display !== "none") n += g.querySelectorAll(".job").length;
    });
    return n;
  }

  function applyRegion(region) {
    groups.forEach(function (g) {
      var title = (g.querySelector(".jobs-group__title") || {}).textContent || "";
      var match = !region || title.trim() === region;
      g.style.display = match ? "" : "none";
      // sichtbar gewordenes Karussell neu vermessen (clientWidth war 0 bei display:none)
      if (match && typeof g.__carouselUpdate === "function") {
        window.requestAnimationFrame(g.__carouselUpdate);
      }
    });
    if (countEl) countEl.textContent = countVisibleJobs();
  }

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      chips.forEach(function (c) { c.classList.remove("chip--active"); });
      chip.classList.add("chip--active");
      var region = chip.getAttribute("data-region") || "";
      applyRegion(region);
      // Dropdown synchron halten
      if (regionSelect) regionSelect.value = region;
    });
  });

  // Dropdown „Bundesland" mit den Chips verknüpfen
  if (regionSelect) {
    regionSelect.addEventListener("change", function () {
      var region = regionSelect.value;
      var matchChip = null;
      chips.forEach(function (c) {
        c.classList.remove("chip--active");
        if ((c.getAttribute("data-region") || "") === region) matchChip = c;
      });
      (matchChip || chips[0]).classList.add("chip--active");
      applyRegion(region);
    });
  }

  // Sanft zur Stellen-Liste scrollen (mit Abstand für den fixierten Header)
  function scrollToResults() {
    var target = document.querySelector(".jobs-list-section") || document.getElementById("jobs-container");
    if (!target) return;
    var header = document.querySelector(".site-header");
    var offset = (header ? header.offsetHeight : 0) + 16;
    var top = target.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({ top: top, behavior: "smooth" });
  }

  // „Suchen": Filter anwenden + zu den Ergebnissen scrollen
  var form = document.getElementById("jobfilter");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      applyRegion(regionSelect ? regionSelect.value : "");
      scrollToResults();
    });
  }
})();
