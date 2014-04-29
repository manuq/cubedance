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

var snakePoints = [Point(3, 0, 0), Point(2, 0, 0), Point(1, 0, 0)];
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
    iso.add(Shape.Prism(point).
            scale(Point(point.x + 0.5, point.y + 0.5, point.z + 0.5), 0.7), snakeColor);
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
  return pointB.x - pointA.x + pointB.y - pointA.y;
}

function checkWalls() {
  var head = snakePoints[0];
  var newHead = getForward();
  var forceDirection = null;
  switch (snakeDirection) {
  case 'n':
    if (newHead.x > mazeWidth - 1) {
      if (newHead.y == 0) {
        forceDirection = 'w';
      } else {
        forceDirection = 'e';
      }
    }
    break;
  case 'e':
    if (newHead.y < 0) {
      if (newHead.x == 0) {
        forceDirection = 'n';
      } else {
        forceDirection = 's';
      }
    }
    break;
  case 's':
    if (newHead.x < 0) {
      if (newHead.y == mazeHeight - 1) {
        forceDirection = 'e';
      } else {
        forceDirection = 'w';
      }
    }
    break;
  case 'w':
    if (newHead.y > mazeHeight - 1) {
      if (newHead.x == mazeWidth - 1) {
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
    newHead = Point(head.x + 1, head.y, 0);
    break;
  case 'e':
    newHead = Point(head.x, head.y - 1, 0);
    break;
  case 's':
    newHead = Point(head.x - 1, head.y, 0);
    break;
  case 'w':
    newHead = Point(head.x, head.y + 1, 0);
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
    return (head.x == point.x && head.y == point.y);
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
  snakePoints = [Point(3, 0, 0), Point(2, 0, 0), Point(1, 0, 0)];
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
