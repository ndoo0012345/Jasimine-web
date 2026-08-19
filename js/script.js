/* ============================================================
   ANGELICA JASMINE KARTAWINATA — MAIN SCRIPT
   Music Playlist Player + UI Interactions
   ============================================================ */

/* ── PLAYLIST DATA ── */
const PLAYLIST = [
    {
        src:    'animal.mp3',
        title:  'Animal',
        artist: 'KATSEYE',
        color:  'from-brand-600 to-sky-400'
    },
    {
        src:    'SENCY.mp3',
        title:  'SENCY',
        artist: 'DIA Ft. TENXI',
        color:  'from-purple-600 to-pink-400'
    },
    {
        src:    'Candy Scar.mp3',
        title:  'Candy Scar',
        artist: 'VIVINOS',
        color:  'from-rose-500 to-orange-400'
    },
    {
        src:    'Bang Jono.mp3',
        title:  'Bang Jono',
        artist: 'ZASKIA GOTIK',
        color:  'from-emerald-500 to-teal-400'
    }
];

/* ── STORAGE KEYS ── */
const STORAGE_KEY_POS     = 'ajk_music_pos';
const STORAGE_KEY_PLAYING = 'ajk_music_playing';
const STORAGE_KEY_VOLUME  = 'ajk_music_volume';
const STORAGE_KEY_MUTED   = 'ajk_music_muted';
const STORAGE_KEY_WIDGET  = 'ajk_music_widget_open';
const STORAGE_KEY_TRACK   = 'ajk_music_track';

/* ── CURRENT TRACK INDEX ── */
let currentTrack = parseInt(localStorage.getItem(STORAGE_KEY_TRACK) || '0', 10);
if (currentTrack < 0 || currentTrack >= PLAYLIST.length) currentTrack = 0;

/* ── MUSIC PLAYER CORE ── */
const audio          = document.getElementById('global-audio');
const playIcon       = document.getElementById('music-play-icon');
const progressBar    = document.getElementById('music-progress');
const timeDisplay    = document.getElementById('music-time-display');
const vinylDisc      = document.getElementById('music-vinyl-disc');
const volIcon        = document.getElementById('music-vol-icon');
const volumeSlider   = document.getElementById('music-volume');
const pillStatus     = document.getElementById('music-pill-status');
const statusNotice   = document.getElementById('music-status-notice');
const playerCard     = document.getElementById('music-player-card');
const playerPill     = document.getElementById('music-player-pill');

let isPlaying = false;
let raf; // requestAnimationFrame handle

