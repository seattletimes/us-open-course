var matches = "matchesSelector" in document.body ? "matchesSelector" :
  "msMatchesSelector" in document.body ? "msMatchesSelector" :
  "mozMatchesSelector" in document.body ? "mozMatchesSelector" :
  "webkitMatchesSelector" in document.body ? "webkitMatchesSelector" : "matches";

module.exports = {
  closest(from, selector) {
    while (from != document.documentElement) {
      if (from[matches](selector)) return from;
      from = from.parentElement;
    }
  },
  nextTick: window.requestAnimationFrame ? 
    window.requestAnimationFrame.bind(window) :
    function(f) { setTimeout(f, 10) },
  deg(r) {
    if (r < 0) r += 360;
    return r / 360 * (Math.PI * 2);
  },
  inMiles: (m) => m / 5280 * 3.25,
  inFeet: (f) => f * 3.25,
  inInches: (i) => i * 3.25 / 12,
  toFeet: (u) => u / 3.25
}