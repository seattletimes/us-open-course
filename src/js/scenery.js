var three = require("three");
var treeMesh = require("./tree");

module.exports = function(scene) {
  var ambience = new three.AmbientLight(0x404040);
  scene.add(ambience);

  var sun = new three.DirectionalLight(0x888888, 4);
  sun.position.set(0, 60, 60);
  scene.add(sun);

  //create the water
  var plane = new three.PlaneGeometry(2000, 5500, 40, 60);
  var blue = new three.MeshPhongMaterial({
    // wireframe: true,
    color: 0x2233,
    specular: 0x111111,
    // shading: three.FlatShading,
    shininess: 20,
    morphTargets: true,
    transparent: true,
    opacity: .8,
    // side: three.DoubleSide
  });
  var morphs = [];
  var waveHeight = .5;
  var waveInterval = .2
  plane.vertices.forEach(function(vertex, i) {
    vertex.z = Math.sin(i * waveInterval) * waveHeight
    var morphed = vertex.clone();
    morphed.z = -Math.sin(i * waveInterval) * waveHeight;
    morphs.push(morphed);
  });
  plane.computeVertexNormals();
  plane.morphTargets.push({ name: "morph", vertices: morphs });
  var water = new three.Mesh(plane, blue);
  window.water = water;
  water.rotation.set(-Math.PI * .5, 0, 0);
  water.position.set(-1650, 8, -700);
  scene.add(water);

  //add the lone fir 
  var tree = new three.Mesh(treeMesh, new three.MeshLambertMaterial({
    color: 0x002211,
    emissive: 0x003300
  }));
  scene.add(tree);
  tree.position.set(-1250, 56, -1400);
};