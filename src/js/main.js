//Use CommonJS style via browserify to load other modules
require("./lib/social");
require("./lib/ads");

// load the 3D code
require("./scene");

var fullscreen = false;
var requestFullscreen = "webkitRequestFullscreen" in document.body ? "webkitRequestFullscreen" :
  "msRequestFullscreen" in document.body ? "msRequestFullscreen" :
  "mozRequestFullScreen" in document.body ? "mozRequestFullScreen" : 
  "requestFullscreen";
var exitFullscreen = "webkitExitFullscreen" in document ? "webkitExitFullscreen" :
  "msExitFullscreen" in document ? "msExitFullscreen" :
  "mozCancelFullScreen" in document ? "mozCancelFullScreen" :
  "exitFullscreen";
console.log(exitFullscreen);
document.querySelector(".toggle-fullscreen").addEventListener("click", function() {
  if (fullscreen) {
    document[exitFullscreen]();
  } else {
    document.querySelector(".three-d")[requestFullscreen]();
  }
  fullscreen = !fullscreen;
  document.body.classList.toggle("fullscreened", fullscreen);
});