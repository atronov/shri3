/**
 * Created by atronov on 25.07.15.
 */
var Player = function(element) {
    this.element = element;
    this.elements = {
        play: element.querySelector(".player__play-button"),
        stop: element.querySelector(".player__stop-button"),
        pause: element.querySelector(".player__pause-button"),
        file: element.querySelector(".player__file-input"),
        dropArea: element.querySelector(".player__drop-area"),
        title: element.querySelector(".player__title"),
        open: element.querySelector(".player__open-button"),
        visualization: element.querySelector(".player__visualization"),
        equalizer: element.querySelector(".player__equalizer"),
    };
    this.elements.play.addEventListener("click", this.play.bind(this));
    this.elements.stop.addEventListener("click", this.stop.bind(this));
    this.elements.pause.addEventListener("click", this.pause.bind(this));
    this.elements.open.addEventListener("click", this.elements.file.click.bind(this.elements.file));
    this.elements.file.addEventListener("change", this._handleFileOpen.bind(this));
    this.elements.dropArea.addEventListener("drop", this._handleFileOpen.bind(this));
    this.elements.dropArea.addEventListener("dragover", this._showDropArea.bind(this));
    this.elements.dropArea.addEventListener("dragleave", this._hideDropArea.bind(this));

    this._init();
    this._initVisualization();
    this._disablePlay();
};

Player.prototype._init = function() {
    this.startedAt = 0;
    this.pausedAfter = 0;
    this.paused = false;
    this.playing = false;
    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    this.equalizer = new Equalizer(this.audioCtx, this.elements.equalizer);
};

Player.prototype.open = function(file) {
    var reader = new FileReader();
    reader.addEventListener("load", function() {
        var fileData = reader.result;
        this.elements.title.textContent = file.name;
        var tags = getTags(fileData);
        this._showTags(tags);
        this.audioCtx.decodeAudioData(fileData, function(buffer) {
                this.audioDataBuffer = buffer;
                this._allowPlay();
            }.bind(this),
            function(e) {
                console.error("Error with decoding audio data" + e);
            }
        );
    }.bind(this));
    reader.readAsArrayBuffer(file);
};

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
    }
};

Player.prototype.pause = function() {
    this.pausedAfter = Date.now() - this.startedAt;
    this.audioSource.stop();
    this.paused = true;
    this.playing = false;
};

Player.prototype.stop = function() {
    this.pausedAfter = 0;
    this.audioSource.stop();
    this.paused = false;
    this.playing = false;
};

Player.prototype._connectVisualization = function() {
    if (this.visualization) {
        this.visualization.stop();
    }
    var Visualization =  this.visualizationConstruntor;
    this.visualization = new Visualization(this.analyzer, this.elements.visualization);
};

Player.prototype._initVisualization = function() {
    var visualizations = {
        "spectrum": Spectrum,
        "waveform": WaveForm
    };
    var visualizationSelect = this.element.querySelector(".player__visualization-select");
    var selected = false;
    for (var visualizationName in visualizations) {
        var visualization = visualizations[visualizationName];
        var visualizationEl = document.createElement("option");
        visualizationEl.textContent = visualizationName;
        visualizationEl.value = visualizationName;
        if (!selected) {
            this.visualizationConstruntor = visualization;
            visualizationEl.setAttribute("selected", "selected");
        }
        visualizationSelect.appendChild(visualizationEl);
    }
    visualizationSelect.addEventListener("change", function() {
        var visualizationName = visualizationSelect.options[visualizationSelect.selectedIndex].value;
        this.visualizationConstruntor = visualizations[visualizationName];
        if (this.playing) {
            this._connectVisualization();
        }
    }.bind(this));
};

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
    addClass("player__drop-area--hover", this.elements.dropArea);
};

Player.prototype._hideDropArea = function(e) {
    e.preventDefault();
    removeClass("player__drop-area--hover", this.elements.dropArea);
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
    if (tags.title) {
        var titleEl = this.element.querySelector(".player__title-tag");
        titleEl.textContent = tags.title
    }
    if (tags.album) {
        var albumEl = this.element.querySelector(".player__album-tag");
        albumEl.textContent = tags.album;
    }
    if (tags.artist) {
        var artistEl = this.element.querySelector(".player__artist-tag");
        artistEl.textContent = tags.artist;
    }
};