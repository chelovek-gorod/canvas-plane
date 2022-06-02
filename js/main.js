'use strict';

const CANVAS = document.createElement("canvas");
const ctx = CANVAS.getContext('2d');
document.body.append(CANVAS);

const tiles = new Image();
tiles.src = './src/images/tile920_2x2.jpg';
tiles.size = 920;

/*
const map = [
    //   fields        lake        mountains    
    [{x: 1, y: 1}, {x: 1, y: 0}, {x: 0, y: 0}],
    //   lake           City        fields
    [{x: 1, y: 0}, {x: 0, y: 1}, {x: 1, y: 1}],
    // mountains       fields        lake
    [{x: 0, y: 0}, {x: 1, y: 1}, {x: 1, y: 0}]
];
*/
const map = [
    //   fields        lake        mountains    
    [{x: 0, y: 0}, {x: 0, y: 0}, {x: 0, y: 0}],
    //   lake           City        fields
    [{x: 1, y: 1}, {x: 0, y: 1}, {x: 1, y: 0}],
    // mountains       fields        lake
    [{x: 0, y: 0}, {x: 0, y: 0}, {x: 0, y: 0}]
];
map.forEach(e => e.forEach(c => {
    c.x *= tiles.size;
    c.y *= tiles.size;
}));

const mapSize = tiles.size * map.length;

let C_WIDTH, C_HEIGHT, VIEW_CX, VIEW_CY, VIEW_RADIUS;
let tilesInRadius, tilesInViewLine;

const resize = () => {
    C_WIDTH = CANVAS.width = window.innerWidth;
    C_HEIGHT = CANVAS.height = window.innerHeight;
    VIEW_CX = C_WIDTH / 2;
    VIEW_CY = (C_HEIGHT / 3) * 2;
    VIEW_RADIUS = Math.ceil(Math.sqrt((VIEW_CX ** 2) + (VIEW_CY ** 2)));
    tilesInRadius = Math.ceil(VIEW_RADIUS / tiles.size);
    tilesInViewLine = 1 + (tilesInRadius * 2);
} 

resize()
window.addEventListener('resize', resize)

/*****************
 *  CONTROL
 */

let planeImage = new Image();
planeImage.src = "./src/images/plane150_30x3.png";

let frameSize = 150;
let frameHalfSize = 75;

let xFrames = 29;
let yFrames = 2;
let frameX = xFrames;
let frameY = 0;

let flyIs = false;

let planeMapX = mapSize / 2;
let planeMapY = mapSize / 2;

let speed = 0;
let direction = 0;

const RAD = Math.PI / 180;
const getAngle = () => RAD * direction;

const minSpeed = 5;
const cruisingSpeed = 3;
const maxSpeed = 1;

const turnSpeed = 0.01;
let turnK = -1;
const accSpeed = 0.01;

let toLeftIs = false;
let toRightIs = false;
let accelerationIs = false;
let slowdownIs = false;

function planeMove() {

    if (accelerationIs != slowdownIs) {
        if (accelerationIs) speed = 1;
        else speed = -1;
    } else speed = 0;
    
    let angle = getAngle();
    planeMapY += Math.cos(angle) * speed;
    planeMapX += Math.sin(angle) * speed;

    if (planeMapX < 0) planeMapX += mapSize;
    if (planeMapX >= mapSize) planeMapX = planeMapX - mapSize;
    if (planeMapY < 0) planeMapY += mapSize;
    if (planeMapY >= mapSize) planeMapY = planeMapY - mapSize;
    
}

document.addEventListener('keydown', (event) => {
    switch(event.code) {
        case 'KeyA' : toLeftIs = true; break;
        case 'KeyD' : toRightIs = true; break;
        case 'KeyW' : accelerationIs = true; break;
        case 'KeyS' : slowdownIs = true; break;
    
        case 'ArrowLeft' : toLeftIs = true; break;
        case 'ArrowRight' : toRightIs = true; break;
        case 'ArrowUp' : accelerationIs = true; break;
        case 'ArrowDown' : slowdownIs = true; break;
    }
});
  
document.addEventListener('keyup', (event) => {
    switch(event.code) {
        case 'KeyA' : toLeftIs = false; break;
        case 'KeyD' : toRightIs = false; break;
        case 'KeyW' : accelerationIs = false; break;
        case 'KeyS' : slowdownIs = false; break;
    
        case 'ArrowLeft' : toLeftIs = false; break;
        case 'ArrowRight' : toRightIs = false; break;
        case 'ArrowUp' : accelerationIs = false; break;
        case 'ArrowDown' : slowdownIs = false; break;

        case 'NumpadAdd' : direction += 45; break;
        case 'NumpadSubtract' : direction -= 45; break;
    }
    console.log('keypress', event.code);
});

