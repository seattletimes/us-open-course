var three = require("three");

var vert = `
//from three
${three.ShaderChunk.common}
${three.ShaderChunk.lights_lambert_pars_vertex}
${three.ShaderChunk.logdepthbuf_pars_vertex}
varying vec3 vLightFront;

//custom
varying vec3 v_coord;
varying vec4 v_normal;

void main() {
${three.ShaderChunk.defaultnormal_vertex}
${three.ShaderChunk.logdepthbuf_vertex}
${three.ShaderChunk.lights_lambert_vertex}
  v_coord = position;
  v_normal = vec4(normal, 1.0);
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`;

var frag = `
//choose HOMEMADE or THREE_SHADING
#define THREE_SHADING

//from Three
uniform vec3 diffuse;
varying vec3 vLightFront;
${three.ShaderChunk.common}
${three.ShaderChunk.fog_pars_fragment}
${three.ShaderChunk.specularmap_pars_fragment}
${three.ShaderChunk.logdepthbuf_pars_fragment}

//custom
uniform vec3 u_minBounds;
uniform vec3 u_maxBounds;
uniform sampler2D u_texture;
varying vec3 v_coord;
varying vec4 v_normal;

void main() {
  vec3 modelSpace = (v_coord - u_minBounds) / (u_maxBounds - u_minBounds);
  vec4 diffuseColor = vec4(diffuse, 1.0);

  vec4 texel = texture2D(u_texture, vec2(modelSpace.x, 1.0 - modelSpace.z));

  #ifdef THREE_SHADING
  //darken texture
    texel *= 0.6;
    texel.rgb = inputToLinear(texel.rgb);
  #endif

  diffuseColor *= texel;
  vec3 outgoingLight = vec3(0.0);

${three.ShaderChunk.logdepthbuf_fragment}
${three.ShaderChunk.alphamap_fragment}
${three.ShaderChunk.alphatest_fragment}
${three.ShaderChunk.specularmap_fragment}

  outgoingLight += diffuseColor.rgb * vLightFront;

${three.ShaderChunk.linear_to_gamma_fragment}
${three.ShaderChunk.fog_fragment}

  // higher peaks are lighter
  float shadow = 0.3;
  float height = modelSpace.y;
  vec3 shading = vec3(height * (1.0 - shadow * 2.0) + shadow);

  // world's worst lambert shading
  float lighting = ((v_normal.x + v_normal.y + v_normal.z) / 3.0);
  
  #ifdef HOMEMADE
    gl_FragColor = texel * vec4(shading, 1.0) + (lighting * 0.75);
  #endif
  #ifdef THREE_SHADING
    gl_FragColor = vec4(outgoingLight, 1.0);
  #endif
}`;

module.exports = {
  vertex: vert,
  fragment: frag
}