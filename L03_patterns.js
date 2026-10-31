
let colorValue =  0;

function setup() {
    // createCanvas(600, 400);
    createCanvas(200, 200);
    background(220);
  // noLoop(); // Stops continuous drawing
}
  
function draw() {
  // Recap 1: Repeating Circles
  // circle(75,200 ,100)
  // circle(225,200 ,100)
  // circle(375,200 ,100)
  // circle(525,200 ,100)

  // Task 1: Colour Gradient
  // for (let i = 0; i < 5; i++) {
  //   fill(20 + i * 50, 20, 20 + i * 50);
  //   circle(200 + i * 50, 200, 40);
  // }

  // Task 2: Colour Loop
  // circle(100, 100, 100);
  fill(colorValue);
  colorValue++;

  // Task 3: Row of Circles
  // for (let i = 0; i < 10; i++) {
  //   fill(i % 2 * 255);
  //   circle(50 + 50 * i, 100, 50);
  // }

  // Task 4: Grid of Squares
//   for (let row = 0; row < 5; row++) {
//     for (let col = 0; col < 5; col++) {
//       if ((row + col) % 2 == 0) {
//         fill(0)
//       } else {
//         fill(255)
//       }
//       rect(col * 80, row * 80, 80, 80)
//     }
//   }

  let circleDiameter = 30;
  let numCircles = 5;
  let totalWidth = numCircles * circleDiameter;

  let startX = (width - totalWidth) / 2 + circleDiameter / 2;
  let startY = (height - totalWidth) / 2 + circleDiameter / 2;

  for (let row = 0; row < 5; row++) {
    let rowY = startY + (circleDiameter * row)

    for (let i = 0; i < numCircles; i++) {
      let x = startX + i * circleDiameter;
      ellipse(x, rowY, circleDiameter, circleDiameter);
    }
  }
}