//Use CommonJS style via browserify to load other modules
// require("./lib/social");
// require("./lib/ads");

require("component-responsive-frame/child");

var nextTick = window.requestAnimationFrame ? 
  window.requestAnimationFrame.bind(window) :
  function(f) { setTimeout(f, 10) };

var three = require("three");
window.THREE = three;
var scene = new three.Scene();

var scaleDown = .8;
var renderer = new three.WebGLRenderer();
document.querySelector(".render-container").appendChild(renderer.domElement);
renderer.setSize(renderer.domElement.offsetWidth * scaleDown, renderer.domElement.offsetHeight * scaleDown);
renderer.domElement.setAttribute("style", "");
renderer.setClearColor(0xEEEEFF);

var sphere = new three.SphereGeometry(1, 16, 16);
var white = new three.MeshPhongMaterial({ color: 0x888888 });
white.shading = three.FlatShading;
var red = new three.MeshPhongMaterial({ color: 0x883333 });
red.shading = three.FlatShading;
var spike = new three.CylinderGeometry(1, 0, 3, 4, 4);
var gold = new three.MeshPhongMaterial({ color: 0xAA8800 });

var ambience = new three.AmbientLight(0xFFFFFF);
scene.add(ambience);

var sun = new three.DirectionalLight(0x888888, 2);
sun.position.set(0, 4, 2);
// var sun = new three.HemisphereLight(0xFFFFFF, 0x003355, .6);
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

var focus = new three.Mesh(sphere, red);
// focus.visible = false;
scene.add(focus);

require("./targetCam");
var camera = new three.TargetCamera(70, 16 / 9, 0.1, 1000);

camera.addTarget({
  name: "focus",
  targetObject: focus,
  fixed: false,
  matchRotation: false,
  cameraPosition: new three.Vector3(0, 20, 80),
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
  tween = new tweenjs.Tween(current).to(midpoint, 1000)
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

var async = require("async");

async.parallel({
  texture: function(c) {
    three.ImageUtils.loadTexture("./assets/dwg.jpg", null, function(tex) {
      c(null, tex);
    });
  },
  mesh: function(c) {
    var loader = new three.ObjectLoader();
    loader.load("./assets/model.json", function(mesh) {
      c(null, mesh);
    });
  }
}, function(err, loaded) {
  var mesh = loaded.mesh;
  mesh.scale.set(0.1, 0.1, 0.1);
  mesh.position.set(0, -20, 0);
  mesh.geometry = new three.BufferGeometry().fromGeometry(mesh.geometry);
  mesh.geometry.computeBoundingBox();
  var bounds = mesh.geometry.boundingBox;
  window.ground = mesh;
  scene.add(mesh);

  var shaders = require("./shader");
  var shader = new three.ShaderMaterial({
    uniforms: {
      u_texture: { type: "t", value: loaded.texture },
      u_minBounds: { type: "v3", value: new three.Vector3(bounds.min.x, bounds.min.y, bounds.min.z) },
      u_maxBounds: { type: "v3", value: new three.Vector3(bounds.max.x, bounds.max.y, bounds.max.z) }
    },
    fragmentShader: shaders.fragment,
    vertexShader: shaders.vertex
  });
  mesh.material = shader;
  
  //start the loop
  renderLoop();
  shift();
});

window.camera = camera;