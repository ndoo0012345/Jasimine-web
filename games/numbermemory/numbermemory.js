/* games/numbermemory/numbermemory.js */
window.initnumbermemory = function(container) {
    container.innerHTML = `
        <div class="num-container">
            <div id="num-area" class="num-area">
                <div class="text-6xl mb-4">🔢</div>
                <h2 class="text-3xl font-bold mb-2">Number Memory</h2>
                <p class="text-blue-100 mb-6">Remember the longest number you can.</p>
                <button id="num-start" class="px-8 py-3 bg-white text-blue-600 font-bold rounded-xl shadow hover:bg-slate-50 transition-colors">Start</button>
            </div>
            
            <div class="num-stats">
                <div class="bg-white p-4 rounded-xl shadow-sm text-center border border-slate-100 min-w-[120px]">
                    <div class="text-xs font-bold text-slate-500 uppercase tracking-wide">Level</div>
                    <div class="text-2xl font-black text-slate-800" id="num-level">1</div>
                </div>
                <div class="bg-white p-4 rounded-xl shadow-sm text-center border border-slate-100 min-w-[120px]">
                    <div class="text-xs font-bold text-slate-500 uppercase tracking-wide">Best</div>
                    <div class="text-2xl font-black text-slate-800" id="num-best">1</div>
                </div>
            </div>
        </div>
    `;

    const area = document.getElementById('num-area');
    let level = 1;
    let targetNumber = '';
    let timer = null;
    let bestScore = parseInt(localStorage.getItem('arcade_numbermemory_best')) || 1;
    
    document.getElementById('num-best').innerText = bestScore;

    function generateNumber(len) {
        let n = '';
        for(let i=0; i<len; i++) {
            n += Math.floor(Math.random() * 10);
        }
        return n;
    }

    function startGame() {
        level = 1;
        document.getElementById('num-level').innerText = level;
        playLevel();
    }

    function playLevel() {
        targetNumber = generateNumber(level);
        
        area.innerHTML = `
            <div class="num-display">${targetNumber}</div>
            <div class="num-bar-container"><div class="num-bar" id="num-bar"></div></div>
        `;
        
        const bar = document.getElementById('num-bar');
        
        // Ensure browser paints the 100% width before transitioning
        requestAnimationFrame(() => {
            bar.style.transitionDuration = '2000ms';
            bar.style.width = '0%';
        });

        timer = setTimeout(showInput, 2000);
    }

    function showInput() {
        area.innerHTML = `
            <h3 class="text-xl font-semibold mb-4 text-blue-100">What was the number?</h3>
            <input type="number" id="num-input" class="num-input" autocomplete="off" />
            <button id="num-submit" class="px-8 py-3 bg-white text-blue-600 font-bold rounded-xl shadow hover:bg-slate-50 transition-colors mt-2">Submit</button>
        `;
        
        const input = document.getElementById('num-input');
        input.focus();
        
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') checkAnswer();
        });
        document.getElementById('num-submit').addEventListener('click', checkAnswer);
    }

    function checkAnswer() {
        const input = document.getElementById('num-input');
        const answer = input.value;
        
        if (answer === targetNumber) {
            level++;
            document.getElementById('num-level').innerText = level;
            
            if (level > bestScore) {
                bestScore = level;
                localStorage.setItem('arcade_numbermemory_best', bestScore);
                document.getElementById('num-best').innerText = bestScore;
            }
            
            area.innerHTML = `
                <div class="text-4xl mb-4">✅</div>
                <h2 class="text-2xl font-bold mb-2">Correct!</h2>
            `;
            setTimeout(playLevel, 1000);
        } else {
            area.innerHTML = `
                <div class="text-4xl mb-4">❌</div>
                <h2 class="text-2xl font-bold mb-2">Incorrect</h2>
                <p class="text-blue-100 mb-2">Number was: <strong>${targetNumber}</strong></p>
                <p class="text-blue-100 mb-6">You typed: <strong>${answer}</strong></p>
                <button id="num-restart" class="px-8 py-3 bg-white text-blue-600 font-bold rounded-xl shadow hover:bg-slate-50 transition-colors">Try Again</button>
            `;
            document.getElementById('num-restart').addEventListener('click', startGame);
        }
    }

    document.getElementById('num-start').addEventListener('click', startGame);

    return function cleanup() {
        clearTimeout(timer);
    };
};
