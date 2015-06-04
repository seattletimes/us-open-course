var three = require("three");
var async = require("async");

module.exports = function(scene, ready) {

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
    // mesh.scale.set(0.1, 0.1, 0.1);
    mesh.position.set(0, 0, 0);
    mesh.geometry = new three.BufferGeometry().fromGeometry(mesh.geometry);
    mesh.geometry.computeBoundingBox();
    // mesh.geometry.computeVertexNormals();
    var bounds = mesh.geometry.boundingBox;
    window.ground = mesh;
    scene.add(mesh);

    loaded.texture.minFilter = three.LinearFilter;

    var shaders = require("./shader");
    var shader = new three.ShaderMaterial({
      uniforms: three.UniformsUtils.merge([
        three.UniformsLib.common,
        three.UniformsLib.fog,
        three.UniformsLib.lights,
        three.UniformsLib.shadowmap,
        {
          u_minBounds: { type: "v3", value: new three.Vector3(bounds.min.x, bounds.min.y, bounds.min.z) },
          u_maxBounds: { type: "v3", value: new three.Vector3(bounds.max.x, bounds.max.y, bounds.max.z) }
        },
      ]),
      fragmentShader: shaders.fragment,
      vertexShader: shaders.vertex,
      fog: true,
      lights: true
    });
    //three's merge clobbers our texture for some reason, add it manually
    shader.uniforms.u_texture = { type: "t", value: loaded.texture };
    mesh.material = shader;
    
    if (ready) ready(mesh);
  });
}