/* ─── Format seconds → mm:ss ─── */
function formatTime(sec) {
    if (isNaN(sec) || !isFinite(sec)) return '00:00';
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = Math.floor(sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

/* ─── Update progress UI ─── */
function updateProgressUI() {
    if (!audio) return;
    const cur = audio.currentTime;
    const dur = audio.duration || 0;
    const pct = dur > 0 ? (cur / dur) * 100 : 0;

    if (progressBar) {
        progressBar.value = pct;
        progressBar.style.setProperty('--progress', pct + '%');
    }
    if (timeDisplay) {
        timeDisplay.textContent = `${formatTime(cur)} / ${formatTime(dur)}`;
    }
}

/* ─── Animation loop ─── */
function tick() {
    updateProgressUI();
    if (isPlaying) raf = requestAnimationFrame(tick);
}

/* ─── Apply vinyl spin ─── */
function setVinylSpin(spinning) {
    if (!vinylDisc) return;
    if (spinning) {
        vinylDisc.classList.remove('animate-vinyl-paused');
        vinylDisc.classList.add('animate-vinyl-spin');
    } else {
        vinylDisc.classList.remove('animate-vinyl-spin');
        vinylDisc.classList.add('animate-vinyl-paused');
    }
}

/* ─── Update pill status text ─── */
function updatePillStatus() {
    if (!pillStatus) return;
    pillStatus.textContent = isPlaying ? '▶ Sedang Diputar' : '⏸ Jeda';
}

/* ─── Update song info display in the player ─── */
function updateTrackUI() {
    const track = PLAYLIST[currentTrack];
    if (!track) return;

    // Song title
    const titleEl = document.getElementById('music-song-title');
    if (titleEl) {
        titleEl.textContent = track.title;
        titleEl.setAttribute('title', track.title);
    }

    // Artist
    const artistEl = document.getElementById('music-song-artist');
    if (artistEl) artistEl.textContent = track.artist;

    // Pill title
    const pillTitleEl = document.getElementById('music-pill-title');
    if (pillTitleEl) pillTitleEl.textContent = track.title;

    // Track counter badge
    const counterEl = document.getElementById('music-track-counter');
    if (counterEl) counterEl.textContent = `${currentTrack + 1} / ${PLAYLIST.length}`;

    // Vinyl disc accent color (update glow class)
    if (vinylDisc) {
        vinylDisc.style.boxShadow = currentTrack === 0
            ? '0 0 20px rgba(14,165,233,0.4)'
            : '0 0 20px rgba(168,85,247,0.4)';
    }
}

/* ─── Load a track by index ─── */
function loadTrack(index, autoPlay) {
    if (!audio) return;
    if (index < 0) index = PLAYLIST.length - 1;
    if (index >= PLAYLIST.length) index = 0;
    currentTrack = index;

    // Stop current playback
    audio.pause();
    cancelAnimationFrame(raf);
    isPlaying = false;
    if (playIcon) { playIcon.classList.remove('fa-pause'); playIcon.classList.add('fa-play'); }
    setVinylSpin(false);

    // Reset progress
    if (progressBar) { progressBar.value = 0; progressBar.style.setProperty('--progress', '0%'); }
    if (timeDisplay) timeDisplay.textContent = '00:00 / 00:00';

    // Set new source
    audio.src = PLAYLIST[currentTrack].src;
    audio.load();

    // Save track index, reset position
    localStorage.setItem(STORAGE_KEY_TRACK, currentTrack.toString());
    localStorage.setItem(STORAGE_KEY_POS, '0');

    // Update UI labels
    updateTrackUI();

    // Track switch entrance animation on vinyl
    if (vinylDisc) {
        vinylDisc.style.transition = 'transform 0.3s ease, box-shadow 0.4s ease';
        vinylDisc.style.transform = 'scale(0.85)';
        setTimeout(() => { vinylDisc.style.transform = 'scale(1)'; }, 300);
    }

    if (autoPlay) {
        audio.addEventListener('canplay', function playOnReady() {
            audio.removeEventListener('canplay', playOnReady);
            const p = audio.play();
            if (p !== undefined) {
                p.then(() => {
                    isPlaying = true;
                    if (playIcon) { playIcon.classList.remove('fa-play'); playIcon.classList.add('fa-pause'); }
                    setVinylSpin(true);
                    raf = requestAnimationFrame(tick);
                }).catch(() => {
                    if (statusNotice) statusNotice.classList.remove('hidden');
                });
            }
            localStorage.setItem(STORAGE_KEY_PLAYING, '1');
            updatePillStatus();
        }, { once: true });
    }
}

/* ─── PUBLIC: Next Track ─── */
function nextTrack() {
    loadTrack(currentTrack + 1, true);
}

/* ─── PUBLIC: Previous Track ─── */
function prevTrack() {
    // If more than 3 seconds in, restart current; else go back
    if (audio && audio.currentTime > 3) {
        audio.currentTime = 0;
        if (!isPlaying) togglePlayPause();
    } else {
        loadTrack(currentTrack - 1, true);
    }
}

/* ─── PUBLIC: Toggle Play / Pause ─── */
function togglePlayPause() {
    if (!audio) return;
    if (isPlaying) {
        audio.pause();
        isPlaying = false;
        if (playIcon) { playIcon.classList.remove('fa-pause'); playIcon.classList.add('fa-play'); }
        setVinylSpin(false);
        cancelAnimationFrame(raf);
        if (statusNotice) statusNotice.classList.add('hidden');
    } else {
        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                isPlaying = true;
                if (playIcon) { playIcon.classList.remove('fa-play'); playIcon.classList.add('fa-pause'); }
                setVinylSpin(true);
                raf = requestAnimationFrame(tick);
                if (statusNotice) statusNotice.classList.add('hidden');
            }).catch(() => {
                if (statusNotice) statusNotice.classList.remove('hidden');
            });
        }
    }
    localStorage.setItem(STORAGE_KEY_PLAYING, isPlaying ? '1' : '0');
    updatePillStatus();
}

/* ─── PUBLIC: Seek by offset (seconds) ─── */
function seekOffset(seconds) {
    if (!audio) return;
    audio.currentTime = Math.max(0, Math.min(audio.duration || 0, audio.currentTime + seconds));
    updateProgressUI();
    savePosition();
}

/* ─── PUBLIC: Seek to percentage ─── */
function seekAudio(value) {
    if (!audio || !audio.duration) return;
    audio.currentTime = (value / 100) * audio.duration;
    savePosition();
}

/* ─── PUBLIC: Toggle mute ─── */
function toggleMute() {
    if (!audio) return;
    audio.muted = !audio.muted;
    updateVolumeIcon();
    localStorage.setItem(STORAGE_KEY_MUTED, audio.muted ? '1' : '0');
}

