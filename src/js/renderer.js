var three = require("three");

const SKY_COLOR = 0xBBCCFF;
const SCALING = 1;

var canvas = document.querySelector(".renderer");
var renderer = new three.WebGLRenderer({
  canvas: canvas,
  alpha: false,
  antialias: true
});
renderer.setClearColor(SKY_COLOR);
var onResize = () => renderer.setSize(canvas.offsetWidth * SCALING, canvas.offsetHeight * SCALING, false)
window.addEventListener("resize", onResize);
onResize();

module.exports = renderer;