/**
 * Created by vkusny on 05.08.15.
 */
function test() {
    var i = document.querySelector(".player__file-input");
    var file = i.files[0];
    var reader = new FileReader();
    reader.addEventListener("load", function() {
        var ar = new Uint8Array(reader.result);
        var tagsAr = ar.subarray(ar.length - 128, ar.length);
        _arrayBufferToString(tagsAr, function(s) {
            console.log(s);
        });
    });
    reader.readAsArrayBuffer(file);
}

function _arrayBufferToString(buf, callback) {
  var bb = new Blob([new Uint8Array(buf)]);
  var f = new FileReader();
  f.onload = function(e) {
    callback(e.target.result);
  };
  f.readAsText(bb);
}