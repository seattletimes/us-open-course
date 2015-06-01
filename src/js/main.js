//Use CommonJS style via browserify to load other modules
// require("./lib/social");
// require("./lib/ads");

const SKY_COLOR = 0xBBBBEE;

var nextTick = window.requestAnimationFrame ? 
  window.requestAnimationFrame.bind(window) :
  function(f) { setTimeout(f, 10) };

var three = require("three");
window.THREE = three;
var scene = new three.Scene();
scene.fog = new three.Fog(SKY_COLOR, 100, 500);

var scaleDown = 1;//.8;
var canvas = document.querySelector(".renderer");
var renderer = new three.WebGLRenderer({
  canvas: canvas
});
renderer.setSize(canvas.offsetWidth, canvas.offsetHeight, false);
renderer.setClearColor(SKY_COLOR);
window.addEventListener("resize", () => renderer.setSize(canvas.offsetWidth, canvas.offsetHeight, false));

var sphere = new three.SphereGeometry(1, 16, 16);
var white = new three.MeshLambertMaterial({ color: 0x888888 });
white.shading = three.FlatShading;
var red = new three.MeshLambertMaterial({ color: 0x552222 });
red.shading = three.FlatShading;
var spike = new three.CylinderGeometry(1, 0, 3, 9, 4);
var gold = new three.MeshLambertMaterial({ color: 0xAA8800 });
var green = new three.MeshLambertMaterial({ color: 0x446622 });

var ambience = new three.AmbientLight(0x404040);
scene.add(ambience);

var sun = new three.DirectionalLight(0x888888, 4);
sun.position.set(0, 60, 60);
scene.add(sun);

var poiMap = {};

var poi = require("./poi");
poi.course.forEach(function(point) {
  var ball = new three.Mesh(sphere, white);
  ball.position.set(...point.hole);
  scene.add(ball);
  var tee = new three.Mesh(spike, red);
  tee.position.set(...point.tee);
  scene.add(tee);
  poiMap[point.id] = {
    ball: ball,
    data: point,
    tee: tee
  };
});

var focus = new three.Mesh(sphere, green);
// focus.visible = false;
scene.add(focus);

require("./targetCam");
var camera = new three.TargetCamera(70, 16 / 9, 0.1, 1000);

camera.addTarget({
  name: "focus",
  targetObject: focus,
  fixed: false,
  matchRotation: false,
  cameraPosition: new three.Vector3(-80, 20, 20),
  stiffness: 0.01
});
camera.setTarget("focus");


var tweenjs = require("tween.js");
var tween = null;
var previous = null;

var moveFocus = function() {
  focus.position.set(this.x, this.y, this.z);
};

var goto = function(id) {
  // console.log(id, poiMap[id]);
  var point = poiMap[id];
  if (previous) {
    previous.ball.material = white;
    previous.tee.material = red;
  }
  previous = point;
  point.ball.material = gold;
  point.tee.material = gold;
  var ball = point.ball.position;
  var tee = point.tee.position;
  var midpoint = {
    x: (tee.x + ball.x) / 2,
    y: (tee.y + ball.y) / 2,
    z: (tee.z + ball.z) / 2
  };
  var current = {
    x: focus.position.x,
    y: focus.position.y,
    z: focus.position.z
  };
  if (tween) tween.stop();
  tween = new tweenjs.Tween(current).to(midpoint, 1000);
  tween.easing(tweenjs.Easing.Quartic.InOut);
  tween.start();
  tween.onUpdate(moveFocus);
};

var current = 0;
var shift = function() {
  goto((current++ % 18) + 1);
  setTimeout(shift, 4000);
};

var counter = 0;
var renderLoop = function() {
  tweenjs.update();
  renderer.render(scene, camera);
  counter += 0.005;
  camera.update();
  nextTick(renderLoop);
  // setTimeout(renderLoop, 1000);
};

document.body.classList.add("loading");
var init = require("./init");
init(scene, function() {
  document.body.classList.remove("loading");
  renderLoop();
  goto(12);
});

document.body.addEventListener("click", function(e) {
  if (!e.target.classList.contains("go-to")) return;
  var id = e.target.getAttribute("data-link");
  goto(id);
});

window.camera = camera;