var iso = new Isomer(document.getElementById("snake-canvas"), {scale: 20});

var Shape = Isomer.Shape;
var Plane = Shape.Plane;
var Point = Isomer.Point;
var Color = Isomer.Color;
var snakeColor = new Color(255, 210, 100);
var mazeColor = new Color(35, 35, 40);
var backgroundColor = new Color(10, 10, 10);
var mazeWidth = 20;
var mazeHeight = 20;

var snakePoints = [[3, 0], [2, 0], [1, 0]];
var snakePointsSorted = [];
var snakeDirection = 'n';   // n, e, s, w
var snakeEnlarge = 5;

var loopSpeed = 50;
var loopStart = null;
var loopCount = 0;

var keyAlias = {
  37: 'w',
  38: 'n',
  39: 'e',
  40: 's'
};

function drawSnake() {
  snakePointsSorted.forEach(function (point, i) {
    iso.add(Shape.Prism(Point(point[0], point[1], 0)).
            scale(Point(point[0] + 0.5, point[1] + 0.5, 0), 0.7), snakeColor);
  });
}

function drawMaze() {
  iso.add(Plane(Point.ORIGIN, mazeWidth, mazeHeight), mazeColor);
  iso.add(Plane(Point(mazeWidth, Point.ORIGIN.y), 1, mazeHeight), backgroundColor);
  iso.add(Plane(Point(Point.ORIGIN.x, mazeHeight), mazeWidth+1, 1), backgroundColor);
}

function draw() {
  drawMaze();
  drawSnake();
}

function sortSnake(pointA, pointB) {
  return pointB[0] - pointA[0] + pointB[1] - pointA[1];
}

function checkWalls() {
  var head = snakePoints[0];
  var newHead = getForward();
  var forceDirection = null;
  switch (snakeDirection) {
  case 'n':
    if (newHead[0] > mazeWidth - 1) {
      if (newHead[1] == 0) {
        forceDirection = 'w';
      } else {
        forceDirection = 'e';
      }
    }
    break;
  case 'e':
    if (newHead[1] < 0) {
      if (newHead[0] == 0) {
        forceDirection = 'n';
      } else {
        forceDirection = 's';
      }
    }
    break;
  case 's':
    if (newHead[0] < 0) {
      if (newHead[1] == mazeHeight - 1) {
        forceDirection = 'e';
      } else {
        forceDirection = 'w';
      }
    }
    break;
  case 'w':
    if (newHead[1] > mazeHeight - 1) {
      if (newHead[0] == mazeWidth - 1) {
        forceDirection = 's';
      } else {
        forceDirection = 'n';
      }
    }
    break;
  }
  if (forceDirection) {
    snakeDirection = forceDirection;
  }
}

function getForward() {
  var head = snakePoints[0];
  var newHead;
  switch (snakeDirection) {
  case 'n':
    newHead = [head[0] + 1, head[1]];
    break;
  case 'e':
    newHead = [head[0], head[1] - 1];
    break;
  case 's':
    newHead = [head[0] - 1, head[1]];
    break;
  case 'w':
    newHead = [head[0], head[1] + 1];
    break;
  }
  return newHead;
}

function forwardSnake() {
  var head = snakePoints[0];
  var newHead = getForward();

  snakePoints.unshift(newHead);
  if (!(loopCount % snakeEnlarge == 0)) {
    snakePoints.pop();
  }

  snakePointsSorted = snakePoints.slice(0);
  snakePointsSorted.sort(sortSnake);
}

function updateSnake() {
  checkWalls();
  forwardSnake();
}

function checkSnakeBite() {
  var head = snakePoints[0];
  var tail = snakePoints.slice(0);
  tail.shift();
  return tail.some(function (point) {
    return (head[0] == point[0] && head[1] == point[1]);
  });
}

function restart() {
  setupGame();
}

function update() {
  updateSnake();
  if (checkSnakeBite()) {
    restart();
  }
}

function step(timestamp) {
    if (loopStart === null) {
      loopStart = timestamp;
    }
    if (timestamp - loopStart < loopSpeed) {
        requestAnimationFrame(step);
        return;
    } else {
        loopStart = timestamp;
        loopCount += 1;
    }

    draw();
    update();
    requestAnimationFrame(step);
}

function opossiteDirection(direction) {
  if (direction == 'n') {
    return 's';
  }
  if (direction == 's') {
      return 'n';
  }
  if (direction == 'w') {
      return 'e';
  }
  if (direction == 'e') {
      return 'w';
  }
}

function rightDirection(direction) {
    if (direction == 'n') {
        return 'e';
    }
    if (direction == 's') {
        return 'w';
    }
    if (direction == 'w') {
        return 'n';
    }
    if (direction == 'e') {
        return 's';
    }
}

function onKeyDown(event) {
  if (!(event.keyCode in keyAlias)) {
    return;
  }
  var newDirection = keyAlias[event.keyCode];
  if (opossiteDirection(newDirection) == snakeDirection) {
    return;
  }
  snakeDirection = newDirection;
}

function setupCanvas() {
  document.addEventListener("keydown", onKeyDown, false);
}

function setupGame() {
  snakePoints = [[3, 0], [2, 0], [1, 0]];
  snakePointsSorted = [];
  snakeDirection = 'n';   // n, e, s, w
  snakeEnlarge = 5;
}

function main() {
  setupCanvas();
  setupGame();
  requestAnimationFrame(step);
}

main();
