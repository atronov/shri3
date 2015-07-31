/**
 * Created by atronov on 25.07.15.
 */
var Player = function(element) {
    this.elements = {
        play: element.querySelector(".player__play-button"),
        stop: element.querySelector(".player__stop-button"),
        pause: element.querySelector(".player__pause-button"),
        file: element.querySelector(".player__file-input"),
        dropArea: element.querySelector(".player__drop-area"),
        title: element.querySelector(".player__title"),
        open: element.querySelector(".player__open-button"),
        visualization: element.querySelector(".player__visualization")
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
    this._disablePlay();
};

Player.prototype._init = function() {
    this.startedAt = 0;
    this.pausedAfter = 0;
    this.paused = false;
    this.playing = false;
    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
};

Player.prototype.open = function(file) {
    var reader = new FileReader();
    reader.addEventListener("load", function() {
        this.elements.title.textContent = file.name;
        this.audioCtx.decodeAudioData(reader.result, function(buffer) {
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

        var analizer = this.audioCtx.createAnalyser();
        var visualization = new Spectrum(analizer, this.elements.visualization);

        this.audioSource.connect(analizer);
        analizer.connect(this.audioCtx.destination);

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

        visualization.start();
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

window.addEventListener("load", function() {
    player = new Player(document.querySelector(".player"));
});