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

var snake;
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

var Snake = function (startPoint, direction) {
  direction = direction || 'n';

  this.points = [startPoint];
  this.pointsSorted = [startPoint];
  this.direction = direction;
}

Snake.prototype.increase = function () {
  var head = this.points[0];
  var newHead = getForwardPoint(head, this.direction);

  this.points.unshift(newHead);
}

Snake.prototype.decrease = function () {
  this.points.pop();
}

Snake.prototype.forward = function () {
  this.increase();

  if (!(loopCount % snakeEnlarge == 0)) {
    this.decrease();
  }
}

Snake.prototype.updatePointsSorted = function () {
  this.pointsSorted = this.points.slice(0);
  this.pointsSorted.sort(sortPoints);
}

Snake.prototype.turnOnWalls = function () {
  var head = this.points[0];
  var newHead = getForwardPoint(head, this.direction);
  var forceDirection = null;
  switch (this.direction) {
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
    this.direction = forceDirection;
  }
}

Snake.prototype.checkBitesItself = function() {
  var head = this.points[0];
  var tail = this.points.slice(0);
  tail.shift();
  return tail.some(function (point) {
    return (head.x == point.x && head.y == point.y);
  });
}


function drawSnake(snake) {
  snake.pointsSorted.forEach(function (point, i) {
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
  drawSnake(snake);
}

function sortPoints(pointA, pointB) {
  return pointB.x - pointA.x + pointB.y - pointA.y;
}

function getForwardPoint(point, direction) {
  var forwardPoint;
  switch (direction) {
  case 'n':
    forwardPoint = Point(point.x + 1, point.y, 0);
    break;
  case 'e':
    forwardPoint = Point(point.x, point.y - 1, 0);
    break;
  case 's':
    forwardPoint = Point(point.x - 1, point.y, 0);
    break;
  case 'w':
    forwardPoint = Point(point.x, point.y + 1, 0);
    break;
  }
  return forwardPoint;
}

function updateSnake() {
  snake.turnOnWalls();
  snake.forward();
  snake.updatePointsSorted();
}

function restart() {
  setupGame();
}

function update() {
  updateSnake();
  if (snake.checkBitesItself()) {
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
  if (opossiteDirection(newDirection) == snake.direction) {
    return;
  }
  snake.direction = newDirection;
}

function setupCanvas() {
  document.addEventListener("keydown", onKeyDown, false);
}

function setupGame() {
  snake = new Snake(Point(1, 0, 0));
  snake.increase();
  snake.increase();
}

function main() {
  setupCanvas();
  setupGame();
  requestAnimationFrame(step);
}

main();
