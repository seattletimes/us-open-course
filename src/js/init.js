var three = require("three");
var async = require("async");

var isApple = require("./isApple");

module.exports = function(scene, ready) {

  async.parallel({
    texture: function(c) {
      three.ImageUtils.loadTexture(isApple() ? "./assets/dwg-mobile.jpg" : "./assets/dwg.jpg", null, function(tex) {
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

    loaded.texture.minFilter = loaded.texture.magFilter = three.LinearFilter;

    var shaders = require("./shader");
    var shader = new three.ShaderMaterial({
      uniforms: three.UniformsUtils.merge([
        three.UniformsLib.common,
        three.UniformsLib.fog,
        three.UniformsLib.lights,
        three.UniformsLib.shadowmap,
        //phong
        {
          emissive: { type: "c", value: new three.Color(0x0) },
          specular : { type: "c", value: new three.Color( 0x111111 ) },
          shininess: { type: "f", value: 5 },
          wrapRGB  : { type: "v3", value: new three.Vector3( 0.5, 0.5, 0.5 ) }
        },
        //texture projection
        {
          u_minBounds: { type: "v3", value: new three.Vector3(bounds.min.x, bounds.min.y, bounds.min.z) },
          u_maxBounds: { type: "v3", value: new three.Vector3(bounds.max.x, bounds.max.y, bounds.max.z) }
        },
      ]),
      fragmentShader: shaders.fragment,
      vertexShader: shaders.vertex,
      // fog: true,
      lights: true,
      shading: three.SmoothShading
    });
    //three's merge clobbers our texture for some reason, add it manually
    shader.uniforms.u_texture = { type: "t", value: loaded.texture };
    mesh.material = shader;
    
    if (ready) ready(mesh);
  });
}