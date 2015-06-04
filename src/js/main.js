//Use CommonJS style via browserify to load other modules
// require("./lib/social");
// require("./lib/ads");

var async = require("async");
var three = require("three");
var tweenjs = require("tween.js");

const SKY_COLOR = 0xBBBBEE;
const TAU = Math.PI * 2;
const TRAVEL_TIME = 2000;

var nextTick = window.requestAnimationFrame ? 
  window.requestAnimationFrame.bind(window) :
  function(f) { setTimeout(f, 10) };

window.THREE = three;
var scene = new three.Scene();
scene.fog = new three.Fog(SKY_COLOR, 100, 800);

var canvas = document.querySelector(".renderer");
var renderer = new three.WebGLRenderer({
  canvas: canvas,
  alpha: false,
  antialias: true
});
renderer.setSize(canvas.offsetWidth, canvas.offsetHeight, false);
renderer.setClearColor(SKY_COLOR);
window.addEventListener("resize", () => renderer.setSize(canvas.offsetWidth, canvas.offsetHeight, false));

var camera = new three.PerspectiveCamera(80, 16 / 9, 0.1, 1000);
camera.position.set(-200, 100, -100);
camera.rotation.set(-1, -1, -1);
window.camera = camera;

var makeScenery = require("./scenery");
makeScenery(scene);

var makeMarkers = require("./markers");
var poiMap = makeMarkers(scene);

//load data, then set up rendering
document.body.classList.add("loading");
var init = require("./init");
init(scene, function(terrain) {

  window.terrain = terrain;

  var counter = 0;
  var renderLoop = function() {
    counter += .01;
    water.morphTargetInfluences[0] = (Math.sin(counter) + 1) / 2;
    tweenjs.update();
    renderer.render(scene, camera);
    nextTick(renderLoop);
  };

  document.body.classList.remove("loading");
  renderLoop();
  goto("overview");
});

//navigation
document.body.addEventListener("click", function(e) {
  if (!e.target.classList.contains("go-to")) return;
  var id = e.target.getAttribute("data-link");
  goto(id);
});

var cameraTweens = {
  location: null,
  rotation: null
};
var previous = null;
var arrow = require("./arrow");
var focusArrow = new three.Mesh(arrow, new three.MeshBasicMaterial({
  // wireframe: true,
  color: 0xFFCC33,
  transparent: true
}));
scene.add(focusArrow);
focusArrow.visible = false;
var cycle = new tweenjs.Tween({ alpha: .8 }).to({ alpha: .3 }, 700);
cycle.repeat(Infinity).yoyo(true);
cycle.onUpdate(function() {
  focusArrow.material.opacity = this.alpha;
});
cycle.start();

var goto = function(id) {
  if (false && previous) {
    previous.hole.visible = false;
    previous.tee.visible = false;
  }

  var currentPosition = camera.position;
  var currentRotation = camera.rotation;
  var newRotation, newPosition, shot;

  if (id == "overview") {
    shot = poiMap.overview;
    //hide arrow
    focusArrow.visible = false;
  } else {
    var point = poiMap[id];
    shot = point.data.camera;
    point.hole.visible = true;
    point.tee.visible = true;
    previous = point;
    //move arrow over point
    focusArrow.position.set(point.hole.position.x, point.hole.position.y + 12, point.hole.position.z);
    focusArrow.visible = true;
  }
  var newPosition = new three.Vector3(...shot.location);
  var newRotation = new three.Vector3(...shot.rotation);

  //normalize rotation to prevent weird shifts
  ["x", "y", "z"].forEach(function(axis) {
    if (newRotation[axis] - currentRotation[axis] > Math.PI) {
      newRotation[axis] -= TAU;
    } else if (currentRotation[axis] - newRotation[axis] > Math.PI) {
      newRotation[axis] += TAU;
    }
  });
  
  if (cameraTweens.location) cameraTweens.location.stop();
  if (cameraTweens.rotation) cameraTweens.rotation.stop();

  var l = cameraTweens.location = new tweenjs.Tween(currentPosition).to(newPosition, TRAVEL_TIME);
  l.easing(tweenjs.Easing.Quartic.Out);
  l.onUpdate(function() {
    camera.position.set(this.x, this.y, this.z);
  });
  l.start();

  var r = cameraTweens.rotation = new tweenjs.Tween(currentRotation).to(newRotation, TRAVEL_TIME);
  r.easing(tweenjs.Easing.Quartic.Out);
  r.onUpdate(function() {
    camera.rotation.set(this.x, this.y, this.z);
  });
  r.start();
};

var current = 0;
var shift = function() {
  goto((current++ % 18) + 1);
  setTimeout(shift, 4000);
};