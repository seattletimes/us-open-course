var async = require("async");
var dot = require("./dot");
var three = require("three");
var tweenjs = require("tween.js");
var util = require("./util");

const AERIAL_TIME = 3000;
const DRONE_TILT = Math.PI * .05;
const DRONE_HEIGHT = 20;
const DRONE_ASCENT = 3000;
const DRONE_MPH = 20;
const GOTO_TIME = 4000;
const START_POSITION = "overview";

var holeDetail = dot.compile(require("./_holeDescription.html"));
var holePhotos = dot.compile(require("./_holePhotos.html"));

var caddyInfo = {};
window.courseData.forEach(function(row) {
  caddyInfo[row.hole] = row;
});

window.THREE = three;
var renderer = require("./renderer");
var scene = require("./scene");
var camera = require("./camera");

var makeScenery = require("./scenery");
makeScenery(scene);

var makeMarkers = require("./markers");
var poiMap = makeMarkers(scene);

var arrow = require("./arrow");
var focusArrow = new three.Mesh(arrow, new three.MeshBasicMaterial({
  // wireframe: true,
  color: 0xFFCC33,
  transparent: true
}));
scene.add(focusArrow);
focusArrow.scale.set(8, 8, 8);
focusArrow.visible = false;
var cycle = new tweenjs.Tween({ alpha: .8 }).to({ alpha: .3 }, 700);
cycle.repeat(Infinity).yoyo(true);
cycle.onUpdate(function() {
  focusArrow.material.opacity = this.alpha;
});
// cycle.start();

var director = require("./director");

var setTourable = function(yes) {
  document.body.classList.toggle("tourable", yes);
}

var setTouring = function(yes) {
  document.body.classList.toggle("touring", yes);
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
    focusArrow.position.set(point.hole.position.x, point.hole.position.y + util.inFeet(30), point.hole.position.z);
    focusArrow.visible = true;
    document.body.classList.add("show-details");
    var info = caddyInfo[id];
    document.querySelector(".details").innerHTML = holeDetail(info);
    document.querySelector(".photos").innerHTML = holePhotos(info);
  }
  var newPosition = new three.Vector3(...shot.location);
  var newRotation = new three.Vector3(...shot.rotation);

  setTourable(false);
  setTouring(false);

  //go directly if we're very high or going in/out of overview mode
  if (id == "overview" || !previous || currentPosition.y > 400 || noHop) {
    director.moveCamera(currentPosition, newPosition, setTourable.bind(null, true));
    director.rotateCamera(currentRotation, newRotation);
  } else {
    var lift = currentPosition.clone();
    lift.lerp(newPosition, .5);
    lift.y = lift.y > 600 ? lift.y : lift.y + 400;
    async.series([
      (c) => {
        director.moveCamera(currentPosition, lift, 1000, c)
      },
      () => {
        currentRotation = camera.rotation.clone();
        director.moveCamera(lift, newPosition, setTourable.bind(null, true));
        director.rotateCamera(currentRotation, newRotation);
      }
    ]);
  }

};

var tour = function() {
  if (!current) return;
  var point = current;
  focusArrow.visible = false;

  var currentPosition = camera.position.clone();
  var hopPosition = camera.position.clone();
  hopPosition.y += DRONE_HEIGHT;

  var newPosition = point.hole.position.clone();
  newPosition.y += 130;
  newPosition.x += 60;
  newPosition.z += 60;

  var currentRotation = camera.rotation.clone();
  camera.position.set(hopPosition.x, hopPosition.y, hopPosition.z);
  camera.lookAt(point.hole.position);
  var newRotation = camera.rotation.clone();
  //slight downward tilt
  newRotation.x -= DRONE_TILT;
  camera.position.set(currentPosition.x, currentPosition.y, currentPosition.z);
  camera.rotation.set(currentRotation.x, currentRotation.y, currentRotation.z);

  setTourable(false);
  setTouring(true);

  async.series([
    (c) => {
      async.parallel([
        (d) => director.rotateCamera(currentRotation, newRotation, DRONE_ASCENT, d),
        (d) => director.moveCamera(currentPosition, hopPosition, DRONE_ASCENT, d)
      ], c)
    },
    (c) => {
      var fps = DRONE_MPH * 5280 / 60 / 60;
      var units = Math.sqrt(Math.pow(hopPosition.x - newPosition.x, 2) + Math.pow(hopPosition.z - newPosition.z, 2));
      var distance = util.toFeet(units);
      var travel = distance / fps * 1000;
      var hole = point.hole.position.clone();
      var tiltShift = function() {
        camera.lookAt(hole);
        camera.rotation.x -= DRONE_TILT;
      };
      if (point.data.camera.tour) {
        var ups = util.inFeet(fps);
        director.followPath(point.data.camera.tour, ups, tiltShift, c);
      } else {
        director.moveCamera(hopPosition, newPosition, travel, tiltShift, c);
      }
    },
    (c) => {
      // setTouring(false); // already done by goto
      goto(current.data.id, true);
    }
  ], function(err) {
    if (err) console.log(err);
  })

}

//navigation
document.body.addEventListener("click", function(e) {
  if (e.target.classList.contains("go-to")) {
    document.querySelector("nav .selected").classList.remove("selected");
    e.target.classList.add("selected");

    var id = e.target.getAttribute("data-link");
    // if (current && current.data.id == id) return;
    goto(id);
  }
  if (util.closest(e.target, ".tour")) {
    tour();
  }
});

//export a function that starts the engine
module.exports = function() {
  //load data, then set up rendering
  document.body.classList.add("loading");
  var init = require("./init");
  init(scene, function(terrain) {

    window.terrain = terrain;

    var counter = 0;

    var waterPosition = water.position.clone();

    var tide = new tweenjs.Tween({ wave: 0 }).to({ wave: 1 }, 2000);
    tide.easing(tweenjs.Easing.Sinusoidal.InOut);
    tide.onUpdate(function() {
      water.morphTargetInfluences[0] = this.wave;
      water.position.set(waterPosition.x, waterPosition.y + this.wave, waterPosition.z);
    });
    tide.repeat(Infinity).yoyo(true);
    tide.start();

    var renderLoop = function() {
      counter += .05;
      tweenjs.update();
      renderer.render(scene, camera);
      util.nextTick(renderLoop);
    };

    document.body.classList.remove("loading");
    document.body.classList.add("running");
    renderLoop();
    goto(START_POSITION);
  });

  return true;
};