
// function setup() {
//     createCanvas(600, 400);
//     textAlign(LEFT, CENTER);
//     textSize(24);
//     fill("rgb(150, 0, 255)");
// }
// function draw() {

//     background(220);

//     hour = hour();
//     min = minute();
//     sec = second();

//     timeString = nf(hour, 2) + " : " + nf(min, 2) + " : " + nf(sec, 2);

//     // text(hour, width / 2, height / 2);
//     // text(" :", width / 2 + 25, height / 2);
//     // text(min, width / 2 + 50, height / 2);
//     // text(" :", width / 2  + 75, height / 2);
//     // text(sec, width / 2 + 100, height / 2);
// }






// let intervalid;
// let x = 0;

// function setup() {
//     createCanvas(600, 400);
//     intervalid = setInterval(drawCircle, 10);
// }
// function draw() {
// //    background(220);
// }
// function drawCircle() {
//     clear();
//     circle(x, 50, 20);
//     x += 10;
//     if (x > 200) {
//         x = 0;
//     }
// }
// function mousePressed() {
//     clearInterval(intervalid);
// }





let num = 5;
let intervalid;

function setup() {
    createCanvas(600, 400);
    textSize(50);
    intervalid = setInterval(updateCountdown, 1000);
}
function draw() {
    clear();
    background(220);
    text(num, width / 2, height / 2);
}
function updateCountdown() {
    num -= 1;
    if (num <= 0) {
        num = 0;
        // clearInterval(intervalid);
    }
}
function mousePressed() {
    num = 5;

    //  if (numStart === false) {
    //     numStart = true;
    //     num = 5;
    //     intervalid = setInterval(updateCountdown, 1000);
    //  }
}