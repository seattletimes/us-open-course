var async = require("async");
var tweenjs = require("tween.js");

var camera = require("./camera");
var util = require("./util");

const TAU = Math.PI * 2;
const GOTO_TIME = 2000;

var cameraTweens = {
  location: null,
  rotation: null
};

var moveCamera = function(currentPosition, newPosition, time, during, done) {
  if (cameraTweens.location) cameraTweens.location.stop();

  if (typeof time == "function" || !time) {
    during = time;
    time = GOTO_TIME;
  }

  if (typeof done == "undefined") {
    done = during;
    during = null;
  }

  var l = cameraTweens.location = new tweenjs.Tween(currentPosition).to(newPosition, time);
  l.easing(tweenjs.Easing.Sinusoidal.InOut);
  l.onUpdate(function() {
    camera.position.set(this.x, this.y, this.z);
    if (during) during();
  });
  if (done) l.onComplete(function() {
    util.nextTick(() => done());
  });
  util.nextTick(() => l.start());
};

var rotateCamera = function(currentRotation, newRotation, time, during, done) {
  if (cameraTweens.rotation) cameraTweens.rotation.stop();
  if (typeof done == "undefined") {
    done = during;
    during = null;
  }

  //normalize rotation to prevent weird shifts
  ["x", "y", "z"].forEach(function(axis) {
    // newRotation[axis] %= TAU;
    // currentRotation[axis] %= TAU;
    if (newRotation[axis] - currentRotation[axis] < 0) newRotation[axis] += TAU;
    if (newRotation[axis] - currentRotation[axis] >= Math.PI) {
      newRotation[axis] -= TAU;
    }
  });

  var r = cameraTweens.rotation = new tweenjs.Tween(currentRotation).to(newRotation, time);
  r.easing(tweenjs.Easing.Quartic.InOut);
  r.onUpdate(function() {
    camera.rotation.set(this.x, this.y, this.z);
    if (during) during();
  });
  if (done) r.onComplete(function() {
    util.nextTick(() => done());
  });
  util.nextTick(() => r.start());
};

var followPath = function(path, speed, during, callback) {
  if (!callback) {
    callback = during;
    during = null;
  }

  path = path.slice();
  //grab the first and last ones for tweening
  var first = true;
  var last = path.pop();

  async.eachSeries(path, function(point, next) {
    var currentPosition = camera.position.clone();
    var newPosition = point.clone();

    var distance = currentPosition.distanceTo(newPosition);
    var time = distance / speed * 1000;

    if (first && cameraTweens.location) cameraTweens.location.stop();

    var m = cameraTweens.location = new tweenjs.Tween(currentPosition).to(newPosition, time);
    m.easing(first ? tweenjs.Easing.Sinusoidal.In : tweenjs.Easing.Linear.None);
    m.onUpdate(function() {
      camera.position.set(this.x, this.y, this.z);
      if (during) during();
    });
    m.onComplete(function() {
      next();
    });
    m.start();

    // after first point, don't tween the same way
    first = false;
  }, function() {
    var currentPosition = camera.position.clone();
    var newPosition = last.clone();

    var distance = currentPosition.distanceTo(newPosition);
    var time = distance / speed * 1000;

    var m = cameraTweens.location = new tweenjs.Tween(currentPosition).to(newPosition, time);
    m.easing(tweenjs.Easing.Sinusoidal.Out);
    m.onUpdate(function() {
      camera.position.set(this.x, this.y, this.z);
      if (during) during();
    });
    m.onComplete(callback);
    m.start();
  });
};

module.exports = {
  rotateCamera,
  moveCamera,
  followPath
};