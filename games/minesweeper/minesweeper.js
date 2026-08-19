/* games/minesweeper/minesweeper.js */
window.initminesweeper = function(container) {
    container.innerHTML = `
        <div class="ms-container">
            <div class="ms-header">
                <div id="ms-flags">💣 10</div>
                <div id="ms-status" class="cursor-pointer">🙂</div>
                <div id="ms-time">⏱️ 0</div>
            </div>
            <div class="ms-board" id="ms-board">
                <div class="ms-overlay hidden" id="ms-overlay">
                    <h2 class="text-3xl font-bold text-slate-800 mb-2" id="ms-msg">Game Over!</h2>
                    <button id="ms-restart" class="px-6 py-3 bg-slate-800 text-white font-bold rounded-xl shadow-lg hover:bg-slate-900 mt-2">Play Again</button>
                </div>
            </div>
            <p class="text-xs text-slate-500 mt-4 text-center">Klik Kiri untuk buka, Klik Kanan / Tahan untuk bendera.</p>
        </div>
    `;

    const cols = 9;
    const rows = 9;
    const totalMines = 10;
    let grid = [];
    let minesLeft = totalMines;
    let time = 0;
    let timerInterval = null;
    let gameOver = false;
    let firstClick = true;
    let revealedCount = 0;

    const boardEl = document.getElementById('ms-board');
    boardEl.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

    function initGrid() {
        grid = Array(rows).fill(0).map(() => Array(cols).fill({}).map(() => ({
            mine: false,
            revealed: false,
            flagged: false,
            neighborMines: 0
        })));
        
        // Render UI
        boardEl.innerHTML = '';
        boardEl.appendChild(document.getElementById('ms-overlay')); // keep overlay

        for (let r=0; r<rows; r++) {
            for (let c=0; c<cols; c++) {
                const cell = document.createElement('div');
                cell.className = 'ms-cell';
                cell.dataset.r = r;
                cell.dataset.c = c;
                
                // Event Listeners
                cell.addEventListener('click', (e) => handleCellClick(r, c));
                cell.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    handleRightClick(r, c);
                });
                
                // Long press for mobile flag
                let pressTimer;
                cell.addEventListener('touchstart', (e) => {
                    pressTimer = setTimeout(() => { handleRightClick(r, c); }, 500);
                }, {passive: true});
                cell.addEventListener('touchend', () => clearTimeout(pressTimer));
                cell.addEventListener('touchmove', () => clearTimeout(pressTimer));

                boardEl.appendChild(cell);
            }
        }
    }

    function placeMines(excludeR, excludeC) {
        let placed = 0;
        while (placed < totalMines) {
            const r = Math.floor(Math.random() * rows);
            const c = Math.floor(Math.random() * cols);
            // don't place on first click or already a mine
            if (!grid[r][c].mine && !(Math.abs(r - excludeR) <= 1 && Math.abs(c - excludeC) <= 1)) {
                grid[r][c].mine = true;
                placed++;
            }
        }
        
        // calculate neighbors
        for (let r=0; r<rows; r++) {
            for (let c=0; c<cols; c++) {
                if (!grid[r][c].mine) {
                    let count = 0;
                    for (let dr=-1; dr<=1; dr++) {
                        for (let dc=-1; dc<=1; dc++) {
                            const nr = r + dr;
                            const nc = c + dc;
                            if (nr>=0 && nr<rows && nc>=0 && nc<cols && grid[nr][nc].mine) {
                                count++;
                            }
                        }
                    }
                    grid[r][c].neighborMines = count;
                }
            }
        }
    }

    function getCellEl(r, c) {
        return boardEl.querySelector(`.ms-cell[data-r="${r}"][data-c="${c}"]`);
    }

    function handleCellClick(r, c) {
        if (gameOver || grid[r][c].flagged || grid[r][c].revealed) return;

        if (firstClick) {
            placeMines(r, c);
            firstClick = false;
            timerInterval = setInterval(() => {
                time++;
                document.getElementById('ms-time').innerText = `⏱️ ${time}`;
            }, 1000);
            document.getElementById('ms-status').innerText = '😲';
            setTimeout(() => { if(!gameOver) document.getElementById('ms-status').innerText = '🙂'; }, 300);
        }

        if (grid[r][c].mine) {
            endGame(false, r, c);
        } else {
            reveal(r, c);
            checkWin();
        }
    }

    function handleRightClick(r, c) {
        if (gameOver || grid[r][c].revealed) return;
        
        grid[r][c].flagged = !grid[r][c].flagged;
        minesLeft += grid[r][c].flagged ? -1 : 1;
        document.getElementById('ms-flags').innerText = `💣 ${minesLeft}`;
        
        const cellEl = getCellEl(r, c);
        if (grid[r][c].flagged) {
            cellEl.innerHTML = '🚩';
            cellEl.classList.add('flagged');
        } else {
            cellEl.innerHTML = '';
            cellEl.classList.remove('flagged');
        }
    }

    function reveal(r, c) {
        if (r<0 || r>=rows || c<0 || c>=cols || grid[r][c].revealed || grid[r][c].flagged) return;

        grid[r][c].revealed = true;
        revealedCount++;
        
        const cellEl = getCellEl(r, c);
        cellEl.classList.add('revealed');
        
        if (grid[r][c].neighborMines > 0) {
            cellEl.innerText = grid[r][c].neighborMines;
            cellEl.classList.add(`ms-${grid[r][c].neighborMines}`);
        } else {
            // Flood fill
            for (let dr=-1; dr<=1; dr++) {
                for (let dc=-1; dc<=1; dc++) {
                    reveal(r+dr, c+dc);
                }
            }
        }
    }

    function checkWin() {
        if (revealedCount === (rows * cols) - totalMines) {
            endGame(true);
        }
    }

    function endGame(win, deathR = -1, deathC = -1) {
        gameOver = true;
        clearInterval(timerInterval);
        document.getElementById('ms-status').innerText = win ? '😎' : '😵';
        
        // Reveal all mines
        for (let r=0; r<rows; r++) {
            for (let c=0; c<cols; c++) {
                if (grid[r][c].mine) {
                    const cellEl = getCellEl(r, c);
                    if (!grid[r][c].flagged) {
                        cellEl.innerHTML = '💣';
                        cellEl.classList.add('revealed');
                        if (r === deathR && c === deathC) {
                            cellEl.classList.add('mine');
                        }
                    }
                } else if (grid[r][c].flagged) {
                    // False flag
                    const cellEl = getCellEl(r, c);
                    cellEl.innerHTML = '❌';
                }
            }
        }

        setTimeout(() => {
            document.getElementById('ms-overlay').classList.remove('hidden');
            document.getElementById('ms-msg').innerText = win ? 'You Win!' : 'Game Over!';
            
            if (win) {
                let best = parseInt(localStorage.getItem('arcade_minesweeper_best')) || 999;
                if (time < best) {
                    localStorage.setItem('arcade_minesweeper_best', time);
                    document.getElementById('ms-msg').innerText += '\nNew Best Time!';
                }
            }
        }, 1500);
    }

    function reset() {
        clearInterval(timerInterval);
        minesLeft = totalMines;
        time = 0;
        gameOver = false;
        firstClick = true;
        revealedCount = 0;
        
        document.getElementById('ms-flags').innerText = `💣 ${minesLeft}`;
        document.getElementById('ms-time').innerText = `⏱️ ${time}`;
        document.getElementById('ms-status').innerText = '🙂';
        document.getElementById('ms-overlay').classList.add('hidden');
        
        initGrid();
    }

    document.getElementById('ms-status').addEventListener('click', reset);
    document.getElementById('ms-restart').addEventListener('click', reset);

    reset();

    return function cleanup() {
        clearInterval(timerInterval);
    };
};
