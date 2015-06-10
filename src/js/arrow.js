var three = require("three");

var point = new three.CylinderGeometry(3, 0, 3, 0, 20);
var tip = new three.Mesh(point);
tip.position.set(0, 1.5, 0);
tip.updateMatrix();

var line = new three.CylinderGeometry(1, 1, 4, 8, 8);
var mesh = new three.Mesh(line);
mesh.position.set(0, 4.5, 0);
mesh.updateMatrix();

var combined = new three.Geometry();
combined.merge(tip.geometry, tip.matrix);
combined.merge(mesh.geometry, mesh.matrix);

module.exports = combined;