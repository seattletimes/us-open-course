var three = require("three");

var camera = new three.PerspectiveCamera(60, 16 / 9, 0.1, 8000);
camera.position.set(-2000, 1000, -1000);
camera.rotation.set(0, 0, 0);
camera.rotation.order = "YXZ";
window.camera = camera;

module.exports = camera;