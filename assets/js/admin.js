/* Admin-Bereich — Supabase Auth (E-Mail/Passwort) + Verwaltung von
   Stellenangeboten und Bewerbungen. Nutzt window.hcpSupabase() (CDN-Client). */
(function () {
  var sb = window.hcpSupabase && window.hcpSupabase();
  var bucket = (window.HCP_SUPABASE && window.HCP_SUPABASE.bucket) || "bewerbungen";

  // Feste Auswahllisten
  var BUNDESLAENDER = [
    "Baden-Württemberg", "Bayern", "Berlin", "Brandenburg", "Bremen", "Hamburg",
    "Hessen", "Mecklenburg-Vorpommern", "Niedersachsen", "Nordrhein-Westfalen",
    "Rheinland-Pfalz", "Saarland", "Sachsen", "Sachsen-Anhalt", "Schleswig-Holstein", "Thüringen"
  ];
  var FACHGEBIETE = [
    "Asset Management", "Property Management", "Facility Management", "Projektentwicklung",
    "Hochbau", "Tiefbau", "Schlüsselfertiges Bauen", "Vermietung", "Transaktion"
  ];
  var ANSTELLUNG = ["Festanstellung", "Interim", "Teilzeit"];
  var ERFAHRUNG = ["Berufseinsteiger", "1-3 Jahre", "3-5 Jahre", "5-10 Jahre", "10+ Jahre", "Führungsebene"];
  var STATUS = ["neu", "gesichtet", "weitergeleitet"];
  var STATUS_KONTAKT = ["neu", "in Bearbeitung", "erledigt"];
  var KONTAKT_BUCKET = "kontakt";

  // DOM
  var elLoading = document.getElementById("admin-loading");
  var elLogin = document.getElementById("admin-login");
  var elDash = document.getElementById("admin-dash");
  var elUser = document.getElementById("admin-user");
  var logoutBtn = document.getElementById("logout-btn");

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function asArray(v) { return Array.isArray(v) ? v : (v == null || v === "" ? [] : [v]); }
  function show(el) { if (el) el.hidden = false; }
  function hide(el) { if (el) el.hidden = true; }
  function fmtDate(s) {
    if (!s) return "—";
    try { return new Date(s).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" }); }
    catch (e) { return s; }
  }
  function slugify(s) {
    return String(s || "").toLowerCase()
      .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
      .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }

  /* ====================== AUTH ====================== */
  function refreshUI(session) {
    hide(elLoading);
    if (session && session.user) {
      hide(elLogin); show(elDash);
      show(logoutBtn);
      if (elUser) elUser.textContent = session.user.email || "";
      loadJobs();
      loadApps();
      loadContacts();
    } else {
      hide(elDash); hide(logoutBtn);
      if (elUser) elUser.textContent = "";
      show(elLogin);
    }
  }

  if (!sb) { hide(elLoading); show(elLogin); var ls = document.getElementById("login-status"); if (ls) { ls.textContent = "Verbindung zur Datenbank nicht möglich."; ls.className = "applyform__status applyform__status--error"; } return; }

  sb.auth.getSession().then(function (res) { refreshUI(res.data ? res.data.session : null); });
  sb.auth.onAuthStateChange(function (_event, session) { refreshUI(session); });

  var loginForm = document.getElementById("login-form");
  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var status = document.getElementById("login-status");
    status.textContent = ""; status.className = "applyform__status";
    var btn = document.getElementById("login-btn"); btn.disabled = true;
    sb.auth.signInWithPassword({
      email: document.getElementById("login-email").value.trim(),
      password: document.getElementById("login-pass").value
    }).then(function (res) {
      btn.disabled = false;
      if (res.error) {
        status.textContent = "Anmeldung fehlgeschlagen. Bitte prüfen Sie E-Mail und Passwort.";
        status.className = "applyform__status applyform__status--error";
      }
      // Erfolg → onAuthStateChange übernimmt
    });
  });

  logoutBtn.addEventListener("click", function () { sb.auth.signOut(); });

  /* ====================== TABS ====================== */
  document.querySelectorAll(".admin-tab").forEach(function (tab) {
    tab.addEventListener("click", function () {
      document.querySelectorAll(".admin-tab").forEach(function (t) { t.classList.remove("is-active"); });
      tab.classList.add("is-active");
      var which = tab.getAttribute("data-tab");
      document.getElementById("tab-jobs").hidden = which !== "jobs";
      document.getElementById("tab-apps").hidden = which !== "apps";
      document.getElementById("tab-initiativ").hidden = which !== "initiativ";
      document.getElementById("tab-contacts").hidden = which !== "contacts";
    });
  });

  /* ====================== BEREICH 1: STELLEN ====================== */
  var jobsList = document.getElementById("jobs-admin-list");
  var jobsCache = [];
  var jobFilter = "all";   // all | active | inactive

  function loadJobs() {
    jobsList.innerHTML = '<p class="jobs-loading">Stellen werden geladen …</p>';
    sb.from("stellenangebote").select("*").order("created_at", { ascending: false })
      .then(function (res) {
        if (res.error) { jobsList.innerHTML = '<p class="applyform__status--error">Fehler beim Laden: ' + esc(res.error.message) + "</p>"; return; }
        jobsCache = res.data || [];
        applyJobFilter();
      });
  }

  function applyJobFilter() {
    var active = jobsCache.filter(function (j) { return j.aktiv; }).length;
    var setTxt = function (id, n) { var e = document.getElementById(id); if (e) e.textContent = "(" + n + ")"; };
    setTxt("jf-count-all", jobsCache.length);
    setTxt("jf-count-active", active);
    setTxt("jf-count-inactive", jobsCache.length - active);
    var list = jobsCache.filter(function (j) {
      return jobFilter === "all" || (jobFilter === "active" ? j.aktiv : !j.aktiv);
    });
    renderJobs(list);
  }

  document.querySelectorAll(".admin-filter__btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      document.querySelectorAll(".admin-filter__btn").forEach(function (b) { b.classList.remove("is-active"); });
      btn.classList.add("is-active");
      jobFilter = btn.getAttribute("data-filter");
      applyJobFilter();
    });
  });

  function renderJobs(jobs) {
    if (!jobs.length) { jobsList.innerHTML = "<p>Noch keine Stellen angelegt.</p>"; return; }
    var rows = jobs.map(function (j) {
      var orte = asArray(j.orte).join(", ");
      var laender = asArray(j.bundeslaender).join(", ");
      return (
        '<tr data-id="' + esc(j.id) + '">' +
          "<td><strong>" + esc(j.titel) + "</strong><br><span class='admin-muted'>" + esc(laender) + (orte ? " · " + esc(orte) : "") + "</span></td>" +
          "<td>" + esc(j.referenznummer || "—") + "</td>" +
          "<td><label class='switch'><input type='checkbox' class='js-toggle'" + (j.aktiv ? " checked" : "") + "><span class='switch__slider'></span></label> " +
            "<span class='badge " + (j.aktiv ? "badge--on" : "badge--off") + "'>" + (j.aktiv ? "Aktiv" : "Inaktiv") + "</span></td>" +
          "<td class='admin-actions'>" +
            "<button class='btn btn--ghost btn--xs js-edit'>Bearbeiten</button>" +
            "<button class='btn btn--ghost btn--xs js-del'>Löschen</button>" +
          "</td>" +
        "</tr>"
      );
    }).join("");
    jobsList.innerHTML =
      "<table class='admin-table'><thead><tr><th>Titel / Ort</th><th>Referenz</th><th>Status</th><th></th></tr></thead><tbody>" +
      rows + "</tbody></table>";

    jobsList.querySelectorAll("tbody tr").forEach(function (tr) {
      var id = tr.getAttribute("data-id");
      var job = jobs.find(function (x) { return String(x.id) === String(id); });
      if (!job) return;
      var tg = tr.querySelector(".js-toggle");
      var ed = tr.querySelector(".js-edit");
      var dl = tr.querySelector(".js-del");
      if (tg) tg.addEventListener("change", function (e) { toggleActive(job, e.target); });
      if (ed) ed.addEventListener("click", function () { openJobForm(job); });
      if (dl) dl.addEventListener("click", function () { deleteJob(job); });
    });
  }

  function toggleActive(job, checkbox) {
    var next = checkbox.checked;
    sb.from("stellenangebote").update({ aktiv: next }).eq("id", job.id).then(function (res) {
      if (res.error) { checkbox.checked = !next; alert("Konnte Status nicht ändern: " + res.error.message); return; }
      job.aktiv = next;
      applyJobFilter();   // Zähler + gefilterte Ansicht aktuell halten
    });
  }

  function deleteJob(job) {
    if (!window.confirm('Stelle „' + (job.titel || "") + '" wirklich unwiderruflich löschen?')) return;
    sb.from("stellenangebote").delete().eq("id", job.id).then(function (res) {
      if (res.error) { alert("Löschen fehlgeschlagen: " + res.error.message); return; }
      loadJobs();
    });
  }

  /* ---- Job-Formular (Modal) ---- */
  var jobModal = document.getElementById("job-modal");
  var jobForm = document.getElementById("job-form");

  function fillSelect(id, values) {
    document.getElementById(id).innerHTML =
      '<option value="">— bitte wählen —</option>' +
      values.map(function (v) { return '<option value="' + esc(v) + '">' + esc(v) + "</option>"; }).join("");
  }
  function buildCheckgrid(id, values) {
    document.getElementById(id).innerHTML = values.map(function (v, i) {
      var cid = id + "-" + i;
      return '<label class="checkgrid__item"><input type="checkbox" value="' + esc(v) + '" id="' + cid + '"> ' + esc(v) + "</label>";
    }).join("");
  }
  function getChecked(id) {
    return Array.prototype.slice.call(document.querySelectorAll("#" + id + " input:checked")).map(function (c) { return c.value; });
  }
  function setChecked(id, values) {
    var set = {}; asArray(values).forEach(function (v) { set[v] = 1; });
    document.querySelectorAll("#" + id + " input").forEach(function (c) { c.checked = !!set[c.value]; });
  }

  fillSelect("jf-anstellung", ANSTELLUNG);
  fillSelect("jf-erfahrung", ERFAHRUNG);
  buildCheckgrid("jf-bundeslaender", BUNDESLAENDER);
  buildCheckgrid("jf-fachgebiete", FACHGEBIETE);

  function updateSlug() {
    var t = document.getElementById("jf-titel").value;
    var r = document.getElementById("jf-ref").value;
    var slug = [slugify(t), slugify(r)].filter(Boolean).join("-");
    document.getElementById("jf-slug").value = slug;
  }
  document.getElementById("jf-titel").addEventListener("input", updateSlug);
  document.getElementById("jf-ref").addEventListener("input", updateSlug);

  function openJobForm(job) {
    jobForm.reset();
    document.getElementById("jf-status").textContent = "";
    document.getElementById("job-modal-title").textContent = job ? "Stelle bearbeiten" : "Neue Stelle";
    document.getElementById("jf-id").value = job ? job.id : "";
    document.getElementById("jf-titel").value = job ? (job.titel || "") : "";
    document.getElementById("jf-ref").value = job ? (job.referenznummer || "") : "";
    document.getElementById("jf-teaser").value = job ? (job.teaser || "") : "";
    document.getElementById("jf-beschreibung").value = job ? (job.beschreibung || "") : "";
    document.getElementById("jf-orte").value = job ? asArray(job.orte).join(", ") : "";
    document.getElementById("jf-anstellung").value = job ? (job.anstellungsart || "") : "";
    document.getElementById("jf-erfahrung").value = job ? (job.berufserfahrung || "") : "";
    document.getElementById("jf-aktiv").checked = job ? !!job.aktiv : true;
    setChecked("jf-bundeslaender", job ? job.bundeslaender : []);
    setChecked("jf-fachgebiete", job ? job.fachgebiete : []);
    updateSlug();
    show(jobModal);
  }

  document.getElementById("new-job-btn").addEventListener("click", function () { openJobForm(null); });

  jobForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var status = document.getElementById("jf-status");
    status.textContent = ""; status.className = "applyform__status";
    var titel = document.getElementById("jf-titel").value.trim();
    var ref = document.getElementById("jf-ref").value.trim();
    if (!titel || !ref) { status.textContent = "Titel und Referenznummer sind Pflichtfelder."; status.className = "applyform__status applyform__status--error"; return; }

    var orte = document.getElementById("jf-orte").value.split(",").map(function (s) { return s.trim(); }).filter(Boolean);
    var row = {
      titel: titel,
      referenznummer: ref,
      slug: [slugify(titel), slugify(ref)].filter(Boolean).join("-"),
      teaser: document.getElementById("jf-teaser").value.trim() || null,
      beschreibung: document.getElementById("jf-beschreibung").value.trim() || null,
      orte: orte,
      bundeslaender: getChecked("jf-bundeslaender"),
      fachgebiete: getChecked("jf-fachgebiete"),
      anstellungsart: document.getElementById("jf-anstellung").value || null,
      berufserfahrung: document.getElementById("jf-erfahrung").value || null,
      aktiv: document.getElementById("jf-aktiv").checked
    };
    var id = document.getElementById("jf-id").value;
    var saveBtn = document.getElementById("jf-save"); saveBtn.disabled = true;
    status.textContent = "Wird gespeichert …";

    var op = id
      ? sb.from("stellenangebote").update(row).eq("id", id)
      : sb.from("stellenangebote").insert(row);

    op.then(function (res) {
      saveBtn.disabled = false;
      if (res.error) {
        status.textContent = "Speichern fehlgeschlagen: " + res.error.message;
        status.className = "applyform__status applyform__status--error";
        return;
      }
      hide(jobModal);
      loadJobs();
    });
  });

  /* ====================== BEREICH 2: BEWERBUNGEN ====================== */
  var appsList = document.getElementById("apps-admin-list");
  var initiativList = document.getElementById("initiativ-admin-list");
  var appsCache = [];

  // Initiativbewerbung: keine konkrete Stelle verknüpft (stelle_id leer) bzw.
  // explizit als „Initiativbewerbung" gespeichert.
  function isInitiativ(a) {
    return !a.stelle_id || a.stelle_titel === "Initiativbewerbung";
  }

  function loadApps() {
    appsList.innerHTML = '<p class="jobs-loading">Bewerbungen werden geladen …</p>';
    initiativList.innerHTML = '<p class="jobs-loading">Initiativbewerbungen werden geladen …</p>';
    sb.from("bewerbungen").select("*").order("created_at", { ascending: false })
      .then(function (res) {
        if (res.error) {
          var msg = '<p class="applyform__status--error">Fehler beim Laden: ' + esc(res.error.message) + "</p>";
          appsList.innerHTML = msg; initiativList.innerHTML = msg; return;
        }
        appsCache = res.data || [];
        renderAllApps();
      });
  }

  // Teilt den Cache in „mit Stelle" und „Initiativ" und rendert beide Listen.
  function renderAllApps() {
    var regular = appsCache.filter(function (a) { return !isInitiativ(a); });
    var initiativ = appsCache.filter(isInitiativ);
    renderApps(regular, appsList, "Noch keine Bewerbungen eingegangen.", true);
    renderApps(initiativ, initiativList, "Noch keine Initiativbewerbungen eingegangen.", false);
  }

  function statusBadge(s) {
    var cls = s === "weitergeleitet" ? "badge--fwd" : (s === "gesichtet" ? "badge--seen" : "badge--new");
    return "<span class='badge " + cls + "'>" + esc(s || "neu") + "</span>";
  }

  // showStelle = Spalte „Stelle" anzeigen (bei Initiativbewerbungen überflüssig)
  function renderApps(apps, targetEl, emptyMsg, showStelle) {
    if (!apps.length) { targetEl.innerHTML = "<p>" + esc(emptyMsg) + "</p>"; return; }
    var rows = apps.map(function (a) {
      var name = [a.vorname, a.nachname].filter(Boolean).join(" ");
      var stelleCell = showStelle
        ? "<td>" + esc(a.stelle_titel || "—") + "<br><span class='admin-muted'>" + esc(a.referenznummer || "") + "</span></td>"
        : "";
      return (
        '<tr data-id="' + esc(a.id) + '">' +
          "<td><strong>" + esc(name || "—") + "</strong><br><span class='admin-muted'>" + esc(a.email || "") + "</span></td>" +
          stelleCell +
          "<td>" + fmtDate(a.created_at) + "</td>" +
          "<td>" + statusBadge(a.status) + "</td>" +
          "<td class='admin-actions'><button class='btn btn--ghost btn--xs js-view'>Ansehen</button></td>" +
        "</tr>"
      );
    }).join("");
    var stelleHead = showStelle ? "<th>Stelle</th>" : "";
    targetEl.innerHTML =
      "<table class='admin-table'><thead><tr><th>Name</th>" + stelleHead + "<th>Datum</th><th>Status</th><th></th></tr></thead><tbody>" +
      rows + "</tbody></table>";
    targetEl.querySelectorAll("tbody tr").forEach(function (tr) {
      var a = apps.find(function (x) { return String(x.id) === String(tr.getAttribute("data-id")); });
      if (!a) return;
      var v = tr.querySelector(".js-view");
      if (v) v.addEventListener("click", function () { openAppDetail(a); });
    });
  }

  var appModal = document.getElementById("app-modal");

  function row(label, value) {
    return "<div class='kv'><span class='kv__k'>" + esc(label) + "</span><span class='kv__v'>" + (value || "—") + "</span></div>";
  }

  function openAppDetail(a) {
    var name = [a.anrede, a.vorname, a.nachname].filter(Boolean).join(" ");
    document.getElementById("app-modal-title").textContent = name || "Bewerbung";
    var detail = document.getElementById("app-detail");

    var statusSel = "<select id='app-status' class='jobfilter__select'>" +
      STATUS.map(function (s) { return "<option value='" + s + "'" + ((a.status || "neu") === s ? " selected" : "") + ">" + s + "</option>"; }).join("") +
      "</select>";

    detail.innerHTML =
      "<div class='app-detail__status'>" + row("Status", statusSel) + "</div>" +
      row("Eingegangen", fmtDate(a.created_at)) +
      row("Stelle", esc(a.stelle_titel || "—") + (a.referenznummer ? " (" + esc(a.referenznummer) + ")" : "")) +
      row("Anrede", esc(a.anrede)) +
      row("Name", esc([a.vorname, a.nachname].filter(Boolean).join(" "))) +
      row("Geburtsdatum", esc(a.geburtsdatum)) +
      row("E-Mail", a.email ? "<a href='mailto:" + esc(a.email) + "'>" + esc(a.email) + "</a>" + (a.email_typ ? " (" + esc(a.email_typ) + ")" : "") : "—") +
      row("Telefon privat", esc(a.telefon_privat)) +
      row("Telefon Arbeit", esc(a.telefon_arbeit)) +
      row("Nachricht", esc(a.nachricht)) +
      "<div class='kv'><span class='kv__k'>Dateien</span><span class='kv__v' id='app-files'>Links werden erzeugt …</span></div>";

    show(appModal);

    // Status-Änderung
    document.getElementById("app-status").addEventListener("change", function (e) {
      var next = e.target.value;
      sb.from("bewerbungen").update({ status: next }).eq("id", a.id).then(function (res) {
        if (res.error) { alert("Status konnte nicht geändert werden: " + res.error.message); return; }
        a.status = next;
        renderAllApps();
      });
    });

    // Signierte Download-Links (privater Bucket)
    var paths = [];
    if (a.lebenslauf_pfad) paths.push({ label: "Lebenslauf", path: a.lebenslauf_pfad });
    asArray(a.zusatz_dateien).forEach(function (p, i) { paths.push({ label: "Zusatzdatei " + (i + 1), path: p }); });

    var filesEl = document.getElementById("app-files");
    if (!paths.length) { filesEl.textContent = "Keine Dateien"; return; }

    sb.storage.from(bucket).createSignedUrls(paths.map(function (p) { return p.path; }), 3600)
      .then(function (res) {
        if (res.error) { filesEl.textContent = "Download-Links konnten nicht erzeugt werden."; return; }
        var map = {};
        (res.data || []).forEach(function (d) { map[d.path] = d.signedUrl; });
        filesEl.innerHTML = paths.map(function (p) {
          var url = map[p.path];
          var fname = p.path.split("/").pop();
          return url
            ? "<a class='app-file' href='" + esc(url) + "' target='_blank' rel='noopener'>↓ " + esc(p.label) + " <span class='admin-muted'>(" + esc(fname) + ")</span></a>"
            : "<span class='app-file app-file--err'>" + esc(p.label) + " — nicht verfügbar</span>";
        }).join("");
      });
  }

  /* ====================== BEREICH 3: KONTAKTANFRAGEN ====================== */
  var contactsList = document.getElementById("contacts-admin-list");
  var contactsCache = [];
  var contactModal = document.getElementById("contact-modal");

  function loadContacts() {
    contactsList.innerHTML = '<p class="jobs-loading">Kontaktanfragen werden geladen …</p>';
    sb.from("kontaktanfragen").select("*").order("created_at", { ascending: false })
      .then(function (res) {
        if (res.error) { contactsList.innerHTML = '<p class="applyform__status--error">Fehler beim Laden: ' + esc(res.error.message) + "</p>"; return; }
        contactsCache = res.data || [];
        renderContacts(contactsCache);
      });
  }

  function contactStatusBadge(s) {
    var cls = s === "erledigt" ? "badge--fwd" : (s === "in Bearbeitung" ? "badge--seen" : "badge--new");
    return "<span class='badge " + cls + "'>" + esc(s || "neu") + "</span>";
  }

  function renderContacts(items) {
    if (!items.length) { contactsList.innerHTML = "<p>Noch keine Kontaktanfragen eingegangen.</p>"; return; }
    var rows = items.map(function (k) {
      var name = [k.vorname, k.nachname].filter(Boolean).join(" ");
      return (
        '<tr data-id="' + esc(k.id) + '">' +
          "<td><strong>" + esc(name || "—") + "</strong><br><span class='admin-muted'>" + esc(k.email || "") + "</span></td>" +
          "<td>" + esc(k.firma || "—") + "</td>" +
          "<td>" + esc(k.art_der_anfrage || "—") + "</td>" +
          "<td>" + fmtDate(k.created_at) + "</td>" +
          "<td>" + contactStatusBadge(k.status) + "</td>" +
          "<td class='admin-actions'><button class='btn btn--ghost btn--xs js-view'>Ansehen</button></td>" +
        "</tr>"
      );
    }).join("");
    contactsList.innerHTML =
      "<table class='admin-table'><thead><tr><th>Name</th><th>Firma</th><th>Art der Anfrage</th><th>Datum</th><th>Status</th><th></th></tr></thead><tbody>" +
      rows + "</tbody></table>";
    contactsList.querySelectorAll("tbody tr").forEach(function (tr) {
      var k = items.find(function (x) { return String(x.id) === String(tr.getAttribute("data-id")); });
      if (!k) return;
      var v = tr.querySelector(".js-view");
      if (v) v.addEventListener("click", function () { openContactDetail(k); });
    });
  }

  function openContactDetail(k) {
    var name = [k.vorname, k.nachname].filter(Boolean).join(" ");
    document.getElementById("contact-modal-title").textContent = name || "Kontaktanfrage";
    var detail = document.getElementById("contact-detail");

    var statusSel = "<select id='contact-status' class='jobfilter__select'>" +
      STATUS_KONTAKT.map(function (s) { return "<option value='" + esc(s) + "'" + ((k.status || "neu") === s ? " selected" : "") + ">" + esc(s) + "</option>"; }).join("") +
      "</select>";

    detail.innerHTML =
      "<div class='app-detail__status'>" + row("Status", statusSel) + "</div>" +
      row("Eingegangen", fmtDate(k.created_at)) +
      row("Art der Anfrage", esc(k.art_der_anfrage)) +
      row("Name", esc(name)) +
      row("Firma / Institution", esc(k.firma)) +
      row("E-Mail", k.email ? "<a href='mailto:" + esc(k.email) + "'>" + esc(k.email) + "</a>" : "—") +
      row("Telefon", k.telefon ? "<a href='tel:" + esc(k.telefon) + "'>" + esc(k.telefon) + "</a>" : "—") +
      row("Nachricht", esc(k.nachricht)) +
      "<div class='kv'><span class='kv__k'>Anhänge</span><span class='kv__v' id='contact-files'>Links werden erzeugt …</span></div>";

    show(contactModal);

    document.getElementById("contact-status").addEventListener("change", function (e) {
      var next = e.target.value;
      sb.from("kontaktanfragen").update({ status: next }).eq("id", k.id).then(function (res) {
        if (res.error) { alert("Status konnte nicht geändert werden: " + res.error.message); return; }
        k.status = next;
        renderContacts(contactsCache);
      });
    });

    var paths = asArray(k.dateien);
    var filesEl = document.getElementById("contact-files");
    if (!paths.length) { filesEl.textContent = "Keine Anhänge"; return; }

    sb.storage.from(KONTAKT_BUCKET).createSignedUrls(paths, 3600).then(function (res) {
      if (res.error) { filesEl.textContent = "Download-Links konnten nicht erzeugt werden."; return; }
      var map = {};
      (res.data || []).forEach(function (d) { map[d.path] = d.signedUrl; });
      filesEl.innerHTML = paths.map(function (p, i) {
        var url = map[p];
        var fname = String(p).split("/").pop();
        return url
          ? "<a class='app-file' href='" + esc(url) + "' target='_blank' rel='noopener'>↓ Anhang " + (i + 1) + " <span class='admin-muted'>(" + esc(fname) + ")</span></a>"
          : "<span class='app-file app-file--err'>Anhang " + (i + 1) + " — nicht verfügbar</span>";
      }).join("");
    });
  }

  /* ---- Modal schließen ---- */
  document.querySelectorAll("[data-close]").forEach(function (el) {
    el.addEventListener("click", function () {
      hide(document.getElementById(el.getAttribute("data-close") + "-modal"));
    });
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { hide(jobModal); hide(appModal); hide(contactModal); }
  });
})();
