var three = require("three");

const SKY_COLOR = 0xBBCCFF;
const SCALING = 1;

var canvas = document.querySelector(".renderer");
try {
  //Sorry, IE
  if (navigator.userAgent.match(/trident|msie/i)) {
    throw("IE not supported");
  }

  var renderer = new three.WebGLRenderer({
    canvas: canvas,
    alpha: false,
    antialias: true
  });

  renderer.context.depthFunc(renderer.context.LESS);

  renderer.setClearColor(SKY_COLOR);
  var onResize = () => renderer.setSize(canvas.offsetWidth * SCALING, canvas.offsetHeight * SCALING, false)
  window.addEventListener("resize", onResize);
  onResize();

} catch (e) {
  document.body.classList.add("no-webgl");
}

module.exports = renderer;