/**
 * Created by atronov on 25.07.15.
 */
var Player = function(element) {
    this.element = element;
    this._init();
};

Player.prototype._init = function() {
    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    this.initFileOpen();
};

Player.prototype.initFileOpen = function() {
    var self = this;
    var fileElement = this.element.querySelector(".player__file-input");
    var soundSource = self.audioCtx.createBufferSource();
    fileElement.addEventListener("change", function() {
        if (fileElement.files.length == 0) return;
        var reader = new FileReader();
        reader.addEventListener("load", function() {

            request = new XMLHttpRequest();

            request.open('GET', 'http://mdn.github.io/decode-audio-data/viper.ogg', true);

            request.responseType = 'arraybuffer';


            request.onload = function () {
                var data = request.response;
                data = reader.result;


                // var data = reader.result.slice(0, reader.result.byteLength);
                self.audioCtx.decodeAudioData(data, function(buffer) {
                        console.log("success from my");
                        soundSource.buffer = buffer;

                    },
                    function(e) {
                        console.error("Error with decoding audio data" + e.err);
                    }
                );

                //self.audioCtx.decodeAudioData(data, function (buffer) {
                //        console.log("Success from other");
                //        // source.buffer = buffer;
                //
                //    },
                //
                //    function (e) {
                //        "Error with decoding audio data" + e.err
                //    });

            }

            request.send();

        });
        reader.readAsArrayBuffer(fileElement.files[0]);
    });
};

window.addEventListener("load", function() {
    new Player(document.querySelector(".player"));
});