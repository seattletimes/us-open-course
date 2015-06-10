var three = require("three");

var height = 10;

var cylinder = new three.CylinderGeometry(.1, .1, height, 9, 9);
var trunk = new three.Mesh(cylinder);
trunk.position.set(0, height / 2, 0);
trunk.updateMatrix();

var sphere = new three.SphereGeometry(20, 8, 8);
var boughs = new three.Mesh(sphere);
boughs.scale.set(.2, 1, .2);
boughs.position.set(0, height, 0);
boughs.updateMatrix();

var combined = new three.Geometry();
combined.merge(trunk.geometry, trunk.matrix);
combined.merge(boughs.geometry, boughs.matrix);

module.exports = combined;