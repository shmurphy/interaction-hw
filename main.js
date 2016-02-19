
// GameBoard code below
var gameWidth = 1200;
var gameHeight = 600;

function distance(a, b) {
    var dx = a.x - b.x;
    var dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
}

function Circle(game) {
    this.player = 1;
    this.radius = 10;
    this.visualRadius = 50;
    this.colors = ["Red", "Green", "Blue", "DeepPink", "MediumPurple", "Turquoise", "Purple", "Orange", "MediumVioletRed", "Yellow", "White"];
    this.setNotIt();
    Entity.call(this, game, this.radius + Math.random() * (gameHeight - this.radius * 2), this.radius + Math.random() * (gameWidth - this.radius * 2));

    this.velocity = { x: Math.random() * 1000, y: Math.random() * 1000 };
    var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
    if (speed > maxSpeed) {
        var ratio = maxSpeed / speed;
        this.velocity.x *= ratio;
        this.velocity.y *= ratio;
    }
};

Circle.prototype = new Entity();
Circle.prototype.constructor = Circle;

Circle.prototype.setIt = function () {
    this.it = true;
    this.color = 10;
    this.visualRadius = 200;
    this.radius ++;
};

Circle.prototype.setNotIt = function () {
    this.it = false;
    this.color = Math.round(Math.random() * 10);

    this.visualRadius = 200;
};

Circle.prototype.collide = function (other) {
    return distance(this, other) < this.radius + other.radius;
};

Circle.prototype.collideLeft = function () {
    return (this.x - this.radius) < 0;
};

Circle.prototype.collideRight = function () {
    return (this.x + this.radius) > gameWidth;
};

Circle.prototype.collideTop = function () {
    return (this.y - this.radius) < 0;
};

Circle.prototype.collideBottom = function () {
    return (this.y + this.radius) > gameHeight;
};

Circle.prototype.update = function () {
    Entity.prototype.update.call(this);
 //  console.log(this.velocity);

    this.x += this.velocity.x * this.game.clockTick;
    this.y += this.velocity.y * this.game.clockTick;

    if (this.collideLeft() || this.collideRight()) {
        this.velocity.x = -this.velocity.x * friction;
        if (this.collideLeft()) this.x = this.radius;
        if (this.collideRight()) this.x = gameWidth - this.radius;
        this.x += this.velocity.x * this.game.clockTick;
        this.y += this.velocity.y * this.game.clockTick;
    }

    if (this.collideTop() || this.collideBottom()) {
        this.velocity.y = -this.velocity.y * friction;
        if (this.collideTop()) this.y = this.radius;
        if (this.collideBottom()) this.y = gameHeight - this.radius;
        this.x += this.velocity.x * this.game.clockTick;
        this.y += this.velocity.y * this.game.clockTick;
    }

    for (var i = 0; i < this.game.entities.length; i++) {
        var ent = this.game.entities[i];
        if (ent !== this && ((this.collide(ent) || ent.collide(this)) && (this.color != ent.color))) {
            var temp = { x: this.velocity.x, y: this.velocity.y };

            var dist = distance(this, ent);
            var delta = this.radius + ent.radius - dist;
            var difX = (this.x - ent.x)/dist;
            var difY = (this.y - ent.y)/dist;

            this.x += difX * delta / 2;
            this.y += difY * delta / 2;
            ent.x -= difX * delta / 2;
            ent.y -= difY * delta / 2;

            if(this.radius > ent.radius) {
                ent.removeFromWorld = true;
                //this.radius += ent.radius / 2;
                this.radius += 2;

                var circle = new Circle(this.game);
                circle.radius = 10;
                circle.color = this.color;
                this.game.addEntity(circle);
                //this.game.newCircle = true;

                // want it to slow down here
            } else if (this.radius >= ent.radius) {
                this.removeFromWorld = true;
                //ent.radius += this.radius / 2;
                ent.radius += 2;
            } else {

                this.velocity.x = ent.velocity.x * friction;
                this.velocity.y = ent.velocity.y * friction;
                ent.velocity.x = temp.x * friction;
                ent.velocity.y = temp.y * friction;
                this.x += this.velocity.x * this.game.clockTick;
                this.y += this.velocity.y * this.game.clockTick;
                ent.x += ent.velocity.x * this.game.clockTick;
                ent.y += ent.velocity.y * this.game.clockTick;

            }
        }

        // the chasing
        if (ent != this && (this.collide({ x: ent.x, y: ent.y, radius: this.visualRadius }) && (this.color != ent.color))) {
            var dist = distance(this, ent);
            //if (this.it && dist > this.radius + ent.radius + 10 && ent.radius <= this.radius) {
            if (dist > this.radius + ent.radius + 10 && ent.radius < this.radius) {

                var difX = (ent.x - this.x)/dist;
                var difY = (ent.y - this.y)/dist;
                this.velocity.x += difX * acceleration / (dist*dist);
                this.velocity.y += difY * acceleration / (dist * dist);
                var speed = Math.sqrt(this.velocity.x*this.velocity.x + this.velocity.y*this.velocity.y);
                if (speed > maxSpeed) {
                    var ratio = maxSpeed / speed;
                    this.velocity.x *= ratio;
                    this.velocity.y *= ratio;
                }
            }
            if (dist > this.radius + ent.radius && ent.radius > this.radius) {
                var difX = (ent.x - this.x) / dist;
                var difY = (ent.y - this.y) / dist;
                this.velocity.x -= difX * acceleration / (dist * dist);
                this.velocity.y -= difY * acceleration / (dist * dist);
                var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
                if (speed > maxSpeed) {
                    var ratio = maxSpeed / speed;
                    this.velocity.x *= ratio;
                    this.velocity.y *= ratio;
                }
            }

        }

    }

    if(this.game.newCircle) {
        var circle = new Circle(this.game);
        circle.radius = 10;
        this.game.addEntity(circle);
        this.game.newCircle = false;
    }

    this.velocity.x -= (1 - friction) * this.game.clockTick * this.velocity.x;
    this.velocity.y -= (1 - friction) * this.game.clockTick * this.velocity.y;
};

Circle.prototype.draw = function (ctx) {
    ctx.beginPath();
    ctx.fillStyle = this.colors[this.color];
    //console.log(random);

    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fill();

    ctx.lineWidth = 5;
    ctx.strokeStyle = "Black";
    ctx.stroke();
    ctx.closePath();

};



// the "main" code begins here
var friction = 1;
var acceleration = 1000000;
var maxSpeed = 100;

var ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload("./img/960px-Blank_Go_board.png");
ASSET_MANAGER.queueDownload("./img/black.png");
ASSET_MANAGER.queueDownload("./img/white.png");

ASSET_MANAGER.downloadAll(function () {
    console.log("starting up da sheild");
    var canvas = document.getElementById('gameWorld');
    var ctx = canvas.getContext('2d');


    var gameEngine = new GameEngine();
    var circle = new Circle(gameEngine);
    circle.setIt();
    gameEngine.addEntity(circle);
    //for (var i = 0; i < 13; i++) {
    //    circle = new Circle(gameEngine);
    //    //if(!(i % 3)) {
    //    //    circle.setIt();
    //    //}
    //    gameEngine.addEntity(circle);
    //}
    gameEngine.init(ctx);
    gameEngine.start();
});
