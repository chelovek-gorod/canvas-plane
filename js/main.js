'use strict';

const CANVAS = document.createElement("canvas");
const ctx = CANVAS.getContext('2d');
document.body.append(CANVAS);
CANVAS.requestFullscreen();

const tiles = new Image();
tiles.src = './src/images/tile920_2x2.jpg';
tiles.size = 920;

const map = [
    //   fields        lake        mountains    
    [{x: 0, y: 0}, {x: 0, y: 1}, {x: 1, y: 1}],
    //   lake           City        fields
    [{x: 0, y: 1}, {x: 1, y: 0}, {x: 0, y: 0}],
    // mountains       fields        lake
    [{x: 1, y: 1}, {x: 0, y: 0}, {x: 0, y: 1}]
];
map.forEach(line => line.forEach(tile => {
    tile.x *= tiles.size;
    tile.y *= tiles.size;
    tile.objects = [];
    // tile.staticObjects = [];
    // tile.rotaryObjects = [];
}));
const mapSize = tiles.size * map.length;

let C_WIDTH, C_HEIGHT, VIEW_CX, VIEW_CY, VIEW_RADIUS;
let tilesInRadius, tilesInViewLine, mapTailsBias;

const resize = () => {
    C_WIDTH = CANVAS.width = window.innerWidth;
    C_HEIGHT = CANVAS.height = window.innerHeight;
    VIEW_CX = C_WIDTH / 2;
    VIEW_CY = (C_HEIGHT / 3) * 2;
    VIEW_RADIUS = Math.ceil(Math.sqrt((VIEW_CX ** 2) + (VIEW_CY ** 2)));
    tilesInRadius = Math.ceil(VIEW_RADIUS / tiles.size);
    tilesInViewLine = 1 + (tilesInRadius * 2);
    mapTailsBias = (tilesInViewLine % map.length);

    console.log('C_WIDTH =', C_WIDTH, '; C_HEIGHT =', C_HEIGHT);
    console.log('VIEW_CX =', VIEW_CX, '; VIEW_CY =', VIEW_CY);
    console.log('VIEW_RADIUS =', VIEW_RADIUS);
    console.log('tilesInRadius =', tilesInRadius);
    console.log('tilesInViewLine =', tilesInViewLine);
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

let speed = 3;
let direction = 0;

const RAD = Math.PI / 180;
const getAngle = () => RAD * direction;

const minSpeed = 2;
const cruisingSpeed = 4;
const maxSpeed = 7;

const turnSpeed = 0.02;
let turnK = -1;
const accSpeed = 0.025;
const defSpeed = 0.01;

let toLeftIs = false;
let toRightIs = false;
let accelerationIs = false;
let slowdownIs = false;

function planeMove() {

    if (accelerationIs != slowdownIs) {
        if (accelerationIs && speed < maxSpeed) speed = ((speed + accSpeed) < maxSpeed) ? (speed + accSpeed) : maxSpeed;
        if (slowdownIs && speed > minSpeed) speed = ((speed - defSpeed) > minSpeed) ? (speed - defSpeed) : minSpeed;
    } else if (speed != cruisingSpeed) {
        if (speed < cruisingSpeed) speed = ((speed + defSpeed) < cruisingSpeed) ? (speed + defSpeed) : cruisingSpeed;
        if (speed > cruisingSpeed) speed = ((speed - defSpeed) > cruisingSpeed) ? (speed - defSpeed) : cruisingSpeed;
    }
    
    let angle = getAngle();
    planeMapX -= Math.sin(angle) * speed;
    planeMapY -= Math.cos(angle) * speed;
    
    if (planeMapX < 0) planeMapX += mapSize;
    if (planeMapX >= mapSize) planeMapX = planeMapX - mapSize;
    if (planeMapY < 0) planeMapY += mapSize;
    if (planeMapY >= mapSize) planeMapY = planeMapY - mapSize;
    
}

function isDesktop() {
    var check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
    return check;
};

if (!isDesktop) {

    console.log('ADD CONTROLLER');

    const control_div = document.createElement("div");
    control_div.className = 'control-div';

    const up_btn = document.createElement("img");
    up_btn.src = './src/images/arrow.svg';
    up_btn.className = 'up-btn';
    control_div.append(up_btn);

    const down_btn = document.createElement("img");
    down_btn.src = './src/images/arrow.svg';
    down_btn.style.transform = "rotate(180deg)";
    down_btn.className = 'down-btn';
    control_div.append(down_btn);

    const left_btn = document.createElement("img");
    left_btn.src = './src/images/arrow.svg';
    left_btn.style.transform = "rotate(270deg)";
    left_btn.className = 'left-btn';
    control_div.append(left_btn);

    const right_btn = document.createElement("img");
    right_btn.src = './src/images/arrow.svg';
    right_btn.style.transform = "rotate(90deg)";
    right_btn.className = 'right-btn';
    control_div.append(right_btn);

    document.body.append(control_div);

    up_btn.addEventListener('click', () => {
        if (slowdownIs) slowdownIs = false;
        else accelerationIs = true;
    });

    down_btn.addEventListener('click', () => {
        if (accelerationIs) accelerationIs = false;
        else slowdownIs = true;
    });

    left_btn.addEventListener('click', () => {
        if (toRightIs) toRightIs = false;
        else toLeftIs = true;
    });

    right_btn.addEventListener('click', () => {
        if (toLeftIs) toLeftIs = false;
        else toRightIs = true;
    });

} else {

    console.log('USE KEYBOARD');

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
    
            case 'KeyM' : console.log(map); break;
        }
        console.log('keypress', event.code);
    });
}

