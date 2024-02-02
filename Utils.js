const Utils = (() => {
  function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  function sentenceCase(string) {
    return capitalize(string.replace(/([A-Z])/g, ' $1'))
  }

  function stringifyNumber(number) {
    return number.toFixed(3)
  }

  function padRight(string, length) {
    return string + ' '.repeat(length - string.length)
  }

  return {
    capitalize,
    sentenceCase,
    stringifyNumber,
    padRight,
  };
})()
