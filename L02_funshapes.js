/*
Task 1: Add the setup() function
*/
function setup() {
  createCanvas(600, 400);
  background("#00ffc0")
}

function draw() {
  // Challenge 1: An eye using ellipse() function
  // ellipse(300,200,500,250);
  // ellipse(300,200,125,250);
  // ellipse(300,200,125,62.5);

  // Challenge 2: A face using circle() function
  // circle(100, 75, 100);
  // circle(400, 75, 100);
  // circle(250, 200, 300);
  // circle(175, 175, 50);
  // circle(325, 175, 50);
  // ellipse(250,260,150,100);

  // Challenge 3: A house using rect() function
  // rect(50, 50, 450, 300);
  // circle(150, 150, 75);
  // circle(400, 150, 75);
  // rect(225, 200, 100, 150);
  // circle(250, 260, 25);

  // Challenge 4: A rocketship using triangle() function
  // ellipse(300,200,200,275);
  // triangle(300, 10, 400, 150, 200, 150);
  // circle(300, 200, 50);
  // rect(200, 300, 200, 50)
  
  // Challenge 5: A square face using quad() function
  strokeWeight(5);
  stroke("#e3b878");
  fill("#f7ddb5");
  quad(500,50, 100,50, 100,350, 500,350);
  strokeWeight(0);
  fill("#000000");
  circle(200, 175, 50);
  circle(400, 175, 50);
  strokeWeight(3);
  stroke("#ff7b56");
  fill("#ff5656");
  quad(450,250, 150,250, 200,300, 400,300);

  // Challenge 6: Add some colours to the drawings in the above challenges

  // Challenge 7: Create a funny Pokemon
}