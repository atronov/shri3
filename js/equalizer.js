/**
 * Created by atronov on 01.08.15.
 */
Equalizer = function(audioCtx, equalizerElement) {
    this.audioCtx = audioCtx;
    this.enabled = false;
    this.connected = false;
    this.filters = [];
    // частоты взяты из winamp
    // 60, 170, 310, 600, 1000, 3000, 6000, 12000, 14000, 16000
    // значения Q-фактора получены эксперементально
    // по хорошему нужен lowshelf, но работает он плохо, т.к. не позволяет задать Q-фактор
    this.filters[0] = this._createFilter("peaking", 60, 0.7);
    this.filters[1] = this._createFilter("peaking", 170, 1);
    this.filters[2] = this._createFilter("peaking", 310, 1);
    this.filters[3] = this._createFilter("peaking", 600, 1);
    this.filters[4] = this._createFilter("peaking", 1000, 1);
    this.filters[5] = this._createFilter("peaking", 3000, 1);
    this.filters[6] = this._createFilter("peaking", 6000, 1);
    this.filters[7] = this._createFilter("peaking", 12000, 1.5); // получено эксперементально
    this.filters[8] = this._createFilter("peaking", 14000, 1.6); // получено эксперементально
    // как и с нижней границей, но нужен был highshelf
    this.filters[9] = this._createFilter("peaking", 16000, 1.7); // получено эксперементально

    var maxGain = 12;
    for (var i = 0; i < this.filters.length; i++) {
        var filterElement = equalizerElement.querySelector(".line"+(i+1));
        filterElement.value = 0;
        filterElement.setAttribute("min", -maxGain);
        filterElement.setAttribute("max", maxGain);
        filterElement.addEventListener("change", function(filter, e) {
            filter.gain.value = parseFloat(e.target.value);
        }.bind(this, this.filters[i]));
    }

    var switchElement = equalizerElement.querySelector(".equalizer__switch");
    switchElement.checked = this.enabled;
    switchElement.addEventListener("change", function(e) {
        this.enabled = e.target.checked;
        this._updateState();
    }.bind(this));
    this._updateState();
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
    var toFrequency = function(ar) {
        var far = new Float32Array(ar.length);
        ar.forEach(function(el, ind) {
            far[ind] = el;
        });
        return far;
    };
    var freqAr = toFrequency([60, 170, 310, 600, 1000, 3000, 6000, 12000, 14000, 16000]);
    var rangeAr = toFrequency([30, 90, 180, 400, 750, 1800, 4000, 9000, 13000, 15000, 17000 ]);
    var calcMagnitude = function(ar, filter) {
        var magResponseOutput = new Float32Array(ar.length);
        var phaseResponseOutput = new Float32Array(ar.length);
        filter.getFrequencyResponse(ar,magResponseOutput,phaseResponseOutput);
        return magResponseOutput;
    };

    var printArray = function(ar) {
        return ar.map(function(f) { return Math.round(f * 100); }).join(",");
    };
    console.log("Magnitude:", printArray(calcMagnitude(freqAr, this.filters[i])));
    console.log("Edges:    ", printArray(calcMagnitude(rangeAr, this.filters[i])));
};

Equalizer.prototype.connect = function(srcNode, dstNode) {
    this.srcNode = srcNode;
    this.dstNode = dstNode;
    this.connected = true;
    this._updateState();
};

Equalizer.prototype._updateState = function() {
    if (!this.connected) return;
    if (this.enabled) {
        this.enable();
    } else {
        this.disable();
    }
};

Equalizer.prototype.enable = function() {
    this.srcNode.connect(this.filters[0]);
    this.filters.reduce(function(cur, next) {
        cur.connect(next);
        return next;
    });
    this.filters[this.filters.length - 1].connect(this.dstNode);
    this.enabled = true;
};

Equalizer.prototype.disable = function() {
    this.srcNode.disconnect();
    this.filters[this.filters.length - 1].disconnect();
    this.srcNode.connect(this.dstNode);
    this.enabled = false;
};