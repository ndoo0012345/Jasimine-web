/* games/memory/memory.js */
window.initmemory = function(container) {
    container.innerHTML = `
        <div class="memo-container">
            <div class="memo-header">
                <h2 class="text-3xl font-extrabold text-slate-800">Memory Match</h2>
                <div class="memo-stats">
                    <div>Moves: <span id="memo-moves">0</span></div>
                    <div>Best: <span id="memo-best">0</span></div>
                </div>
            </div>
            
            <div class="memo-grid" id="memo-grid">
                <!-- Cards here -->
                <div class="memo-overlay hidden" id="memo-overlay">
                    <h2 class="text-3xl font-bold text-slate-800 mb-2">You Win!</h2>
                    <p class="text-lg text-slate-600 mb-4 font-bold" id="memo-msg-moves">Moves: 0</p>
                    <button id="memo-restart" class="px-6 py-3 bg-brand-500 text-white font-bold rounded-xl shadow-lg hover:bg-brand-600">Play Again</button>
                </div>
            </div>
        </div>
    `;

    const grid = document.getElementById('memo-grid');
    const emojis = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'];
    let cards = [...emojis, ...emojis];
    let firstCard = null;
    let secondCard = null;
    let moves = 0;
    let matches = 0;
    let lockBoard = false;
    let bestScore = parseInt(localStorage.getItem('arcade_memory_best')) || 0;

    document.getElementById('memo-best').innerText = bestScore;

    function shuffle() {
        for (let i = cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [cards[i], cards[j]] = [cards[j], cards[i]];
        }
    }

    function createBoard() {
        // remove old cards
        Array.from(grid.children).forEach(child => {
            if (child.id !== 'memo-overlay') child.remove();
        });

        shuffle();
        cards.forEach((emoji, index) => {
            const card = document.createElement('div');
            card.className = 'memo-card';
            card.dataset.emoji = emoji;
            card.dataset.index = index;

            const front = document.createElement('div');
            front.className = 'memo-front';
            
            const back = document.createElement('div');
            back.className = 'memo-back';
            back.innerText = emoji;

            card.appendChild(front);
            card.appendChild(back);
            card.addEventListener('click', flipCard);
            
            grid.appendChild(card);
        });
    }

    function flipCard() {
        if (lockBoard) return;
        if (this === firstCard) return;

        this.classList.add('flipped');

        if (!firstCard) {
            firstCard = this;
            return;
        }

        secondCard = this;
        moves++;
        document.getElementById('memo-moves').innerText = moves;
        checkForMatch();
    }

    function checkForMatch() {
        let isMatch = firstCard.dataset.emoji === secondCard.dataset.emoji;

        if (isMatch) {
            disableCards();
        } else {
            unflipCards();
        }
    }

    function disableCards() {
        firstCard.removeEventListener('click', flipCard);
        secondCard.removeEventListener('click', flipCard);
        firstCard.classList.add('matched');
        secondCard.classList.add('matched');

        matches++;
        if (matches === emojis.length) {
            setTimeout(winGame, 500);
        }

        resetBoard();
    }

    function unflipCards() {
        lockBoard = true;

        setTimeout(() => {
            firstCard.classList.remove('flipped');
            secondCard.classList.remove('flipped');
            resetBoard();
        }, 1000);
    }

    function resetBoard() {
        [firstCard, secondCard, lockBoard] = [null, null, false];
    }

    function winGame() {
        if (bestScore === 0 || moves < bestScore) {
            bestScore = moves;
            localStorage.setItem('arcade_memory_best', bestScore);
            document.getElementById('memo-best').innerText = bestScore;
        }
        
        document.getElementById('memo-overlay').classList.remove('hidden');
        document.getElementById('memo-msg-moves').innerText = `Moves: ${moves}`;
    }

    function reset() {
        moves = 0;
        matches = 0;
        document.getElementById('memo-moves').innerText = moves;
        document.getElementById('memo-overlay').classList.add('hidden');
        resetBoard();
        createBoard();
    }

    document.getElementById('memo-restart').addEventListener('click', reset);

    reset();

    return function cleanup() {
        // no intervals
    };
};
