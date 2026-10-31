
let button;
let inputField;
let displayText = "TYPE SOMETHING";
let wordArray = ["claustraphobic", "rhombohedron", "cataracts", "tripophobia", "geography", "hippopotamus","Pseudopseudohypoparathyroidism", "Supercalifragilisticexpialidocious", "Antidisestablishmentarianism"];
let randomWord;
let displayHint;

function setup() {
    createCanvas(600, 400);
    background(220);
    textSize(20);
    textAlign(CENTER, CENTER);

    let inputX = this.canvas.offsetLeft + (width / 2) - 80;
    let inputY = this.canvas.offsetTop + (height / 2) - 10;
    inputField = createInput();
    inputField.position(inputX, inputY);

    inputField.size(150, 30);
    inputField.style("background-color", "lightblue");
    inputField.style("font-size", "20px");
    inputField.style("border", "1px solid black");
    inputField.style("color", "purple");
    inputField.style("text-align", "center");

    button = createButton("submit");
    button.position(width / 3 + 75, height * 0.2 + inputY);
    button.mousePressed(submitGuess);

    randomWord = random(wordArray);
    displayHint = randomWord[0].toUpperCase() + " _".repeat(randomWord.length - 1)
    text(displayHint, width / 2, height * 0.4);
}

function submitGuess() {
    let inputText = inputField.value();
    // background(220);
    fill(random(0, 255), random(0, 255), random(0, 255));
    text(inputText, width / 2, 100);
    let letters = correctGuess(inputText, randomWord);
    console.log(letters)

}
function correctGuess(guess, word) {
    let correctletters = "";
    for (let i = 0; i < word.length; i++) {
        if (word.includes(guess[i]) && !correctletters.includes(guess[i])) {
            correctletters += guess[i];
        }
    }
    return correctletters;
}