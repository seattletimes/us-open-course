var three = require("three/three.min");

var vert = `
//from three
${three.ShaderChunk.common}
${three.ShaderChunk.lights_phong_pars_vertex}
${three.ShaderChunk.lights_lambert_pars_vertex}
${three.ShaderChunk.logdepthbuf_pars_vertex}
varying vec3 vLightFront;
varying vec3 vViewPosition;
varying vec3 vNormal;

//custom
varying vec3 v_coord;
varying vec4 v_normal;

void main() {
${three.ShaderChunk.defaultnormal_vertex}
${three.ShaderChunk.default_vertex}
${three.ShaderChunk.logdepthbuf_vertex}
${three.ShaderChunk.worldpos_vertex}
${three.ShaderChunk.lights_phong_vertex}
${three.ShaderChunk.lights_lambert_vertex}
  v_coord = position;
  v_normal = vec4(normal, 1.0);

  //Three's Phong shading
  #ifndef FLAT_SHADED
  vNormal = normalize(transformedNormal);
  #endif
  vViewPosition = -mvPosition.xyz;

  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`;

var frag = `
#define PHONG
// #define LAMBERT

//from Three
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform vec3 diffuse;
varying vec3 vLightFront;
${three.ShaderChunk.common}
${three.ShaderChunk.fog_pars_fragment}
${three.ShaderChunk.lights_phong_pars_fragment}
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

  vec2 texCoord = vec2(modelSpace.x, 1.0 - modelSpace.z);
  //dither
  texCoord += vec2(cos(v_coord.x * 10.0) * 0.0001, sin(v_coord.z * 10.0) * 0.0001);

  vec4 texel = texture2D(u_texture, texCoord);

  //darken texture
  texel *= 0.6;
  texel.rgb = inputToLinear(texel.rgb);

  diffuseColor *= texel;
  vec3 outgoingLight = vec3(0.0);

${three.ShaderChunk.logdepthbuf_fragment}
${three.ShaderChunk.specularmap_fragment}

#ifdef PHONG
${three.ShaderChunk.lights_phong_fragment}
#else
  outgoingLight += diffuseColor.rgb * vLightFront;
#endif

${three.ShaderChunk.linear_to_gamma_fragment}
${three.ShaderChunk.fog_fragment}
  
  gl_FragColor = vec4(outgoingLight, 1.0);
}`;

module.exports = {
  vertex: vert,
  fragment: frag
}