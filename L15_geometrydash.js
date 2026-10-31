
let playerX = 100;
let playerY;
let playerSize = 30;
let velocity = 0;
let isGrounded = false;

let spikesX = [];
let spikeWidth = 20;
let spikeHeight = 30;
let spikeSpeed = 5;

let gameOver = false;

function setup() {
    createCanvas(600, 400);
    textAlign(CENTER, CENTER);
    playerY = height - playerSize;

    for (let i = 0; i < 10; i++) {
        spikesX.push(width + i * 300);
    }
}
function draw() {
    background(220);

    if (!gameOver) {
        velocity += 0.8;
        playerY += velocity;
    
        if (playerY >= height - playerSize) {
            playerY = height - playerSize;
            isGrounded = true;
            velocity = 0;
        } else {
            isGrounded = false;
        }
    
        fill(255, 0, 255);
        rect(playerX, playerY, playerSize, playerSize);
    
        fill(255, 0, 0,);
        for (let i = 0; i < spikesX.length; i++) {
            spikesX[i] -= spikeSpeed;
    
            if (spikesX[i] < -spikeWidth) {
                spikesX[i] = width + random(1000, 3000);
                
            }
    
            triangle(spikesX[i], height, spikesX[i] + spikeWidth / 2, height - spikeHeight, spikesX[i] + spikeWidth, height);

            if (playerX + playerSize > spikesX[i] &&
                playerX < spikesX[i] + spikeWidth &&
                playerY + playerSize > height - spikeHeight) {
                gameOver = true;
            }
        }
    } else {
        fill(0, 0, 0);
        textSize(40);
        text("GGs You Lost.", width / 2 ,height / 2);
    }
}
function keyPressed() {
    if (key === " " && isGrounded === true) {
        velocity = -15;
    }
}