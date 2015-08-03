/**
 * Created by atronov on 01.08.15.
 */
Equalizer = function(audioCtx, equlizerElement) {
    this.audioCtx = audioCtx;
    this.filters = [];
    this.filters[0] = this._createFilter("lowshelf", 60);
    this.filters[1] = this._createFilter("peaking", 170, 1);
    this.filters[2] = this._createFilter("peaking", 310, 1);
    this.filters[3] = this._createFilter("peaking", 600, 1);
    this.filters[4] = this._createFilter("peaking", 1000, 1);
    this.filters[5] = this._createFilter("peaking", 3000, 1);
    this.filters[6] = this._createFilter("peaking", 6000, 1);
    this.filters[7] = this._createFilter("peaking", 12000, 1);
    this.filters[8] = this._createFilter("peaking", 14000, 1);
    this.filters[9] = this._createFilter("highshelf", 20000);
    // 60, 170, 310, 600, 1000, 3000, 6000, 12000, 14000, 16000
    for (var i = 0; i < this.filters.length; i++) {
        equlizerElement.querySelector(".line"+(i+1)).addEventListener("change", function(filter, e) {
            filter.gain.value = parseFloat(e.target.value);
        }.bind(this, this.filters[i]));
    }
};

Equalizer.prototype._createFilter = function(type, f, q) {
    var filter = this.audioCtx.createBiquadFilter();
    filter.type = type;
    filter.frequency.value = f;
    filter.gain.value = 0;
    if (typeof q !== "undefined") filter.Q.value = q;
    return filter;
};

Equalizer.prototype.testFilter = function(i) {
    var myFrequencyArray = new Float32Array(10);
    [60, 170, 310, 600, 1000, 3000, 6000, 12000, 14000, 16000].forEach(function(el, ind) {
       myFrequencyArray[ind] = el;
    });

    var magResponseOutput = new Float32Array(myFrequencyArray.length);
    var phaseResponseOutput = new Float32Array(myFrequencyArray.length);
    this.filters[i].getFrequencyResponse(myFrequencyArray,magResponseOutput,phaseResponseOutput);
    console.log("Magnitude:", magResponseOutput.join(","));
    console.log("Phase:", phaseResponseOutput.join(","));
};



Equalizer.prototype.connect = function(srcNode, dstNode) {
    this.srcNode = srcNode;
    this.dstNode = dstNode;
    this.srcNode.connect(this.filters[0]);
    this.filters.reduce(function(cur, next) {
        cur.connect(next);
        return next;
    });
    this.filters[this.filters.length - 1].connect(this.dstNode);
};

Equalizer.prototype.disconnect = function() {
    this.srcNode.disconnect();
    this.filters[this.filters.length - 1].disconnect();
    this.srcNode.connect(this.dstNode);
    this.srcNode = undefined;
    this.dstNode = undefined;
};

function getQ(bandwidth){
    // center_frequency / (top_frequency - bottom_frequency)
    return Math.sqrt( Math.pow(2, bandwidth) ) / ( Math.pow(2, bandwidth) - 1 );
}