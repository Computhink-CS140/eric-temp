
let inputText;
let displayText = "Your Name Here";
let colourPicker;
let nounField;
let verbField;
let adjectiveField;
let adverbField;
let placeField;
let button;

function setup() {
    createCanvas(600, 400);
    textSize(50);
    textAlign(CENTER, CENTER);
    nounField = createInput();
    verbField = createInput();
    adjectiveField = createInput();
    adverbField = createInput();
    placeField = createInput();
    nounField.position(width / 2, height * 0.2);
    verbField.position(width / 2, height * 0.2 + 50);
    adjectiveField.position(width / 2, height * 0.2 + 100);
    adverbField.position(width / 2, height * 0.2 + 150);
    placeField.position(width / 2, height * 0.2 + 200);

    button = createButton("submit");
    button.position(width / 2, height * 0.2 + 250);
    button.mousePressed(generateStory);
}
function draw() {
    background(220)
    text("Enter a noun: ", width * 0.2, height * 0.2)
    text("Enter a verb: ", width * 0.2, height * 0.2 + 50)
    text("Enter a adjective: ", width * 0.2, height * 0.2 + 100)
    text("Enter a adverb: ", width * 0.2, height * 0.2 + 150)
    text("Enter a place: ", width * 0.2, height * 0.2 + 200)
}
function generateStory() {
    console.log("Button clicked!");
    let noun = nounField.value();
    let verb = verbField.value();
    let adjective = adjectiveField.value();
    let adverb = adverbField.value();
    let place = placeField.value();
    // console.log(noun)
    // console.log(verb)
    // console.log(adjective)
    // console.log(adverb)
    // console.log(place)

    let story = `The ${adjective} ${noun} decided to ${verb} ${adverb} at the ${place}.`
    console.log(story)
}