
let inputText;
let displayText = "Your Name Here";
let colourPicker;

function setup() {
    createCanvas(600, 400);
    textSize(50);
    textAlign(CENTER, CENTER);
    let inputX = this.canvas.offsetLeft + (width / 2) - 80;
    let inputY = this.canvas.offsetTop + (height / 2) - 10;
    inputText = createInput();
    inputText.position(inputX, inputY);
    inputText.input(updateText);

    colourPicker = createColorPicker(color(200, 0, 255));
    let colourX = this.canvas.offsetLeft + (width / 2);
    let colourY = this.canvas.offsetTop + (height * 0.7);
    colourPicker.position(colourX, colourY);
}
function draw() {
    background(colourPicker.value());
    text(displayText, width / 2, height * 0.3);
}
function updateText() {
    displayText = this.value();
    console.log(displayText);
}