//Use CommonJS style via browserify to load other modules
// require("./lib/social");
// require("./lib/ads");

var async = require("async");
var dot = require("dot");
var three = require("three");
var tweenjs = require("tween.js");
var util = require("./util");

dot.templateSettings.varname = "data";
dot.templateSettings.selfcontained = true;
dot.templateSettings.evaluate = /<%([\s\S]+?)%>/g;
dot.templateSettings.interpolate = /<%=([\s\S]+?)%>/g;

var holeDetail = dot.compile(require("./_holeDescription.html"));

var caddyInfo = {};
window.courseData.forEach(function(row) {
  caddyInfo[row.hole] = row;
});

var scaling = 1;
const SKY_COLOR = 0xBBCCFF;
const TAU = Math.PI * 2;
const GOTO_TIME = 2000;
const AERIAL_TIME = 3000;
const DRONE_TILT = Math.PI * .05;
const DRONE_HEIGHT = 20;
const DRONE_ASCENT = 3000;
const DRONE_MPH = 20;

window.THREE = three;
var scene = new three.Scene();
// scene.fog = new three.Fog(SKY_COLOR, 1000, 5000);

var canvas = document.querySelector(".renderer");
var renderer = new three.WebGLRenderer({
  canvas: canvas,
  alpha: false,
  antialias: true
});
renderer.setClearColor(SKY_COLOR);
var onResize = () => renderer.setSize(canvas.offsetWidth * scaling, canvas.offsetHeight * scaling, false)
window.addEventListener("resize", onResize);
onResize();

var camera = new three.PerspectiveCamera(80, 16 / 9, 0.1, 100000);
camera.position.set(-2000, 1000, -1000);
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

  var waterPosition = water.position.clone();

  var renderLoop = function() {
    counter += .05;
    water.morphTargetInfluences[0] = (Math.sin(counter) + 1) / 2;
    water.position.set(waterPosition.x, waterPosition.y + (Math.sin(counter) * 2), waterPosition.z);
    tweenjs.update();
    renderer.render(scene, camera);
    util.nextTick(renderLoop);
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
focusArrow.scale.set(20, 20, 20);
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
  l.easing(tweenjs.Easing.Sinusoidal.InOut);
  l.onUpdate(function() {
    camera.position.set(this.x, this.y, this.z);
    if (during) during();
  });
  if (done) l.onComplete(function() {
    util.nextTick(() => done());
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
    // newRotation[axis] %= TAU;
    // currentRotation[axis] %= TAU;
    if (newRotation[axis] - currentRotation[axis] < 0) newRotation[axis] += TAU;
    if (newRotation[axis] - currentRotation[axis] >= Math.PI) {
      newRotation[axis] -= TAU;
    }
  });

  var r = cameraTweens.rotation = new tweenjs.Tween(currentRotation).to(newRotation, time);
  r.easing(tweenjs.Easing.Quartic.InOut);
  r.onUpdate(function() {
    camera.rotation.set(this.x, this.y, this.z);
    if (during) during();
  });
  if (done) r.onComplete(function() {
    util.nextTick(() => done());
  });
  r.start();
}

var setTourable = function(yes) {
  document.body.classList.toggle("tourable", yes);
}

var current = null;
var goto = function(id, noHop) {

  var currentPosition = camera.position.clone();
  var currentRotation = camera.rotation.clone();
  var newRotation, newPosition, shot;
  var previous = current;

  if (id == "overview") {
    shot = poiMap.overview;
    //hide arrow
    focusArrow.visible = false;
    current = null;
    document.body.classList.remove("show-details");
  } else {
    var point = poiMap[id];
    shot = point.data.camera;
    current = point;
    //move arrow over point
    focusArrow.position.set(point.hole.position.x, point.hole.position.y + 120, point.hole.position.z);
    focusArrow.visible = true;
    document.body.classList.add("show-details");
    var info = caddyInfo[id];
    document.querySelector(".details").innerHTML = holeDetail(info);
  }
  var newPosition = new three.Vector3(...shot.location);
  var newRotation = new three.Vector3(...shot.rotation);

  setTourable(false);

  //go directly if we're very high or going in/out of overview mode
  if (id == "overview" || !previous || currentPosition.y > 400 || noHop) {
    moveCamera(currentPosition, newPosition, GOTO_TIME, setTourable.bind(null, true));
    rotateCamera(currentRotation, newRotation, GOTO_TIME);
  } else {
    var lift = currentPosition.clone();
    lift.lerp(newPosition, .5);
    lift.y = lift.y > 600 ? lift.y : lift.y + 400;
    async.series([
      (c) => {
        moveCamera(currentPosition, lift, 1000, c)
      },
      () => {
        currentRotation = camera.rotation.clone();
        moveCamera(lift, newPosition, GOTO_TIME, setTourable.bind(null, true));
        rotateCamera(currentRotation, newRotation, GOTO_TIME);
      }
    ]);
  }

};

var tour = function() {
  if (!current) return;
  var point = current;

  var currentPosition = camera.position.clone();
  var hopPosition = camera.position.clone();
  hopPosition.y += DRONE_HEIGHT;

  var newPosition = point.hole.position.clone();
  newPosition.y += 130;
  newPosition.x += 60;
  newPosition.z += 60;

  camera.position.set(hopPosition.x, hopPosition.y, hopPosition.z);
  var currentRotation = camera.rotation.clone();
  camera.lookAt(point.hole.position);
  var newRotation = camera.rotation.clone();
  //slight downward tilt
  newRotation.x -= DRONE_TILT;
  camera.rotation.set(currentPosition.x, currentPosition.y, currentPosition.z);
  camera.rotation.set(currentRotation.x, currentRotation.y, currentRotation.z);

  setTourable(false);

  async.series([
    (c) => {
      async.parallel([
        (d) => rotateCamera(currentRotation, newRotation, DRONE_ASCENT, d),
        (d) => moveCamera(currentPosition, hopPosition, DRONE_ASCENT, d)
      ], c)
    },
    (c) => {
      var fps = DRONE_MPH * 5280 / 60 / 60;
      var units = Math.sqrt(Math.pow(hopPosition.x - newPosition.x, 2) + Math.pow(hopPosition.z - newPosition.z, 2));
      var distance = util.toFeet(units);
      var travel = distance / fps * 1000;
      var hole = point.hole.position.clone();
      moveCamera(hopPosition, newPosition, travel, function() {
        camera.lookAt(hole);
        camera.rotation.x -= DRONE_TILT;
      }, c);
    },
    (c) => {
      goto(current.data.id, true);
    }
  ], function(err) {
    console.log(arguments);
  })

}

//navigation
document.body.addEventListener("click", function(e) {
  if (e.target.classList.contains("go-to")) {
    document.querySelector("nav .selected").classList.remove("selected");
    util.closest(e.target, ".hole-button").classList.add("selected");

    var id = e.target.getAttribute("data-link");
    if (current && current.data.id == id) return;
    goto(id);
  }
  if (e.target.classList.contains("tour")) {
    tour();
  }
});