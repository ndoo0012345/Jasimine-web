/* games/game2048/game2048.js */
window.initgame2048 = function(container) {
    container.innerHTML = `
        <div class="g2048-container">
            <div class="g2048-header">
                <div>
                    <h2 class="text-3xl font-extrabold text-slate-800">2048</h2>
                    <p class="text-sm text-slate-500">Join the numbers!</p>
                </div>
                <div class="g2048-scores">
                    <div class="g2048-score-box">
                        <div class="g2048-score-title">Score</div>
                        <div class="g2048-score-value" id="g2048-score">0</div>
                    </div>
                    <div class="g2048-score-box">
                        <div class="g2048-score-title">Best</div>
                        <div class="g2048-score-value" id="g2048-best">0</div>
                    </div>
                </div>
            </div>
            
            <div class="g2048-board" id="g2048-board">
                <!-- 16 empty cells for background -->
                ${Array(16).fill('<div class="g2048-cell"></div>').join('')}
                
                <div id="g2048-tiles-container"></div>

                <div class="g2048-overlay hidden" id="g2048-overlay">
                    <h2 class="text-3xl font-bold text-slate-800 mb-2">Game Over!</h2>
                    <button id="g2048-restart" class="px-6 py-3 bg-slate-800 text-white font-bold rounded-xl shadow-lg hover:bg-slate-900">Try Again</button>
                </div>
            </div>
        </div>
    `;

    let board = [[0,0,0,0], [0,0,0,0], [0,0,0,0], [0,0,0,0]];
    let score = 0;
    let bestScore = parseInt(localStorage.getItem('arcade_game2048_best')) || 0;
    document.getElementById('g2048-best').innerText = bestScore;
    
    let touchStartX = 0;
    let touchStartY = 0;

    function reset() {
        board = [[0,0,0,0], [0,0,0,0], [0,0,0,0], [0,0,0,0]];
        score = 0;
        updateScore();
        addRandomTile();
        addRandomTile();
        renderBoard();
        document.getElementById('g2048-overlay').classList.add('hidden');
    }

    function addRandomTile() {
        let emptyCells = [];
        for (let r=0; r<4; r++) {
            for (let c=0; c<4; c++) {
                if (board[r][c] === 0) emptyCells.push({r, c});
            }
        }
        if (emptyCells.length > 0) {
            let rand = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            board[rand.r][rand.c] = Math.random() < 0.9 ? 2 : 4;
        }
    }

    function renderBoard() {
        const container = document.getElementById('g2048-tiles-container');
        if (!container) return;
        
        const boardEl = document.getElementById('g2048-board');
        const padding = 8;
        const gap = 8;
        const boardWidth = boardEl.clientWidth;
        const cellSize = (boardWidth - (padding * 2) - (gap * 3)) / 4;

        container.innerHTML = '';
        for (let r=0; r<4; r++) {
            for (let c=0; c<4; c++) {
                if (board[r][c] !== 0) {
                    const val = board[r][c];
                    const tile = document.createElement('div');
                    tile.className = `g2048-tile g2048-tile-${val > 2048 ? '2048' : val}`;
                    tile.innerText = val;
                    
                    const top = padding + r * (cellSize + gap);
                    const left = padding + c * (cellSize + gap);
                    
                    tile.style.width = cellSize + 'px';
                    tile.style.height = cellSize + 'px';
                    tile.style.top = top + 'px';
                    tile.style.left = left + 'px';
                    
                    container.appendChild(tile);
                }
            }
        }
    }

    function updateScore() {
        document.getElementById('g2048-score').innerText = score;
        if (score > bestScore) {
            bestScore = score;
            localStorage.setItem('arcade_game2048_best', bestScore);
            document.getElementById('g2048-best').innerText = bestScore;
        }
    }

    function slideRow(row) {
        let arr = row.filter(val => val);
        for (let i=0; i<arr.length-1; i++) {
            if (arr[i] === arr[i+1]) {
                arr[i] *= 2;
                score += arr[i];
                arr[i+1] = 0;
            }
        }
        arr = arr.filter(val => val);
        while (arr.length < 4) arr.push(0);
        return arr;
    }

    function slideLeft() {
        let moved = false;
        for (let r=0; r<4; r++) {
            let oldRow = [...board[r]];
            board[r] = slideRow(board[r]);
            if (oldRow.join(',') !== board[r].join(',')) moved = true;
        }
        return moved;
    }

    function slideRight() {
        let moved = false;
        for (let r=0; r<4; r++) {
            let oldRow = [...board[r]];
            let reversed = [...board[r]].reverse();
            reversed = slideRow(reversed);
            board[r] = reversed.reverse();
            if (oldRow.join(',') !== board[r].join(',')) moved = true;
        }
        return moved;
    }

    function slideUp() {
        let moved = false;
        for (let c=0; c<4; c++) {
            let col = [board[0][c], board[1][c], board[2][c], board[3][c]];
            let newCol = slideRow(col);
            for (let r=0; r<4; r++) {
                if (board[r][c] !== newCol[r]) moved = true;
                board[r][c] = newCol[r];
            }
        }
        return moved;
    }

    function slideDown() {
        let moved = false;
        for (let c=0; c<4; c++) {
            let col = [board[0][c], board[1][c], board[2][c], board[3][c]].reverse();
            let newCol = slideRow(col).reverse();
            for (let r=0; r<4; r++) {
                if (board[r][c] !== newCol[r]) moved = true;
                board[r][c] = newCol[r];
            }
        }
        return moved;
    }

    function checkGameOver() {
        for (let r=0; r<4; r++) {
            for (let c=0; c<4; c++) {
                if (board[r][c] === 0) return false;
                if (c < 3 && board[r][c] === board[r][c+1]) return false;
                if (r < 3 && board[r][c] === board[r+1][c]) return false;
            }
        }
        return true;
    }

    function handleInput(dir) {
        if (!document.getElementById('g2048-overlay').classList.contains('hidden')) return;
        
        let moved = false;
        if (dir === 'LEFT') moved = slideLeft();
        else if (dir === 'RIGHT') moved = slideRight();
        else if (dir === 'UP') moved = slideUp();
        else if (dir === 'DOWN') moved = slideDown();

        if (moved) {
            addRandomTile();
            updateScore();
            renderBoard();
            if (checkGameOver()) {
                document.getElementById('g2048-overlay').classList.remove('hidden');
            }
        }
    }

    const keyHandler = (e) => {
        if (['ArrowUp', 'w', 'W'].includes(e.key)) handleInput('UP');
        if (['ArrowDown', 's', 'S'].includes(e.key)) handleInput('DOWN');
        if (['ArrowLeft', 'a', 'A'].includes(e.key)) handleInput('LEFT');
        if (['ArrowRight', 'd', 'D'].includes(e.key)) handleInput('RIGHT');
        if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) {
            e.preventDefault();
        }
    };

    const handleTouchStart = (e) => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
    };

    const handleTouchEnd = (e) => {
        let touchEndX = e.changedTouches[0].screenX;
        let touchEndY = e.changedTouches[0].screenY;
        let dx = touchEndX - touchStartX;
        let dy = touchEndY - touchStartY;
        
        if (Math.abs(dx) > Math.abs(dy)) {
            if (Math.abs(dx) > 30) {
                if (dx > 0) handleInput('RIGHT');
                else handleInput('LEFT');
            }
        } else {
            if (Math.abs(dy) > 30) {
                if (dy > 0) handleInput('DOWN');
                else handleInput('UP');
            }
        }
    };

    window.addEventListener('keydown', keyHandler, { passive: false });
    const boardEl = document.getElementById('g2048-board');
    boardEl.addEventListener('touchstart', handleTouchStart, {passive: true});
    boardEl.addEventListener('touchend', handleTouchEnd, {passive: true});
    
    // Resize observer to update tile positions
    const resizeObserver = new ResizeObserver(() => renderBoard());
    resizeObserver.observe(boardEl);

    document.getElementById('g2048-restart').onclick = reset;

    // Small delay to ensure layout is ready before first render
    setTimeout(reset, 50);

    return function cleanup() {
        window.removeEventListener('keydown', keyHandler);
        if(boardEl) {
            boardEl.removeEventListener('touchstart', handleTouchStart);
            boardEl.removeEventListener('touchend', handleTouchEnd);
        }
        resizeObserver.disconnect();
    };
};
