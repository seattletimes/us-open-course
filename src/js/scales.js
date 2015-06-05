module.exports = {
  inMiles: (m) => m / 5280 * 3.25,
  inFeet: (f) => f * 3.25,
  inInches: (i) => i * 3.25 / 12,
  toFeet: (u) => u / 3.25
};