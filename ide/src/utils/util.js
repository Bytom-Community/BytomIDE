
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function Ticker(fn, t) {
    var timerObj = setInterval(fn, t)
    this.stop = function() {
        if (timerObj) {
            clearInterval(timerObj);
            timerObj = null;
        }
        return this;
    }
    // start timer using current settings (if it's not already running)
    this.start = function() {
        if (!timerObj) {
            this.stop();
            timerObj = setInterval(fn, t);
        }
        return this;
    }
    // start with new interval, stop current interval
    this.reset = function(newT) {
        t = newT;
        return this.stop().start();
    }

    this.interval = function() {
        return t
    }
}

export {
    sleep,
    Ticker
}