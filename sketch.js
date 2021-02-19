/* eslint-disable no-undef */

let snake;
let rez = 20;
let food;
let w;
let h;

let video;
let poseNet;
let pose;
let skeleton;

let brain;
let poseLabel = "Y";

let snakeAnimation;
let spritefood;
let snakeblock;

let msg;
let state;
let videoImg;
let score;
let highScore = 0;

let trainingPause = 300;
let startTime;

function preload() {
  snakeAnimation = createImg(
    "https://cdn.glitch.com/9b17d982-325c-454e-a022-1b4b60be03b7%2Fde9175e6-fc4e-4f76-96b0-9c6df7c48389_Snake%20head%20kill%202.gif?v=1605791352043"
  );
  spritefood = createImg(
    "https://cdn.glitch.com/9b17d982-325c-454e-a022-1b4b60be03b7%2Fde9175e6-fc4e-4f76-96b0-9c6df7c48389_Food.png?v=1605791349948"
  );
  /*snakeblock = createImg(
    "https://cdn.glitch.com/9b17d982-325c-454e-a022-1b4b60be03b7%2Fde9175e6-fc4e-4f76-96b0-9c6df7c48389_Snake%20block%202.png?v=1605791354154"
  );
  */
  snakeblock = loadImage("https://cdn.glitch.com/9b17d982-325c-454e-a022-1b4b60be03b7%2Fde9175e6-fc4e-4f76-96b0-9c6df7c48389_Snake%20block%202.png?v=1605791354154"
  );

  snakeAnimation.hide();
  spritefood.hide();
  //snakeblock.hide();
}

function setup() {
  canvas = createCanvas(650, 650);
  w = floor(width / rez);
  h = floor(height / rez);
  frameRate(10);

  startTime = Date.now();

  canvas.parent("sketch-holder");
  snakeAnimation.parent("sketch-holder");
  spritefood.parent("sketch-holder");
  //snakeblock.parent("sketch-holder");

  snakeAnimation.size(rez, rez);
  spritefood.size(rez, rez);
  //following line replaced by line 41 current - image(img, rez, rez);
  //snakeblock.size(rez, rez);

  msg = createDiv();
  msg.parent("sketch-holder");
  msg.position(0, -40);

  startGame();

  //========================Begin TeachableMachine Segment==========================

  //PoseNet?
  video = createCapture(VIDEO);
  video.hide();
  console.log("video captured");
  poseNet = ml5.poseNet(video, modelLoaded);
  poseNet.on("pose", gotPoses); //gotPoses never runs:o:o:o
  //end PoseNet?

  let options = {
    inputs: 34,
    outputs: 4,
    task: "classification",
    debug: true
  };
  brain = ml5.neuralNetwork(options);

  msg.html("get in camera");
  setTimeout(runDataCollection, 3000);

  //this runs
  // const modelInfo = {
  //   model: "model.json",
  //   metadata: "model_meta.json",
  //   weights:
  //     "https://cdn.glitch.com/9b17d982-325c-454e-a022-1b4b60be03b7%2Fmodel.weights.bin?v=1605543149795"
  //   //"https://cdn.glitch.com/9b17d982-325c-454e-a022-1b4b60be03b7%2Fmodel.weights%20(1).bin?v=1603724630091"
  // };
  // console.log(brain);
  //brain.load(modelInfo, brainLoaded);
  //brain.loadData('model.json', dataReady);
}

function brainLoaded() {
  console.log("pose classification ready!");
  classifyPose();
}

function modelLoaded() {
  console.log("model ready!");
}

function dataReady() {
  brain.normalizeData();
  brain.train(
    {
      epochs: 50
    },
    finished
  );
}
function classifyPose() {
  if (pose) {
    let inputs = [];
    for (let i = 0; i < pose.keypoints.length; i++) {
      let x = pose.keypoints[i].position.x;
      let y = pose.keypoints[i].position.y;
      inputs.push(x);
      inputs.push(y);
    }
    brain.classify(inputs, gotResult);
  } else {
    setTimeout(classifyPose, 100);
  }
}

