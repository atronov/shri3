/**
 * Created by atronov on 31.07.15.
 */
function Spectrum(analizerNode, canvas) {
    this.node = analizerNode;
    analizerNode.fftSize = 256;
    this.canvas = canvas;
    this.canvasCtx = canvas.getContext("2d");
}

Spectrum.prototype.start = function() {
    var bufferLength = this.node.frequencyBinCount;
    var buffer = new Uint8Array(bufferLength);
    var barCount = 30;
    var step = bufferLength / barCount;

    var draw = function() {
        var width = this.canvas.width;
        var height = this.canvas.height;
        var ctx = this.canvasCtx;
        this.node.getByteFrequencyData(buffer);
        ctx.clearRect(0,0, width, height);

        var barWidth = (width / barCount);
        var barHeight;
        var x = 0;
        for(var i = 0; i < barCount; i++) {
            var bufferValue = buffer[Math.round(step * (i + 0.5))];
            barHeight = Math.round(height / 255 * bufferValue);
            if (barHeight > 0) {
                var gFraction = Math.round((255 - 50) / height * barHeight + 50);
                ctx.fillStyle = 'rgb(50,'+gFraction+',50)';
                ctx.fillRect(x, height - barHeight, barWidth - 1, barHeight);
            }
            x += barWidth + 1;
        }
    }.bind(this);

    var planDraw = function() {
        draw();
        window.requestAnimationFrame(planDraw);
    };
    planDraw();
};

Spectrum.prototype.stop = function() {

};