/* ─── PUBLIC: Change volume ─── */
function changeVolume(value) {
    if (!audio) return;
    audio.volume = parseFloat(value);
    audio.muted  = false;
    updateVolumeIcon();
    localStorage.setItem(STORAGE_KEY_VOLUME, value);
    localStorage.setItem(STORAGE_KEY_MUTED, '0');
}

/* ─── Update volume icon ─── */
function updateVolumeIcon() {
    if (!volIcon || !audio) return;
    volIcon.className = 'fa-solid text-brand-400 text-xs';
    if (audio.muted || audio.volume === 0) {
        volIcon.classList.add('fa-volume-xmark');
    } else if (audio.volume < 0.5) {
        volIcon.classList.add('fa-volume-low');
    } else {
        volIcon.classList.add('fa-volume-high');
    }
    if (volumeSlider) volumeSlider.value = audio.muted ? 0 : audio.volume;
}

/* ─── PUBLIC: Toggle widget expand/collapse ─── */
function toggleMusicWidget() {
    if (!playerCard || !playerPill) return;
    const isOpen = !playerCard.classList.contains('hidden');
    if (isOpen) {
        playerCard.classList.add('hidden');
        playerPill.classList.remove('hidden');
        localStorage.setItem(STORAGE_KEY_WIDGET, '0');
    } else {
        playerCard.classList.remove('hidden');
        playerPill.classList.add('hidden');
        localStorage.setItem(STORAGE_KEY_WIDGET, '1');
    }
}

/* ─── Save current position ─── */
function savePosition() {
    if (!audio) return;
    localStorage.setItem(STORAGE_KEY_POS, audio.currentTime.toString());
}

/* ─── Restore saved state ─── */
function restoreState() {
    if (!audio) return;

    // Volume
    const savedVol = localStorage.getItem(STORAGE_KEY_VOLUME);
    if (savedVol !== null) {
        audio.volume = parseFloat(savedVol);
        if (volumeSlider) volumeSlider.value = savedVol;
    } else {
        audio.volume = 0.8;
        if (volumeSlider) volumeSlider.value = 0.8;
    }

    // Muted
    const savedMuted = localStorage.getItem(STORAGE_KEY_MUTED);
    audio.muted = savedMuted === '1';
    updateVolumeIcon();

    // Widget open/closed
    const widgetOpen = localStorage.getItem(STORAGE_KEY_WIDGET);
    if (widgetOpen === '0') {
        if (playerCard) playerCard.classList.add('hidden');
        if (playerPill) playerPill.classList.remove('hidden');
    } else {
        if (playerCard) playerCard.classList.remove('hidden');
        if (playerPill) playerPill.classList.add('hidden');
    }

    // Set the correct track source (without auto-play)
    audio.src = PLAYLIST[currentTrack].src;
    updateTrackUI();

    // Restore position once metadata is ready
    const restorePos = () => {
        const savedPos = localStorage.getItem(STORAGE_KEY_POS);
        if (savedPos !== null) {
            audio.currentTime = parseFloat(savedPos);
        }
        updateProgressUI();

        // Auto-resume if was playing
        const wasPlaying = localStorage.getItem(STORAGE_KEY_PLAYING);
        if (wasPlaying === '1') {
            const p = audio.play();
            if (p !== undefined) {
                p.then(() => {
                    isPlaying = true;
                    if (playIcon) { playIcon.classList.remove('fa-play'); playIcon.classList.add('fa-pause'); }
                    setVinylSpin(true);
                    raf = requestAnimationFrame(tick);
                    if (statusNotice) statusNotice.classList.add('hidden');
                }).catch(() => {
                    isPlaying = false;
                    if (statusNotice) statusNotice.classList.remove('hidden');
                });
            }
        }
        updatePillStatus();
    };

    if (audio.readyState >= 1) {
        restorePos();
    } else {
        audio.addEventListener('loadedmetadata', restorePos, { once: true });
    }
}

/* ─── Auto-save position periodically & on unload ─── */
function setupAutoSave() {
    if (!audio) return;
    setInterval(() => {
        if (isPlaying) savePosition();
    }, 1000);

    window.addEventListener('beforeunload', () => {
        savePosition();
        localStorage.setItem(STORAGE_KEY_PLAYING, isPlaying ? '1' : '0');
    });

    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
            savePosition();
            localStorage.setItem(STORAGE_KEY_PLAYING, isPlaying ? '1' : '0');
        }
    });
}

/* ─── Handle audio end → auto-next ─── */
function onAudioEnded() {
    // Auto-play next track
    const next = (currentTrack + 1) % PLAYLIST.length;
    loadTrack(next, true);
}