function gotResult(error, results) {
  //console.log(error);
  if (results[0].confidence > 0.75) {
    poseLabel = results[0].label.toUpperCase();
    //console.log(poseLabel);
    //msg.html("I see " + poseLabel);
  }
  if (poseLabel == "L") {
    snake.setDir(-1, 0);
  }
  if (poseLabel == "R") {
    snake.setDir(1, 0);
  }
  if (poseLabel == "U") {
    snake.setDir(0, -1);
  }
  if (poseLabel == "D") {
    snake.setDir(0, 1);
  }

  classifyPose();
}

function gotPoses(poses) {
  // console.log(poses);
  if (poses.length > 0) {
    pose = poses[0].pose;
    skeleton = poses[0].skeleton;
    if (state == "collecting") {
      let inputs = [];
      for (let i = 0; i < pose.keypoints.length; i++) {
        let x = pose.keypoints[i].position.x;
        let y = pose.keypoints[i].position.y;
        inputs.push(x);
        inputs.push(y);
      }
      let target = [targetLabel];
      brain.addData(inputs, target);
    }
  }
}

function foodLocation() {
  let x = floor(random(w));
  let y = floor(random(h));
  food = createVector(x, y);

  //show food
  spritefood.position(food.x * rez, food.y * rez);
  spritefood.show();

  //show food
  // noStroke();
  // fill(255, 0, 0);
  // rect(food.x, food.y, 1, 1);
}

function keyPressed() {
  if (keyCode === LEFT_ARROW) {
    snake.setDir(-1, 0);
  } else if (keyCode === RIGHT_ARROW) {
    snake.setDir(1, 0);
  } else if (keyCode === UP_ARROW) {
    snake.setDir(0, -1);
  } else if (keyCode === DOWN_ARROW) {
    snake.setDir(0, 1);
  }

  if (key == "s") {
    brain.saveData();
  }
  if (key == "r") {
    startGame();
  }
}

function draw() {
  //scale(rez);
  background(220);
  if (state != "playing") {
    drawPoses();
  } else {
    //score = (Date.now() - startTime) / 1000;

    if (score > highScore) {
      highScore = score;
    }
    msg.html("I see " + poseLabel + ". SCORE = " + score + " // HIGH SCORE = " + highScore);
  }
  if (snake.eat(food)) {
    foodLocation();
    score++;
  }
  snake.update();
  snake.show();

  if (snake.endGame()) {
    print("END GAME");
    background(255, 0, 0);
    noLoop();
    setTimeout(startGame, 5000);
  }
}

function startGame() {
  snake = new Snake(snakeAnimation, snakeblock);
  foodLocation();
  loop();
  startTime = Date.now();
  score = 0;
  //snakeblock.hide();
}

function drawPoses() {
  push();
  translate(video.width, 0);
  scale(-1, 1);
  image(video, 0, 0, video.width, video.height);

  if (pose) {
    for (let i = 0; i < skeleton.length; i++) {
      let a = skeleton[i][0];
      let b = skeleton[i][1];
      strokeWeight(2);
      stroke(0);

      line(a.position.x, a.position.y, b.position.x, b.position.y);
    }
    for (let i = 0; i < pose.keypoints.length; i++) {
      let x = pose.keypoints[i].position.x;
      let y = pose.keypoints[i].position.y;
      fill(0);
      stroke(255);
      ellipse(x, y, 16, 16);
    }
  }
  pop();

  // fill(255, 0, 255);
  // noStroke();
  // textSize(512);
  // textAlign(CENTER, CENTER);
  // text(poseLabel, width / 2, height / 2);
}

let labels = ["N", "L", "R", "U", "D"];
function runDataCollection() {
  setTimeout(function() {
    collect(0);
  }, trainingPause);
}

function collect(i) {
  let label = labels[i];
  msg.html("get in position for " + label);
  targetLabel = label;
  setTimeout(function() {
    msg.html("collecting " + label);
    state = "collecting";
    setTimeout(function() {
      msg.html("done collecting " + label);
      state = "waiting";
      setTimeout(function() {
        if (i < labels.length - 1) {
          collect(i + 1);
        } else {
          state = "training";
          msg.html("training");
          brain.normalizeData();
          brain.train({ epochs: 50 }, finishedTraining);
        }
      }, trainingPause);
    }, trainingPause);
  }, trainingPause);
}

function finishedTraining() {
  console.log("model trained");
  //brain.save();
  msg.html("READY TO PLAY");
  state = "playing";
  startGame();
  classifyPose();
}
