/**
 * Created by atronov on 05.08.15.
 */
window.addEventListener("load", function() {
    // сохраняем экземпляр плеера прямо в widow, чтобы проще отлажтвать
    player = new Player(document.querySelector(".player"));
});