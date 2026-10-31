let shapecolour = "#ff0000"
let perivousmouseX = 50
let circlesize = 0

function setup() {
    createCanvas(600, 400);
    background(225);
//   noLoop(); // Stops continuous drawing
}

// function draw() {
//     fill(shapecolour);
// }

// function mousePressed() {
//     let randomcolour = color(random(255), random(255), random(255));
//     fill(randomcolour);
//     noStroke();
//     ellipse(200, 200, 80, 80)
// }

// function mouseReleased() {
//     fill("#ffffff")
//     ellipse(200, 200, 80, 80)
// }

// function mouseMoved() {
    
//     if (perivousmouseX < mouseX) {
//         circlesize++
//     } else {
//         circlesize--
//     }
//     perivousmouseX = mouseX;
//     background('white');
//     ellipse(300, 200, circlesize, circlesize);

    // let randomcolour = color(random(255), random(255), random(255));
    // fill(randomcolour);
    // ellipse(mouseX, mouseY, 10, 10);
// }

function mouseDragged() {
    for (let i = 0; i < 5; i++) {
        let randomsize = random(10, 15);
        let randomcolour = color(random(255), random(255), random(255));
        let randomY = random(mouseY - 10, mouseY + 10);
        let randomX = random(mouseX - 10, mouseX + 10);
        fill(randomcolour)
        circle(randomX, randomY, randomsize,)
    }
}