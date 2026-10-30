/* ============================================================================
   Absenden der beiden Funnels an Supabase.

   Spiegelt bewusst die erprobte Logik aus job-detail.js und kontakt-form.js:
   Dateien zuerst in den Storage-Bucket, danach eine Zeile in die Tabelle.
   Es werden ausschliesslich Spalten geschrieben, die dort nachweislich
   schon benutzt werden — keine neuen Felder, keine Migration noetig.

     Kandidaten-Funnel  -> Tabelle "bewerbungen"      (stelle_id = null, also
                                                       im Admin unter
                                                       "Initiativbewerbungen")
     Unternehmens-Funnel -> Tabelle "kontaktanfragen"  (art_der_anfrage =
                                                       "Anfrage als Unternehmen")

   Die Antworten aus den Funnel-Schritten passen in keine eigene Spalte und
   werden deshalb als lesbares Protokoll in "nachricht" abgelegt.
   ========================================================================== */
window.hcpFunnelSubmit = (function () {
  "use strict";

  function client() {
    return window.hcpSupabase ? window.hcpSupabase() : null;
  }

  /* ── Datei-Upload (identisch zu kontakt-form.js) ────────────────────────── */
  function sanitizeName(name) {
    return String(name || "datei")
      .normalize("NFKD")
      .replace(/[^\w.\-]+/g, "_")
      .replace(/_+/g, "_")
      .slice(-80);
  }

  var counter = 0;
  function uploadFile(sb, file) {
    counter += 1;
    var stamp = new Date().toISOString().replace(/[:.]/g, "-");
    var path = stamp + "-" + counter + "-" + sanitizeName(file.name);
    return sb.storage
      .from(window.HCP_SUPABASE.bucket)
      .upload(path, file, { upsert: false, contentType: file.type || undefined })
      .then(function (res) {
        if (res.error) throw res.error;
        return (res.data && res.data.path) || path;
      });
  }

  function filesOf(input) {
    return input && input.files ? Array.prototype.slice.call(input.files) : [];
  }

  /* ── Antworten der Schritte einsammeln ──────────────────────────────────
     Bewusst generisch ueber die Schritte statt ueber feste Feld-IDs: so
     bleibt das Protokoll vollstaendig, auch wenn spaeter Fragen dazukommen
     oder umformuliert werden. Felder, die eine eigene Spalte haben
     (Name, Mail, Telefon, Firma), werden ausgelassen. */
  function clean(el) {
    return (el.textContent || "").replace(/\s+/g, " ").trim();
  }

  function collectAnswers(skipIds) {
    var skip = {};
    (skipIds || []).forEach(function (id) { skip[id] = true; });

    var lines = [];
    document.querySelectorAll(".funnel-step").forEach(function (step) {
      var n = Number(step.getAttribute("data-step"));
      if (!n) return;                                  /* Schritt 0 = Intro */

      var head = step.querySelector("h2, h1");
      var question = head ? clean(head) : "Schritt " + n;
      var parts = [];

      var opt = step.querySelector(".funnel-option.is-selected");
      if (opt) parts.push(clean(opt));

      step.querySelectorAll("[data-chipgroup] .funnel-chip.is-selected")
        .forEach(function (chip) { parts.push(clean(chip)); });

      step.querySelectorAll("input, textarea").forEach(function (el) {
        if (skip[el.id]) return;
        if (el.type === "file" || el.type === "checkbox" || el.type === "radio") return;
        var v = (el.value || "").trim();
        if (v) parts.push(v);
      });

      if (parts.length) lines.push(question + ": " + parts.join(" | "));
    });
    return lines.join("\n");
  }

  function val(id) {
    var el = document.getElementById(id);
    return el ? el.value.trim() : "";
  }

  /* ── Kandidaten-Funnel ──────────────────────────────────────────────────── */
  function submitKandidat() {
    var sb = client();
    if (!sb) return Promise.reject(new Error("Supabase-Client nicht verfuegbar."));

    var cv = filesOf(document.getElementById("f-cv"))[0] || null;
    var extra = filesOf(document.getElementById("f-zeugnisse"));

    var cvStep = cv ? uploadFile(sb, cv) : Promise.resolve(null);

    return cvStep
      .then(function (cvPath) {
        return Promise.all(extra.map(function (f) { return uploadFile(sb, f); }))
          .then(function (extraPaths) {
            return { cvPath: cvPath, extraPaths: extraPaths };
          });
      })
      .then(function (paths) {
        var row = {
          vorname: val("f-vorname") || null,
          nachname: val("f-nachname") || null,
          email: val("f-mail"),
          telefon_privat: val("f-tel") || null,
          nachricht: collectAnswers(["f-vorname", "f-nachname", "f-mail", "f-tel"]) || null,
          einwilligung: true,
          lebenslauf_pfad: paths.cvPath,
          zusatz_dateien: paths.extraPaths,
          stelle_id: null,
          stelle_titel: "Initiativbewerbung"
        };
        return sb.from("bewerbungen").insert(row);
      })
      .then(function (res) {
        if (res.error) throw res.error;
        return true;
      });
  }

  /* ── Unternehmens-Funnel ────────────────────────────────────────────────── */
  function submitUnternehmen() {
    var sb = client();
    if (!sb) return Promise.reject(new Error("Supabase-Client nicht verfuegbar."));

    var row = {
      vorname: null,
      nachname: null,
      firma: val("f-firma") || null,
      email: val("f-mail"),
      telefon: val("f-tel"),
      art_der_anfrage: "Anfrage als Unternehmen",
      nachricht: collectAnswers(["f-firma", "f-mail", "f-tel"]) || null,
      dateien: [],
      einwilligung: true,
      quelle: "lead-funnel"
    };

    return sb.from("kontaktanfragen").insert(row).then(function (res) {
      if (res.error) throw res.error;
      return true;
    });
  }

  return { kandidat: submitKandidat, unternehmen: submitUnternehmen };
})();
