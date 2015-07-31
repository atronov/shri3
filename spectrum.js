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
    var buffer = new Float32Array(bufferLength);

    var draw = function() {
        var width = this.canvas.width;
        var height = this.canvas.height;
        var ctx = this.canvasCtx;
        this.node.getFloatFrequencyData(buffer);
        ctx.clearRect(0,0, width, height);

        var barWidth = (width / bufferLength) * 2.5;
        var barHeight;
        var x = 0;
        for(var i = 0; i < bufferLength; i++) {
            barHeight = (buffer[i] + 140)*2;

            ctx.fillStyle = 'rgb(' + (barHeight+100) + ',50,50)';
            ctx.fillRect(x,height-barHeight/2,barWidth,barHeight);

            x += barWidth + 1;
        }
    }.bind(this);

    var planDraw = function() {
        draw();
        window.requestAnimationFrame(planDraw);
    };
    planDraw();
};