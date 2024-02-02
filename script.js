// 0C53002-770077E0770E77EE77-0123012322
// 0C33006-07E707-5050505050505050505050
// file:///home/albert/repos/canvasFun/index.html?seed=E0023C-40A0E4EAAE4E0A0440-5858505010203010F0F000F0
// C0E92E4-770077E0770E77EE77-353740303038333800F0C855
// 401750F14-770077E0770E77EE77-10501050105010501010
const colors = ["aqua", "blue", "fuchsia", "green", "lime", "maroon", "navy", "olive", "orange", "purple", "red", "silver", "teal", "yellow"]
const configs = [
  [0.5, 0.1],
  [0.3],
  [0.1, 0.1, 0.75],
]
const nbrOfIterationsVariants = [5, 6, 7, 8, 9, 10, 11]
const pauseTime = 5000

// Get the canvas element
const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

const polygonList = [];
let iterations
let timer
let numberOfIterations
let playing = false
let configuration
let tempScaling = null
window.onload = () => {
  const seed = getQueryParam("seed");
  restart(seed ? Configuration.fromSeed(seed) : undefined)

  document.getElementById('panel').addEventListener('keydown', event => {
    event.stopPropagation()
  })

  window.addEventListener('resize', () => restart(configuration, playing))

  document.addEventListener("keydown", event => {
    if (event.ctrlKey) {
      return
    }
    if (event.key === " ") {
      if (playing) {
        pause()
      } else {
        play()
      }
    }
    if (event.key === "+" || event.key === "=") {
      runConfigMethodAndRestart('incFolds')
    }
    if (event.key === "-" || event.key === "_") {
      runConfigMethodAndRestart('decFolds')
    }
    if (event.key === "n") {
      restart(null, false)
    }
    if (event.key === "ArrowLeft") {
      runConfigMethodAndRestart('undo')
    }
    if (event.key === "ArrowRight") {
      runConfigMethodAndRestart('redo')
    }
    if (event.key === "0") {
      restart(configuration)
    }
    if (event.key === "1") {
      runConfigMethodAndRestart('resetColor')
    }
    if (event.key === "2") {
      runConfigMethodAndRestart('resetBgColor')
    }
    if (event.key === "3") {
      runConfigMethodAndRestart('resetLineWidth')
    }
    if (event.key === "4") {
      runConfigMethodAndRestart('resetSize')
    }
    if (event.key === "5") {
      runConfigMethodAndRestart('resetRotation')
    }
    if (event.key === "6") {
      runConfigMethodAndRestart('resetSpacing')
    }

    if (event.key === "s") {
      runConfigMethodAndRestart('incSpacing')
    }
    if (event.key === "S") {
      runConfigMethodAndRestart('decSpacing')
    }
    if (event.key === "l") {
      runConfigMethodAndRestart('incLineWidth')
    }
    if (event.key === "L") {
      runConfigMethodAndRestart('decLineWidth')
    }
    if (event.key === "z") {
      runConfigMethodAndRestart('incSize')
    }
    if (event.key === "Z") {
      runConfigMethodAndRestart('decSize')
    }
    if (event.key === "c") {
      runConfigMethodAndRestart('incColor')
    }
    if (event.key === "C") {
      runConfigMethodAndRestart('decColor')
    }
    if (event.key === "b") {
      runConfigMethodAndRestart('incBgColor')
    }
    if (event.key === "B") {
      runConfigMethodAndRestart('decBgColor')
    }
    if (event.key === "i") {
      runConfigMethodAndRestart('invertColors')
    }
    if (event.key === "I") {
      runConfigMethodAndRestart('invertColors')
    }
    if (event.key === "r") {
      runConfigMethodAndRestart('incRotation')
    }
    if (event.key === "R") {
      runConfigMethodAndRestart('decRotation')
    }
    if (event.key === "f") {
      fullScreen()
    }
    if (event.key === "x") {
      if (configuration.spacing !== 0) {
        tempScaling = configuration.spacing
        configuration.spacing = 0
        restart(configuration)
      } else if (tempScaling !== null) {
        configuration.spacing = tempScaling
        tempScaling = null
        restart(configuration)
      }
    }
  });
}

function modifyHex(component, event) {
  if (event.key === "ArrowUp") {
    event.preventDefault()
    component.value = addHex(component.value, 1)
  } else if (event.key === "ArrowDown") {
    event.preventDefault()
    component.value = addHex(component.value, -1)
  } else if (event.key === "PageUp") {
    event.preventDefault()
    component.value = addHex(component.value, 16)
  } else if (event.key === "PageDown") {
    event.preventDefault()
    component.value = addHex(component.value, -16)
  }
}

function addHex(hex, delta) {
  const hex2 = hex.length === 2
  const max = hex2 ? 255 : 15
  const hexValue = parseInt(hex, 16)
  let newHexValue = hexValue + delta
  while (newHexValue > max) {
    newHexValue -= (max + 1)
  }
  if (newHexValue < 0) {
    newHexValue += (max + 1)
  }
  const result = newHexValue.toString(16).toUpperCase()
  return hex2 ? result.padStart(2, '0') : result
}

function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

function downloadImage() {
  const link = document.createElement('a')
  link.download = `${configuration.getSeed()}.png`
  link.href = canvas.toDataURL()
  link.click()
}

