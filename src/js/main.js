//Use CommonJS style via browserify to load other modules
// require("./lib/social");
// require("./lib/ads");

var async = require("async");
var three = require("three");
var tweenjs = require("tween.js");

const SKY_COLOR = 0xBBBBEE;
const TAU = Math.PI * 2;
const TRAVEL_TIME = 2000;
const DRONE_TIME = 6000;
const AERIAL_TIME = 4000;

var deg = (d) => d / 360 * TAU;

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
camera.rotation.set(0, 0, 0);
camera.rotation.order = "YXZ";
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

var cameraTweens = {
  location: null,
  rotation: null
};

var moveCamera = function(currentPosition, newPosition, time, during, done) {
  if (cameraTweens.location) cameraTweens.location.stop();

  if (typeof done == "undefined") {
    done = during;
    during = null;
  }

  var l = cameraTweens.location = new tweenjs.Tween(currentPosition).to(newPosition, time);
  l.easing(tweenjs.Easing.Quartic.InOut);
  l.onUpdate(function() {
    camera.position.set(this.x, this.y, this.z);
    if (during) during();
  });
  if (done) l.onComplete(function() {
    nextTick(() => done());
  });
  l.start();
};

var rotateCamera = function(currentRotation, newRotation, time, during, done) {
  if (cameraTweens.rotation) cameraTweens.rotation.stop();
  if (typeof done == "undefined") {
    done = during;
    during = null;
  }

  //normalize rotation to prevent weird shifts
  ["x", "y", "z"].forEach(function(axis) {
    // if (currentRotation[axis] > Math.PI) currentRotation[axis] -= TAU;
    // if (newRotation[axis] > Math.PI) newRotation[axis] -= TAU;
    if (newRotation[axis] - currentRotation[axis] >= Math.PI) {
      newRotation[axis] -= TAU;
    }
  });

  var r = cameraTweens.rotation = new tweenjs.Tween(currentRotation).to(newRotation, time);
  r.easing(tweenjs.Easing.Cubic.InOut);
  r.onUpdate(function() {
    camera.rotation.set(this.x, this.y, this.z);
    if (during) during();
  });
  if (done) r.onComplete(function() {
    nextTick(() => done());
  });
  r.start();
}

var current = null;
var goto = function(id) {

  var currentPosition = camera.position.clone();
  var currentRotation = camera.rotation.clone();
  var newRotation, newPosition, shot;

  if (id == "overview") {
    shot = poiMap.overview;
    //hide arrow
    focusArrow.visible = false;
    current = null;
  } else {
    var point = poiMap[id];
    shot = point.data.camera;
    current = point;
    //move arrow over point
    focusArrow.position.set(point.hole.position.x, point.hole.position.y + 12, point.hole.position.z);
    focusArrow.visible = true;
  }
  var newPosition = new three.Vector3(...shot.location);
  var newRotation = new three.Vector3(...shot.rotation);

  moveCamera(currentPosition, newPosition, TRAVEL_TIME);
  rotateCamera(currentRotation, newRotation, TRAVEL_TIME);

};

var tour = function() {
  if (!current) return;
  var point = current;

  var currentPosition = camera.position.clone();
  var newPosition = point.hole.position.clone();
  newPosition.y += 20;
  newPosition.x += 10;
  newPosition.z += 10;

  var currentRotation = camera.rotation.clone();
  camera.lookAt(point.hole.position);
  var newRotation = camera.rotation.clone();
  camera.rotation.set(currentRotation.x, currentRotation.y, currentRotation.z);

  async.series([
    (c) => {
      rotateCamera(currentRotation, newRotation, 500, c);
    },
    (c) => {
      moveCamera(currentPosition, newPosition, DRONE_TIME, () => camera.lookAt(point.hole.position), c);
    },
    (c) => {
      var midpoint = new three.Vector3(
        (point.hole.position.x + point.tee.position.x) / 2,
        (point.hole.position.y + point.tee.position.y) / 2,
        (point.hole.position.z + point.tee.position.z) / 2
      );

      var lifted = midpoint.clone();
      lifted.x -= 70;
      lifted.y += 70;
      lifted.z += 70;

      var currentPosition = camera.position.clone();
      camera.position.set(lifted.x, lifted.y, lifted.z);
      var currentRotation = camera.rotation.clone();
      camera.lookAt(midpoint);
      var newRotation = camera.rotation.clone();
      camera.rotation.set(currentRotation.x, currentRotation.y, currentRotation.z);
      camera.position.set(currentPosition.x, currentPosition.y, currentPosition.z);

      async.parallel([
        (d) => moveCamera(currentPosition, lifted, AERIAL_TIME, d),
        (d) => rotateCamera(currentRotation, newRotation, AERIAL_TIME, d)
      ], c);
    },
    (c) => {
      goto(current.data.id);
    }
  ], function(err) {
    console.log(arguments);
  })

}

//navigation
document.body.addEventListener("click", function(e) {
  if (e.target.classList.contains("go-to")) {
    document.querySelector("nav .selected").classList.remove("selected");
    e.target.classList.add("selected");

    var id = e.target.getAttribute("data-link");
    goto(id);
  }
  if (e.target.classList.contains("tour")) {
    tour();
  }
});