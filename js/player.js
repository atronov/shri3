/**
 * Created by atronov on 25.07.15.
 */
var Player = function(element) {
    this.element = element;
    this._init();
    this._initElements();
    this._initEqualizer();
    this._initVisualization();
    this._disablePlay();
    this._updatePlayOrPause();
    this._showTags({}); // показать пустые теги, пока никакой трек не открыт
};

Player.prototype._init = function() {
    this.startedAt = 0;
    this.pausedAfter = 0;
    this.paused = false;
    this.playing = false;
    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
};

Player.prototype._initElements = function() {
    var element = this.element;
    this.elements = {
        play: element.querySelector(".player__play-button"),
        stop: element.querySelector(".player__stop-button"),
        pause: element.querySelector(".player__pause-button"),
        open: element.querySelector(".player__open-button"),
        file: element.querySelector(".player__file-input"),
        dropArea: element.querySelector(".player__drop-area"),
        fileName: element.querySelector(".player__file-name"),
        visualization: {
            canvas: element.querySelector(".player__visualization-canvas"),
            select: element.querySelector(".player__visualization-select")
        },
        tags: {
            title: element.querySelector(".player__title-tag"),
            album: element.querySelector(".player__album-tag"),
            artist: element.querySelector(".player__artist-tag")
        },
        equalizer: element.querySelector(".player__equalizer"),
        error: element.querySelector(".player__error")
    };

    this.elements.play.addEventListener("click", this.play.bind(this));
    this.elements.stop.addEventListener("click", this.stop.bind(this));
    this.elements.pause.addEventListener("click", this.pause.bind(this));
    this.elements.open.addEventListener("click", this.elements.file.click.bind(this.elements.file));
    this.elements.file.addEventListener("change", this._handleFileOpen.bind(this));
    this.elements.dropArea.addEventListener("drop", this._handleFileOpen.bind(this));
    this.element.addEventListener("dragover", this._showDropArea.bind(this));
    this.elements.dropArea.addEventListener("dragleave", this._hideDropArea.bind(this));
};

Player.prototype._initEqualizer = function() {
    this.equalizer = new Equalizer(this.audioCtx, this.elements.equalizer);
};

Player.prototype._initVisualization = function() {
    var visualizations = {
        "spectrum": Spectrum,
        "waveform": WaveForm,
        "none": undefined
    };
    var visualizationSelect = this.elements.visualization.select;
    var selected = false;
    for (var visualizationName in visualizations) {
        var visualization = visualizations[visualizationName];
        var visualizationEl = document.createElement("option");
        visualizationEl.textContent = visualizationName;
        visualizationEl.value = visualizationName;
        if (!selected) {
            this.visualizationConstruntor = visualization;
            visualizationEl.selected = true;
        }
        visualizationSelect.appendChild(visualizationEl);
    }
    visualizationSelect.addEventListener("change", function() {
        var visualizationName = visualizationSelect.value;
        var visualization = visualizations[visualizationName];
        if (!visualization) return;
        this.visualizationConstruntor = visualization;
        if (this.playing) {
            this._connectVisualization();
        }
    }.bind(this));
};

/**
 * Открываем музыкальный файл
 * @param {File} file
 */
Player.prototype.open = function(file) {
    var reader = new FileReader();
    reader.addEventListener("load", function() {
        var fileData = reader.result;
        this.elements.fileName.textContent = file.name;
        var tags = getTags(fileData);
        this._showTags(tags);
        this.audioCtx.decodeAudioData(fileData, function(buffer) {
                if (this.playing) {
                    this.stop();
                }
                this.audioDataBuffer = buffer;
                this._showError(undefined);
                this._allowPlay();
            }.bind(this),
            function(e) {
                console.error("Error with decoding audio data", e);
                this._showError("Impossible to decode this file.");
                if (this.playing) {
                    this.stop();
                }
            }.bind(this)
        );
    }.bind(this));
    reader.readAsArrayBuffer(file);
};

/**
 * Начать воспроизведение
 */
