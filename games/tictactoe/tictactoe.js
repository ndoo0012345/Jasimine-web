/* games/tictactoe/tictactoe.js */
window.inittictactoe = function(container) {
    container.innerHTML = `
        <div class="ttt-container">
            <div class="ttt-header">
                <h2 class="text-3xl font-extrabold text-slate-800 mb-1">Tic Tac Toe</h2>
                <div class="inline-flex gap-4 font-bold text-sm bg-slate-100 px-4 py-2 rounded-full text-slate-600 border border-slate-200 shadow-sm">
                    <div>Win: <span id="ttt-wins" class="text-brand-600">0</span></div>
                    <div>Loss: <span id="ttt-losses" class="text-rose-500">0</span></div>
                    <div>Draw: <span id="ttt-draws" class="text-slate-500">0</span></div>
                </div>
            </div>
            
            <div class="ttt-board" id="ttt-board">
                <div class="ttt-cell" data-idx="0"></div>
                <div class="ttt-cell" data-idx="1"></div>
                <div class="ttt-cell" data-idx="2"></div>
                <div class="ttt-cell" data-idx="3"></div>
                <div class="ttt-cell" data-idx="4"></div>
                <div class="ttt-cell" data-idx="5"></div>
                <div class="ttt-cell" data-idx="6"></div>
                <div class="ttt-cell" data-idx="7"></div>
                <div class="ttt-cell" data-idx="8"></div>

                <div class="ttt-overlay hidden" id="ttt-overlay">
                    <h2 class="text-4xl font-black mb-2" id="ttt-msg">You Win!</h2>
                    <button id="ttt-restart" class="px-6 py-3 bg-brand-500 text-white font-bold rounded-xl shadow-lg hover:bg-brand-600 mt-4">Play Again</button>
                </div>
            </div>
        </div>
    `;

    const cells = document.querySelectorAll('.ttt-cell');
    let board = Array(9).fill(null);
    let isPlayerTurn = true; // Player is X
    let gameOver = false;
    
    let stats = JSON.parse(localStorage.getItem('arcade_tictactoe_stats')) || { w:0, l:0, d:0 };
    
    function updateStatsUI() {
        document.getElementById('ttt-wins').innerText = stats.w;
        document.getElementById('ttt-losses').innerText = stats.l;
        document.getElementById('ttt-draws').innerText = stats.d;
        localStorage.setItem('arcade_tictactoe_stats', JSON.stringify(stats));
    }
    updateStatsUI();

    const winPatterns = [
        [0,1,2], [3,4,5], [6,7,8], // rows
        [0,3,6], [1,4,7], [2,5,8], // cols
        [0,4,8], [2,4,6] // diags
    ];

    function checkWin(b, player) {
        return winPatterns.some(p => p.every(idx => b[idx] === player));
    }

    function checkDraw(b) {
        return b.every(cell => cell !== null);
    }

    function computerMove() {
        if (gameOver) return;
        
        let bestMove = -1;
        
        // 1. Win
        for (let i=0; i<9; i++) {
            if (board[i] === null) {
                board[i] = 'O';
                if (checkWin(board, 'O')) bestMove = i;
                board[i] = null;
                if (bestMove !== -1) break;
            }
        }
        
        // 2. Block
        if (bestMove === -1) {
            for (let i=0; i<9; i++) {
                if (board[i] === null) {
                    board[i] = 'X';
                    if (checkWin(board, 'X')) bestMove = i;
                    board[i] = null;
                    if (bestMove !== -1) break;
                }
            }
        }

        // 3. Center
        if (bestMove === -1 && board[4] === null) {
            bestMove = 4;
        }

        // 4. Random
        if (bestMove === -1) {
            let available = [];
            for (let i=0; i<9; i++) if (board[i] === null) available.push(i);
            if (available.length > 0) {
                bestMove = available[Math.floor(Math.random() * available.length)];
            }
        }

        if (bestMove !== -1) {
            board[bestMove] = 'O';
            cells[bestMove].innerText = 'O';
            cells[bestMove].classList.add('o');
            
            if (checkWin(board, 'O')) {
                endGame('O');
            } else if (checkDraw(board)) {
                endGame('Draw');
            } else {
                isPlayerTurn = true;
            }
        }
    }

    function handleCellClick(e) {
        const idx = e.target.dataset.idx;
        if (!isPlayerTurn || gameOver || board[idx] !== null) return;

        board[idx] = 'X';
        e.target.innerText = 'X';
        e.target.classList.add('x');

        if (checkWin(board, 'X')) {
            endGame('X');
        } else if (checkDraw(board)) {
            endGame('Draw');
        } else {
            isPlayerTurn = false;
            setTimeout(computerMove, 500); // 500ms delay for realism
        }
    }

    function endGame(winner) {
        gameOver = true;
        const overlay = document.getElementById('ttt-overlay');
        const msg = document.getElementById('ttt-msg');
        
        if (winner === 'X') {
            msg.innerText = 'You Win! 🎉';
            msg.className = 'text-4xl font-black mb-2 text-brand-600';
            stats.w++;
        } else if (winner === 'O') {
            msg.innerText = 'You Lose! 😢';
            msg.className = 'text-4xl font-black mb-2 text-rose-600';
            stats.l++;
        } else {
            msg.innerText = 'Draw! 🤝';
            msg.className = 'text-4xl font-black mb-2 text-slate-600';
            stats.d++;
        }
        
        updateStatsUI();
        
        setTimeout(() => {
            overlay.classList.remove('hidden');
        }, 500);
    }

    function reset() {
        board = Array(9).fill(null);
        isPlayerTurn = true;
        gameOver = false;
        
        cells.forEach(c => {
            c.innerText = '';
            c.className = 'ttt-cell';
        });
        
        document.getElementById('ttt-overlay').classList.add('hidden');
    }

    cells.forEach(c => c.addEventListener('click', handleCellClick));
    document.getElementById('ttt-restart').addEventListener('click', reset);

    return function cleanup() {
        // cleanup
    };
};
