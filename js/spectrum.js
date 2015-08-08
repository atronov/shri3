/**
 * Created by atronov on 31.07.15.
 */

function Spectrum(analyzerNode, canvas) {
    Visualization.call(this,analyzerNode, canvas);
};

Spectrum.prototype = Object.create(Visualization.prototype);

Spectrum.prototype._draw = function() {
    var barCount = 80;
    var width = this.canvas.width;
    var height = this.canvas.height;
    var ctx = this.canvasCtx;

    var buffer = this.buffer;
    this.analyzerNode.getByteFrequencyData(buffer);

    ctx.clearRect(0,0, width, height);

    var step = buffer.length / barCount;
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
};