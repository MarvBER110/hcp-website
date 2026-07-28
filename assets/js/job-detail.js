/* Stellen-Detailseite: lädt die Stelle anhand ?slug= aus Supabase, rendert
   Referenznummer/Titel/Ort/Beschreibung und verarbeitet das Bewerbungsformular
   (Datei-Upload in Storage-Bucket + Insert in Tabelle bewerbungen). */
(function () {
  var sb = window.hcpSupabase && window.hcpSupabase();
  var bucket = (window.HCP_SUPABASE && window.HCP_SUPABASE.bucket) || "bewerbungen";

  var elLoading = document.getElementById("jd-loading");
  var elNotFound = document.getElementById("jd-notfound");
  var elContent = document.getElementById("jd-content");
  var applyWrap = document.getElementById("apply-wrap");
  var applyForm = document.getElementById("apply-form");
  var applyConfirm = document.getElementById("apply-confirm");
  var statusEl = document.getElementById("af-status");

  var currentJob = null;

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function asArray(v) { return Array.isArray(v) ? v : (v == null ? [] : [v]); }
  function show(el) { if (el) el.hidden = false; }
  function hide(el) { if (el) el.hidden = true; }

  function getSlug() {
    var p = new URLSearchParams(window.location.search);
    return (p.get("slug") || "").trim();
  }
  function getParam(name) {
    return (new URLSearchParams(window.location.search).get(name) || "").trim();
  }

  function showNotFound() { hide(elLoading); hide(elContent); hide(applyWrap); show(elNotFound); }

  function renderJob(job) {
    currentJob = job;
    document.getElementById("jd-title").textContent = job.titel || "Stellenangebot";
    document.title = (job.titel || "Stellenangebot") + " — Holmes Consulting Partners";

    var orte = asArray(job.orte).join(", ");
    var laender = asArray(job.bundeslaender).join(", ");
    var ortLine = [orte, laender].filter(Boolean).join(" · ");
    document.getElementById("jd-meta").textContent =
      [ortLine, job.anstellungsart].filter(Boolean).join("  |  ");

    var ref = document.getElementById("jd-ref");
    if (job.referenznummer) ref.textContent = "Referenznr. " + job.referenznummer; else ref.style.display = "none";

    // Tags: Fachgebiete + Berufserfahrung als Chips
    var tags = asArray(job.fachgebiete).slice();
    if (job.berufserfahrung) tags.push(job.berufserfahrung);
    document.getElementById("jd-tags").innerHTML = tags.map(function (t) {
      return '<span class="chip">' + esc(t) + "</span>";
    }).join("");

    document.getElementById("jd-body").textContent = job.beschreibung || job.teaser || "";

    hide(elLoading); hide(elNotFound); show(elContent);

    // Deep-Link: #bewerben öffnet das Formular direkt + scrollt sanft dorthin
    // (kurze Verzögerung, damit das Layout nach dem Rendern steht).
    if (window.location.hash === "#bewerben") {
      show(applyWrap);
      setTimeout(function () {
        applyWrap.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 80);
    }
  }

  // Initiativbewerbung: keine konkrete Stelle, Formular direkt anzeigen.
  // Nutzt dasselbe Formular + denselben Supabase-Upload; die Bewerbung wird
  // mit stelle_titel „Initiativbewerbung" (ohne Referenznummer) gespeichert.
  function showInitiativ() {
    currentJob = { id: null, titel: "Initiativbewerbung", referenznummer: null };
    document.title = "Initiativbewerbung — Holmes Consulting Partners";
    hide(elLoading); hide(elNotFound); hide(elContent);

    var head = applyWrap.querySelector(".section__head h2");
    if (head) head.textContent = "Initiativbewerbung";
    var intro = applyWrap.querySelector(".section__head p");
    if (intro) {
      intro.innerHTML = "Aktuell ist nichts Passendes dabei? Senden Sie uns Ihre Unterlagen — " +
        "wir melden uns, sobald eine passende Position entsteht. " +
        'Pflichtfelder sind mit <span class="req">*</span> markiert.';
    }
    applyWrap.style.marginTop = "0";
    show(applyWrap);
    applyWrap.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function load() {
    var slug = getSlug();
    if (!sb) { showNotFound(); return; }
    if (!slug) {
      if (getParam("initiativ") === "1") { showInitiativ(); return; }
      showNotFound(); return;
    }
    sb.from("stellenangebote").select("*").eq("slug", slug).limit(1)
      .then(function (res) {
        if (res.error) { console.error(res.error); showNotFound(); return; }
        if (!res.data || !res.data.length) { showNotFound(); return; }
        renderJob(res.data[0]);
      });
  }

  /* ---- Bewerbungsformular ---- */
  function openApply() {
    show(applyWrap);
    // Teilbaren Deep-Link erzeugen: #bewerben an die URL hängen (der ?slug=… bleibt
    // erhalten). pushState statt location.hash, damit der sanfte Scroll nicht durch
    // einen harten Sprung gestört wird.
    if (window.location.hash !== "#bewerben") {
      history.pushState(null, "", "#bewerben");
    }
    applyWrap.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  var applyBtn = document.getElementById("jd-apply-btn");
  if (applyBtn) applyBtn.addEventListener("click", openApply);
  var applyLink = document.getElementById("jd-apply-link");
  if (applyLink) applyLink.addEventListener("click", function (e) { e.preventDefault(); openApply(); });

  function setStatus(msg, isError) {
    if (!statusEl) return;
    statusEl.textContent = msg || "";
    statusEl.className = "applyform__status" + (isError ? " applyform__status--error" : "");
  }

  function sanitizeName(name) {
    return String(name || "datei")
      .normalize("NFKD").replace(/[^\w.\-]+/g, "_").replace(/_+/g, "_").slice(-80);
  }

  // einfacher Pfad-Token statt Math.random (für Eindeutigkeit reicht Zeit + Zähler)
  var uploadCounter = 0;
  function uploadPath(file) {
    uploadCounter += 1;
    var stamp = new Date().toISOString().replace(/[:.]/g, "-");
    var base = (currentJob && currentJob.referenznummer ? currentJob.referenznummer : "allgemein");
    return base + "/" + stamp + "-" + uploadCounter + "-" + sanitizeName(file.name);
  }

  function uploadFile(file) {
    var path = uploadPath(file);
    return sb.storage.from(bucket).upload(path, file, { upsert: false, contentType: file.type || undefined })
      .then(function (res) {
        if (res.error) throw res.error;
        return (res.data && res.data.path) || path;
      });
  }

  if (applyForm) {
    applyForm.addEventListener("submit", function (e) {
      e.preventDefault();
      setStatus("");

      // Validierung Pflichtfelder
      var vorname = document.getElementById("af-vorname");
      var nachname = document.getElementById("af-nachname");
      var email = document.getElementById("af-email");
      var cv = document.getElementById("af-cv");
      var datenschutz = document.getElementById("af-datenschutz");
      [vorname, nachname, email, cv].forEach(function (f) { if (f) f.classList.remove("form-error"); });

      var missing = [];
      if (!vorname.value.trim()) { vorname.classList.add("form-error"); missing.push("Vorname"); }
      if (!nachname.value.trim()) { nachname.classList.add("form-error"); missing.push("Nachname"); }
      if (!email.value.trim()) { email.classList.add("form-error"); missing.push("E-Mail"); }
      if (!cv.files || !cv.files.length) { cv.classList.add("form-error"); missing.push("Lebenslauf"); }
      if (!datenschutz.checked) { missing.push("Datenschutz-Einwilligung"); }
      if (missing.length) { setStatus("Bitte ausfüllen: " + missing.join(", ") + ".", true); return; }

      var cvFile = cv.files[0];
      if (cvFile.type && cvFile.type.indexOf("pdf") === -1) { setStatus("Der Lebenslauf muss eine PDF-Datei sein.", true); cv.classList.add("form-error"); return; }

      var extra = Array.prototype.slice.call(document.getElementById("af-files").files || []);
      if (extra.length > 5) { setStatus("Bitte maximal 5 zusätzliche Dateien.", true); return; }

      var submitBtn = document.getElementById("af-submit");
      submitBtn.disabled = true;
      setStatus("Bewerbung wird übermittelt …", false);

      // 1) Lebenslauf hochladen → 2) Zusatzdateien → 3) Insert
      uploadFile(cvFile)
        .then(function (cvPath) {
          return Promise.all(extra.map(uploadFile)).then(function (extraPaths) {
            return { cvPath: cvPath, extraPaths: extraPaths };
          });
        })
        .then(function (paths) {
          var gd = document.getElementById("af-geburtsdatum").value;
          var row = {
            anrede: document.getElementById("af-anrede").value || null,
            vorname: vorname.value.trim(),
            nachname: nachname.value.trim(),
            geburtsdatum: gd ? gd : null,
            email: email.value.trim(),
            email_typ: document.getElementById("af-email-typ").value || null,
            telefon_privat: document.getElementById("af-tel-privat").value.trim() || null,
            telefon_arbeit: document.getElementById("af-tel-arbeit").value.trim() || null,
            nachricht: document.getElementById("af-nachricht").value.trim() || null,
            einwilligung: true,
            lebenslauf_pfad: paths.cvPath,
            zusatz_dateien: paths.extraPaths,
            stelle_id: currentJob ? currentJob.id : null,
            stelle_titel: currentJob ? currentJob.titel : null,
            referenznummer: currentJob ? currentJob.referenznummer : null
          };
          return sb.from("bewerbungen").insert(row);
        })
        .then(function (res) {
          if (res.error) throw res.error;
          hide(applyWrap); hide(elContent);
          show(applyConfirm);
          applyConfirm.scrollIntoView({ behavior: "smooth", block: "start" });
        })
        .catch(function (err) {
          console.error("Bewerbung fehlgeschlagen:", err);
          submitBtn.disabled = false;
          var msg = "Die Bewerbung konnte nicht gesendet werden. Bitte versuchen Sie es später erneut.";
          if (err && (err.code === "42501" || /row-level security/i.test(err.message || "")))
            msg = "Senden derzeit nicht möglich (Berechtigung). Bitte kontaktieren Sie uns direkt.";
          setStatus(msg, true);
        });
    });
  }

  load();
})();
