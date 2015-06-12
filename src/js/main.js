//Use CommonJS style via browserify to load other modules
require("./lib/social");
require("./lib/ads");

var dot = require("./dot");
var util = require("./util");

//handle fullscreen toggle
var fullscreen = false;
var requestFullscreen = "webkitRequestFullscreen" in document.body ? "webkitRequestFullscreen" :
  "msRequestFullscreen" in document.body ? "msRequestFullscreen" :
  "mozRequestFullScreen" in document.body ? "mozRequestFullScreen" : 
  "requestFullscreen" in document.body ? "requestFullscreen" :
  false;
var exitFullscreen = "webkitExitFullscreen" in document ? "webkitExitFullscreen" :
  "msExitFullscreen" in document ? "msExitFullscreen" :
  "mozCancelFullScreen" in document ? "mozCancelFullScreen" :
  "exitFullscreen";

if (!requestFullscreen) {
  document.body.classList.add("no-fullscreen");
}

document.querySelector(".toggle-fullscreen").addEventListener("click", function() {
  if (fullscreen) {
    document[exitFullscreen]();
  } else {
    document.querySelector(".three-d")[requestFullscreen]();
  }
  fullscreen = !fullscreen;
  document.body.classList.toggle("fullscreened", fullscreen);
});

["mozfullscreenchange", "webkitfullscreenchange", "fullscreenchange"].forEach(ev => document.addEventListener(ev, function() {
  var attr = "mozFullScreenElement" in document ? "mozFullScreenElement" :
    "webkitFullscreenElement" in document ? "webkitFullscreenElement" :
    "fullScreenElement";

  if (!document[attr]) {
    document.body.classList.remove("fullscreened");
  }

}));

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
    var url = target.href;
    var credit = target.getAttribute("credit");
    modal.innerHTML = `
<img class="close-overlay" src="${target.href}">
<cite>${credit} / The Seattle Times</cite>`;
    return;
  }

  //close overlay
  if (e.target.classList.contains("overlay") || e.target.classList.contains("close-overlay")) {
    overlay.classList.remove("show");
    modal.innerHTML = "";
  }
});

//3D engine kickoff
var startEngine = require("./3D");
var section = document.querySelector(".click-message");
var play = function() {
  if (document.body.classList.contains("no-webgl")) return;
  section.removeEventListener("click", play);
  section.classList.remove("click-to-play");
  document.body.classList.remove("waiting");
  startEngine();
};
section.addEventListener("click", play)