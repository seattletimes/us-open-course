var three = require("three");
var poiList = require("./poi");

var materials = {
  white: 0x888888,
  red: 0x772110,
  gold: 0xAA8800,
  green: 0x446622
};

for (var key in materials) {
  materials[key] = new three.MeshLambertMaterial({
    color: materials[key],
    emissive: 0x222222,
    shading: three.SmoothShading,
    fog: true
  });
}

module.exports = function(scene) {
  //set up remains of the scene
  var sphere = new three.SphereGeometry(1, 16, 16);
  var flag = require("./flag");

  var poiMap = {
    overview: poiList.overview
  };

  poiList.course.forEach(function(point) {
    point.hole = new three.Vector3(...point.hole);
    point.tee = new three.Vector3(...point.tee);

    var ball = new three.Mesh(sphere, materials.white);
    ball.position.set(point.tee.x, point.tee.y, point.tee.z);
    scene.add(ball);

    var hole = new three.Mesh(flag, materials.red);
    hole.position.set(point.hole.x, point.hole.y + .25, point.hole.z);
    hole.rotation.set(0, Math.PI * Math.random(), 0);
    scene.add(hole);

    // ball.visible = false;
    // tee.visible = false;

    poiMap[point.id] = {
      hole: hole,
      data: point,
      tee: ball
    };
  });

  return poiMap;
}