/**
 * Created by atronov on 26.07.15.
 */
window.addEventListener("load", function() {
// define variables

    var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    var source;

// use XHR to load an audio track, and
// decodeAudioData to decode it and stick it in a buffer.
// Then we put the buffer into the source

    function getData() {
        source = audioCtx.createBufferSource();
        request = new XMLHttpRequest();

        request.open('GET', 'http://mdn.github.io/decode-audio-data/viper.ogg', true);

        request.responseType = 'arraybuffer';


        request.onload = function () {
            var audioData = request.response;

            audioCtx.decodeAudioData(audioData, function (buffer) {
                    source.buffer = buffer;

                    source.connect(audioCtx.destination);
                    source.loop = true;
                    source.start(0);
                },

                function (e) {
                    "Error with decoding audio data" + e.err
                });

        }

        request.send();
    };
    getData();
});
