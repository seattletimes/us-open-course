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
      tee: [460, 89.97, 1260],
      camera: {
        location: [461, 90, 1270],
        rotation: [0, deg(52), 0]
      }
    }, {
      id: 2,
      hole: [-1120, 83.993, -840],
      tee: [-1410, 78.514, 550],
      camera: {
        location: [-141, 86, 58],
        rotation: [0, 0, 0]
      }
    }, {
      id: 3,
      hole: [-970, 67.174, -1370],
      tee: [-790, 77.127, -820],
      camera: {
        location: [-79, 81, -82],
        rotation: [0, deg(12), 0]
      }
    }, {
      id: 4,
      hole: [1430, 198.641, -1080],
      tee: [-140, 128.4, -1680],
      camera: {
        location: [-16, 81, -168],
        rotation: [0, deg(270), 0]
      }
    }, {
      id: 5,
      hole: [-140, 80.308, -1380],
      tee: [1330, 188.945, -820],
      camera: {
        location: [135, 78, -80],
        rotation: [0, deg(90), 0]
      }
    }, {
      id: 6,
      hole: [-175, 89.052, 120],
      tee: [-330, 106.365, -1540],
      camera: {
        location: [-33, 80.5, -158],
        rotation: [0, deg(-170), 0]
      }
    }, {
      id: 7,
      hole: [1420, 168.592, -550],
      tee: [0, 77.709, 100],
      camera: {
        location: [-2, 86, 11],
        rotation: [0, deg(-75), 0]
      }
    }, {
      id: 8,
      hole: [1370, 200.301, 1780],
      tee: [1350, 167.283, -170],
      camera: {
        location: [130, 74, -22],
        rotation: [0, deg(190), 0]
      }
    }, {
      id: 9,
      hole: [700, 125.31, 1820],
      tee: [1370, 231.532, 2085],
      camera: {
        location: [140, 72, 210],
        rotation: [deg(-30), deg(70), 0]
      }
    }, {
      id: 10,
      hole: [-730, 79.432, 280],
      tee: [420, 85.893, 1040],
      camera: {
        location: [44, 75.5, 104],
        rotation: [0, deg(80), 0]
      }
    }, {
      id: 11,
      hole: [-560, 76.8, -1500],
      tee: [-680, 83.387, 140],
      camera: {
        location: [-67, 85, 19],
        rotation: [0, deg(10), 0]
      }
    }, {
      id: 12,
      hole: [-180, 162.873, -2710],
      tee: [-590, 105.927, -1740],
      camera: {
        location: [-60, 79.5, -170],
        rotation: [0, deg(-20), 0]
      }
    }, {
      id: 13,
      hole: [1510, 229.394, -1880],
      tee: [40, 193.577, -2680],
      camera: {
        location: [0, 81, -272],
        rotation: [deg(-15), deg(-110), 0]
      }
    }, {
      id: 14,
      hole: [0, 152.449, -2220],
      tee: [1440, 221.234, -1690],
      camera: {
        location: [146, 80, -169],
        rotation: [0, deg(70), 0]
      }
    }, {
      id: 15,
      hole: [-1060, 55.797, -1630],
      tee: [-810, 81.428, -1870],
      camera: {
        location: [-81, 78.5, -190],
        rotation: [0, deg(160), 0]
      }
    }, {
      id: 16,
      hole: [-1560, 48.585, -70],
      tee: [-1290, 46.388, -1390],
      camera: {
        location: [-129, 78, -141],
        rotation: [0, deg(180), 0]
      }
    }, {
      id: 17,
      hole: [-1770, 35.099, 890],
      tee: [-1610, 68.187, 265],
      camera: {
        location: [-161, 87.5, 24],
        rotation: [0, deg(180), 0]
      }
    }, {
      id: 18,
      hole: [240, 63.76, 1450],
      tee: [-1680, 34.8, 1090],
      camera: {
        location: [-171, 89.5, 109],
        rotation: [0, deg(-90), 0]
      }
    }
  ]
}