/* ── INIT MUSIC PLAYER ── */
if (audio) {
    audio.addEventListener('ended', onAudioEnded);
    restoreState();
    setupAutoSave();
}

/* ============================================================
   NAVIGATION & TAB SWITCHING (index.html specific)
   ============================================================ */

function switchTab(tabName) {
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(t => t.classList.add('hidden'));
    const target = document.getElementById('tab-' + tabName);
    if (target) target.classList.remove('hidden');
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('text-brand-700', 'bg-white', 'shadow-sm');
        btn.classList.add('text-slate-600');
    });
    const activeNavBtn = document.getElementById('nav-' + tabName);
    if (activeNavBtn) {
        activeNavBtn.classList.add('text-brand-700', 'bg-white', 'shadow-sm');
        activeNavBtn.classList.remove('text-slate-600');
    }
}

/* ── MOBILE MENU ── */
function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    const icon = document.getElementById('mobile-menu-icon');
    if (!menu) return;
    const isOpen = !menu.classList.contains('hidden');
    if (isOpen) {
        menu.classList.add('hidden');
        if (icon) { icon.classList.remove('fa-xmark'); icon.classList.add('fa-bars'); }
    } else {
        menu.classList.remove('hidden');
        if (icon) { icon.classList.remove('fa-bars'); icon.classList.add('fa-xmark'); }
    }
}

/* ── ASSIGNMENT MODAL (index.html) ── */
function openModal(title, status, body) {
    const modal = document.getElementById('detail-modal');
    if (!modal) return;
    document.getElementById('modal-title').textContent  = title  || '';
    document.getElementById('modal-status').textContent = status || '';
    document.getElementById('modal-body').innerHTML     = body   || '';
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const modal = document.getElementById('detail-modal');
    if (modal) modal.classList.add('hidden');
    document.body.style.overflow = '';
}

document.addEventListener('click', e => {
    const modal = document.getElementById('detail-modal');
    if (modal && e.target === modal) closeModal();
});

/* ── SCHEDULE SUB-TABS ── */
function switchScheduleSubtab(name) {
    document.querySelectorAll('.schedule-subtab-content').forEach(el => el.classList.add('hidden'));
    const target = document.getElementById('schedule-subtab-' + name);
    if (target) target.classList.remove('hidden');
    document.querySelectorAll('.schedule-tab-btn').forEach(btn => {
        btn.classList.remove('bg-white', 'text-brand-700', 'shadow-md');
        btn.classList.add('text-white', 'hover:bg-white/15');
    });
    const activeBtn = document.getElementById('subtab-btn-' + name);
    if (activeBtn) {
        activeBtn.classList.add('bg-white', 'text-brand-700', 'shadow-md');
        activeBtn.classList.remove('text-white', 'hover:bg-white/15');
    }
}

/* ── DAY FILTER (Schedule) ── */
function filterDay(day) {
    const cards = document.querySelectorAll('.day-card');
    cards.forEach(card => {
        if (day === 'all' || card.classList.contains('day-' + day)) {
            card.style.display = '';
        } else {
            card.style.display = 'none';
        }
    });
    document.querySelectorAll('.day-filter-btn').forEach(btn => {
        btn.classList.remove('bg-brand-600', 'text-white', 'shadow-sm');
        btn.classList.add('bg-slate-100', 'text-slate-600');
    });
    const activeBtn = document.getElementById('day-btn-' + day);
    if (activeBtn) {
        activeBtn.classList.add('bg-brand-600', 'text-white', 'shadow-sm');
        activeBtn.classList.remove('bg-slate-100', 'text-slate-600');
    }
}

/* ── TEACHER LEGEND ACCORDION ── */
function toggleTeacherLegend() {
    const legend  = document.getElementById('teacher-legend');
    const chevron = document.getElementById('legend-chevron');
    if (!legend) return;
    const isOpen = !legend.classList.contains('hidden');
    if (isOpen) {
        legend.classList.add('hidden');
        if (chevron) chevron.style.transform = '';
    } else {
        legend.classList.remove('hidden');
        if (chevron) chevron.style.transform = 'rotate(180deg)';
    }
}

/* ── SKILL BARS ANIMATION (profil.html) ── */
function animateSkillBars() {
    const bars = document.querySelectorAll('.skill-bar-fill');
    bars.forEach(bar => {
        const target = bar.dataset.width || '0%';
        bar.style.width = target;
    });
}

/* ── ON DOM READY ── */
document.addEventListener('DOMContentLoaded', () => {
    animateSkillBars();

    if (progressBar) {
        progressBar.addEventListener('input', function() {
            this.style.setProperty('--progress', this.value + '%');
        });
    }
});
