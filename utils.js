/**
 * Created by atronov on 27.07.15.
 */
function addClass(className, el) {
    console.log("Addition");
    var classRegexp = new RegExp("\\b"+className+"\\b");
    if (!el.className.match(classRegexp)) {
        el.className = el.className + " " + className;
    }
};

function removeClass(className, el) {
    console.log("Remove");
    var classRegexp = new RegExp("\\b"+className+"\\b");
    if (el.className.match(classRegexp)) {
        el.className = el.className.replace(classRegexp, "");
    }
}