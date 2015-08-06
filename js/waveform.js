/**
 * Created by atronov on 31.07.15.
 */

function WaveForm(analyzerNode, canvas) {
    Visualization.call(this,analyzerNode, canvas);
};

WaveForm.prototype = Object.create(Visualization.prototype);

WaveForm.prototype._draw = function() {
    var width = this.canvas.width;
    var height = this.canvas.height;
    var ctx = this.canvasCtx;
    var buffer = this.buffer;

    this.analyzerNode.getByteTimeDomainData(buffer);
    ctx.clearRect(0,0, width, height);
    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgb(0,255,0)";
    var sliceWidth = width / buffer.length;
    var x = 0;
    ctx.beginPath();
    for(var i = 0; i < buffer.length; i++) {
        var v = buffer[i] / 128.0;
        var y = v * height/2;
        if(i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
        x += sliceWidth;
    }
    ctx.stroke();
};