/**
 * Created by atronov on 27.07.15.
 */

/**
 * @param {string} className добавляемый класс
 * @param {HTMLElement} el элемент
 */
function addClass(className, el) {
    var classRegexp = new RegExp("\\b"+className+"\\b");
    if (!el.className.match(classRegexp)) {
        el.className = el.className + " " + className;
    }
}

/**
 * @param {string} className удаляемый класс
 * @param {HTMLElement} el элемент
 */
function removeClass(className, el) {
    var classRegexp = new RegExp("\\b"+className+"\\b");
    if (el.className.match(classRegexp)) {
        el.className = el.className.replace(classRegexp, "");
    }
}