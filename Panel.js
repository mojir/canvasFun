const Panel = (() => {
  let tabIndex = 0
  function drawControlPanel(configuration) {
    tabIndex = 0
    const panel = document.getElementById('panel')
    const seed = configuration.getSeed()
    panel.innerHTML = `
      <div class="logo">
        <a href="?">Canvas Fun</a>
      </div>
      <div class="link">
        <a href="?seed=${seed}">Link to this</a>
      </div>

      <div class="editable-fields">
        ${drawEditableHexField(configuration, 'color')}
        ${drawEditableHexField(configuration, 'bgColor')}
        ${drawEditableHexField(configuration, 'lineWidth')}
        ${drawEditableHexField(configuration, 'size')}
        ${drawEditableHexField(configuration, 'rotation', v => `${Utils.stringifyNumber(v)} rad, (${Utils.stringifyNumber(v * 180 / Math.PI)}&deg;)`)}
        ${drawEditableHexField(configuration, 'spacing', v => `${Utils.stringifyNumber(v)}`)}
        ${drawEditableIntField(configuration, 'folds')}
      </div>

      <div id="seed-container">
        Seed
        <input tabindex=${++tabIndex} id="seedInput" onchange="applySeed()"></input>
      </div>

      <div id="button-group">
      </div>
      `

  }

  function drawEditableHexField(configuration, field, map = v => v) {
    const capitalizedField = Utils.capitalize(field)
    const getSeedFunction = `getSeed${capitalizedField}`
    const setSeedFunction = `setSeed${capitalizedField}`

    const title = Utils.padRight(Utils.sentenceCase(field), 10)
    const hex = configuration[getSeedFunction]()
    const value = `${map(configuration[field])}`

    const incFieldName = `inc${capitalizedField}`
    const decFieldName = `dec${capitalizedField}`
    const resetFieldName = `reset${capitalizedField}`
    return `
      <div class="editable-field">
        <div class="field-title">
          <pre>${title}</pre>
          <input tabindex=${++tabIndex} value="${hex}" onkeydown="modifyHex(this, event);configuration.${setSeedFunction}(this.value.toUpperCase());redraw(configuration)" onchange="configuration.${setSeedFunction}(this.value.toUpperCase());restart(configuration)"></input>
          <pre>${value}</pre>
        </div>
        <div class="field-controls">
          <button onclick="runConfigMethodAndRestart('${decFieldName}')">-</button>
          <button onclick="runConfigMethodAndRestart('${incFieldName}')">+</button>
          <button onclick="runConfigMethodAndRestart('${resetFieldName}')">Reset</button>
        </div>
      </div>
`
  }

  function drawEditableIntField(configuration, field) {
    const capitalizedField = Utils.capitalize(field)

    const title = Utils.padRight(Utils.sentenceCase(field), 10)
    const value = configuration[field].toString(10)

    const incFieldName = `inc${capitalizedField}`
    const decFieldName = `dec${capitalizedField}`
    const resetFieldName = `reset${capitalizedField}`
    return `
      <div class="editable-field">
        <div class="field-title">
          <pre>${title}</pre>
          <input tabindex=${++tabIndex} value="${value}" onchange="configuration.${field} = Number(this.value); restart(configuration)"></input>
        </div>
        <div class="field-controls">
          <button onclick="runConfigMethodAndRestart('${decFieldName}')">-</button>
          <button onclick="runConfigMethodAndRestart('${incFieldName}')">+</button>
          <button onclick="runConfigMethodAndRestart('${resetFieldName}')">Reset</button>
        </div>
      </div>
`
  }


  function update(configuration) {
    drawControlPanel(configuration)
    updateButtonGroup(configuration)
    document.getElementById('seedInput').value = configuration.getSeed()

    return
    document.getElementById('debug').innerHTML = `
Rotation: ${configuration.rotation * 180 / Math.PI}

${JSON.stringify(configuration, null, 2)}
    `
    document.getElementById('seedInput').value = configuration.getSeed()
  }

  function updateButtonGroup(configuration) {
    const buttonGroup = document.getElementById('button-group')
    buttonGroup.innerHTML = `
      <button onclick="restart(null, false)">New</button>
      ${playing ? `<button onclick="pause()">Pause</button>` : `<button onclick="play()">Play</button>`}
      <button onclick="downloadImage()">Download</button>
      <button ${configuration.canUndo() ? '' : 'disabled'} onclick="configuration.undo(); restart(configuration)">Undo</button>
      <button ${configuration.canRedo() ? '' : 'disabled'} onclick="configuration.redo(); restart(configuration)">Redo</button>
      <button onclick="fullScreen()">Fullscreen</button>
    `
  }

  return {
    update,
    updateButtonGroup,
  }
})()
