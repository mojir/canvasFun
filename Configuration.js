const Configuration = (() => {
  // PUBLIC
  function generateRandom(history = []) {
    const foldSequence = generateRandomFoldSequence()
    console.log(Object.values(sizeMap).sort((a, b) => a - b).slice(50, 200))
    return new ConfigurationImpl({
      color: pickRandom(Object.values(hexColorMap).slice(1)),
      bgColor: hexColorMap['0'],
      lineWidth: pickRandom(Object.values(hexLineWidthMap).slice(0, 6)),
      size: pickRandom(Object.values(sizeMap).filter(s => s > 150 && s < 800)),
      rotation: 0,
      spacing: 1,
      foldSequence,
      polygonTemplate: getCross(),
      history,
    })
  }

  function fromSeed(seed, history = []) {
    seed = seed.toUpperCase()
    const separator1Index = seed.indexOf('-')
    const separator2Index = seed.indexOf('-', separator1Index + 1)
    polygonSeedSize = separator2Index - separator1Index - 1

    const color = hexColorMap[seed[0]]
    const bgColor = hexColorMap[seed[1]]
    const lineWidth = hexLineWidthMap[seed[2]]
    const size = sizeMap[seed.substring(3, 5)]
    const rotation = rotationMap[seed.substring(5, 7)]
    const spacing = spacingMap[seed.substring(7, 9)]
    const polygonTemplate = getPolygonTemplateFromSeed(seed.substring(separator1Index + 1, separator2Index))
    //80361-444BBBB444-3C505656565E505030
    const foldSequence = getFoldSequenceFromSeed(seed.substring(separator2Index + 1))
    return new ConfigurationImpl({
      color,
      bgColor,
      lineWidth,
      size,
      rotation,
      spacing,
      polygonTemplate,
      foldSequence,
      history,
    })
  }

  // PRIVATE
  const epsilon = 0.0000001

  const phiMap = {
    '0': 0,
    '1': Math.PI / 6,
    '2': Math.PI / 4,
    '3': Math.PI / 3,
    '4': Math.PI / 2,
    '5': 2 * Math.PI / 3,
    '6': 3 * Math.PI / 4,
    '7': 5 * Math.PI / 6,
    '8': Math.PI,
    '9': 7 * Math.PI / 6,
    'A': 5 * Math.PI / 4,
    'B': 4 * Math.PI / 3,
    'C': 3 * Math.PI / 2,
    'D': 5 * Math.PI / 3,
    'E': 7 * Math.PI / 4,
    'F': 11 * Math.PI / 6,
  }

  const rotationMap = Array.from({ length: 256 }).map((_, i) => i).reduce((acc, i) => {
    const hex = i.toString(16).toUpperCase()
    const key = hex.length === 1 ? `0${hex}` : hex
    const rotationAngle = (i / 240) * Math.PI / 2
    acc[key] = rotationAngle
    return acc
  }, {})
  const defaultRotationHex = getKeyByCloseValue(rotationMap, 0)

  const spacingMap = (() => {
    const a = Array.from({ length: 256 }).map((_, i) => (i + 2) / 20)
    const b = Array.from({ length: 256 }).map((_, i) => Math.sqrt(2) * (i + 2) / 4)
    const spaces = [0, ...a, ...b].sort((a, b) => a - b).slice(0, 256)
    return spaces.reduce((acc, space, index) => {
      const hex = index.toString(16).toUpperCase()
      const key = hex.length === 1 ? `0${hex}` : hex
      acc[key] = space
      return acc
    }, {})
  })()
  const defaultSpacingHex = getKeyByCloseValue(spacingMap, 2)


  const hexLineWidthMap = {
    '0': 0.5,
    '1': 1,
    '2': 2,
    '3': 3,
    '4': 4,
    '5': 5,
    '6': 6,
    '7': 8,
    '8': 10,
    '9': 12,
    'A': 15,
    'B': 22,
    'C': 30,
    'D': 40,
    'E': 56,
    'F': 80,
  }
  const defaultLineWidthHex = getKeyByCloseValue(hexLineWidthMap, 1)

  const sizeMap = Array.from({ length: 256 }).map((_, i) => i).reduce((acc, index) => {
    const hex = index.toString(16).toUpperCase()
    const key = hex.length === 1 ? `0${hex}` : hex
    const size = index < 50 ? index * 2 : index < 100 ? index * 4 - 100 : index < 150 ? index * 8 - 500 : index < 200 ? index * 16 - 1700 : index * 32 - 4900
    acc[key] = size + 4
    return acc
  }, {})

  const defaultSizeHex = getKeyByCloseValue(sizeMap, 400)

  const hexColorMap = {
    '0': "#000000",
    '1': "#0000FF",
    '2': "#00FF00",
    '3': "#00FFFF",
    '4': "#FF0000",
    '5': "#FF00FF",
    '6': "#FFFF00",
    '7': "#888888",
    '8': "#DAA520",
    '9': "#8888FF",
    'A': "#88FF88",
    'B': "#88FFFF",
    'C': "#FF8888",
    'D': "#FF88FF",
    'E': "#FFFF88",
    'F': "#FFFFFF",
  }
  const defaultColorHex = '1'
  const defaultBgColorHex = '0'

  const foldSetVariants = [
    ['11', '22', '33', '44', '55', '66'].map(getPolarVector2FromHex2),
    ['50', '28', '33', '10'].map(getPolarVector2FromHex2),
    ['50', '10'].map(getPolarVector2FromHex2),
    ['30', '38'].map(getPolarVector2FromHex2),
    ['10', '10', '70'].map(getPolarVector2FromHex2),
  ]

  const foldNumberVariants = [6, 7, 8, 9, 10, 11]


  function generateRandomFoldSequence() {
    const folds = pickRandom(foldNumberVariants)
    const foldSequence = []
    const foldSet = pickRandom(foldSetVariants)
    for (let i = 0; i < folds; i++) {
      foldSequence.push(pickRandom(foldSet))
    }
    return foldSequence
  }

  function pickRandom(items) {
    return items[Math.floor(Math.random() * items.length)]
  }

  function getCross() {
    return [
      getPointFromHex2('77'), // center
      getPointFromHex2('00'), // top-left
      getPointFromHex2('77'), // center
      getPointFromHex2('E0'), // top-right
      getPointFromHex2('77'), // center
      getPointFromHex2('0E'), // bottom-left
      getPointFromHex2('77'), // center
      getPointFromHex2('EE'), // bottom-right
      getPointFromHex2('77'), // center
    ]
  }

  function getPolygonTemplateSeed(polygonTemplate) {
    return polygonTemplate.map(point => getHex2FromPoint(point)).join('')
  }

  function isClose(a, b) {
    return Math.abs(a - b) < epsilon
  }


  function getHex2FromPoint(point) {
    const xCode = Math.round((point.x + 1) * 7)
    const yCode = Math.round((point.y + 1) * 7)

    const x = xCode.toString(16).toUpperCase()
    const y = yCode.toString(16).toUpperCase()

    return `${x}${y}`
  }

  function getPointFromHex2(hex2) {
    const xCode = parseInt(hex2[0], 16)
    const yCode = parseInt(hex2[1], 16)

    const x = xCode === 15 ? 0 : xCode / 7 - 1
    const y = yCode === 15 ? 0 : yCode / 7 - 1

    return new Vector2(x, y)
  }

  function getHex2FromPolarVector2(v) {
    const hexR = getHexFromR(v.r)
    const hexPhi = getKeyByCloseValue(phiMap, v.phi)
    return `${hexR}${hexPhi}`
  }

  function getPolarVector2FromHex2(hex2) {
    const r = getRFromHex(hex2[0])
    const phi = phiMap[hex2[1]]

    return new PolarVector2(r, phi)
  }

  function getHexFromR(r) {
    if (isClose(r, 0)) {
      return '0'
    } else if (isClose(r, 1 / 10)) {
      return '1'
    } else if (isClose(r, 1 / 5)) {
      return '2'
    } else if (isClose(r, 1 / 3)) {
      return '3'
    } else if (isClose(r, 2 / 5)) {
      return '4'
    } else if (isClose(r, 1 / 2)) {
      return '5'
    } else if (isClose(r, 3 / 5)) {
      return '6'
    } else if (isClose(r, 2 / 3)) {
      return '7'
    } else if (isClose(r, 4 / 5)) {
      return '8'
    } else if (isClose(r, 9 / 10)) {
      return '9'
    } else if (isClose(r, 1)) {
      return 'A'
    } else if (isClose(r, 6 / 5)) {
      return 'B'
    } else if (isClose(r, 5 / 4)) {
      return 'C'
    } else if (isClose(r, 4 / 3)) {
      return 'D'
    } else if (isClose(r, 3 / 2)) {
      return 'E'
    } else if (isClose(r, 2)) {
      return 'F'
    }
  }

  function getRFromHex(hex) {
    switch (hex) {
      case '0': return 0
      case '1': return 1 / 10
      case '2': return 1 / 5
      case '3': return 1 / 3
      case '4': return 2 / 5
      case '5': return 1 / 2
      case '6': return 3 / 5
      case '7': return 2 / 3
      case '8': return 4 / 5
      case '9': return 9 / 10
      case 'A': return 1
      case 'B': return 6 / 5
      case 'C': return 5 / 4
      case 'D': return 4 / 3
      case 'E': return 3 / 2
      case 'F': return 2
      default: throw new Error('Invalid hex', hex)
    }
  }

  function getKeyByValue(object, value) {
    const key = Object.keys(object).find(key => object[key] === value);
    if (key === undefined) {
      throw new Error('Invalid value', value)
    }
    return key
  }

  function getKeyByCloseValue(object, value) {
    const key = Object.keys(object).find(key => Math.abs(object[key] - value) < epsilon);
    if (key === undefined) {
      throw new Error('Invalid value', value)
    }
    return key
  }

  function getPolygonTemplateFromSeed(polygonTemplateSeed) {
    if (polygonTemplateSeed.length === 0) {
      return []
    }
    if (polygonTemplateSeed.length % 2 !== 0) {
      polygonTemplateSeed += '0'
    }
    return polygonTemplateSeed.match(/.{2}/g).map(hex2 => getPointFromHex2(hex2))
  }

  function getFoldSequenceFromSeed(foldSequenceSeed) {
    if (foldSequenceSeed.length === 0) {
      return []
    }
    if (foldSequenceSeed.length % 2 !== 0) {
      foldSequenceSeed += '0'
    }
    return foldSequenceSeed.match(/.{2}/g).map(hex2 => getPolarVector2FromHex2(hex2))
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max)
  }

  class ConfigurationImpl {
    constructor({
      color,
      bgColor,
      lineWidth,
      size,
      rotation,
      spacing,
      polygonTemplate,
      foldSequence,
      history,
    }) {
      this._color = color
      this._bgColor = bgColor
      this._lineWidth = lineWidth
      this._size = size
      this._rotation = rotation
      this._spacing = spacing
      this._polygonTemplate = polygonTemplate
      this._foldSequence = foldSequence
      this._folds = foldSequence.length
      this.history = [...(history ?? []), this.getSeed()]
      this.historyIndex = this.history.length - 1
    }

    pushHistory() {
      if (this.getSeed() === this.history[this.historyIndex]) {
        return
      }
      this.history = this.history.slice(0, this.historyIndex + 1)
      this.history.push(this.getSeed())
      this.historyIndex = this.history.length - 1
    }

    canUndo() {
      return this.historyIndex > 0
    }

    canRedo() {
      return this.historyIndex < this.history.length - 1
    }

    undo() {
      if (this.historyIndex > 0) {
        this.historyIndex -= 1
        const seed = this.history[this.historyIndex]
        const configuration = Configuration.fromSeed(seed)
        this._color = configuration.color
        this._bgColor = configuration.bgColor
        this._lineWidth = configuration.lineWidth
        this._size = configuration.size
        this._rotation = configuration.rotation
        this._spacing = configuration.spacing
        this._polygonTemplate = configuration.polygonTemplate
        this._foldSequence = configuration.foldSequence
        this._folds = configuration.folds
      }
    }

    redo() {
      if (this.historyIndex < this.history.length - 1) {
        this.historyIndex += 1
        const seed = this.history[this.historyIndex]
        const configuration = Configuration.fromSeed(seed)
        this._color = configuration.color
        this._bgColor = configuration.bgColor
        this._lineWidth = configuration.lineWidth
        this._size = configuration.size
        this._rotation = configuration.rotation
        this._spacing = configuration.spacing
        this._polygonTemplate = configuration.polygonTemplate
        this._foldSequence = configuration.foldSequence
        this._folds = configuration.folds
      }
    }

    get color() {
      return this._color
    }
    set color(color) {
      this._color = color
      this.pushHistory()
    }
    getSeedColor() {
      return getKeyByValue(hexColorMap, this.color)
    }
    setSeedColor(colorSeed) {
      this.color = hexColorMap[colorSeed] ?? this.color
    }
    resetColor() {
      this.color = hexColorMap[defaultColorHex]
    }
    incColor() {
      const colorSeed = getKeyByValue(hexColorMap, this.color)
      const newColorSeed = ((parseInt(colorSeed, 16) + 1) % 16).toString(16).toUpperCase()
      this.color = hexColorMap[newColorSeed]
    }
    decColor() {
      const colorSeed = getKeyByValue(hexColorMap, this.color)
      const newColorSeed = ((parseInt(colorSeed, 16) + 15) % 16).toString(16).toUpperCase()
      this.color = hexColorMap[newColorSeed]
    }

    get bgColor() {
      return this._bgColor
    }
    set bgColor(bgColor) {
      this._bgColor = bgColor
      this.pushHistory()
    }
    getSeedBgColor() {
      return getKeyByValue(hexColorMap, this.bgColor)
    }
    setSeedBgColor(bgColorSeed) {
      this.bgColor = hexColorMap[bgColorSeed] ?? this.bgColor
    }
    resetBgColor() {
      this.bgColor = hexColorMap[defaultBgColorHex]
    }
    incBgColor() {
      const bgColorSeed = getKeyByValue(hexColorMap, this.bgColor)
      const newBgColorSeed = ((parseInt(bgColorSeed, 16) + 1) % 16).toString(16).toUpperCase()
      this.bgColor = hexColorMap[newBgColorSeed]
    }
    decBgColor() {
      const bgColorSeed = getKeyByValue(hexColorMap, this.bgColor)
      const newBgColorSeed = ((parseInt(bgColorSeed, 16) + 15) % 16).toString(16).toUpperCase()
      this.bgColor = hexColorMap[newBgColorSeed]
    }

    get lineWidth() {
      return this._lineWidth
    }
    set lineWidth(lineWidth) {
      this._lineWidth = lineWidth
      this.pushHistory()
    }
    getSeedLineWidth() {
      return getKeyByCloseValue(hexLineWidthMap, this.lineWidth)
    }
    setSeedLineWidth(lineWidthSeed) {
      this.lineWidth = hexLineWidthMap[lineWidthSeed] ?? this.lineWidth
    }
    resetLineWidth() {
      this.lineWidth = hexLineWidthMap[defaultLineWidthHex]
    }
    incLineWidth() {
      const lineWidthSeed = getKeyByCloseValue(hexLineWidthMap, this.lineWidth)
      const newLineWidthSeed = ((parseInt(lineWidthSeed, 16) + 1) % 16).toString(16).toUpperCase()
      this.lineWidth = hexLineWidthMap[newLineWidthSeed]
    }
    decLineWidth() {
      const lineWidthSeed = getKeyByCloseValue(hexLineWidthMap, this.lineWidth)
      const newLineWidthSeed = ((parseInt(lineWidthSeed, 16) + 15) % 16).toString(16).toUpperCase()
      this.lineWidth = hexLineWidthMap[newLineWidthSeed]
    }

    get size() {
      return this._size
    }
    set size(size) {
      this._size = size
      this.pushHistory()
    }
    getSeedSize() {
      return getKeyByValue(sizeMap, this.size)
    }
    setSeedSize(sizeSeed) {
      this.size = sizeMap[sizeSeed] ?? this.size
    }
    resetSize() {
      this.size = sizeMap[defaultSizeHex]
    }
    incSize() {
      const sizeSeed = getKeyByCloseValue(sizeMap, this.size)
      const newSize = parseInt(sizeSeed, 16) + 1
      const newSizeHex = (newSize > 255 ? 0 : newSize).toString(16).toUpperCase()
      const newSizeSeed = newSizeHex.length === 1 ? `0${newSizeHex}` : newSizeHex

      this.size = sizeMap[newSizeSeed]
    }
    decSize() {
      const sizeSeed = getKeyByCloseValue(sizeMap, this.size)
      const newSize = parseInt(sizeSeed, 16) - 1
      const newSizeHex = (newSize < 0 ? 255 : newSize).toString(16).toUpperCase()
      const newSizeSeed = newSizeHex.length === 1 ? `0${newSizeHex}` : newSizeHex

      this.size = sizeMap[newSizeSeed]
    }


    get rotation() {
      return this._rotation
    }
    set rotation(rotation) {
      this._rotation = rotation
      this.pushHistory()
    }
    getSeedRotation() {
      return getKeyByCloseValue(rotationMap, this.rotation)
    }
    setSeedRotation(rotationSeed) {
      this.rotation = rotationMap[rotationSeed] ?? this.rotation
    }
    resetRotation() {
      this.rotation = rotationMap[defaultRotationHex]
    }
    incRotation() {
      const rotationSeed = getKeyByCloseValue(rotationMap, this.rotation)
      const newRotation = parseInt(rotationSeed, 16) + 1
      const newRotationHex = (newRotation >= 256 ? 0 : newRotation).toString(16).toUpperCase()
      const newRotationSeed = newRotationHex.length === 1 ? `0${newRotationHex}` : newRotationHex

      this.rotation = rotationMap[newRotationSeed]
    }
    decRotation() {
      const rotationSeed = getKeyByCloseValue(rotationMap, this.rotation)
      const newRotation = parseInt(rotationSeed, 16) - 1
      const newRotationHex = (newRotation < 0 ? 255 : newRotation).toString(16).toUpperCase()
      const newRotationSeed = newRotationHex.length === 1 ? `0${newRotationHex}` : newRotationHex

      this.rotation = rotationMap[newRotationSeed]
    }

    get spacing() {
      return this._spacing
    }
    set spacing(spacing) {
      this._spacing = spacing
      this.pushHistory()
    }
    getSeedSpacing() {
      return getKeyByCloseValue(spacingMap, this.spacing)
    }
    setSeedSpacing(spacingSeed) {
      this.spacing = spacingMap[spacingSeed] ?? this.spacing
    }
    resetSpacing() {
      this.spacing = spacingMap[defaultSpacingHex]
    }
    incSpacing() {
      const spacingSeed = getKeyByCloseValue(spacingMap, this.spacing)
      const newSpacing = parseInt(spacingSeed, 16) + 1
      const newSpacingHex = (newSpacing >= 256 ? 0 : newSpacing).toString(16).toUpperCase()
      const newSpacingSeed = newSpacingHex.length === 1 ? `0${newSpacingHex}` : newSpacingHex

      this.spacing = spacingMap[newSpacingSeed]
    }
    decSpacing() {
      const spacingSeed = getKeyByCloseValue(spacingMap, this.spacing)
      const newSpacing = parseInt(spacingSeed, 16) - 1
      const newSpacingHex = (newSpacing < 0 ? 255 : newSpacing).toString(16).toUpperCase()
      const newSpacingSeed = newSpacingHex.length === 1 ? `0${newSpacingHex}` : newSpacingHex

      this.spacing = spacingMap[newSpacingSeed]
    }

    get folds() {
      return this._folds
    }
    set folds(folds) {
      console.log('folds', folds)
      this._folds = isNaN(folds) ? this._folds : clamp(folds, 0, this._foldSequence.length)
      this.pushHistory()
    }
    resetFolds() {
      this.folds = this.foldSequence.length
    }
    decFolds() {
      this.folds = clamp(this.folds - 1, 0, this.foldSequence.length)
    }
    incFolds() {
      this.folds = clamp(this.folds + 1, 0, this.foldSequence.length)
    }
    get polygonTemplate() {
      return this._polygonTemplate
    }

    set polygonTemplate(polygonTemplate) {
      this._polygonTemplate = polygonTemplate
      this.pushHistory()
    }

    get foldSequence() {
      return this._foldSequence
    }

    set foldSequence(foldSequence) {
      this._foldSequence = foldSequence
      this.pushHistory()
    }

    getSeed() {
      const colorSeed = this.getSeedColor()
      const bgColorSeed = this.getSeedBgColor()
      const lineWidthSeed = this.getSeedLineWidth()
      const sizeSeed = this.getSeedSize()
      const rotationSeed = this.getSeedRotation()
      const spacingSeed = this.getSeedSpacing()
      const polygonTemplateSeed = getPolygonTemplateSeed(this.polygonTemplate)
      const foldSequenceSeed = this
        .foldSequence
        .slice(0, this.folds)
        .map(getHex2FromPolarVector2).join('')
      return colorSeed
        + bgColorSeed
        + lineWidthSeed
        + sizeSeed
        + rotationSeed
        + spacingSeed
        + '-'
        + polygonTemplateSeed
        + '-'
        + foldSequenceSeed
    }
    getFoldSequence() {
      return this.foldSequence.slice(0, this.folds)
    }

    invertColors() {
      const color = this.color
      this.color = this.bgColor
      this.bgColor = color
    }
    getPolygon() {
      return new Polygon(this.polygonTemplate).rotate(this.rotation)
    }
  }
  return {
    generateRandom,
    fromSeed,
    test,
  }

  function randomHexString(length) {
    let result = ''
    const characters = '0123456789ABCDEF'
    for (let i = 0; i < length; i++) {
      result += characters[Math.floor(Math.random() * characters.length)]
    }
    return result
  }
  function randomSeed() {
    return `${randomHexString(6)}-${randomHexString(8).replace(/F/g, '7')}-${randomHexString(8)}`
  }

  function test() {
    for (let i = 0; i < 1000; i++) {
      const hex2_1 = randomHexString(2)
      const pv = getPolarVector2FromHex2(hex2_1)
      const hex2_2 = getHex2FromPolarVector2(pv)
      if (hex2_1 !== hex2_2) {
        throw new Error('Hex mismatch', hex2_1, hex2_2)
      }

      const hex2_3 = randomHexString(2).replace(/F/g, '7')
      const p = getPointFromHex2(hex2_3)
      const hex2_4 = getHex2FromPoint(p)
      if (hex2_3 !== hex2_4) {
        throw new Error('Hex mismatch', hex2_3, hex2_4)
      }


      const seed = randomSeed()
      const configuration = Configuration.fromSeed(seed)
      const seed2 = configuration.getSeed()
      if (seed !== seed2) {
        throw new Error('Seed mismatch', seed, seed2)
      }
    }

  }
})()

