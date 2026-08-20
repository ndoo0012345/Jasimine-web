/* games/flappy/flappy.js */
window.initflappy = function(container) {
    container.innerHTML = `
        <div class="flappy-container relative">
            <div class="flappy-score-board">
                <div>Score: <span id="flappy-score">0</span></div>
                <div>Best: <span id="flappy-best">0</span></div>
            </div>
            <canvas id="flappy-canvas" width="320" height="480"></canvas>
            
            <div id="flappy-overlay" class="flappy-overlay">
                <h2 class="text-3xl font-bold text-slate-800 mb-2" id="flappy-msg">Flappy Mini</h2>
                <p class="text-slate-500 mb-4 text-sm font-semibold">Click or Space to flap</p>
                <button id="flappy-start" class="px-6 py-3 bg-sky-500 text-white font-bold rounded-xl shadow-lg hover:bg-sky-600">Start Game</button>
            </div>
        </div>
    `;

    const canvas = document.getElementById('flappy-canvas');
    const ctx = canvas.getContext('2d');
    
    let score = 0;
    let bestScore = parseInt(localStorage.getItem('arcade_flappy_best')) || 0;
    document.getElementById('flappy-best').innerText = bestScore;

    let frames = 0;
    let gameLoop;
    let playing = false;

    const bird = {
        x: 50, y: 150,
        width: 30, height: 20,
        gravity: 0.25,
        lift: -5,
        velocity: 0,
        draw() {
            ctx.fillStyle = '#f59e0b'; // amber-500
            ctx.beginPath();
            ctx.ellipse(this.x + this.width/2, this.y + this.height/2, this.width/2, this.height/2, 0, 0, Math.PI * 2);
            ctx.fill();
            // Eye
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(this.x + 22, this.y + 6, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(this.x + 24, this.y + 6, 2, 0, Math.PI * 2);
            ctx.fill();
            // Wing
            ctx.fillStyle = '#d97706';
            ctx.beginPath();
            ctx.ellipse(this.x + 10, this.y + 12, 8, 4, 0, 0, Math.PI * 2);
            ctx.fill();
        },
        update() {
            this.velocity += this.gravity;
            this.y += this.velocity;
            
            if (this.y + this.height >= canvas.height) {
                this.y = canvas.height - this.height;
                this.velocity = 0;
                gameOver();
            }
            if (this.y < 0) {
                this.y = 0;
                this.velocity = 0;
            }
        },
        flap() {
            this.velocity = this.lift;
        }
    };

    const pipes = {
        array: [],
        width: 40,
        gap: 120,
        dx: 2,
        draw() {
            ctx.fillStyle = '#22c55e'; // green-500
            for (let i = 0; i < this.array.length; i++) {
                let p = this.array[i];
                // top pipe
                ctx.fillRect(p.x, 0, this.width, p.top);
                // bottom pipe
                ctx.fillRect(p.x, canvas.height - p.bottom, this.width, p.bottom);
            }
        },
        update() {
            if (frames % 100 === 0) {
                let minTop = 50;
                let maxTop = canvas.height - this.gap - 50;
                let topH = Math.floor(Math.random() * (maxTop - minTop + 1) + minTop);
                let bottomH = canvas.height - this.gap - topH;
                this.array.push({ x: canvas.width, top: topH, bottom: bottomH, passed: false });
            }
            
            for (let i = 0; i < this.array.length; i++) {
                let p = this.array[i];
                p.x -= this.dx;
                
                // Collision
                if (bird.x + bird.width > p.x && bird.x < p.x + this.width &&
                    (bird.y < p.top || bird.y + bird.height > canvas.height - p.bottom)) {
                    gameOver();
                }

                // Score
                if (p.x + this.width < bird.x && !p.passed) {
                    score++;
                    document.getElementById('flappy-score').innerText = score;
                    p.passed = true;
                }

                if (p.x + this.width < 0) {
                    this.array.shift();
                    i--;
                }
            }
        }
    };

    function draw() {
        ctx.fillStyle = '#e0f2fe';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        bird.draw();
        pipes.draw();
    }

    function update() {
        bird.update();
        pipes.update();
    }

    function loop() {
        if (!playing) return;
        update();
        draw();
        frames++;
        gameLoop = requestAnimationFrame(loop);
    }

    function gameOver() {
        playing = false;
        document.getElementById('flappy-overlay').classList.remove('hidden');
        document.getElementById('flappy-msg').innerText = 'Game Over!';
        document.getElementById('flappy-start').innerText = 'Play Again';
        
        if (score > bestScore) {
            bestScore = score;
            localStorage.setItem('arcade_flappy_best', bestScore);
            document.getElementById('flappy-best').innerText = bestScore;
        }
    }

    function reset() {
        bird.y = 150;
        bird.velocity = 0;
        pipes.array = [];
        score = 0;
        frames = 0;
        document.getElementById('flappy-score').innerText = score;
    }

    function handleInput(e) {
        if (!playing && !document.getElementById('flappy-overlay').classList.contains('hidden')) {
            document.getElementById('flappy-start').click();
            return;
        }
        if (playing) {
            bird.flap();
        }
        if (e && e.preventDefault) e.preventDefault();
    }

    canvas.addEventListener('mousedown', handleInput);
    canvas.addEventListener('touchstart', handleInput, {passive: false});
    
    const keyHandler = (e) => {
        if (e.key === ' ' || e.key === 'ArrowUp') {
            handleInput(e);
        }
    };
    window.addEventListener('keydown', keyHandler, { passive: false });

    document.getElementById('flappy-start').onclick = () => {
        document.getElementById('flappy-overlay').classList.add('hidden');
        reset();
        playing = true;
        gameLoop = requestAnimationFrame(loop);
    };

    // Draw initial state
    draw();

    return function cleanup() {
        playing = false;
        cancelAnimationFrame(gameLoop);
        window.removeEventListener('keydown', keyHandler);
    };
};
