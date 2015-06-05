//Use CommonJS style via browserify to load other modules
// require("./lib/social");
// require("./lib/ads");

var async = require("async");
var three = require("three");
var tweenjs = require("tween.js");
var scale = require("./scales");

var scaling = 1;
const SKY_COLOR = 0xBBCCFF;
const TAU = Math.PI * 2;
const GOTO_TIME = 2000;
const AERIAL_TIME = 3000;
const DRONE_TILT = Math.PI * .05;
const DRONE_HEIGHT = 20;
const DRONE_ASCENT = 3000;
const DRONE_MPH = 20;

var deg = (d) => d / 360 * TAU;

var nextTick = window.requestAnimationFrame ? 
  window.requestAnimationFrame.bind(window) :
  function(f) { setTimeout(f, 10) };

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
    nextTick(renderLoop);
  };
  
  // var elevations = []
  
  // Object.keys(poiMap).forEach(function(id) {
  //   console.log(id);
  //   if (id == "overview") return;
  //   var point = poiMap[id];
  //   var elevation = {};
    
  //   var raycaster = new three.Raycaster();
  //   var above = point.data.hole.clone();
  //   above.y = 1000;
  //   raycaster.set(above, new three.Vector3(0, -1, 0));
  //   var i = raycaster.intersectObject(terrain);
  //   if (i[0]) {
  //     elevation.hole = i[0].point.y;
  //   }
    
  //   above = point.data.tee.clone();
  //   above.y = 1000;
  //   raycaster.set(above, new three.Vector3(0, -1, 0));
  //   var i = raycaster.intersectObject(terrain);
  //   if (i[0]) {
  //     elevation.tee = i[0].point.y;
  //   }
    
  //   elevations.push(elevation);
  // })
  
  // console.table(elevations);

  document.body.classList.remove("loading");
  renderLoop();
  goto("overview");
  
  // var focus = poiMap[18].data.tee;
  // camera.position.set(focus.x, focus.y + 600, focus.z + 10);
  // camera.lookAt(focus);
  
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
  l.easing(tweenjs.Easing.Quadratic.InOut);
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
    newRotation[axis] %= TAU;
    currentRotation[axis] %= TAU;
    // if (currentRotation[axis] > Math.PI) currentRotation[axis] -= TAU;
    // if (newRotation[axis] > Math.PI) newRotation[axis] -= TAU;
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
    nextTick(() => done());
  });
  r.start();
}

var current = null;
var goto = function(id) {

  var currentPosition = camera.position.clone();
  var currentRotation = camera.rotation.clone();
  var newRotation, newPosition, shot;
  var previous = current;

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
    focusArrow.position.set(point.hole.position.x, point.hole.position.y + 120, point.hole.position.z);
    focusArrow.visible = true;
  }
  var newPosition = new three.Vector3(...shot.location);
  var newRotation = new three.Vector3(...shot.rotation);

  if (id == "overview" || !previous) {
    moveCamera(currentPosition, newPosition, GOTO_TIME);
    rotateCamera(currentRotation, newRotation, GOTO_TIME);
  } else {
    var lift = currentPosition.clone();
    lift.y += 50;
    async.series([
      (c) => {
        moveCamera(currentPosition, lift, 1000, c)
      },
      () => {
        moveCamera(lift, newPosition, GOTO_TIME);
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
      var distance = scale.toFeet(units);
      var travel = distance / fps * 1000;
      var hole = point.hole.position.clone();
      moveCamera(hopPosition, newPosition, travel, function() {
        camera.lookAt(hole);
        camera.rotation.x -= DRONE_TILT;
      }, c);
    },
    // (c) => {
    //   var midpoint = new three.Vector3(
    //     (point.hole.position.x + point.tee.position.x) / 2,
    //     (point.hole.position.y + point.tee.position.y) / 2,
    //     (point.hole.position.z + point.tee.position.z) / 2
    //   );

    //   var lifted = midpoint.clone();
    //   lifted.x -= 700;
    //   lifted.y += 700;
    //   lifted.z += 700;

    //   var currentPosition = camera.position.clone();
    //   camera.position.set(lifted.x, lifted.y, lifted.z);
    //   var currentRotation = camera.rotation.clone();
    //   camera.lookAt(midpoint);
    //   var newRotation = camera.rotation.clone();
    //   camera.rotation.set(currentRotation.x, currentRotation.y, currentRotation.z);
    //   camera.position.set(currentPosition.x, currentPosition.y, currentPosition.z);

    //   async.parallel([
    //     (d) => moveCamera(currentPosition, lifted, AERIAL_TIME, d),
    //     (d) => rotateCamera(currentRotation, newRotation, AERIAL_TIME, d)
    //   ], c);
    // },
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