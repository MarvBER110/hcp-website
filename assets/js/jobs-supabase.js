/* Stellenangebote-Übersicht — lädt aktive Stellen aus Supabase,
   gruppiert nach Bundesland (Arrays!), rendert Karten + Karussell je Gruppe
   und verdrahtet die Filter (Bundesland / Fachgebiet / Anstellungsart). */
(function () {
  var sb = window.hcpSupabase && window.hcpSupabase();
  var container = document.getElementById("jobs-container");
  var countEl = document.getElementById("job-count");
  var regionSelect = document.getElementById("filter-region");
  var searchInput = document.getElementById("filter-search");
  var suggestEl = document.getElementById("filter-suggest");
  if (!container) return;

  var ALL = [];   // alle aktiven Stellen

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
  function asArray(v) { return Array.isArray(v) ? v : (v == null ? [] : [v]); }
  function uniqSorted(arr) {
    return Array.from(new Set(arr.filter(Boolean))).sort(function (a, b) {
      return a.localeCompare(b, "de");
    });
  }

  function showMessage(html) {
    container.innerHTML = '<div class="jobs-empty">' + html + "</div>";
    if (countEl) countEl.textContent = "0";
  }

  function jobCard(job) {
    var orte = asArray(job.orte).join(", ");
    // Übersicht: nur Ort + Anstellungsart + Teaser. Referenznummer NUR auf der Detailseite.
    var href = "stellenangebot.html?slug=" + encodeURIComponent(job.slug || "");
    return (
      '<article class="job job--lg">' +
        '<h3 class="job__title">' + esc(job.titel) + "</h3>" +
        '<div class="job__pad">' +
        '<p class="job__meta">' + esc([orte, job.anstellungsart].filter(Boolean).join(" | ")) + "</p>" +
        '<p class="job__desc">' + esc(job.teaser || "") + "</p>" +
        '<span class="job__rule"></span>' +
        '<a href="' + href + '" class="btn job__btn">Zum Stellenangebot</a>' +
        "</div>" +
      "</article>"
    );
  }

  var NAV_SVG =
    '<div class="carousel__nav">' +
      '<button type="button" class="carousel__btn" data-dir="prev" aria-label="Vorherige Stellen">' +
        '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m15 5-7 7 7 7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
      "</button>" +
      '<button type="button" class="carousel__btn" data-dir="next" aria-label="Weitere Stellen">' +
        '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m9 5 7 7-7 7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
      "</button>" +
    "</div>";

  function render(jobs) {
    if (!jobs.length) {
      showMessage("<p>Für die gewählten Kriterien sind derzeit keine Stellen ausgeschrieben.</p>");
      return;
    }
    // Nach Bundesland gruppieren (eine Stelle kann in mehreren Ländern erscheinen)
    var groups = {};
    jobs.forEach(function (job) {
      var laender = asArray(job.bundeslaender);
      if (!laender.length) laender = ["Weitere Regionen"];
      laender.forEach(function (land) {
        (groups[land] = groups[land] || []).push(job);
      });
    });
    var order = uniqSorted(Object.keys(groups));

    container.innerHTML = order.map(function (land) {
      var cards = groups[land].map(jobCard).join("");
      return (
        '<div class="jobs-group" data-region="' + esc(land) + '">' +
          '<div class="jobs-group__head">' +
            '<h2 class="jobs-group__title">' + esc(land) + "</h2>" +
            NAV_SVG +
          "</div>" +
          '<div class="carousel"><div class="carousel__track">' + cards + "</div></div>" +
        "</div>"
      );
    }).join("");

    // eindeutige Stellen zählen (nicht Gruppen-Duplikate)
    if (countEl) {
      var ids = {};
      jobs.forEach(function (j) { ids[j.id] = 1; });
      countEl.textContent = Object.keys(ids).length;
    }

    container.querySelectorAll(".jobs-group").forEach(initCarousel);
  }

  /* ---- Karussell pro Region ---- */
  function initCarousel(group) {
    var track = group.querySelector(".carousel__track");
    var nav = group.querySelector(".carousel__nav");
    if (!track || !nav) return;
    var prev = nav.querySelector('[data-dir="prev"]');
    var next = nav.querySelector('[data-dir="next"]');
    function maxScroll() { return track.scrollWidth - track.clientWidth; }
    function update() {
      if (maxScroll() < 4) { nav.hidden = true; return; }
      nav.hidden = false;
      if (prev) prev.disabled = track.scrollLeft <= 2;
      if (next) next.disabled = track.scrollLeft >= maxScroll() - 2;
    }
    function page(dir) {
      var card = track.querySelector(".job");
      var step = card ? card.getBoundingClientRect().width + 24 : track.clientWidth;
      var visible = Math.max(1, Math.round(track.clientWidth / step));
      track.scrollBy({ left: dir * step * visible, behavior: "smooth" });
    }
    if (prev) prev.addEventListener("click", function () { page(-1); });
    if (next) next.addEventListener("click", function () { page(1); });
    track.addEventListener("scroll", function () { window.requestAnimationFrame(update); });
    window.addEventListener("resize", update);
    update();
  }

  /* ---- Filter ---- */
  function fillSelect(sel, values, allLabel) {
    if (!sel) return;
    sel.innerHTML = '<option value="">' + allLabel + "</option>" +
      values.map(function (v) { return '<option value="' + esc(v) + '">' + esc(v) + "</option>"; }).join("");
  }

  // Durchsuchbarer Text einer Stelle (Titel, Orte, Bundesländer, Fachgebiete, Teaser)
  function jobHaystack(j) {
    return [
      j.titel, j.teaser, j.anstellungsart, j.referenznummer
    ].concat(asArray(j.orte), asArray(j.bundeslaender), asArray(j.fachgebiete))
     .filter(Boolean).join(" ").toLowerCase();
  }

  // gewählte Werte einer Checkbox-Gruppe auslesen
  function getChecked(containerId) {
    return Array.prototype.slice.call(
      document.querySelectorAll("#" + containerId + " input:checked")
    ).map(function (c) { return c.value; });
  }

  function currentFiltered() {
    var region = regionSelect ? regionSelect.value : "";
    var fields = getChecked("opts-field");
    var exps = getChecked("opts-exp");
    var types = getChecked("opts-type");
    var q = (searchInput ? searchInput.value : "").trim().toLowerCase();
    return ALL.filter(function (j) {
      if (region && asArray(j.bundeslaender).indexOf(region) === -1) return false;
      if (fields.length && !asArray(j.fachgebiete).some(function (f) { return fields.indexOf(f) !== -1; })) return false;
      if (exps.length && exps.indexOf(j.berufserfahrung) === -1) return false;
      if (types.length && types.indexOf(j.anstellungsart) === -1) return false;
      if (q && jobHaystack(j).indexOf(q) === -1) return false;
      return true;
    });
  }

  function apply() { render(currentFiltered()); }

  // Checkbox-Gruppe mit Anzahl je Wert (gezählt über alle aktiven Stellen)
  function buildGroup(containerId, values, getter) {
    var el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = values.map(function (v) {
      var n = ALL.filter(function (j) { return asArray(getter(j)).indexOf(v) !== -1; }).length;
      return '<label class="filteropt"><input type="checkbox" value="' + esc(v) + '">' +
             '<span class="filteropt__label">' + esc(v) + "</span>" +
             '<span class="filteropt__count">(' + n + ")</span></label>";
    }).join("");
    el.querySelectorAll("input").forEach(function (c) { c.addEventListener("change", apply); });
  }

  if (regionSelect) regionSelect.addEventListener("change", apply);

  var resetBtn = document.getElementById("filter-reset");
  if (resetBtn) resetBtn.addEventListener("click", function () {
    if (searchInput) searchInput.value = "";
    if (regionSelect) regionSelect.value = "";
    document.querySelectorAll(".filtergroup__opts input:checked").forEach(function (c) { c.checked = false; });
    apply();
  });

  /* ---- Volltextsuche + Vorschläge (ab 3 Zeichen) ---- */
  function hideSuggest() { if (suggestEl) { suggestEl.hidden = true; suggestEl.innerHTML = ""; } }

  function buildSuggestions(q) {
    // Treffer aus Titeln + Orten, nach Relevanz (Anfang vor Mitte)
    var seen = {}, out = [];
    ALL.forEach(function (j) {
      var cands = [j.titel].concat(asArray(j.orte));
      cands.forEach(function (c) {
        if (!c) return;
        var key = c.toLowerCase();
        if (key.indexOf(q) === -1 || seen[key]) return;
        seen[key] = 1;
        out.push({ label: c, starts: key.indexOf(q) === 0 });
      });
    });
    out.sort(function (a, b) { return (b.starts - a.starts) || a.label.localeCompare(b.label, "de"); });
    return out.slice(0, 8);
  }

  function showSuggest(q) {
    if (!suggestEl) return;
    var items = buildSuggestions(q);
    if (!items.length) { hideSuggest(); return; }
    suggestEl.innerHTML = items.map(function (it) {
      return '<li class="jobsearch__option" role="option" data-val="' + esc(it.label) + '">' + esc(it.label) + "</li>";
    }).join("");
    suggestEl.hidden = false;
    suggestEl.querySelectorAll(".jobsearch__option").forEach(function (li) {
      li.addEventListener("mousedown", function (e) {   // mousedown vor blur
        e.preventDefault();
        searchInput.value = li.getAttribute("data-val");
        hideSuggest();
        apply();
      });
    });
  }

  if (searchInput) {
    searchInput.addEventListener("input", function () {
      var q = searchInput.value.trim().toLowerCase();
      if (q.length >= 3) showSuggest(q); else hideSuggest();
      apply();   // Liste live mitfiltern
    });
    searchInput.addEventListener("focus", function () {
      var q = searchInput.value.trim().toLowerCase();
      if (q.length >= 3) showSuggest(q);
    });
    searchInput.addEventListener("blur", function () { window.setTimeout(hideSuggest, 120); });
    searchInput.addEventListener("keydown", function (e) { if (e.key === "Escape") hideSuggest(); });
  }

  // „Suchen": filtern + sanft zur Liste scrollen
  var form = document.getElementById("jobfilter");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      hideSuggest();
      apply();
      var target = document.querySelector(".jobs-list-section") || container;
      var header = document.querySelector(".site-header");
      var offset = (header ? header.offsetHeight : 0) + 16;
      window.scrollTo({ top: target.getBoundingClientRect().top + window.pageYOffset - offset, behavior: "smooth" });
    });
  }

  /* ---- Laden ---- */
  function init() {
    if (!sb) { showMessage("<p>Verbindung zur Datenbank nicht möglich. Bitte später erneut versuchen.</p>"); return; }
    showMessage('<p class="jobs-loading">Stellenangebote werden geladen …</p>');
    sb.from("stellenangebote")
      .select("*")
      .eq("aktiv", true)
      .order("created_at", { ascending: false })
      .then(function (res) {
        if (res.error) {
          console.error(res.error);
          showMessage("<p>Die Stellenangebote konnten nicht geladen werden.</p>");
          return;
        }
        ALL = res.data || [];
        // Filter-Optionen aus echten Daten
        var laender = uniqSorted(ALL.reduce(function (a, j) { return a.concat(asArray(j.bundeslaender)); }, []));
        var fach = uniqSorted(ALL.reduce(function (a, j) { return a.concat(asArray(j.fachgebiete)); }, []));
        var erf = uniqSorted(ALL.map(function (j) { return j.berufserfahrung; }));
        var arten = uniqSorted(ALL.map(function (j) { return j.anstellungsart; }));
        fillSelect(regionSelect, laender, "Alle Bundesländer");
        buildGroup("opts-field", fach, function (j) { return j.fachgebiete; });
        buildGroup("opts-exp", erf, function (j) { return j.berufserfahrung; });
        buildGroup("opts-type", arten, function (j) { return j.anstellungsart; });
        apply();
      });
  }

  init();
})();
