var three = require("three");

module.exports = function(scene) {
  var ambience = new three.AmbientLight(0x404040);
  scene.add(ambience);

  var sun = new three.DirectionalLight(0x888888, 4);
  sun.position.set(0, 60, 60);
  scene.add(sun);

  //create the water
  var plane = new three.PlaneGeometry(200, 550, 80, 120);
  var blue = new three.MeshPhongMaterial({
    // wireframe: true,
    color: 0x2233,
    specular: 0x111111,
    shading: three.FlatShading,
    shininess: 20,
    morphTargets: true,
    transparent: true,
    opacity: .9
  });
  var morphs = [];
  var waveHeight = .6;
  var waveInterval = .5
  plane.vertices.forEach(function(vertex, i) {
    vertex.z = Math.sin(i * waveInterval) * waveHeight
    var morphed = vertex.clone();
    morphed.z = Math.cos(i * waveInterval) * waveHeight;
    morphs.push(morphed);
  });
  plane.computeVertexNormals();
  plane.morphTargets.push({ name: "morph", vertices: morphs });
  var water = new three.Mesh(plane, blue);
  window.water = water;
  water.rotation.set(-Math.PI * .5, 0, 0);
  water.position.set(-165, 1.2, -70);
  var waves = new three.MorphAnimation(water);
  waves.play();
  scene.add(water);
};