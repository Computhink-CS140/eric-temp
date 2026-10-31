function setup(){
    createCanvas(600, 400);
    background("#5c5c5c");
}

function draw(){
    fill(255, 0, 0);
    ellipse(300,100,100,100);
    
    // Todo: Challenge 3 Traffic Light
    fill(255, 255, 0);
    ellipse(300,200,100,100);

    fill(0, 255, 0);
    ellipse(300,300,100,100);
}