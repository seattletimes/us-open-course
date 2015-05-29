var frag = `
uniform vec3 u_minBounds;
uniform vec3 u_maxBounds;
uniform sampler2D u_texture;
varying vec3 v_coord;
varying vec2 v_texpos;

void main() {
  float shadow = 0.4;
  vec3 normalized = (v_coord - u_minBounds) / (u_maxBounds - u_minBounds);
  vec4 depth = vec4(normalized.yyy, 1.0);
  vec4 color = texture2D(u_texture, vec2(normalized.x, 1.0 - normalized.z));
  // float avg = (color.r + color.g + color.b) / 3.0;
  // float blend = avg * (1.0 - normalized.y);
  // vec4 final = (color * vec4(normalized.yyy, 1.0)) + vec4(blend, blend, blend, 0.0);
  gl_FragColor = color * (depth * (1.0 - shadow) + shadow);
}`;

var vert = `
varying vec3 v_coord;
varying vec2 v_texpos;

void main() {
  v_coord = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}

`;

module.exports = {
  vertex: vert,
  fragment: frag
}