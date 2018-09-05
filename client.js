//'use strict';

var socket; 
var paddleWidth, paddleHeight;
var paddle1, paddle2;
var ball;
var screenWidth, screenHeight;

function setup() {
    socket = io();

    screenWidth = 800;
    screenHeight = 600;

    createCanvas(screenWidth, screenHeight);
    

    paddleWidth = screenWidth / 20;
    paddleHeight = screenHeight / 5;

    paddle1 = new Paddle(screenWidth / 10 + paddleWidth / 2, screenHeight / 2 - paddleHeight / 2);
    paddle2 = new Paddle(screenWidth - screenWidth / 10 - paddleWidth / 2, 
                            screenHeight / 2 - paddleHeight / 2);

    ball = new Ball(screenWidth / 2, screenHeight / 2);

    drawObjects();

    socket.on('p1MoveUp', function(){
        paddle1.y -= paddle1.speed;
    });

    socket.on('p1MoveDown', function(){
        paddle1.y += paddle1.speed;
    });

    socket.on('p2MoveUp', function(){
        paddle2.y -= paddle2.speed;
    });

    socket.on('p2MoveDown', function(){
        paddle2.y += paddle2.speed;
    })

    socket.on('mouse', function(){
        console.log('click event came back');
    });
}

function mouseClicked(){
    console.log("click event happened");
    socket.emit('mouse');
}

function draw(){
    // change positions of paddles based on input
    handleInput();
    // change position of ball based on collisions
    detectBoxCollision();
    detectPaddleCollision(paddle1);
    detectPaddleCollision(paddle2);
    // clear the last frame's positions and draw background
    background(240);
    // draw new positions
    drawObjects();
}

function handleInput(){
    //paddle1
    // if w is pressed and we aren't past the top of the screen
    if(keyIsDown(87) && paddle1.y > 0){
        paddle1.y -= paddle1.speed;
        socket.emit('p1MoveUp');
    }
    // if s is pressed and we aren't past the bottom of the screen, accounting for paddle height
    if(keyIsDown(83) && paddle1.y < screenHeight - paddle1.height){
        paddle1.y += paddle1.speed;
        socket.emit('p1MoveDown');
    }

    //paddle2
    if(keyIsDown(UP_ARROW) && paddle2.y > 0){
        paddle2.y -= paddle2.speed;
        socket.emit('p2MoveUp');
    }
    if(keyIsDown(DOWN_ARROW) && paddle2.y < screenHeight - paddle2.height){
        paddle2.y += paddle2.speed;
        socket.emit('p2MoveDown');
    }

    // start game with space bar while ball is still (temp)
    if(ball.direction.x == 0 && ball.direction.y == 0 && keyIsDown(ENTER)) {
        var randomAngle = Math.random() * Math.PI * 2;
        console.log("x:" + Math.cos(randomAngle) + ", y:" + Math.sin(randomAngle));

        ball.setDirection(Math.cos(randomAngle), Math.sin(randomAngle));
    }
}

function detectBoxCollision(){
    if(ball.y == 30){
        console.log('heya');
    }
}

function detectPaddleCollision(paddle){

    // horizontal collision
    // if the ball is above the bottom and below the top of the paddle
    if(ball.y >= paddle.y - ball.radius && ball.y <= paddle.y + paddle.height + ball.radius){
        var intersectY = paddle.centerY - ball.y;
        var normalIntersectY = (intersectY / (paddle.height / 2));
        var bounceAngle = normalIntersectY * ball.maxAngle;

        // if going to the right, we will collide on the left
        if(ball.direction.x > 0 && abs(paddle.x - ball.x) <= ball.radius) {
            ball.setDirection(cos(bounceAngle), sin(bounceAngle));
            // we are going left, so we will collide on the right, so now we must account for the width of the paddle
        } else if(abs(paddle.x + paddle.width - ball.x) <= ball.radius){
            ball.setDirection(cos(bounceAngle), sin(bounceAngle));
        }  
    }
}

function Paddle(x, y){
    fill(0);
    
    this.x = x;
    this.y = y;
    this.width = paddleWidth;
    this.height = paddleHeight;
    this.roundness = 8;

    this.centerX = this.x + this.width / 2;
    this.centerY = this.y + this.height / 2;

    this.speed = screenHeight / 200;

    this.id = socket.id;
}

function Ball(x, y){
    fill(0);

    this.x = x;
    this.y = y;
    this.radius = screenWidth / 50;

    this.direction = { // should be a noramlized unit vector
        x: 0,
        y: 0
    };

    this.speed = 3; // Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
    this.maxAngle = 5 * Math.PI/12;

    this.setDirection = function(x, y){
        this.direction.x = x;
        this.direction.y = y;
    };

    this.setNewPosition = function(){
        this.x += this.direction.x * this.speed;
        this.y += this.direction.y * this.speed;
    }
}

function drawObjects(){
    rect(paddle1.x, paddle1.y, paddle1.width, paddle1.height, paddle1.roundness);
    rect(paddle2.x, paddle2.y, paddle2.width, paddle2.height, paddle2.roundness);

    ball.setNewPosition();
    ellipse(ball.x, ball.y, ball.radius * 2, ball.radius * 2);
}