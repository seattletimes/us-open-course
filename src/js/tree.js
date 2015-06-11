var three = require("three");
var util = require("./util");

var height = util.inFeet(40);

var cylinder = new three.CylinderGeometry(height * .03, height * .03, height, 9, 9);
var trunk = new three.Mesh(cylinder);
trunk.position.set(0, height / 2, 0);
trunk.updateMatrix();

// var sphere = new three.CylinderGeometry(.5, 3, 15, 6, 4);
var sphere = new three.SphereGeometry(height * .3, 4, 4);
var boughs = new three.Mesh(sphere);
boughs.scale.set(1, 2, 1);
boughs.position.set(0, height, 0);
boughs.updateMatrix();

var combined = new three.Geometry();
combined.merge(trunk.geometry, trunk.matrix);
combined.merge(boughs.geometry, boughs.matrix);

module.exports = combined;