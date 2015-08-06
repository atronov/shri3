/**
 * Created by atronov on 06.08.15.
 */
/**
 * Created by atronov on 31.07.15.
 */

function Visualization(analyzerNode, canvas) {
    this.canvas = canvas;
    this.canvasCtx = canvas.getContext("2d");
    this.analyzerNode = analyzerNode;
    this.analyzerNode.fftSize = 256;

    var bufferLength = this.analyzerNode.frequencyBinCount;
    // сохраним буфер в экземпяре, чтобы не создавать его каждый раз
    this.buffer = new Uint8Array(bufferLength)

    var planDraw = function() {
        this._draw();
        if (!this.needStop) {
            window.requestAnimationFrame(planDraw);
        }
    }.bind(this);
    planDraw();
};

Visualization.prototype._draw = function() {
    throw new Error("_draw method must be overridden.");
};

Visualization.prototype.stop = function() {
    this.needStop = true;
};