function play() {
  clearTimeout(timer)
  timer = null
  playing = true
  restart(null, true)
}

function pause() {
  clearTimeout(timer)
  timer = null
  playing = false
  restart(configuration)
}

function runConfigMethodAndRestart(method) {
  if (!configuration) {
    return
  }
  configuration[method]()
  restart(configuration)
}
function applySeed() {
  console.log('applySeed')
  const seed = document.getElementById('seedInput').value
  configuration = Configuration.fromSeed(seed, configuration?.history)
  clearTimeout(timer)
  timer = null
  playing = false

  restart(configuration)
}

async function fullScreen() {
  if (canvas.requestFullscreen) {
    await canvas.requestFullscreen();
  } else if (canvas.mozRequestFullScreen) { // Firefox
    await canvas.mozRequestFullScreen();
  } else if (canvas.webkitRequestFullscreen) { // Chrome, Safari and Opera
    await canvas.webkitRequestFullscreen();
  } else if (canvas.msRequestFullscreen) { // IE/Edge
    await canvas.msRequestFullscreen();
  }
}

function restart(conf = null, play = false) {
  if (playing && !play) {
    clearTimeout(timer)
    timer = null
    playing = false
  }
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  configuration = conf ? conf : Configuration.generateRandom(configuration?.history)
  Panel.update(configuration)
  const foldedPolygon = runFoldSequence(configuration, configuration.getPolygon())
  draw(configuration, foldedPolygon)
  if (playing) {
    clearTimeout(timer)
    timer = setTimeout(() => restart(null, true), pauseTime)
  }
}

function redraw(configuration) {
  const foldedPolygon = runFoldSequence(configuration, configuration.getPolygon())
  draw(configuration, foldedPolygon)
  Panel.updateButtonGroup(configuration)
}

function foldPolygon(polygon, foldPoint) {
  const oldPoints = [...polygon.points]
  const newPoints = []
  let x1, x2, y1, y2
  oldPoints.forEach(point => {
    if (typeof x1 !== 'number') {
      x1 = point.x;
      y1 = point.y;
      newPoints.push(point)
      return
    }
    x2 = point.x;
    y2 = point.y;
    const v1 = new Vector2(x1, y1);
    const v2 = new Vector2(x2, y2);
    const v1ToV2 = v2.sub(v1);
    const direction = v1ToV2.toPolarVector2().phi;
    const p = v1
      .add(
        v1ToV2.scale(0.5)
      )
      .add(foldPoint.rotate(direction + Math.PI / 2).scale(v1ToV2.length()))
    newPoints.push(p);
    newPoints.push(point);
    x1 = x2;
    y1 = y2;
  });
  return new Polygon(newPoints)
}

function getRepeateData(polygon, configuration) {
  const { x: width, y: height } = polygon.getDimensions()

  if (configuration.spacing === 0) {
    const dimFactor = Math.max(width, height) / 2
    return {
      cols: 1,
      rows: 1,
      size: (Math.min(canvas.width, canvas.height) / dimFactor) - 20 - configuration.lineWidth,
      delta: 0,
    }
  } else {
    const delta = configuration.size * configuration.spacing / 2
    const cols = 1 + Math.ceil((canvas.width - delta) / delta) * 2
    const rows = 1 + Math.ceil((canvas.height - delta) / delta) * 2

    return {
      cols,
      rows,
      size: configuration.size,
      delta,
    }
  }
}

function draw(configuration, polygon) {
  const { rows, cols, size, delta } = getRepeateData(polygon, configuration)
  const scaledPolygon = polygon.scale(size / 2)
  const { x, y } = scaledPolygon.getDimensions()
  const width = x
  const height = y
  const smallCanvas = document.createElement('canvas')
  smallCanvas.width = width + configuration.lineWidth * 2
  smallCanvas.height = height + configuration.lineWidth * 2
  const smallCtx = smallCanvas.getContext('2d')

  smallCtx.strokeStyle = configuration.color;
  smallCtx.lineWidth = configuration.lineWidth;

  smallCtx.beginPath();
  const translatedPolygon = scaledPolygon.translate(new Vector2(width / 2, height / 2))

  translatedPolygon.points.forEach((point, index) => {
    const x = Math.floor(point.x + configuration.lineWidth);
    const y = Math.floor(point.y + configuration.lineWidth);
    if (index === 0) {
      smallCtx.moveTo(x, y);
    } else {
      smallCtx.lineTo(x, y);
    }
  });
  smallCtx.lineJoin = "round";
  smallCtx.stroke();

  ctx.fillStyle = configuration.bgColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const midX = canvas.width / 2
  const midY = canvas.height / 2
  for (let col = 0; col < cols; col += 1) {
    for (let row = 0; row < rows; row += 1) {
      const x = Math.floor(midX - width / 2 + (col - Math.floor(cols / 2)) * delta - configuration.lineWidth)
      const y = Math.floor(midY - width / 2 + (row - Math.floor(rows / 2)) * delta - configuration.lineWidth)
      ctx.drawImage(smallCanvas, x, y)
    }
  }
}

function runFoldSequence(configuration, polygon) {
  return configuration.getFoldSequence().reduce((polygon, foldPoint) => {
    return foldPolygon(polygon, foldPoint)
  }, polygon)
}
