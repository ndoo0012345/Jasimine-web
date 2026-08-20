/* games/reaction/reaction.js */
window.initreaction = function(container) {
    container.innerHTML = `
        <div class="react-container">
            <div id="react-area" class="react-area react-waiting">
                <div id="react-icon" class="react-icon">⚡</div>
                <div id="react-title" class="react-title">Reaction Test</div>
                <div id="react-desc" class="react-desc">Click here to start</div>
            </div>
            
            <div class="react-stats">
                <div class="react-stat-box">
                    <div class="react-stat-label">Current</div>
                    <div class="react-stat-value" id="react-current">- ms</div>
                </div>
                <div class="react-stat-box">
                    <div class="react-stat-label">Best</div>
                    <div class="react-stat-value" id="react-best">- ms</div>
                </div>
            </div>
        </div>
    `;

    const area = document.getElementById('react-area');
    const icon = document.getElementById('react-icon');
    const title = document.getElementById('react-title');
    const desc = document.getElementById('react-desc');
    
    let state = 'waiting'; // waiting, ready, go, result
    let startTime = 0;
    let timeout = null;
    let bestScore = parseInt(localStorage.getItem('arcade_reaction_best')) || null;

    if (bestScore) {
        document.getElementById('react-best').innerText = bestScore + ' ms';
    } else {
        document.getElementById('react-best').innerText = '0 ms'; // Match arcade logic default 0
        // Wait, arcade logic shows 0 if no score. To keep consistency, let's keep 0 in localStorage if needed.
    }

    function handleClick() {
        if (state === 'waiting' || state === 'result') {
            // start
            state = 'ready';
            area.className = 'react-area react-ready';
            icon.innerText = '🔴';
            title.innerText = 'Wait for green...';
            desc.innerText = '';
            
            const delay = Math.floor(Math.random() * 3000) + 1500;
            timeout = setTimeout(() => {
                state = 'go';
                area.className = 'react-area react-go';
                icon.innerText = '🟢';
                title.innerText = 'Click!';
                startTime = performance.now();
            }, delay);
        } else if (state === 'ready') {
            // too early
            clearTimeout(timeout);
            state = 'result';
            area.className = 'react-area react-result';
            icon.innerText = '😅';
            title.innerText = 'Too soon!';
            desc.innerText = 'Click to try again.';
        } else if (state === 'go') {
            // success
            const endTime = performance.now();
            const time = Math.round(endTime - startTime);
            state = 'result';
            
            area.className = 'react-area react-waiting';
            icon.innerText = '⏱️';
            title.innerText = time + ' ms';
            desc.innerText = 'Click to keep trying.';
            
            document.getElementById('react-current').innerText = time + ' ms';
            
            if (!bestScore || time < bestScore || bestScore === 0) {
                bestScore = time;
                localStorage.setItem('arcade_reaction_best', bestScore);
                document.getElementById('react-best').innerText = bestScore + ' ms';
            }
        }
    }

    area.addEventListener('mousedown', (e) => {
        if (e.button !== 0) return; // only left click
        e.preventDefault();
        handleClick();
    });
    
    area.addEventListener('touchstart', (e) => {
        e.preventDefault();
        handleClick();
    }, {passive: false});

    return function cleanup() {
        clearTimeout(timeout);
    };
};