Player.prototype.play = function() {
    if (!this.playing && this.audioDataBuffer) {
        this.audioSource = this.audioCtx.createBufferSource();
        this.audioSource.buffer = this.audioDataBuffer;
        this.audioSource.loop = true;
        this.analyzer = this.audioCtx.createAnalyser();
        this.analyzer.connect(this.audioCtx.destination);
        this.equalizer.connect(this.audioSource, this.analyzer);
        this._connectVisualization();

        if (this.paused) {
            this.startedAt = Date.now() - this.pausedAfter;
            this.audioSource.start(0, Math.round(this.pausedAfter / 1000));
        } else {
            this.startedAt = Date.now();
            this.audioSource.start(0);
        }
        this.playing = true;
        this.paused = false;
        this.pausedAfter = 0;
        this._updatePlayOrPause();
    }
};

/**
 * Приостановить, с возможностью продолжения
 */
Player.prototype.pause = function() {
    this.pausedAfter = Date.now() - this.startedAt;
    if (this.audioDataBuffer) {
        var duration = Math.round(this.audioDataBuffer.duration * 1000);
        this.pausedAfter = this.pausedAfter % duration;
    }
    this.audioSource.stop();
    this.paused = true;
    this.playing = false;
    this._updatePlayOrPause();
};

/**
 * Остановить, воспроизведение начнет трек с начала
 */
Player.prototype.stop = function() {
    this.pausedAfter = 0;
    this.audioSource.stop();
    this.paused = false;
    this.playing = false;
    this._updatePlayOrPause();
};

Player.prototype._connectVisualization = function() {
    if (this.visualization) {
        this.visualization.stop();
    }
    var Visualization =  this.visualizationConstruntor;
    if (Visualization) {
        this.visualization = new Visualization(this.analyzer, this.elements.visualization.canvas);
    }
};

/**
 * Обработчик открытия файла
 * @param e
 * @private
 */
Player.prototype._handleFileOpen = function(e) {
    e.preventDefault();
    this._hideDropArea(e);
    var files = (e.target.files || e.dataTransfer.files);
    if (!files || files.length == 0) return;
    this._disablePlay();
    this.open(files[0]);
};

Player.prototype._showDropArea = function(e) {
    e.preventDefault();
    removeClass("invisible", this.elements.dropArea);
};

Player.prototype._hideDropArea = function(e) {
    e.preventDefault();
    addClass("invisible", this.elements.dropArea);
};

Player.prototype._allowPlay = function() {
    [this.elements.play, this.elements.pause, this.elements.stop].forEach(function(el) {
        el.disabled = false;
    });
};

Player.prototype._disablePlay = function() {
    [this.elements.play, this.elements.pause, this.elements.stop].forEach(function(el) {
        el.disabled = true;
    });
};

Player.prototype._showTags = function(tags) {
    var showTag = function(el, text) {
        if (text) {
            el.querySelector(".tag-content").textContent = text;
            removeClass("invisible", el);
        } else {
            addClass("invisible", el);
        }
    };
    showTag(this.elements.tags.title, tags.title);
    showTag(this.elements.tags.album, tags.album);
    showTag(this.elements.tags.artist, tags.artist);
};

/**
 * Показывает кнопку Play или Pause в зависимости от того, идёт воспроизведение или нет
 * @private
 */
Player.prototype._updatePlayOrPause = function() {
    if (this.playing) {
        var toShow = this.elements.pause;
        var toHide = this.elements.play;
    } else {
        var toHide = this.elements.pause;
        var toShow = this.elements.play;
    }
    var invisibleClass = "invisible";
    addClass(invisibleClass, toHide);
    removeClass(invisibleClass, toShow);
};

/**
 * Показываем сообщение об ошибке
 * @param {string} message; если пустое скрываем предыдущее
 * @private
 */
Player.prototype._showError = function (message) {
    if (message && message.trim().length > 0) {
        this.elements.error.textContent = message;
        removeClass("invisible", this.elements.error);
    } else {
        addClass("invisible", this.elements.error);
    }
};