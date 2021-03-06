var iso = new Isomer(document.getElementById("snake-canvas"), {scale: 20});

var Shape = Isomer.Shape;
var Plane = Shape.Plane;
var Point = Isomer.Point;
var Color = Isomer.Color;

var color1 = new Color(60, 70, 70);
var color2 = new Color(255, 210, 100);
var color3 = new Color(210, 255, 100);
var color4 = new Color(100, 210, 255);
var color5 = new Color(255, 100, 120);

var defaultColor = color2;

var colorPattern1 = [color1, color2, color2, color2];
var colorPattern2 = [color4, color5];
var colorPattern3 = [color4, color3, color2, color2];

var mazeColor = new Color(35, 35, 40);
var backgroundColor = new Color(10, 10, 10);

var mazeWidth = 20;
var mazeHeight = 20;

var snakeList;

var loopSpeed = 50;
var loopStart = null;
var loopCount = 0;

var keyboardDirection = null;
var keyAlias = {
  37: 'w',
  38: 'n',
  39: 'e',
  40: 's'
};

function ColorPoint(point, color) {
  point.color = color;
  return point;
}

var Snake = function (startPoint, direction, colorPattern) {
  direction = direction || 'n';
  colorPattern = colorPattern || [defaultColor];

  this.points = [ColorPoint(startPoint, colorPattern[0])];
  this.direction = direction;
  this.colorPattern = colorPattern;
  this.colorIdx = 0;
  this.insert(startPoint);
}

Snake.prototype.insert = function (point) {
  var color = this.getColor();
  var newPoint = ColorPoint(point, color);
  this.points.unshift(newPoint);
}

Snake.prototype.setPattern = function (colorPattern) {
  this.colorPattern = colorPattern;
  if (this.colorIdx > this.colorPattern.length-1) {
    this.colorIdx = 0;
  }
}

Snake.prototype.getColor = function () {
  var color = this.colorPattern[this.colorIdx];
  this.colorIdx += 1;
  if (this.colorIdx > this.colorPattern.length-1) {
    this.colorIdx = 0;
  }
  return color;
}

Snake.prototype.increase = function (count) {
  count = count || 1;

  for (i = 0; i < count; i++) {
    var head = this.points[0];
    var newHead = getForwardPoint(head, this.direction);
    this.insert(newHead);
  }
}

Snake.prototype.decrease = function (count) {
  count = count || 1;

  for (i = 0; i < count; i++) {
    this.points.pop();
  }
}

Snake.prototype.forward = function (count) {
  count = count || 1;

  this.increase(count);
  this.decrease(count);
}

Snake.prototype.forwardGrowing = function (growCount, count) {
  count = count || 1;

  this.increase();

  if (!(loopCount % growCount == 0)) {
    this.decrease();
  }
}

Snake.prototype.useKeyboardDirection = function () {
  if (!keyboardDirection) {
    return;
  }
  if (opossiteDirection(keyboardDirection) == this.direction) {
    return;
  }
  this.direction = keyboardDirection;
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

Snake.prototype.makeCircles = function (count) {
  if (loopCount % count == 0) {
    this.direction = rightDirection(this.direction);
  }
  this.forward();
}

Snake.prototype.update = function () {
  // make something!
}

function drawSnakes() {
  var points = [];
  snakeList.forEach(function (snake) {
    points = points.concat(snake.points);
  });

  points.sort(sortPoints);

  points.forEach(function (point) {
    if (!(isOutsideMaze(point))) {
      iso.add(Shape.Prism(point).
              scale(Point(point.x + 0.5, point.y + 0.5, point.z + 0.5), 0.7), point.color);
    }
  });
}

function drawMaze() {
  iso.add(Plane(Point.ORIGIN, mazeWidth, mazeHeight), mazeColor);
  iso.add(Plane(Point(mazeWidth, Point.ORIGIN.y), 1, mazeHeight), backgroundColor);
  iso.add(Plane(Point(Point.ORIGIN.x, mazeHeight), mazeWidth+1, 1), backgroundColor);
}

function draw() {
  drawMaze();
  drawSnakes();
}

function sortPoints(pointA, pointB) {
  return pointB.x - pointA.x + pointB.y - pointA.y;
}

function isOutsideMaze(point) {
  return point.x < 0 || point.x > mazeWidth-1 || point.y < 0 || point.y > mazeHeight-1;
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

function updateSnakes() {
  snakeList.forEach(function (snake) {
    snake.update();
  });
}

function restart() {
  setupGame();
}

function update() {
  updateSnakes();
  keyboardDirection = null;
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
  keyboardDirection = keyAlias[event.keyCode];
}

function setupCanvas() {
  document.addEventListener("keydown", onKeyDown, false);
}

function behaviour1() {
  this.useKeyboardDirection();
  this.turnOnWalls();
  this.forwardGrowing(5);
  if (this.checkBitesItself()) {
    restart();
  }
}

function behaviour2() {
  this.makeCircles(3);
}

function behaviour3() {
  this.forward(2);
}

function setupGame() {
  snakeList = [];

  var snake1 = new Snake(Point(1, 0, 0));
  snake1.setPattern(colorPattern1);
  snake1.increase(2);
  snake1.update = behaviour1;
  snakeList.push(snake1);

  var snake2 = new Snake(Point(6, 10, 0));
  snake2.setPattern(colorPattern2);
  snake2.increase(6);
  snake2.update = behaviour2;
  snakeList.push(snake2);

  var snake2b = new Snake(Point(1, 12, 0));
  snake2b.setPattern(colorPattern2);
  snake2b.increase(6);
  snake2b.update = behaviour2;
  snakeList.push(snake2b);

  var snake3 = new Snake(Point(61, 15, 0), 's', colorPattern3);
  snake3.increase(20);
  snake3.update = behaviour3;
  snakeList.push(snake3);
}

function main() {
  setupCanvas();
  setupGame();
  requestAnimationFrame(step);
}

main();
