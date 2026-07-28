/* Holmes Consulting Partners — Scroll-Reveal für die Prozess-Timeline
   ("So begleiten wir Sie — Schritt für Schritt").

   Effekt: "Staggered Fade-up", scroll-gekoppelt (scrub). Der Fortschritt
   jedes Schritts hängt direkt an der Scroll-Position: runterscrollen blendet
   ein (Überschrift → Text → Badge, leicht versetzt), hochscrollen blendet
   spiegelverkehrt wieder aus. Die Animation läuft dem Scroll 1:1 mit, mit
   leichter Glättung (scrub) für ein smoothes, "premium" Gefühl.

   Technik: GSAP 3 + ScrollTrigger (CDN-Einbindung im HTML vor dieser Datei).

   ────────────────────────────────────────────────────────────────────────
   Werte anpassen: einfach den CONFIG-Block unten ändern.
   ──────────────────────────────────────────────────────────────────────── */
(function () {
  "use strict";

  var root = document.documentElement;

  // Falls GSAP/ScrollTrigger nicht geladen sind (z. B. CDN blockiert):
  // die im <head> versteckten Elemente wieder einblenden, damit nichts
  // dauerhaft unsichtbar bleibt.
  if (typeof window.gsap === "undefined" || typeof window.ScrollTrigger === "undefined") {
    root.classList.remove("gsap-anim");
    return;
  }

  // Bei prefers-reduced-motion wird die Klasse im <head> nie gesetzt →
  // dann gibt es nichts zu animieren, alle Elemente sind regulär sichtbar.
  if (!root.classList.contains("gsap-anim")) return;

  gsap.registerPlugin(ScrollTrigger);

  // ============================ CONFIG ==============================
  // Scroll-gekoppelt (scrub): Der Animations-Fortschritt hängt direkt an
  // der Scroll-Position zwischen `start` und `end`. Runterscrollen blendet
  // ein, Hochscrollen blendet spiegelverkehrt wieder aus. Gefahrlos justierbar.
  var CONFIG = {
    yOffset: 40,         // Start-Versatz nach unten in px (Slide-up)
    duration: 0.8,       // relative Gewichtung pro Element (bei scrub kein Sekundenwert)
    ease: "none",        // bei scrub empfohlen: lineares 1:1-Mitlaufen mit dem Scroll
    stagger: 0.15,       // Versatz: Überschrift → Text → Badge
    scrub: 0.6,          // Glättung: Animation läuft dem Scroll mit leichtem Nachlauf
    start: "top 90%",    // Beginn: Schritt-Oberkante nahe unterem Rand
    end: "top 55%"       // Ende: Schritt-Oberkante etwa in der oberen Bildmitte
  };
  // ==================================================================

  // Pro Timeline-Schritt eine eigene Timeline, deren Fortschritt an den
  // Scroll-Bereich [start … end] des Schritts gekoppelt ist (scrub).
  gsap.utils.toArray(".timeline .step").forEach(function (step) {
    var heading = step.querySelector("h3");
    var text    = step.querySelector("p");
    var badge   = step.querySelector(".step__num");

    var tl = gsap.timeline({
      scrollTrigger: {
        trigger: step,
        start: CONFIG.start,
        end: CONFIG.end,
        // scrub koppelt den Fortschritt direkt an die Scroll-Position:
        // runter = einblenden, hoch = spiegelverkehrt ausblenden. Der Zahlwert
        // ist die Glättung (Nachlauf in Sek.) für ein smoothes Mitlaufen.
        scrub: CONFIG.scrub
      }
    });

    // 1) Überschrift, 2) Text — nacheinander versetzt einblenden
    //    (Fade-in opacity 0 → 1 + Slide-up von +yOffset auf 0).
    tl.to([heading, text], {
      opacity: 1,
      y: 0,
      duration: CONFIG.duration,
      ease: CONFIG.ease,
      stagger: CONFIG.stagger
    });

    // 3) Nummern-Badge zuletzt — einen Hauch verspielter (zusätzlich
    //    leichtes Hochskalieren von 0.9 auf 1). Startet zeitlich nach
    //    dem Text, setzt also die Staffelung fort.
    tl.to(badge, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: CONFIG.duration,
      ease: CONFIG.ease
    }, CONFIG.stagger * 2);
  });

  // ── Horizontale Wochen-Timeline (Startseite, „Unser Prozess") ─────────
  // Gleicher scroll-gekoppelter Reveal wie oben, aber als Kaskade von links
  // nach rechts: der Strahl wächst mit, jeder Schritt blendet versetzt ein
  // (Quadrat → Titel → Text). Eine gemeinsame Timeline pro Band, da die
  // Schritte nebeneinander stehen und denselben Scroll-Bereich teilen.
  gsap.utils.toArray(".weeks-line").forEach(function (line) {
    var rail  = line.querySelector(".weeks-line__rail");
    var steps = gsap.utils.toArray(line.querySelectorAll(".weeks-step"));

    var tl = gsap.timeline({
      scrollTrigger: {
        trigger: line,
        start: CONFIG.start,
        end: "top 40%",          // etwas längerer Scrollweg: 5 Schritte kaskadieren
        scrub: CONFIG.scrub
      }
    });

    if (rail) {
      // Strahl wächst über die gesamte Kaskade von links nach rechts
      // (mobil: von oben nach unten — scaleY, siehe CSS-Startzustand)
      tl.to(rail, {
        scaleX: 1,
        scaleY: 1,
        duration: CONFIG.duration * steps.length * 0.5,
        ease: CONFIG.ease
      }, 0);
    }

    steps.forEach(function (step, i) {
      tl.to([
        step.querySelector(".weeks-step__num"),
        step.querySelector("h3"),
        step.querySelector("p")
      ], {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: CONFIG.duration,
        ease: CONFIG.ease,
        stagger: CONFIG.stagger
      }, i * CONFIG.duration * 0.45);
    });
  });
})();
