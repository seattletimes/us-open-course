var three = require("three");

var vert = `
//TERRAIN VERTEX SHADER
varying vec3 v_coord;
varying vec4 v_normal;

void main() {
  v_coord = position;
  v_normal = vec4(normal, 1.0);
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`;

var frag = `
//TERRAIN FRAGMENT SHADER
uniform vec3 u_minBounds;
uniform vec3 u_maxBounds;
uniform sampler2D u_texture;
varying vec3 v_coord;
varying vec4 v_normal;


void main() {
  vec3 modelSpace = (v_coord - u_minBounds) / (u_maxBounds - u_minBounds);
  vec4 color = texture2D(u_texture, vec2(modelSpace.x, 1.0 - modelSpace.z));

  float shadow = 0.3;
  vec3 height = modelSpace.yyy;
  vec3 shading = (height * (1.0 - shadow * 2.0) + shadow);

  float lighting = ((v_normal.x + v_normal.y + v_normal.z) / 3.0);
  vec3 outgoingLight = vec3(lighting);

  float depth = 1.0 - gl_FragCoord.z / gl_FragCoord.w / 400.0;
  
  gl_FragColor = color * vec4(shading, 1.0) + (lighting * 0.75);
}`;

module.exports = {
  vertex: vert,
  fragment: frag
}