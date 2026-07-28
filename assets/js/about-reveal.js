/* Über-uns — Scroll-Reveal für die alternierenden Feature-Zeilen.
   Beim Hineinscrollen erscheint zuerst die linke Spalte, kurz darauf
   (zeitversetzt per CSS transition-delay) die rechte Spalte.
   Greift nur, wenn <html> die Klasse `reveal-anim` trägt (kein
   prefers-reduced-motion). Ohne JS/IO bleiben alle Inhalte sichtbar. */
(function () {
  var features = document.querySelectorAll(".about-feature");
  if (!features.length) return;

  // Kein IntersectionObserver → einfach alles einblenden.
  if (!("IntersectionObserver" in window)) {
    features.forEach(function (f) { f.classList.add("is-in"); });
    return;
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-in");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2, rootMargin: "0px 0px -12% 0px" });

  features.forEach(function (f) { io.observe(f); });
})();
