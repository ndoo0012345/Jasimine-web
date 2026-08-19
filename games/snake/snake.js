/* games/snake/snake.js */
window.initsnake = function(container) {
    container.innerHTML = `
        <div class="snake-container relative">
            <div class="snake-score-board">
                <div>Score: <span id="snake-score">0</span></div>
                <div>Best: <span id="snake-best">0</span></div>
            </div>
            <canvas id="snake-canvas" width="400" height="400"></canvas>
            
            <div class="snake-controls md:hidden">
                <button class="snake-btn snake-left" id="btn-left"><i class="fa-solid fa-arrow-left"></i></button>
                <div class="flex flex-col gap-2">
                    <button class="snake-btn w-full" id="btn-up"><i class="fa-solid fa-arrow-up"></i></button>
                    <button class="snake-btn w-full" id="btn-down"><i class="fa-solid fa-arrow-down"></i></button>
                </div>
                <button class="snake-btn snake-right" id="btn-right"><i class="fa-solid fa-arrow-right"></i></button>
            </div>

            <div id="snake-overlay">
                <h2 class="text-3xl font-bold text-slate-800 mb-2" id="snake-msg">Ready?</h2>
                <button id="snake-start" class="px-6 py-3 bg-brand-500 text-white font-bold rounded-xl shadow-lg hover:bg-brand-600">Start Game</button>
            </div>
        </div>
    `;

    const canvas = document.getElementById('snake-canvas');
    const ctx = canvas.getContext('2d');
    
    // Fit canvas logic
    let tileSize = 20;
    let tileCount = 20;

    let snake = [];
    let food = { x: 10, y: 10 };
    let dx = 0;
    let dy = 0;
    let score = 0;
    let bestScore = parseInt(localStorage.getItem('arcade_snake_best')) || 0;
    
    document.getElementById('snake-best').innerText = bestScore;

    let gameLoop;
    let playing = false;
    let lastTime = 0;
    const speed = 100; // ms per tick

    function reset() {
        snake = [{ x: 10, y: 10 }];
        dx = 0;
        dy = 0;
        score = 0;
        document.getElementById('snake-score').innerText = score;
        spawnFood();
    }

    function spawnFood() {
        food.x = Math.floor(Math.random() * tileCount);
        food.y = Math.floor(Math.random() * tileCount);
        // check collision with snake
        for (let s of snake) {
            if (s.x === food.x && s.y === food.y) return spawnFood();
        }
    }

    function update() {
        if (!playing) return;
        
        let headX = snake[0].x + dx;
        let headY = snake[0].y + dy;

        // Wall collision
        if (headX < 0 || headX >= tileCount || headY < 0 || headY >= tileCount) {
            gameOver();
            return;
        }

        // Self collision (only if moving)
        if (dx !== 0 || dy !== 0) {
            for (let s of snake) {
                if (s.x === headX && s.y === headY) {
                    gameOver();
                    return;
                }
            }
        }

        snake.unshift({ x: headX, y: headY });

        if (headX === food.x && headY === food.y) {
            score += 10;
            document.getElementById('snake-score').innerText = score;
            if (score > bestScore) {
                bestScore = score;
                localStorage.setItem('arcade_snake_best', bestScore);
                document.getElementById('snake-best').innerText = bestScore;
            }
            spawnFood();
        } else {
            // only pop if moving
            if (dx !== 0 || dy !== 0) snake.pop();
        }
    }

    function draw() {
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw food
        ctx.fillStyle = '#f43f5e'; // rose-500
        ctx.fillRect(food.x * tileSize + 1, food.y * tileSize + 1, tileSize - 2, tileSize - 2);

        // Draw snake
        ctx.fillStyle = '#0ea5e9'; // brand-500
        for (let i = 0; i < snake.length; i++) {
            if (i === 0) ctx.fillStyle = '#0284c7'; // darker head
            else ctx.fillStyle = '#38bdf8';
            ctx.fillRect(snake[i].x * tileSize + 1, snake[i].y * tileSize + 1, tileSize - 2, tileSize - 2);
        }
    }

    function loop(timestamp) {
        if (!playing) return;
        if (timestamp - lastTime > speed) {
            update();
            draw();
            lastTime = timestamp;
        }
        gameLoop = requestAnimationFrame(loop);
    }

    function gameOver() {
        playing = false;
        document.getElementById('snake-overlay').classList.remove('hidden');
        document.getElementById('snake-msg').innerText = 'Game Over!';
        document.getElementById('snake-start').innerText = 'Restart';
    }

    function handleInput(dir) {
        if (!playing && dx === 0 && dy === 0 && document.getElementById('snake-overlay').classList.contains('hidden')) {
            // Wait for user to start moving, but game is "playing"
            // Start moving on first key
        }
        
        if (dir === 'UP' && dy === 0) { dx = 0; dy = -1; }
        else if (dir === 'DOWN' && dy === 0) { dx = 0; dy = 1; }
        else if (dir === 'LEFT' && dx === 0) { dx = -1; dy = 0; }
        else if (dir === 'RIGHT' && dx === 0) { dx = 1; dy = 0; }
    }

    const keyHandler = (e) => {
        if (!playing && !document.getElementById('snake-overlay').classList.contains('hidden')) {
            if (e.key === 'Enter' || e.key === ' ') {
                document.getElementById('snake-start').click();
            }
        }
        if (['ArrowUp', 'w', 'W'].includes(e.key)) handleInput('UP');
        if (['ArrowDown', 's', 'S'].includes(e.key)) handleInput('DOWN');
        if (['ArrowLeft', 'a', 'A'].includes(e.key)) handleInput('LEFT');
        if (['ArrowRight', 'd', 'D'].includes(e.key)) handleInput('RIGHT');
        if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key)) {
            e.preventDefault(); // prevent scrolling
        }
    };

    window.addEventListener('keydown', keyHandler, { passive: false });

    // Touch controls
    document.getElementById('btn-up').onclick = () => handleInput('UP');
    document.getElementById('btn-down').onclick = () => handleInput('DOWN');
    document.getElementById('btn-left').onclick = () => handleInput('LEFT');
    document.getElementById('btn-right').onclick = () => handleInput('RIGHT');

    // Start button
    document.getElementById('snake-start').onclick = () => {
        document.getElementById('snake-overlay').classList.add('hidden');
        reset();
        playing = true;
        gameLoop = requestAnimationFrame(loop);
    };

    reset();
    draw();

    // CLEANUP FUNCTION
    return function cleanup() {
        playing = false;
        cancelAnimationFrame(gameLoop);
        window.removeEventListener('keydown', keyHandler);
    };
};