/*****************
 *  CLOUDS
 */

const cloudImage64 = new Image();
cloudImage64.src = './src/images/clouds_64.png';

const cloud64Width = 600;
const cloud64Height = 400;
const cloud64HalfWidth = 300;
const cloud64HalfHeight = 200;

const cloudImage83 = new Image();
cloudImage83.src = './src/images/clouds_83.png';

const cloud83Width = 800;
const cloud83Height = 300;
const cloud83HalfWidth = 400;
const cloud83HalfHeight = 150;

class Cloud {

    constructor(type, img, speed, x, y) {
        this.img = (type === 64) ? cloudImage64 : cloudImage83;
        this.frameX = img * ((type === 64) ? cloud64Width : cloud83Width);
        this.frameY = getRandomInt(2) * ((type === 64) ? cloud64Height : cloud83Height);
        this.width = (type === 64) ? cloud64Width : cloud83Width;
        this.height = (type === 64) ? cloud64Height : cloud83Height;
        this.halfWidth = (type === 64) ? cloud64HalfWidth : cloud83HalfWidth;
        this.halfHeight = (type === 64) ? cloud64HalfHeight : cloud83HalfHeight;
        this.x = x - ((type === 64) ? cloud64HalfWidth : cloud83HalfWidth);
        this.y = y - ((type === 64) ? cloud64HalfHeight : cloud83HalfHeight);

        this.speed = speed;
    }

    draw(drawPointX, drawPointY) {
        ctx.drawImage(this.img, this.frameX, this.frameY, this.width, this.height,
            drawPointX + this.x, drawPointY + this.y, this.width, this.height);
    }

    fly(mapTileX, mapTileY) {
        this.x -= this.speed;
        if (this.x < -this.halfWidth) {
            this.x = tiles.size + this.x;
            map[mapTileY][mapTileX].objects = map[mapTileY][mapTileX].objects.filter(cloud => cloud != this);
            let newTileX = (mapTileX > 0) ? mapTileX - 1 : map.length - 1;
            map[mapTileY][newTileX].objects.push(this);
        }
    }

};

