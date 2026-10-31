
// recap 1
// let squareX = 0;
// let squareY = 0;
// let squarespeedX = 5;
// let squarespeedY = 5;
// function setup() {
//     createCanvas(600, 400);
//     background(220);
// }
// function draw() {
//     squareX += squarespeedX;
//     squareY += squarespeedY;
//     if (squareX + 100 > width || squareX < 0) {
//         squarespeedX *= -1;
//     } if (squareY + 100 > height || squareY < 0) {
//         squarespeedY *= -1;
//     }
//     fill(255, 0, 255);
//     rect(squareX, squareY, 100, 100);
// }

favouriteFoods = ["Pizza", "Burger", "Sushi", "Tacos", "Pasta"];
function setup() {
    createCanvas(600, 400);
    background(220);
    textSize(random(1, 50));
    textAlign(CENTER, CENTER);
    yPos = height;
    // text("My name is Eric.", 50, 50);
    // text("I am 10 this year.", 50, 100);
    // text("My favourite activity is gaming.", 50, 150);
}
function draw() {
    yPos -= 0.6
    createCanvas(600, 400);
    background(220);
    // text("My favourite foods:", 50, 50);
    for (let i = 0; i < favouriteFoods.length; i++) {
        text((i + 1) + ". " + favouriteFoods[i], 50, yPos + i * 30);
    }
}