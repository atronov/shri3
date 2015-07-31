/**
 * Created by atronov on 31.07.15.
 */
function WaveForm(analizerNode, canvas) {
    this.node = analizerNode;
    analizerNode.fftSize = 256;
    this.canvas = canvas;
    this.canvasCtx = canvas.getContext("2d");
}

WaveForm.prototype.start = function() {
    var bufferLength = this.node.frequencyBinCount;
    var buffer = new Uint8Array(bufferLength);

    var draw = function() {
        var width = this.canvas.width;
        var height = this.canvas.height;
        var ctx = this.canvasCtx;
        this.node.getByteTimeDomainData(buffer);
        ctx.clearRect(0,0, width, height);
        ctx.lineWidth = 2;
        ctx.strokeStyle = "rgb(0,255,0)";
        var sliceWidth = width * 1.0 / bufferLength;
        var x = 0;
        ctx.beginPath();
        for(var i = 0; i < bufferLength; i++) {
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
    }.bind(this);

    var planDraw = function() {
        draw();
        window.requestAnimationFrame(planDraw);
    };
    planDraw();
};