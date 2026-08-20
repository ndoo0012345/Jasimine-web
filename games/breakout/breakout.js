/* games/breakout/breakout.js */
window.initbreakout = function(container) {
    container.innerHTML = `
        <div class="breakout-container relative">
            <div class="breakout-score-board">
                <div>Score: <span id="breakout-score">0</span></div>
                <div>Best: <span id="breakout-best">0</span></div>
            </div>
            <canvas id="breakout-canvas" width="480" height="320"></canvas>
            
            <div id="breakout-overlay" class="breakout-overlay">
                <h2 class="text-3xl font-bold mb-2" id="breakout-msg">Breakout</h2>
                <p class="text-slate-300 mb-4 text-sm font-semibold text-center">Use Mouse, Touch, or Arrow Keys<br>to move the paddle</p>
                <button id="breakout-start" class="px-6 py-3 bg-brand-500 text-white font-bold rounded-xl shadow-lg hover:bg-brand-600">Start Game</button>
            </div>
        </div>
    `;

    const canvas = document.getElementById('breakout-canvas');
    const ctx = canvas.getContext('2d');
    
    let score = 0;
    let bestScore = parseInt(localStorage.getItem('arcade_breakout_best')) || 0;
    document.getElementById('breakout-best').innerText = bestScore;

    let gameLoop;
    let playing = false;

    // Ball
    let ballRadius = 8;
    let x = canvas.width / 2;
    let y = canvas.height - 30;
    let dx = 3;
    let dy = -3;

    // Paddle
    let paddleHeight = 10;
    let paddleWidth = 75;
    let paddleX = (canvas.width - paddleWidth) / 2;

    // Controls
    let rightPressed = false;
    let leftPressed = false;

    // Bricks
    let brickRowCount = 4;
    let brickColumnCount = 6;
    let brickWidth = 65;
    let brickHeight = 20;
    let brickPadding = 10;
    let brickOffsetTop = 30;
    let brickOffsetLeft = 20;

    let bricks = [];
    
    function initBricks() {
        bricks = [];
        for (let c = 0; c < brickColumnCount; c++) {
            bricks[c] = [];
            for (let r = 0; r < brickRowCount; r++) {
                bricks[c][r] = { x: 0, y: 0, status: 1 };
            }
        }
    }

    function reset() {
        x = canvas.width / 2;
        y = canvas.height - 30;
        dx = 3;
        dy = -3;
        paddleX = (canvas.width - paddleWidth) / 2;
        score = 0;
        document.getElementById('breakout-score').innerText = score;
        initBricks();
    }

    const keyUpHandler = (e) => {
        if (e.key === 'Right' || e.key === 'ArrowRight') rightPressed = false;
        else if (e.key === 'Left' || e.key === 'ArrowLeft') leftPressed = false;
    };
    const keyDownHandler = (e) => {
        if (e.key === 'Right' || e.key === 'ArrowRight') rightPressed = true;
        else if (e.key === 'Left' || e.key === 'ArrowLeft') leftPressed = true;
        if (['ArrowRight', 'ArrowLeft'].includes(e.key)) e.preventDefault();
    };

    const mouseMoveHandler = (e) => {
        const relativeX = e.clientX - canvas.getBoundingClientRect().left;
        if (relativeX > 0 && relativeX < canvas.width) {
            paddleX = relativeX - paddleWidth / 2;
        }
    };
    
    const touchMoveHandler = (e) => {
        const relativeX = e.touches[0].clientX - canvas.getBoundingClientRect().left;
        if (relativeX > 0 && relativeX < canvas.width) {
            paddleX = relativeX - paddleWidth / 2;
        }
        e.preventDefault();
    };

    function collisionDetection() {
        for (let c = 0; c < brickColumnCount; c++) {
            for (let r = 0; r < brickRowCount; r++) {
                let b = bricks[c][r];
                if (b.status === 1) {
                    if (x > b.x && x < b.x + brickWidth && y > b.y && y < b.y + brickHeight) {
                        dy = -dy;
                        b.status = 0;
                        score++;
                        document.getElementById('breakout-score').innerText = score;
                        if (score === brickRowCount * brickColumnCount) {
                            gameOver(true);
                        }
                    }
                }
            }
        }
    }

    function drawBall() {
        ctx.beginPath();
        ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
        ctx.fillStyle = '#0ea5e9'; // brand-500
        ctx.fill();
        ctx.closePath();
    }

    function drawPaddle() {
        ctx.beginPath();
        ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
        ctx.fillStyle = '#f43f5e'; // rose-500
        ctx.fill();
        ctx.closePath();
    }

    function drawBricks() {
        for (let c = 0; c < brickColumnCount; c++) {
            for (let r = 0; r < brickRowCount; r++) {
                if (bricks[c][r].status === 1) {
                    let brickX = (c * (brickWidth + brickPadding)) + brickOffsetLeft;
                    let brickY = (r * (brickHeight + brickPadding)) + brickOffsetTop;
                    bricks[c][r].x = brickX;
                    bricks[c][r].y = brickY;
                    ctx.beginPath();
                    ctx.rect(brickX, brickY, brickWidth, brickHeight);
                    
                    // Colors by row
                    if (r === 0) ctx.fillStyle = '#ef4444'; // red
                    else if (r === 1) ctx.fillStyle = '#f97316'; // orange
                    else if (r === 2) ctx.fillStyle = '#eab308'; // yellow
                    else ctx.fillStyle = '#22c55e'; // green
                    
                    ctx.fill();
                    ctx.closePath();
                }
            }
        }
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        drawBricks();
        drawBall();
        drawPaddle();
        collisionDetection();

        // Bounce off left/right
        if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
            dx = -dx;
        }
        // Bounce off top
        if (y + dy < ballRadius) {
            dy = -dy;
        } else if (y + dy > canvas.height - ballRadius) {
            // Paddle collision
            if (x > paddleX && x < paddleX + paddleWidth) {
                // Determine bounce angle based on where it hit paddle
                let hitPoint = x - (paddleX + paddleWidth/2);
                dx = hitPoint * 0.15; // adjust angle
                dy = -dy;
            } else {
                gameOver(false);
                return;
            }
        }

        // Move paddle
        if (rightPressed && paddleX < canvas.width - paddleWidth) {
            paddleX += 7;
        } else if (leftPressed && paddleX > 0) {
            paddleX -= 7;
        }

        x += dx;
        y += dy;
        
        if (playing) gameLoop = requestAnimationFrame(draw);
    }

    function gameOver(win) {
        playing = false;
        document.getElementById('breakout-overlay').classList.remove('hidden');
        document.getElementById('breakout-msg').innerText = win ? 'You Win!' : 'Game Over!';
        document.getElementById('breakout-start').innerText = 'Play Again';
        
        if (score > bestScore) {
            bestScore = score;
            localStorage.setItem('arcade_breakout_best', bestScore);
            document.getElementById('breakout-best').innerText = bestScore;
        }
    }

    window.addEventListener('keydown', keyDownHandler, { passive: false });
    window.addEventListener('keyup', keyUpHandler, { passive: false });
    canvas.addEventListener('mousemove', mouseMoveHandler);
    canvas.addEventListener('touchmove', touchMoveHandler, { passive: false });

    document.getElementById('breakout-start').onclick = () => {
        document.getElementById('breakout-overlay').classList.add('hidden');
        reset();
        playing = true;
        gameLoop = requestAnimationFrame(draw);
    };

    initBricks();
    drawBricks();
    drawBall();
    drawPaddle();

    return function cleanup() {
        playing = false;
        cancelAnimationFrame(gameLoop);
        window.removeEventListener('keydown', keyDownHandler);
        window.removeEventListener('keyup', keyUpHandler);
        canvas.removeEventListener('mousemove', mouseMoveHandler);
        canvas.removeEventListener('touchmove', touchMoveHandler);
    };
};
