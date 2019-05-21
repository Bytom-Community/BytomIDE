function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function Ticker(fn, t) {
  var timerObj = setInterval(fn, t)
  this.stop = function () {
    if (timerObj) {
      clearInterval(timerObj);
      timerObj = null;
    }
    return this;
  }
  // start timer using current settings (if it's not already running)
  this.start = function () {
    if (!timerObj) {
      this.stop();
      timerObj = setInterval(fn, t);
    }
    return this;
  }
  // start with new interval, stop current interval
  this.reset = function (newT) {
    t = newT;
    return this.stop().start();
  }

  this.interval = function () {
    return t
  }
}

const calculateBytomFee = (gasType, gas) => {
  let bytomFee = 0
  switch (gasType) {
    case "BTM": {
      bytomFee = parseInt(parseFloat(gas) * 100000000)
      break
    }
    case "mBTM": {
      bytomFee = parseInt(parseFloat(gas) * 1000)
      break
    }
    case "NEU": {
      bytomFee = parseInt(gas)
      break
    }
  }
  return bytomFee
}

export {
  sleep,
  Ticker,
  calculateBytomFee
}
