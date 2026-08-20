/* games/whack/whack.js */
window.initwhack = function(container) {
    container.innerHTML = `
        <div class="whack-container">
            <div class="whack-header">
                <h2 class="text-3xl font-extrabold text-slate-800">Whack-A-Mole</h2>
                <div class="whack-stats">
                    <div>Time: <span id="whack-time">30</span>s</div>
                    <div>Score: <span id="whack-score">0</span></div>
                    <div>Best: <span id="whack-best">0</span></div>
                </div>
            </div>
            
            <div class="whack-board" id="whack-board">
                <div class="whack-hole"><div class="whack-mole" data-idx="0"></div></div>
                <div class="whack-hole"><div class="whack-mole" data-idx="1"></div></div>
                <div class="whack-hole"><div class="whack-mole" data-idx="2"></div></div>
                <div class="whack-hole"><div class="whack-mole" data-idx="3"></div></div>
                <div class="whack-hole"><div class="whack-mole" data-idx="4"></div></div>
                <div class="whack-hole"><div class="whack-mole" data-idx="5"></div></div>
                <div class="whack-hole"><div class="whack-mole" data-idx="6"></div></div>
                <div class="whack-hole"><div class="whack-mole" data-idx="7"></div></div>
                <div class="whack-hole"><div class="whack-mole" data-idx="8"></div></div>

                <div class="whack-overlay" id="whack-overlay">
                    <h2 class="text-4xl font-black mb-2" id="whack-msg">Ready?</h2>
                    <button id="whack-start" class="px-6 py-3 bg-brand-500 text-white font-bold rounded-xl shadow-lg hover:bg-brand-600 mt-4">Start Game</button>
                </div>
            </div>
        </div>
    `;

    const moles = document.querySelectorAll('.whack-mole');
    let lastHole;
    let timeUp = false;
    let score = 0;
    let timeLeft = 30;
    let bestScore = parseInt(localStorage.getItem('arcade_whack_best')) || 0;
    document.getElementById('whack-best').innerText = bestScore;

    let moleTimer;
    let countdownTimer;

    function randomTime(min, max) {
        return Math.round(Math.random() * (max - min) + min);
    }

    function randomHole(moles) {
        const idx = Math.floor(Math.random() * moles.length);
        const mole = moles[idx];
        if (mole === lastHole) {
            return randomHole(moles);
        }
        lastHole = mole;
        return mole;
    }

    function peep() {
        const time = randomTime(400, 1000);
        const mole = randomHole(moles);
        mole.classList.add('up');
        
        moleTimer = setTimeout(() => {
            mole.classList.remove('up');
            if (!timeUp) peep();
        }, time);
    }

    function startGame() {
        document.getElementById('whack-overlay').classList.add('hidden');
        document.getElementById('whack-score').textContent = 0;
        timeUp = false;
        score = 0;
        timeLeft = 30;
        document.getElementById('whack-time').textContent = timeLeft;
        
        peep();
        
        countdownTimer = setInterval(() => {
            timeLeft--;
            document.getElementById('whack-time').textContent = timeLeft;
            if (timeLeft <= 0) {
                timeUp = true;
                clearInterval(countdownTimer);
                clearTimeout(moleTimer);
                moles.forEach(m => m.classList.remove('up'));
                
                document.getElementById('whack-overlay').classList.remove('hidden');
                document.getElementById('whack-msg').innerText = "Time's Up!";
                document.getElementById('whack-start').innerText = 'Play Again';
                
                if (score > bestScore) {
                    bestScore = score;
                    localStorage.setItem('arcade_whack_best', bestScore);
                    document.getElementById('whack-best').innerText = bestScore;
                }
            }
        }, 1000);
    }

    function whack(e) {
        if (!e.isTrusted) return; // cheater!
        if (!this.classList.contains('up')) return;
        score++;
        this.classList.remove('up');
        document.getElementById('whack-score').textContent = score;
    }

    moles.forEach(mole => mole.addEventListener('click', whack));
    document.getElementById('whack-start').addEventListener('click', startGame);

    return function cleanup() {
        clearTimeout(moleTimer);
        clearInterval(countdownTimer);
    };
};