/*****************
 *  DRAW
 */

function drawGround() {

    // map.length, mapSize, tiles.size, planeMapX, planeMapY
    // C_WIDTH, C_HEIGHT, VIEW_CX, VIEW_CY, VIEW_RADIUS, tilesInRadius, tilesInViewLine

    let tilePositionX = planeMapX % tiles.size; // px
    let tileX = Math.floor(planeMapX / tiles.size); // tiles

    let tilePositionY = planeMapY % tiles.size; // px
    let tileY = Math.floor(planeMapY / tiles.size); // tiles

    let mapTileX = (tilesInViewLine + tileX) % map.length; // tiles
    let mapTileY = (tilesInViewLine + tileY) % map.length; // tiles

    let drawPointX = VIEW_CX - (tilesInRadius * tiles.size - tilePositionX); // px
    let drawPointY = VIEW_CY - (tilesInRadius * tiles.size - tilePositionY); // px

    ctx.save();
    ctx.translate(VIEW_CX, VIEW_CY);
    ctx.rotate( getAngle() );
    ctx.translate(-VIEW_CX, -VIEW_CY);

    let startPointX = drawPointX; // px
    for (let yy = 0; yy < tilesInViewLine; yy++) {
        for (let xx = 0; xx < tilesInViewLine; xx++) {
            // console.log('mapTileX =', mapTileX, '; mapTileY =', mapTileY, '; (tileY =', tileY, ')');
            ctx.drawImage(
                tiles, map[mapTileY][mapTileX].x, map[mapTileY][mapTileX].y,
                tiles.size, tiles.size, drawPointX, drawPointY, tiles.size, tiles.size);
            drawPointX += tiles.size;
            mapTileX++;
            if (mapTileX >= map.length) mapTileX = 0;
        }
        drawPointX = startPointX;
        drawPointY += tiles.size;
        mapTileY++;
        if (mapTileY >= map.length) mapTileY = 0;
    }

    ctx.restore();

    if (frameY != 0) {
        direction += turnSpeed * frameX * turnK;
    }

}

/*********************
 *    ANIMATION
 */

let lastAnimateTimestamp = Date.now();
let frame = 0;

function animate() { // console.log('frame =', frame);

    // COUNT DELTA TIME
    let timeStamp = Date.now();
    let animateTimeout = lastAnimateTimestamp -timeStamp;
    lastAnimateTimestamp = timeStamp;

    // CLEAR CANVAS
    ctx.clearRect(0, 0, C_WIDTH, C_HEIGHT);

    drawGround();
    
    ctx.drawImage(planeImage,
        frameX * frameSize, frameY * frameSize, frameSize, frameSize,
        VIEW_CX - frameHalfSize, VIEW_CY - frameHalfSize, frameSize, frameSize);

    planeMove();

    let turn_k = 2;
    if (frame % turn_k === 0 && flyIs) {
        if (toLeftIs != toRightIs) {
            if (toRightIs) {
                if (frameY == 0) frameY = 1;
                else if (frameY == 1 && frameX < xFrames) { frameX++; turnK = -1;}
                else if (frameY == 2 && frameX > 0) frameX--;
                else if (frameY == 2 && frameX == 0) frameY = 0;
            } else {
                if (frameY == 0) frameY = 2;
                else if (frameY == 2 && frameX < xFrames) { frameX++; turnK = 1;}
                else if (frameY == 1 && frameX > 0) frameX--;
                else if (frameY == 1 && frameX == 0) frameY = 0;
            }
        } else if (frameY != 0) {
            if (frameX == 0) frameY == 0;
            else frameX--;
        }
    }

    if (!flyIs && frame % 2 === 0) {
        frameX--;
        if (frameX == 0) flyIs = true;

        // console.log('tilesInViewLine', tilesInViewLine);
        // console.log('VIEW_RADIUS', VIEW_RADIUS);
    }

    if (frame % 60 == 0) console.log('direction:', direction, '\nplaneMapX:', planeMapX, '\nplaneMapY:', planeMapY);

    frame++;
    window.requestAnimationFrame(animate);
}
animate();