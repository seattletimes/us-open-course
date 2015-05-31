var three = require("three");

var frag = `
uniform vec3 u_minBounds;
uniform vec3 u_maxBounds;
uniform sampler2D u_texture;
varying vec3 v_coord;
varying vec2 v_texpos;
varying vec4 v_normal;

void main() {
  float shadow = 0.7;
  vec3 internal = (v_coord - u_minBounds) / (u_maxBounds - u_minBounds);
  vec4 depth = vec4(internal.yyy, 1.0);
  vec4 color = texture2D(u_texture, vec2(internal.x, 1.0 - internal.z));
  float lighting = clamp(v_normal.z + v_normal.y, 1.0, 2.0) / 2.0;
  gl_FragColor = color * (depth * (1.0 - shadow) + shadow) * lighting;
}`;

var vert = `
varying vec3 v_coord;
varying vec2 v_texpos;
varying vec4 v_normal;

void main() {
  v_coord = position;
  v_normal = vec4(normal, 1.0);
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}

`;

module.exports = {
  vertex: vert,
  fragment: frag
}