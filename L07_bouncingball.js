
//  Recap 1
// let picoImage;
// let popSound;
// let x = 0;
// let y = 0;
// let picoWidth = 100;

// function preload() {
//     picoImage = loadImage('assets/pico-a.png');
//     popSound = loadSound('assets/pop.mp3');
// }
// function setup() {
//     createCanvas(600, 400);
// }
// function draw() {
//     background("gray");

//     if (keyIsDown(RIGHT_ARROW)) {
//         x += 5;
//     } else if (keyIsDown(LEFT_ARROW)) {
//         x -= 5;
//     } else if (keyIsDown(DOWN_ARROW)) {
//         y += 5;
//     } else if (keyIsDown(UP_ARROW)) {
//         y -= 5;
//     } 
//     x = constrain(x, 0, width - 100);
//     y = constrain(y, 0, height - 100);
//     createCanvas(600, 400);
//     background("gray");
//     image(picoImage, x, y, picoWidth, 100);
// }
// function keyPressed() {
//     if (keyCode === 32) {
//         popSound.play()
//         picoWidth = 50;

//     }
// }
// function keyReleased() {
//     if (keyCode === 32) {
//         picoWidth = 100;
//     }
// }

let ballX = 300;
let ballY = 200;
let ballsize = 50;
let ballSpeedX = 1;
let ballSpeedY = 1;

function setup() {
    createCanvas(600, 400);
    background(220);
    fill("#a834eb");
}
function draw() {
    ballX += ballSpeedX;
    ballY += ballSpeedY;
    if (ballX <= 0 + ballsize / 2 || ballX >= width - ballsize / 2) {
        ballSpeedX *= random(-0.25, -1.5)
        fill(random(0, 255), random(0, 255), random(0, 255))

    } if (ballY <= 0 + ballsize / 2 || ballY >= height - ballsize / 2) {
        ballSpeedY *= random(-0.25, -1.5)
        fill(random(0, 255), random(0, 255), random(0, 255))
    }
    noStroke();
    circle(ballX, ballY, ballsize);
}