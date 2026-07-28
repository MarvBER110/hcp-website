/* Generisches Karten-Karussell: eine Reihe Karten, Pfeile blättern seitenweise.
   Markup: .cards-carousel > [data-dir="prev"], .carousel__track, [data-dir="next"]. */
(function () {
  var GAP = 24;

  function init(root) {
    var track = root.querySelector(".carousel__track");
    if (!track) return;
    var prev = root.querySelector('[data-dir="prev"]');
    var next = root.querySelector('[data-dir="next"]');

    function maxScroll() { return track.scrollWidth - track.clientWidth; }

    function update() {
      var end = maxScroll();
      if (prev) prev.disabled = track.scrollLeft <= 2;
      if (next) next.disabled = track.scrollLeft >= end - 2;
      // Wenn alles in eine Ansicht passt: beide Pfeile aus.
      if (end < 4) { if (prev) prev.disabled = true; if (next) next.disabled = true; }
    }

    function page(dir) {
      var card = track.querySelector(".card");
      var step = card ? (card.getBoundingClientRect().width + GAP) : track.clientWidth;
      var visible = Math.max(1, Math.round(track.clientWidth / step));
      track.scrollBy({ left: dir * step * visible, behavior: "smooth" });
    }

    if (prev) prev.addEventListener("click", function () { page(-1); });
    if (next) next.addEventListener("click", function () { page(1); });
    track.addEventListener("scroll", function () { window.requestAnimationFrame(update); });
    window.addEventListener("resize", update);
    update();
  }

  document.querySelectorAll(".cards-carousel").forEach(init);
})();
