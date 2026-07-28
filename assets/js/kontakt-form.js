/* Kontaktformular — schreibt in Tabelle kontaktanfragen + optionale Dateien
   in den Storage-Bucket „kontakt". Nutzt window.hcpSupabase() (CDN-Client).
   Insert ohne .select() (return=minimal), da anon nicht lesen darf. */
(function () {
  var sb = window.hcpSupabase && window.hcpSupabase();
  var BUCKET = "kontakt";

  var form = document.getElementById("kontakt-form");
  var confirmEl = document.getElementById("kontakt-confirm");
  var statusEl = document.getElementById("kf-status");
  if (!form) return;

  // Rechenfrage zufällig setzen (Math.random im Browser ist ok)
  var a = Math.floor(Math.random() * 8) + 2;   // 2..9
  var b = Math.floor(Math.random() * 8) + 1;   // 1..8
  document.getElementById("kf-q-a").textContent = a;
  document.getElementById("kf-q-b").textContent = b;

  function setStatus(msg, isError) {
    if (!statusEl) return;
    statusEl.textContent = msg || "";
    statusEl.className = "applyform__status" + (isError ? " applyform__status--error" : "");
  }
  function sanitizeName(name) {
    return String(name || "datei").normalize("NFKD").replace(/[^\w.\-]+/g, "_").replace(/_+/g, "_").slice(-80);
  }

  var counter = 0;
  function uploadFile(file) {
    counter += 1;
    var stamp = new Date().toISOString().replace(/[:.]/g, "-");
    var path = stamp + "-" + counter + "-" + sanitizeName(file.name);
    return sb.storage.from(BUCKET).upload(path, file, { upsert: false, contentType: file.type || undefined })
      .then(function (res) { if (res.error) throw res.error; return (res.data && res.data.path) || path; });
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    setStatus("");

    // Honeypot: wenn ausgefüllt → still abbrechen (Bot)
    var hp = document.getElementById("kf-website");
    if (hp && hp.value.trim() !== "") { return; }

    var email = document.getElementById("kf-email");
    var telefon = document.getElementById("kf-telefon");
    var nachricht = document.getElementById("kf-nachricht");
    var captcha = document.getElementById("kf-captcha");
    var datenschutz = document.getElementById("kf-datenschutz");
    [email, telefon, nachricht, captcha].forEach(function (f) { if (f) f.classList.remove("form-error"); });

    var missing = [];
    if (!email.value.trim()) { email.classList.add("form-error"); missing.push("E-Mail"); }
    if (!telefon.value.trim()) { telefon.classList.add("form-error"); missing.push("Telefon"); }
    if (!nachricht.value.trim()) { nachricht.classList.add("form-error"); missing.push("Nachricht"); }
    if (!datenschutz.checked) { missing.push("Datenschutz-Einwilligung"); }
    if (missing.length) { setStatus("Bitte ausfüllen: " + missing.join(", ") + ".", true); return; }

    // Rechenfrage prüfen
    if (parseInt(captcha.value, 10) !== (a + b)) {
      captcha.classList.add("form-error");
      setStatus("Die Sicherheitsfrage wurde nicht korrekt beantwortet.", true);
      return;
    }

    var files = Array.prototype.slice.call(document.getElementById("kf-files").files || []);
    if (files.length > 3) { setStatus("Bitte maximal 3 Dateien anhängen.", true); return; }

    var submitBtn = document.getElementById("kf-submit");
    submitBtn.disabled = true;
    setStatus("Ihre Nachricht wird gesendet …");

    if (!sb) { submitBtn.disabled = false; setStatus("Verbindung nicht möglich. Bitte später erneut versuchen.", true); return; }

    Promise.all(files.map(uploadFile))
      .then(function (paths) {
        var row = {
          vorname: document.getElementById("kf-vorname").value.trim() || null,
          nachname: document.getElementById("kf-nachname").value.trim() || null,
          firma: document.getElementById("kf-firma").value.trim() || null,
          email: email.value.trim(),
          telefon: telefon.value.trim(),
          art_der_anfrage: document.getElementById("kf-art").value || null,
          nachricht: nachricht.value.trim(),
          dateien: paths,
          einwilligung: true,
          quelle: "website"
        };
        return sb.from("kontaktanfragen").insert(row);   // ohne .select() → return=minimal
      })
      .then(function (res) {
        if (res.error) throw res.error;
        form.hidden = true;
        confirmEl.hidden = false;
        confirmEl.scrollIntoView({ behavior: "smooth", block: "center" });
      })
      .catch(function (err) {
        console.error("Kontaktanfrage fehlgeschlagen:", err);
        submitBtn.disabled = false;
        var msg = "Die Nachricht konnte nicht gesendet werden. Bitte versuchen Sie es später erneut.";
        if (err && (err.code === "42501" || /row-level security/i.test(err.message || "")))
          msg = "Senden derzeit nicht möglich. Bitte kontaktieren Sie uns direkt per E-Mail.";
        setStatus(msg, true);
      });
  });
})();
