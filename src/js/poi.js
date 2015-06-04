var deg = function(r) {
  if (r < 0) r += 360;
  return Math.PI * 2 * (r / 360);
};

module.exports = {
  overview: {
    location: [-2300, 800, -1000],
    rotation: [deg(-30), deg(-90), 0]
  },
  course: [
    {
      id: 1,
      hole: [-1260, 50, 760],
      tee: [460, 95, 1270],
      camera: {
        location: [470, 100, 1270],
        rotation: [0, deg(52), 0]
      }
    }, {
      id: 2,
      hole: [-112, 6.5, -84],
      tee: [-141, 8, 57],
      camera: {
        location: [-142, 10, 60],
        rotation: [0, 0, 0]
      }
    }, {
      id: 3,
      hole: [-97, 7, -137],
      tee: [-79, 8, -82],
      camera: {
        location: [-79, 9, -80],
        rotation: [0, deg(12), 0]
      }
    }, {
      id: 4,
      hole: [143, 20, -108],
      tee: [-14, 13, -168],
      camera: {
        location: [-16, 14, -168],
        rotation: [0, deg(270), 0]
      }
    }, {
      id: 5,
      hole: [-14, 11, -138],
      tee: [133, 19, -80],
      camera: {
        location: [135, 20, -80],
        rotation: [0, deg(90), 0]
      }
    }, {
      id: 6,
      hole: [-17.5, 9, 12],
      tee: [-33, 10.75, -154],
      camera: {
        location: [-33, 11.5, -158],
        rotation: [0, deg(-170), 0]
      }
    }, {
      id: 7,
      hole: [142, 17, -55],
      tee: [0, 8.5, 10],
      camera: {
        location: [-2, 9, 11],
        rotation: [0, deg(-75), 0]
      }
    }, {
      id: 8,
      hole: [137, 20, 178],
      tee: [136, 17, -17],
      camera: {
        location: [130, 19, -22],
        rotation: [0, deg(190), 0]
      }
    }, {
      id: 9,
      hole: [70, 12.5, 182],
      tee: [138, 25, 209.5],
      camera: {
        location: [140, 27, 210],
        rotation: [deg(-30), deg(70), 0]
      }
    }, {
      id: 10,
      hole: [-73, 8, 28],
      tee: [42, 9, 104],
      camera: {
        location: [44, 10, 104],
        rotation: [0, deg(80), 0]
      }
    }, {
      id: 11,
      hole: [-56, 7.5, -150],
      tee: [-68, 8.5, 14],
      camera: {
        location: [-67, 11, 19],
        rotation: [0, deg(10), 0]
      }
    }, {
      id: 12,
      hole: [-18, 16.5, -271],
      tee: [-59, 10.8, -174],
      camera: {
        location: [-60, 12, -170],
        rotation: [0, deg(-20), 0]
      }
    }, {
      id: 13,
      hole: [151, 23, -188],
      tee: [4, 19.5, -268],
      camera: {
        location: [0, 23, -272],
        rotation: [deg(-15), deg(-110), 0]
      }
    }, {
      id: 14,
      hole: [0, 15, -222],
      tee: [144, 22.2, -169],
      camera: {
        location: [146, 23, -169],
        rotation: [0, deg(70), 0]
      }
    }, {
      id: 15,
      hole: [-106, 5.7, -163],
      tee: [-81, 8.2, -187],
      camera: {
        location: [-81, 10, -190],
        rotation: [0, deg(160), 0]
      }
    }, {
      id: 16,
      hole: [-156, 3, -7],
      tee: [-129, 5, -139],
      camera: {
        location: [-129, 6, -141],
        rotation: [0, deg(180), 0]
      }
    }, {
      id: 17,
      hole: [-177, 3.5, 89],
      tee: [-161, 7.5, 26.5],
      camera: {
        location: [-161, 9, 24],
        rotation: [0, deg(180), 0]
      }
    }, {
      id: 18,
      hole: [24, 6, 145],
      tee: [-168, 3.5, 109],
      camera: {
        location: [-171, 5, 109],
        rotation: [0, deg(-90), 0]
      }
    }
  ]
}