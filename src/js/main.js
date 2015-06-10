//Use CommonJS style via browserify to load other modules
require("./lib/social");
require("./lib/ads");

var dot = require("./dot");
var util = require("./util");

// load the 3D code
require("./3D");

//handle fullscreen toggle
var fullscreen = false;
var requestFullscreen = "webkitRequestFullscreen" in document.body ? "webkitRequestFullscreen" :
  "msRequestFullscreen" in document.body ? "msRequestFullscreen" :
  "mozRequestFullScreen" in document.body ? "mozRequestFullScreen" : 
  "requestFullscreen";
var exitFullscreen = "webkitExitFullscreen" in document ? "webkitExitFullscreen" :
  "msExitFullscreen" in document ? "msExitFullscreen" :
  "mozCancelFullScreen" in document ? "mozCancelFullScreen" :
  "exitFullscreen";
document.querySelector(".toggle-fullscreen").addEventListener("click", function() {
  if (fullscreen) {
    document[exitFullscreen]();
  } else {
    document.querySelector(".three-d")[requestFullscreen]();
  }
  fullscreen = !fullscreen;
  document.body.classList.toggle("fullscreened", fullscreen);
});

//media click listener
var overlay = document.querySelector(".overlay");
var modal = document.querySelector(".modal");
var videoTemplate = dot.compile(require("./_videoEmbed.html"));
document.body.addEventListener("click", function(e) {
  
  //videos
  var target = util.closest(e.target, "[data-brightcove]");
  if (target) {
    overlay.classList.add("show");
    modal.innerHTML = videoTemplate({ id: target.getAttribute("data-brightcove") });
    return;
  }
  
  //lightboxes
  target = util.closest(e.target, ".lightbox");
  if (target) {
    e.preventDefault();
    overlay.classList.add("show");
    modal.innerHTML = `<img class="lightboxed" src="${target.href}">`;
    return;
  }

  //close overlay
  if (e.target.classList.contains("overlay") || e.target.classList.contains("close-overlay")) {
    overlay.classList.remove("show");
    modal.innerHTML = "";
  }
});