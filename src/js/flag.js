var three = require("three/three.min");

var height = 10;

var cylinder = new three.CylinderGeometry(.1, .1, height, 9, 9);
var pole = new three.Mesh(cylinder);
pole.position.set(0, height / 2, 0);
pole.updateMatrix();

var cone = new three.CylinderGeometry(4, 1, 2, 4, 4);
var sock = new three.Mesh(cone);

sock.scale.set(.25, 1, .05);
sock.position.set(1, height - 1, 0);
sock.rotation.set(0, 0, Math.PI * .5);
sock.updateMatrix();

var combined = new three.Geometry();
combined.merge(pole.geometry, pole.matrix);
combined.merge(sock.geometry, sock.matrix);

module.exports = combined;