function setClouds() {
    for (let i = 0; i < 6; i++) {
        let cloudMapX = getCloudPosition();
        let cloudMapY = getCloudPosition();
        let cloudPositionX = cloudMapX % tiles.size; // px
        let cloudTileX = Math.floor(cloudMapX / tiles.size); // tiles
        let cloudPositionY = cloudMapY % tiles.size; // px
        let cloudTileY = Math.floor(cloudMapY / tiles.size); // tiles
        map[cloudTileY][cloudTileX].objects.push( new Cloud(64, i, getCloudSpeed(), cloudPositionX, cloudPositionY) );
        
        if (i < 4) {
            let cloudMapX = getCloudPosition();
            let cloudMapY = getCloudPosition();
            let cloudPositionX = cloudMapX % tiles.size; // px
            let cloudTileX = Math.floor(cloudMapX / tiles.size); // tiles
            let cloudPositionY = cloudMapY % tiles.size; // px
            let cloudTileY = Math.floor(cloudMapY / tiles.size); // tiles
            map[cloudTileY][cloudTileX].objects.push( new Cloud(83, i, getCloudSpeed(), cloudPositionX, cloudPositionY) );
        }
    }
}
setClouds(); setClouds();

function getRandomInt(size) {
  return Math.floor(Math.random() * size);
}

function getCloudSpeed() {
    return (5 + getRandomInt(5)) / 10;
}

function getCloudPosition() {
    return getRandomInt(mapSize) - 1;
}

/*****************
 *  DRAW
 */

function drawEnvironments() {

    // map.length, mapSize, tiles.size, planeMapX, planeMapY
    // C_WIDTH, C_HEIGHT, VIEW_CX, VIEW_CY, VIEW_RADIUS, tilesInRadius, tilesInViewLine

    let tilePositionX = planeMapX % tiles.size; // px
    let tileX = Math.floor(planeMapX / tiles.size); // tiles

    let tilePositionY = planeMapY % tiles.size; // px
    let tileY = Math.floor(planeMapY / tiles.size); // tiles

    let mapTileX = tilesInViewLine % map.length + tileX - 1; // tiles
    let mapTileY = tilesInViewLine % map.length + tileY - 1; // tiles

    if (mapTileX < 0) mapTileX = map.length - 1; // tiles
    if (mapTileY < 0) mapTileY = map.length - 1; // tiles

    if (mapTileX >= map.length) mapTileX = mapTileX - map.length; // tiles
    if (mapTileY >= map.length) mapTileY = mapTileY - map.length; // tiles

    let drawPointX = VIEW_CX - (tilesInRadius * tiles.size + tilePositionX); // px
    let drawPointY = VIEW_CY - (tilesInRadius * tiles.size + tilePositionY); // px

    ctx.save();
    ctx.translate(VIEW_CX, VIEW_CY);
    ctx.rotate( getAngle() );
    ctx.translate(-VIEW_CX, -VIEW_CY);

    // draw tiles

    let startPointX = drawPointX; // px
    let startTileX = mapTileX; // tiles

    let startPointY = drawPointY; // px
    let startTileY = mapTileY; // tiles

    for (let yy = 0; yy < tilesInViewLine; yy++) {
        for (let xx = 0; xx < tilesInViewLine; xx++) {
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

    // DRAW MAP OBJECTS

    drawPointX = startPointX;
    mapTileX = startTileX;

    drawPointY = startPointY;
    mapTileY = startTileY;

    for (let yy = 0; yy < tilesInViewLine; yy++) {
        for (let xx = 0; xx < tilesInViewLine; xx++) {
            map[mapTileY][mapTileX].objects.forEach( o => o.draw(drawPointX, drawPointY) );

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

    // FLY MAP OBJECTS

    for (let mapTileYY = 0; mapTileYY < map.length; mapTileYY++) {
        for (let mapTileXX = 0; mapTileXX < map.length; mapTileXX++) {
            map[mapTileYY][mapTileXX].objects.forEach( o => o.fly(mapTileXX, mapTileYY) );
        }
    }

    // ROTATION MAP

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
    let animateTimeout = lastAnimateTimestamp - timeStamp;
    lastAnimateTimestamp = timeStamp;

    // CLEAR CANVAS
    ctx.clearRect(0, 0, C_WIDTH, C_HEIGHT);

    drawEnvironments();
    
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