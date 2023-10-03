let identifiedObject = null;
let posters = []; // Array to store loaded poster images
let fragments = []; // Array to store poster fragments

let numFragments = 30; // Initial number of fragments

let classifier;

function preload() {
  posters.push(loadImage('fanz.jpeg'));
  classifier = ml5.imageClassifier('MobileNet');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  noLoop();
  createCollage(); // Initial collage creation
}

function randomizePosters() {
  fragments = []; // Clear previous fragments

  for (let i = 0; i < numFragments; i++) {
    let poster = random(posters);
    let x = random(width);
    let y = random(height);
    let w = random(600, 600);
    let h = random(600, 600);
    let imgFragment = poster.get(int(random(poster.width - w)), int(random(poster.height - h)), w, h);
    fragments.push({ img: imgFragment, x: x, y: y, w: w, h: h, colors: [] });
  }
}

function createCollage() {
  randomizePosters();
  for (let fragment of fragments) {
    // Use ml5.js to classify the content of the fragment image
    classifier.classify(fragment.img, (error, results) => {
      if (error) {
        console.error(error);
        return;
      }
      fragment.colors = extractColors(fragment.img);
      fragment.objects = results;
    });
  }
}

function extractColors(img) {
  let colors = [];
  for (let i = 0; i < 5; i++) { // Extract dominant colors
    let c = img.get(floor(random(img.width)), floor(random(img.height)));
    colors.push(c);
  }
  return colors;
}

function displayColors(colors) {
  noStroke();
  let rectWidth = width / colors.length;
  for (let i = 0; i < colors.length; i++) {
    fill(colors[i]);
    rect(i * rectWidth, height - 30, rectWidth, 30);
  }
}

function draw() {
  background(255);
  for (let fragment of fragments) {
    image(fragment.img, fragment.x, fragment.y, fragment.w, fragment.h);
  }

  // Display color swatches for the hovered poster
  if (currentHoveredPoster !== null) {
    displayColors(currentHoveredPoster.colors);

    // Display identified object in the middle of the screen
    if (identifiedObject) {
      textAlign(CENTER, CENTER);
      textSize(100);
      fill(255, random(255), random(255)); // Change text color randomly
      text(identifiedObject, width / 2, height / 2);
    }
  }
}

function mouseMoved() {
  // Check if the mouse is over a poster fragment
  currentHoveredPoster = null;
  for (let fragment of fragments) {
    if (mouseX > fragment.x && mouseX < fragment.x + fragment.w &&
        mouseY > fragment.y && mouseY < fragment.y + fragment.h) {
      currentHoveredPoster = fragment;
      break;
    }
  }

  // Identify what's on the poster using ml5.js when the mouse hovers over it
  if (currentHoveredPoster !== null) {
    identifiedObject = currentHoveredPoster.objects[0].label;
  } else {
    identifiedObject = null;
  }
  redraw(); // Redraw canvas to update the displayed object
}
