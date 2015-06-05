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
      hole: [-1260, 54.392, 760],
      tee: [460, 89.97, 1270],
      camera: {
        location: [461, 90, 1270],
        rotation: [0, deg(52), 0]
      }
    }, {
      id: 2,
      hole: [-112, 80,168, -84],
      tee: [-141, 85.734, 57],
      camera: {
        location: [-141, 86, 58],
        rotation: [0, 0, 0]
      }
    }, {
      id: 3,
      hole: [-97, 78.5, -137],
      tee: [-79, 80.23, -82],
      camera: {
        location: [-79, 81, -82],
        rotation: [0, deg(12), 0]
      }
    }, {
      id: 4,
      hole: [143, 77.348, -108],
      tee: [-14, 79.838, -168],
      camera: {
        location: [-16, 81, -168],
        rotation: [0, deg(270), 0]
      }
    }, {
      id: 5,
      hole: [-14, 80.308, -138],
      tee: [133, 76.8, -80],
      camera: {
        location: [135, 78, -80],
        rotation: [0, deg(90), 0]
      }
    }, {
      id: 6,
      hole: [-17.5, 92.683, 12],
      tee: [-33, 79.372, -154],
      camera: {
        location: [-33, 80.5, -158],
        rotation: [0, deg(-170), 0]
      }
    }, {
      id: 7,
      hole: [142, 75.034, -55],
      tee: [0, 84.416, 10],
      camera: {
        location: [-2, 86, 11],
        rotation: [0, deg(-75), 0]
      }
    }, {
      id: 8,
      hole: [137, 70.438, 178],
      tee: [136, 73.2, -17],
      camera: {
        location: [130, 74, -22],
        rotation: [0, deg(190), 0]
      }
    }, {
      id: 9,
      hole: [70, 85.827, 182],
      tee: [138, 71.2, 209.5],
      camera: {
        location: [140, 72, 210],
        rotation: [deg(-30), deg(70), 0]
      }
    }, {
      id: 10,
      hole: [-73, 84.774, 28],
      tee: [42, 74.22, 104],
      camera: {
        location: [44, 75.5, 104],
        rotation: [0, deg(80), 0]
      }
    }, {
      id: 11,
      hole: [-56, 78.865, -150],
      tee: [-68, 84.102, 14],
      camera: {
        location: [-67, 85, 19],
        rotation: [0, deg(10), 0]
      }
    }, {
      id: 12,
      hole: [-18, 79.542, -271],
      tee: [-59, 78.305, -174],
      camera: {
        location: [-60, 79.5, -170],
        rotation: [0, deg(-20), 0]
      }
    }, {
      id: 13,
      hole: [151, 78.033, -188],
      tee: [4, 80.018, -268],
      camera: {
        location: [0, 81, -272],
        rotation: [deg(-15), deg(-110), 0]
      }
    }, {
      id: 14,
      hole: [0, 81.032, -222],
      tee: [144, 78.731, -169],
      camera: {
        location: [146, 80, -169],
        rotation: [0, deg(70), 0]
      }
    }, {
      id: 15,
      hole: [-106, 77.511, -163],
      tee: [-81, 77.512, -187],
      camera: {
        location: [-81, 78.5, -190],
        rotation: [0, deg(160), 0]
      }
    }, {
      id: 16,
      hole: [-156, 85.631, -7],
      tee: [-129, 76.952, -139],
      camera: {
        location: [-129, 78, -141],
        rotation: [0, deg(180), 0]
      }
    }, {
      id: 17,
      hole: [-177, 88.748, 89],
      tee: [-161, 86.639, 26.5],
      camera: {
        location: [-161, 87.5, 24],
        rotation: [0, deg(180), 0]
      }
    }, {
      id: 18,
      hole: [24, 76.468, 145],
      tee: [-168, 88.39, 109],
      camera: {
        location: [-171, 89.5, 109],
        rotation: [0, deg(-90), 0]
      }
    }
  ]
}