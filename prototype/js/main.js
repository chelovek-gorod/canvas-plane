'use strict';

const CANVAS = document.createElement("canvas");
const ctx = CANVAS.getContext('2d');

CANVAS.width = 1000;
CANVAS.height = 700;

document.body.append(CANVAS);

const tiles = new Image();
tiles.src = './src/images/map_100x100_3x3.png';
tiles.size = 100;

const map = [
    //     A            B             C   
    [{x: 0, y: 0}, {x: 1, y: 0}, {x: 2, y: 0}],
    //     D            E             F
    [{x: 0, y: 1}, {x: 1, y: 1}, {x: 2, y: 1}],
    //     G            H             J
    [{x: 0, y: 2}, {x: 1, y: 2}, {x: 2, y: 2}]
];
map.forEach(e => e.forEach(c => {
    c.x *= tiles.size;
    c.y *= tiles.size;
    c.objects = [];
}));
const mapSize = tiles.size * map.length; // 300 x 300 px

let C_WIDTH = 1000, C_HEIGHT = 700, VIEW_CX = 500, VIEW_CY = 400, VIEW_RADIUS;
let VIEW_WIDTH = 400, VIEW_HEIGHT = 200, VIEW_X = 300, VIEW_Y = 250;
VIEW_RADIUS = Math.ceil(Math.sqrt((200 ** 2) + (150 ** 2))); // 250 px
let tilesInRadius, tilesInViewLine;
tilesInRadius = Math.ceil(VIEW_RADIUS / tiles.size); // 3 tiles
tilesInViewLine = 1 + (tilesInRadius * 2); // 7 tiles

/*****************
 *  CONTROL
 */

let planeImage = new Image();
planeImage.src = "./src/images/target.png";
let frameSize = 64;
let frameHalfSize = 32;

let planeMapX = mapSize / 2; // 150 px
let planeMapY = mapSize / 2; // 150 px

let speed = 0;
let direction = 0;

const RAD = Math.PI / 180;
const getAngle = () => RAD * direction;

const turnSpeed = 0.3;

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
    planeMapX -= Math.sin(angle) * speed;
    planeMapY -= Math.cos(angle) * speed;

    if (planeMapX < 0) planeMapX += mapSize;
    if (planeMapX >= mapSize) planeMapX = planeMapX - mapSize;
    if (planeMapY < 0) planeMapY += mapSize;
    if (planeMapY >= mapSize) planeMapY = planeMapY - mapSize;

    if (frame % 300 == 0) console.log('plane on map X =', planeMapX, '; Y =', planeMapY, '; Direction =', direction);
    
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
    }
    //console.log('keypress', event.code);
});

/*****************
 *  CLOUDS
 */

const cloudImage = new Image();
cloudImage.src = './src/images/cloud_200x100.png';
 
const cloudWidth = 200;
const cloudHeight = 100;
const cloudHalfWidth = 100;
const cloudHalfHeight = 50;
 
class Cloud {
 
    constructor(speed, x, y) {
        this.x = x - cloudHalfWidth;
        this.y = y - cloudHalfHeight;
        this.speed = speed;
    }
 
    draw(drawPointX, drawPointY) {
        ctx.drawImage(cloudImage, 0, 0, cloudWidth, cloudHeight,
            drawPointX + this.x, drawPointY + this.y, cloudWidth, cloudHeight);
    }
 
    fly(mapTileX, mapTileY) {
        this.x -= this.speed;
        if (this.x < -cloudHalfWidth) {
            this.x = tiles.size + this.x;
            map[mapTileY][mapTileX].objects = map[mapTileY][mapTileX].objects.filter(cloud => cloud != this);
            let newTileX = (mapTileX > 0) ? mapTileX - 1 : map.length - 1;
            map[mapTileY][newTileX].objects.push(this);
        }
    }
 
};
 
function setClouds() {
    let cloud = new Cloud(0.1, 0, 0);
    map[0][0].objects.push(cloud);
    console.log(cloud);

}
setClouds();
 
function getRandomInt(size) {
   return Math.floor(Math.random() * size);
}
 
function getCloudSpeed() {
    return 1 + getRandomInt(10) / 10;
}
 
