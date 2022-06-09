'use strict';

const btn_start = document.createElement("div");
btn_start.className = 'start-div-btn';
btn_start.innerHTML = '<div> START </div>';

document.body.append(btn_start);

btn_start.onclick = () => startGame();

function startGame() {

    btn_start.remove();

    let mainJS = document.createElement("script");
    mainJS.src = "./js/main.js";
    document.body.append(mainJS);
}