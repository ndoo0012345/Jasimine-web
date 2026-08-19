const ARCADE_GAMES = [
    { id: 'snake', title: 'Snake', desc: 'Classic arcade snake.', category: 'Classic', icon: '🐍' },
    { id: 'game2048', title: '2048', desc: 'Slide tiles to reach 2048.', category: 'Brain', icon: '🧠' },
    { id: 'minesweeper', title: 'Minesweeper', desc: 'Clear the board without hitting a mine.', category: 'Classic', icon: '💣' },
    { id: 'reaction', title: 'Reaction Test', desc: 'Test your reflexes.', category: 'Reaction', icon: '⚡' },
    { id: 'memory', title: 'Memory Match', desc: 'Find the matching pairs.', category: 'Casual', icon: '🃏' },
    { id: 'tictactoe', title: 'Tic Tac Toe', desc: 'Play against the computer.', category: 'Casual', icon: '❌' },
    { id: 'flappy', title: 'Flappy Mini', desc: 'Navigate the obstacles.', category: 'Reaction', icon: '🐦' },
    { id: 'breakout', title: 'Breakout', desc: 'Break all the blocks.', category: 'Classic', icon: '🧱' },
    { id: 'whack', title: 'Whack-A-Mole', desc: 'Whack the moles as they appear.', category: 'Reaction', icon: '🔨' },
    { id: 'numbermemory', title: 'Number Memory', desc: 'Remember the longest number.', category: 'Brain', icon: '🔢' },
];

let currentGameCleanup = null;

// Initialize Arcade
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('arcade-grid')) {
        renderGames(ARCADE_GAMES);
        updateArcadeStats();

        const searchInput = document.getElementById('arcade-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const term = e.target.value.toLowerCase();
                const filtered = ARCADE_GAMES.filter(g => 
                    g.title.toLowerCase().includes(term) || g.desc.toLowerCase().includes(term)
                );
                renderGames(filtered);
            });
        }
    }
});

function filterArcade(category) {
    document.querySelectorAll('.arcade-filter-btn').forEach(btn => {
        btn.classList.remove('bg-brand-600', 'text-white', 'active');
        btn.classList.add('bg-white', 'text-slate-600');
    });
    
    const activeBtn = document.getElementById('btn-filter-' + category);
    if (activeBtn) {
        activeBtn.classList.add('bg-brand-600', 'text-white', 'active');
        activeBtn.classList.remove('bg-white', 'text-slate-600');
    }

    if (category === 'All') {
        renderGames(ARCADE_GAMES);
    } else {
        renderGames(ARCADE_GAMES.filter(g => g.category === category));
    }
}

function renderGames(games) {
    const grid = document.getElementById('arcade-grid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    if (games.length === 0) {
        grid.innerHTML = `<div class="col-span-full text-center py-10 text-slate-500 font-medium">Tidak ada game yang ditemukan.</div>`;
        return;
    }

    games.forEach(game => {
        // Fetch High Score
        const bestScoreStr = localStorage.getItem('arcade_' + game.id + '_best') || '0';
        
        const card = document.createElement('div');
        card.className = 'bg-white rounded-2xl p-5 border border-slate-100 shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col h-full transform hover:-translate-y-1 cursor-pointer';
        card.onclick = () => openArcadeGame(game);
        
        card.innerHTML = `
            <div class="flex items-start justify-between mb-4">
                <div class="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center text-2xl shadow-sm">
                    ${game.icon}
                </div>
                <span class="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-600 uppercase tracking-wide border border-slate-200">
                    ${game.category}
                </span>
            </div>
            <h4 class="font-extrabold text-slate-900 text-lg mb-1">${game.title}</h4>
            <p class="text-xs text-slate-500 mb-4 flex-grow">${game.desc}</p>
            <div class="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
                <div>
                    <span class="block text-[10px] text-slate-400 uppercase font-bold">Best Score</span>
                    <span class="font-bold text-brand-600 text-sm">${bestScoreStr}</span>
                </div>
                <button class="w-10 h-10 rounded-full bg-brand-500 hover:bg-brand-600 text-white flex items-center justify-center shadow-md transition-colors" title="Play ${game.title}">
                    <i class="fa-solid fa-play text-sm ml-0.5"></i>
                </button>
            </div>
        `;
        grid.appendChild(card);
    });
}

function updateArcadeStats() {
    let played = localStorage.getItem('arcade_played_count') || '0';
    const playedEl = document.getElementById('stat-played');
    if (playedEl) playedEl.textContent = played;
}

function incrementGamesPlayed() {
    let played = parseInt(localStorage.getItem('arcade_played_count') || '0', 10);
    played++;
    localStorage.setItem('arcade_played_count', played);
    updateArcadeStats();
}

function openArcadeGame(game) {
    const modal = document.getElementById('arcade-game-modal');
    if (!modal) return;
    
    incrementGamesPlayed();

    document.getElementById('modal-game-icon').textContent = game.icon;
    document.getElementById('modal-game-title').textContent = game.title;
    document.getElementById('modal-game-category').textContent = game.category;
    
    const container = document.getElementById('modal-game-container');
    container.innerHTML = `<div class="text-slate-400 animate-pulse text-sm font-semibold">Memuat game...</div>`;
    
    modal.classList.remove('hidden');
    // small delay for transition
    setTimeout(() => {
        modal.classList.remove('opacity-0');
        document.getElementById('arcade-modal-content').classList.remove('scale-95');
        document.body.style.overflow = 'hidden';
    }, 10);

    // Load game resources dynamically
    loadGameResources(game.id, container);
}

function closeArcadeGame() {
    const modal = document.getElementById('arcade-game-modal');
    if (!modal) return;
    
    // Trigger cleanup
    if (currentGameCleanup) {
        try {
            currentGameCleanup();
        } catch(e) {
            console.error("Error during game cleanup:", e);
        }
        currentGameCleanup = null;
    }

    // Cleanup injected resources
    const oldCss = document.getElementById('dynamic-game-css');
    if (oldCss) oldCss.remove();
    
    const oldJs = document.getElementById('dynamic-game-js');
    if (oldJs) oldJs.remove();

    const container = document.getElementById('modal-game-container');
    container.innerHTML = '';

    modal.classList.add('opacity-0');
    document.getElementById('arcade-modal-content').classList.add('scale-95');
    
    setTimeout(() => {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
        renderGames(ARCADE_GAMES); // refresh scores
    }, 300);
}

function loadGameResources(gameId, container) {
    // Remove old if exists
    const oldCss = document.getElementById('dynamic-game-css');
    if (oldCss) oldCss.remove();
    const oldJs = document.getElementById('dynamic-game-js');
    if (oldJs) oldJs.remove();

    // 1. Load CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `games/${gameId}/${gameId}.css`;
    link.id = 'dynamic-game-css';
    document.head.appendChild(link);

    // 2. Clear container
    container.innerHTML = '';

    // 3. Load JS
    const script = document.createElement('script');
    script.src = `games/${gameId}/${gameId}.js`;
    script.id = 'dynamic-game-js';
    
    script.onload = () => {
        // The script should attach a global init function based on its ID
        // e.g., window.initsnake()
        const initFuncName = 'init' + gameId;
        if (typeof window[initFuncName] === 'function') {
            currentGameCleanup = window[initFuncName](container);
        } else {
            container.innerHTML = `<div class="text-red-500 font-bold p-4">Error: ${initFuncName} not found.</div>`;
        }
    };
    script.onerror = () => {
        container.innerHTML = `<div class="text-red-500 font-bold p-4">Error: Failed to load ${gameId}.js</div>`;
    }
    
    document.body.appendChild(script);
}