function getCloudPosition() {
    return getRandomInt(mapSize) - 1;
}

/*****************
 *  DRAW
 */

function drawGround() {

    // map.length, mapSize, tiles.size, planeMapX, planeMapY
    // C_WIDTH, C_HEIGHT, VIEW_CX, VIEW_CY, VIEW_RADIUS, tilesInRadius, tilesInViewLine

    let tilePositionX = planeMapX % tiles.size; // px (start 50 px)
    let tileX = Math.floor(planeMapX / tiles.size); // tiles (start tile[1])

    let tilePositionY = planeMapY % tiles.size; // px (start 50 px)
    let tileY = Math.floor(planeMapY / tiles.size); // tiles (start tile[1])

    //
    let mapTileX = tilesInViewLine % map.length + tileX - 1; // tiles
    let mapTileY = tilesInViewLine % map.length + tileY - 1; // tiles

    if (mapTileX < 0) mapTileX = map.length - 1; // tiles
    if (mapTileY < 0) mapTileY = map.length - 1; // tiles

    if (mapTileX >= map.length) mapTileX = mapTileX - map.length; // tiles
    if (mapTileY >= map.length) mapTileY = mapTileY - map.length; // tiles

    //
    let drawPointX = VIEW_CX - (tilesInRadius * tiles.size + tilePositionX); // px
    let drawPointY = VIEW_CY - (tilesInRadius * tiles.size + tilePositionY); // px

    if(frame % 300 == 0) {
        console.log('tpX =', tilePositionX, '; tpY =', tilePositionY, '; tileX =', tileX, '; tileY =', tileY);
        console.log('dpX =', drawPointX, '; dpY =', drawPointY);
    }

    ctx.save();
    ctx.translate(VIEW_CX, VIEW_CY);
    ctx.rotate( getAngle() );
    ctx.translate(-VIEW_CX, -VIEW_CY);

    // DRAW MAP

    let startPointX = drawPointX; // px
    let startTileX = mapTileX; // tiles

    let startPointY = drawPointY; // px
    let startTileY = mapTileY; // tiles

    
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
        mapTileX = startTileX;
        drawPointY += tiles.size;
        mapTileY++;
        if (mapTileY >= map.length) mapTileY = 0;
    }

    // DRAW OBJECTS

    drawPointX = startPointX;
    mapTileX = startTileX;

    drawPointY = startPointY;
    mapTileY = startTileY;

    for (let yy = 0; yy < tilesInViewLine; yy++) {
        for (let xx = 0; xx < tilesInViewLine; xx++) {
            map[mapTileY][mapTileX].objects.forEach( o => o.draw(drawPointX, drawPointY, mapTileX, mapTileY) );

            drawPointX += tiles.size;
            mapTileX++;
            if (mapTileX >= map.length) mapTileX = 0;
        }
        drawPointX = startPointX;
        mapTileX = startTileX;
        drawPointY += tiles.size;
        mapTileY++;
        if (mapTileY >= map.length) mapTileY = 0;
    }

    ctx.restore();

    // MOVE OBJECTS

    for (let mapTileYY = 0; mapTileYY < map.length; mapTileYY++) {
        for (let mapTileXX = 0; mapTileXX < map.length; mapTileXX++) {
            map[mapTileYY][mapTileXX].objects.forEach( o => o.fly(mapTileXX, mapTileYY) );
        }
    }

    // ROTATION

    if (toLeftIs != toRightIs) {
        if (toLeftIs) direction += turnSpeed;
        else direction -= turnSpeed;
    }

}

/*********************
 *    ANIMATION
 */

let frame = 0;

function animate() {

    // CLEAR CANVAS
    ctx.clearRect(0, 0, C_WIDTH, C_HEIGHT);

    drawGround();
    
    ctx.drawImage(planeImage, 0, 0, frameSize, frameSize, VIEW_CX - frameHalfSize, VIEW_CY - frameHalfSize, frameSize, frameSize);

    planeMove();

    ctx.strokeStyle = 'red';
    ctx.rect(300, 250, 400, 200);
    ctx.stroke();

    frame++;
    window.requestAnimationFrame(animate);
}
animate();