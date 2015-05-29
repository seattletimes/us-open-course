//Use CommonJS style via browserify to load other modules
// require("./lib/social");
// require("./lib/ads");

require("component-responsive-frame/child");

var nextTick = window.requestAnimationFrame ? 
  window.requestAnimationFrame.bind(window) :
  function(f) { setTimeout(f, 10) };

var three = require("three");
window.THREE = three;
// require("./ColladaLoader.js");

var scene = new three.Scene();
var camera = new three.PerspectiveCamera(10, 16 / 9, 0.1, 1000);

camera.position.y = 100;
camera.position.x = 0;
camera.position.z = -100;

var scaleDown = .8;
var renderer = new three.WebGLRenderer();
document.querySelector(".render-container").appendChild(renderer.domElement);
renderer.setSize(renderer.domElement.offsetWidth * scaleDown, renderer.domElement.offsetHeight * scaleDown);
renderer.domElement.setAttribute("style", "");
renderer.setClearColor(0xEEEEFF);

var loader = new three.ObjectLoader();
loader.load("./assets/model.json", function(object) {
  object.scale.set(0.1, 0.1, 0.1);
  object.position.set(0, -20, 0);
  object.geometry = new three.BufferGeometry().fromGeometry(object.geometry);
  object.geometry.computeBoundingBox();
  var bounds = object.geometry.boundingBox;
  window.obj = object;
  scene.add(object);

  var shaders = require("./shader");
  var texture = three.ImageUtils.loadTexture("assets/dwg.jpg");
  texture.anisotropy = renderer.getMaxAnisotropy();
  texture.minFilter = three.NearestFilter;
  var shader = new three.ShaderMaterial({
    uniforms: {
      u_texture: { type: "t", value: texture },
      u_minBounds: { type: "v3", value: new three.Vector3(bounds.min.x, bounds.min.y, bounds.min.z) },
      u_maxBounds: { type: "v3", value: new three.Vector3(bounds.max.x, bounds.max.y, bounds.max.z) }
    },
    fragmentShader: shaders.fragment,
    vertexShader: shaders.vertex
  });
  object.material = shader;

});

var sphere = new three.SphereGeometry(1, 16, 16);
var white = new three.MeshPhongMaterial({ color: 0x888888 });
white.shading = three.FlatShading;
var red = new three.MeshPhongMaterial({ color: 0x883333 });
red.shading = three.FlatShading;
var spike = new three.TetrahedronGeometry(1, 0);

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
    data: point
  };
});

var counter = 0;
var renderLoop = function() {
  renderer.render(scene, camera);
  counter += 0.05
  camera.position.x = Math.sin(counter) * 400;
  camera.position.z = Math.cos(counter) * 400;
  camera.lookAt(poiMap[5].ball.getWorldPosition());
  nextTick(renderLoop);
  // setTimeout(renderLoop, 1000);
};

window.camera = camera;

renderLoop();