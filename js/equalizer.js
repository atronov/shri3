/**
 * Created by atronov on 01.08.15.
 */
Equalizer = function(audioCtx, equalizerElement) {
    this.audioCtx = audioCtx;
    this.element = equalizerElement;
    this.enabled = false;
    this.connected = false;
    this._initFilters();
    this._initSwitch();
    this._initPresets();
};

/**
 * Подключаем эквалайзер
 * Сделано в не в конструкторе, чтобы можно было менять источник/приемник в одном экхемпляре
 */
Equalizer.prototype.connect = function(srcNode, dstNode) {
    if (this.srcNode) {
        this.srcNode.disconnect();
    }
    this.filters[this.filters.length-1].disconnect();
    this.srcNode = srcNode;
    this.dstNode = dstNode;
    this.connected = true;
    this._updateState();
};

/**
 * Создаём фильтры и связываем их с эелеиентами на UI
 * @private
 */
Equalizer.prototype._initFilters = function() {
    this.filters = [];
    var maxGain = 12;
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
    this.filters[7] = this._createFilter("peaking", 12000, 1.5);
    this.filters[8] = this._createFilter("peaking", 14000, 1.6);
    // как и с нижней границей, но нужен был highshelf
    this.filters[9] = this._createFilter("peaking", 16000, 1.7);

    this.filterInputs = [];
    for (var i = 0; i < this.filters.length; i++) {
        var filterElement = this.filterInputs[i] = this.element.querySelector(".line"+(i+1));
        filterElement.value = 0;
        filterElement.setAttribute("min", -maxGain);
        filterElement.setAttribute("max", maxGain);
        filterElement.addEventListener("change", function(filter, e) {
            filter.gain.value = parseFloat(e.target.value);
        }.bind(this, this.filters[i]));
    }
};

/**
 * Вешаем события на включатель эквалайзера
 * @private
 */
Equalizer.prototype._initSwitch = function() {
    var switchElement = this.element.querySelector(".equalizer__switch");
    switchElement.checked = this.enabled;
    switchElement.addEventListener("change", function(e) {
        this.enabled = e.target.checked;
        this._updateState();
    }.bind(this));
    this._updateState();
};

/**
 * Создаём предустановленные настройки и связываем их с select элементом на UI
 * @private
 */
Equalizer.prototype._initPresets = function() {
    this.presets = {
        "custom":  undefined, // при выборке этой строки просто ничего не меняемы
        "default": [ 0,  0,  0,  0,  0,  0,  0,  0,  0,  0],
        "pop":     [-2, -1,  0,  2,  4,  4,  2,  0, -1, -2],
        "rock":    [ 5,  4,  3,  1,  0, -1,  1,  3,  4,  5],
        "metal":   [ 3,  6,  6,  7,  6,  4,  6,  0,  3,  7],
        "jazz":    [ 4,  3,  1,  2, -2, -2,  0,  1,  2,  4]
    };
    var presetSelect = this.element.querySelector(".equalizer__preset");
    var defaultSelected = "default"; // эта настройка будет выбрана поумолчанию
    for (var presetKey in this.presets) {
        var presetOption = document.createElement("option");
        presetOption.textContent = presetKey;
        presetOption.value = presetKey;
        if (presetKey === defaultSelected) {
            presetOption.setAttribute("selected", "selected");
        }
        presetSelect.appendChild(presetOption);
    }
    presetSelect.addEventListener("change", function() {
        var presetName = presetSelect.options[presetSelect.selectedIndex].value;
        this._setFilters(this.presets[presetName]);
    }.bind(this));
    // если пользователь изменил один из фильтров, выставляем комбобокс в custom
    var setCustomPreset = function() {
        for (var ind in presetSelect.options) {
            if (presetSelect.options[ind].value === "custom")
                presetSelect.options[ind].setAttribute("selected", "selected");
        }
    };
    this.filterInputs.forEach(function(filterInput) {
        filterInput.addEventListener("change", setCustomPreset.bind(this));
    }.bind(this));
    this._setFilters(this.presets[defaultSelected]);
};

Equalizer.prototype._createFilter = function(type, f, q) {
    var filter = this.audioCtx.createBiquadFilter();
    filter.type = type;
    filter.frequency.value = f;
    filter.gain.value = 0;
    if (typeof q !== "undefined") filter.Q.value = q;
    return filter;
};

Equalizer.prototype._setFilters = function(gains) {
    if (gains) {
        for (var i = 0; i < gains.length; i++) {
            this._setFilter(i, gains[i]);
        }
    }
};

Equalizer.prototype._setFilter = function(i, gain) {
    this.filterInputs[i].value = gain;
    this.filters[i].gain.value = gain;
};

/**
 * Подключает/отключает фильтры соглавно флагам
 * @private
 */
Equalizer.prototype._updateState = function() {
    if (!this.connected) return;
    if (this.enabled) {
        this._enable();
    } else {
        this._disable();
    }
};

/**
 * Подключает фильтры между испочником и приёмником
 * @private
 */
Equalizer.prototype._enable = function() {
    this.srcNode.disconnect();
    this.srcNode.connect(this.filters[0]);
    this.filters.reduce(function(cur, next) {
        cur.connect(next);
        return next;
    })
    this.filterInputs.forEach(function(el) {
        el.disabled = false;
    });
    this.filters[this.filters.length - 1].connect(this.dstNode);
    this.enabled = true;
};

/**
 * Подсоеднияем источник к приёмнику, игнорируя фильтры
 * @private
 */
Equalizer.prototype._disable = function() {
    this.srcNode.disconnect();
    this.filters[this.filters.length - 1].disconnect();
    this.srcNode.connect(this.dstNode);
    this.filterInputs.forEach(function(el) {
        el.disabled = true;
    });
    this.enabled = false;
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
        return Array.prototype.map
            .call(ar, function(f) { return Math.round(f * 100) / 100; })
            .join(",");
    };
    console.log("Magnitude:", printArray(calcMagnitude(freqAr, this.filters[i])));
    console.log("Edges:    ", printArray(calcMagnitude(rangeAr, this.filters[i])));
};