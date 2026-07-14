/* ===================================
   HANZMONI - OFFLINE MUSIC PLAYER
   Modern HTML5 Audio Player with glassmorphism UI
   =================================== */

// ===== SONG LIBRARY =====
// EDIT INI: Tambah video kamu di sini
const songs = [
    {
        title: "Wavin' Flag",
        artist: "K'NAAN",
        file: "video/wavin flag.mp4",
        cover: "assets/wavin flag single.jpg"
    },
        {
        title: "Waka Waka (This Time For Africa)",
        artist: "Shakira",
        file: "video/waka waka.mp4",
        cover: "assets/waka waka.jpg"
    },
    {
    title: "Ale Ale Ale",
    artist: "Nicky Jam, Will Smith & Era Istrefi",
    file: "video/ale ale ale.mp4",
    cover: "assets/ale ale ale.jpg"
    },
    {
        title: "Sepenuh Hati",
        artist: "Rony Parulian",
        file: "video/sepenuh hati.mp4",
        cover: "assets/sepenuh hati.jpg"
    },
    {
        title: "Jangan Paksa Rindu",
        artist: "Ifan Seventeen",
        file: "video/jangan paksa rindu.mp4",
        cover: "assets/jangan paksa rindu.jpg"
    },
    {
        title: "Terbuang Dalam Waktu",
        artist: "Barasuara",
        file: "video/terbuang dalam waktu.mp4",
        cover: "assets/terbuang dalam waktu.webp"
    },
    {
        title: "Decadence",
        artist: "Disturbed",
        file: "video/disturbed decadence.mp4",
        cover: "assets/disturbed decadence.jpg"
    },
    {
    title: "Legends Never Die",
    artist: "Against The Current",
    file: "video/legends never die.mp4",
    cover: "assets/legends never die.jpg"
    },
    {
    title: "Royalty",
    artist: "Egzod & Maestro Chives ft. Neoni",
    file: "video/royalty.mp4",
    cover: "assets/royalty.jpg"
    },
    {
    title: "Unstoppable",
    artist: "Sia",
    file: "video/unstoppable.mp4",
    cover: "assets/unstoppable.jpg"
    }
];

// ===== DOM ELEMENTS =====
const audioPlayer = document.getElementById('audioPlayer');
const playBtn = document.getElementById('playBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const loopBtn = document.getElementById('loopBtn');
const shuffleBtn = document.getElementById('shuffleBtn');
const progressBar = document.getElementById('progressBar');
const progressFill = document.getElementById('progressFill');
const currentTimeEl = document.getElementById('currentTime');
const durationEl = document.getElementById('duration');
const volumeSlider = document.getElementById('volumeSlider');
const volumeValue = document.getElementById('volumeValue');
const speedSelect = document.getElementById('speedSelect');
const playlistList = document.getElementById('playlistList');
const songTitle = document.getElementById('songTitle');
const songArtist = document.getElementById('songArtist');
const albumCover = document.getElementById('albumCover');
const coverImage = document.getElementById('coverImage');
const equalizer = document.getElementById('equalizer');
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.querySelector('.sidebar');
const particlesContainer = document.getElementById('particlesContainer');
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');
const searchClearBtn = document.getElementById('searchClearBtn');
const paginationControls = document.getElementById('paginationControls');
const prevPageBtn = document.getElementById('prevPageBtn');
const nextPageBtn = document.getElementById('nextPageBtn');
const paginationInfo = document.getElementById('paginationInfo');

// ===== PLAYER STATE =====
let currentSongIndex = 0;
let isPlaying = false;
let isShuffle = false;
let loopMode = 0; // 0: no loop, 1: loop one, 2: loop all (default off)
let recentlyPlayed = [];
let searchSelectedIndex = -1; // Track selected search result
let currentPage = 1;
const songsPerPage = 5;

// ===== INITIALIZATION =====
function init() {
    console.log('Init start, loopMode before loadSettings:', loopMode);
    loadSettings(); // Load dulu sebelum setupEventListeners
    console.log('Init after loadSettings, loopMode:', loopMode);
    setupEventListeners();
    
    // Create particles untuk animated background
    createParticles();
    
    // Load saved page
    const savedPage = localStorage.getItem('hanzmoni-current-page');
    if (savedPage) {
        currentPage = parseInt(savedPage);
    }
    
    loadSongs();
    
    // Load last played song and position
    const lastSongIndex = localStorage.getItem('hanzmoni-current-song');
    const lastCurrentTime = localStorage.getItem('hanzmoni-current-time');
    const startIndex = lastSongIndex ? parseInt(lastSongIndex) : 0;
    
    // If there are songs, load the first one or last played
    if (songs.length > 0) {
        loadSong(Math.min(startIndex, songs.length - 1));
        
        // Restore playback position if available - tapi tunggu metadata loaded dulu
        if (lastCurrentTime) {
            const savedTime = parseFloat(lastCurrentTime);
            
            // Listener untuk restore time setelah metadata loaded
            const restoreTimeHandler = () => {
                if (audioPlayer.duration && !isNaN(audioPlayer.duration)) {
                    // Ensure time valid dan tidak exceed duration
                    const timeToRestore = Math.min(savedTime, audioPlayer.duration - 1);
                    audioPlayer.currentTime = timeToRestore;
                    
                    // Force trigger timeupdate untuk update UI
                    setTimeout(() => {
                        const event = new Event('timeupdate');
                        audioPlayer.dispatchEvent(event);
                        // Juga manual update progress biar yakin
                        updateProgress();
                    }, 100);
                    
                    audioPlayer.removeEventListener('loadedmetadata', restoreTimeHandler);
                }
            };
            
            // Jika metadata sudah loaded, langsung set
            if (audioPlayer.readyState >= 1) {
                const timeToRestore = Math.min(savedTime, audioPlayer.duration - 1);
                audioPlayer.currentTime = timeToRestore;
                // Force update progress
                setTimeout(() => {
                    const event = new Event('timeupdate');
                    audioPlayer.dispatchEvent(event);
                    updateProgress();
                }, 100);
            } else {
                // Tunggu metadata loaded
                audioPlayer.addEventListener('loadedmetadata', restoreTimeHandler);
            }
        }
    }
    console.log('Init end, final loopMode:', loopMode);
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
    // Play/Pause
    playBtn.addEventListener('click', togglePlay);
    audioPlayer.addEventListener('play', handlePlay);
    audioPlayer.addEventListener('pause', handlePause);
    
    // Navigation
    nextBtn.addEventListener('click', nextSong);
    prevBtn.addEventListener('click', prevSong);
    
    // Progress
    let updateProgressTimeout;
    audioPlayer.addEventListener('timeupdate', () => {
        clearTimeout(updateProgressTimeout);
        updateProgressTimeout = setTimeout(updateProgress, 16);
    });
    audioPlayer.addEventListener('loadedmetadata', updateDuration);
    progressBar.addEventListener('change', seek);
    progressBar.addEventListener('input', previewSeek);
    
    // Click on progress bar to seek
    const progressWrapper = document.querySelector('.progress-bar-wrapper');
    if (progressWrapper) {
        progressWrapper.addEventListener('click', (e) => {
            const rect = progressWrapper.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            audioPlayer.currentTime = percent * audioPlayer.duration;
            progressBar.value = percent * 100;
            progressFill.style.width = (percent * 100) + '%';
        });
    }
    
    // Volume
    volumeSlider.addEventListener('input', changeVolume);
    
    // Speed
    speedSelect.addEventListener('change', changeSpeed);
    
    // Controls
    loopBtn.addEventListener('click', toggleLoop);
    shuffleBtn.addEventListener('click', toggleShuffle);
    
    // Playlist
    playlistList.addEventListener('click', handlePlaylistClick);
    
    // Auto next on song end
    audioPlayer.addEventListener('ended', () => {
        console.log('ENDED EVENT FIRED! currentIndex:', currentSongIndex, 'loopMode:', loopMode, 'isShuffle:', isShuffle);
        
        if (loopMode === 1) {
            // Loop satu lagu
            audioPlayer.currentTime = 0;
            audioPlayer.play().catch(e => console.error('Play error:', e));
        } else if (loopMode === 2) {
            // Loop all - next song (with shuffle check)
            let nextIndex;
            if (isShuffle) {
                // Random tapi jangan lagu yang sama (kalo lebih dari 1 lagu)
                if (songs.length > 1) {
                    do {
                        nextIndex = Math.floor(Math.random() * songs.length);
                    } while (nextIndex === currentSongIndex);
                } else {
                    nextIndex = 0;
                }
            } else {
                nextIndex = (currentSongIndex + 1) % songs.length;
            }
            console.log('Loop all, next index:', nextIndex);
            currentSongIndex = nextIndex;
            const song = songs[nextIndex];
            audioPlayer.src = song.file;
            audioPlayer.playbackRate = parseFloat(speedSelect.value);
            localStorage.setItem('hanzmoni-current-song', nextIndex);
            songTitle.textContent = song.title;
            songArtist.textContent = song.artist;
            coverImage.src = song.cover;
            updatePlaylistHighlight();
            progressBar.value = 0;
            progressFill.style.width = '0%';
            audioPlayer.play().catch(e => console.error('Play error:', e));
        } else {
            // Loop off - just next song auto (with shuffle check)
            let nextIndex;
            if (isShuffle) {
                // Random tapi jangan lagu yang sama (kalo lebih dari 1 lagu)
                if (songs.length > 1) {
                    do {
                        nextIndex = Math.floor(Math.random() * songs.length);
                    } while (nextIndex === currentSongIndex);
                } else {
                    nextIndex = 0;
                }
            } else {
                nextIndex = (currentSongIndex + 1) % songs.length;
            }
            console.log('Loop off, next index:', nextIndex);
            currentSongIndex = nextIndex;
            const song = songs[nextIndex];
            audioPlayer.src = song.file;
            audioPlayer.playbackRate = parseFloat(speedSelect.value);
            localStorage.setItem('hanzmoni-current-song', nextIndex);
            songTitle.textContent = song.title;
            songArtist.textContent = song.artist;
            coverImage.src = song.cover;
            updatePlaylistHighlight();
            progressBar.value = 0;
            progressFill.style.width = '0%';
            audioPlayer.play().catch(e => console.error('Play error:', e));
        }
    });
    
    // Keyboard
    document.addEventListener('keydown', handleKeyboard);
    
    // Menu toggle
    menuToggle.addEventListener('click', toggleMenu);
    
    // Search
    searchInput.addEventListener('input', handleSearch);
    searchInput.addEventListener('keydown', handleSearchKeydown);
    
    // Search clear button
    searchClearBtn.addEventListener('click', clearSearch);
    
    // Pagination
    prevPageBtn.addEventListener('click', () => changePage(-1));
    nextPageBtn.addEventListener('click', () => changePage(1));
    
    // Close menu on nav click
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('expanded');
                menuToggle.classList.remove('active');
            }
        });
    });
}

// ===== SONG LOADING =====
function loadSongs() {
    if (songs.length === 0) {
        playlistList.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M8 12l4 4 4-4"></path>
                </svg>
                <p>No songs loaded</p>
                <small>Add MP4 files to 'vid offline' folder</small>
            </div>
        `;
        return;
    }
    
    renderPlaylist();
}

function loadSong(index) {
    if (index < 0 || index >= songs.length) return;
    
    currentSongIndex = index;
    const song = songs[index];
    
    // Save current song index
    localStorage.setItem('hanzmoni-current-song', index);
    
    // Auto-navigate to the page containing this song
    const pageForSong = Math.floor(index / songsPerPage) + 1;
    if (pageForSong !== currentPage) {
        currentPage = pageForSong;
        localStorage.setItem('hanzmoni-current-page', currentPage);
        renderPlaylist();
    } else {
        // Just update highlight if already on correct page
        updatePlaylistHighlight();
    }
    
    // Clear saved time when loading new song
    localStorage.removeItem('hanzmoni-current-time');
    
    // Update audio source
    audioPlayer.src = song.file;
    
    // Apply playback rate after loading
    audioPlayer.playbackRate = parseFloat(speedSelect.value);
    
    // Update UI
    songTitle.textContent = song.title;
    songArtist.textContent = song.artist;
    coverImage.src = song.cover;
    coverImage.onerror = () => {
        coverImage.src = 'assets/default-cover.svg';
    };
    
    // Add to recently played
    addToRecentlyPlayed(song);
    
    // Reset progress
    progressBar.value = 0;
    progressFill.style.width = '0%';
    currentTimeEl.textContent = '0:00';
}

function addToRecentlyPlayed(song) {
    recentlyPlayed = recentlyPlayed.filter(s => s.file !== song.file);
    recentlyPlayed.unshift(song);
    recentlyPlayed = recentlyPlayed.slice(0, 10);
    saveSettings();
}

// ===== PLAYBACK CONTROLS =====
function togglePlay() {
    if (songs.length === 0) return;
    
    if (isPlaying) {
        audioPlayer.pause();
    } else {
        audioPlayer.play();
    }
}

function handlePlay() {
    isPlaying = true;
    playBtn.querySelector('.icon').innerHTML = '<path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>';
    albumCover.classList.add('playing');
    equalizer.classList.add('active');
    updatePlaylistHighlight();
}

function handlePause() {
    isPlaying = false;
    playBtn.querySelector('.icon').innerHTML = '<path d="M8 5v14l11-7z"/>';
    albumCover.classList.remove('playing');
    equalizer.classList.remove('active');
    updatePlaylistHighlight();
}

function nextSong() {
    if (songs.length === 0) return;
    
    let nextIndex;
    if (isShuffle) {
        nextIndex = Math.floor(Math.random() * songs.length);
    } else {
        nextIndex = (currentSongIndex + 1) % songs.length;
    }
    
    loadSong(nextIndex);
    
    // Delay play biar src sempat load
    setTimeout(() => {
        audioPlayer.play().catch(e => console.error('Play error:', e));
    }, 100);
}

function prevSong() {
    if (songs.length === 0) return;
    
    // If more than 3 seconds into song, restart it
    if (audioPlayer.currentTime > 3) {
        audioPlayer.currentTime = 0;
    } else {
        let prevIndex = (currentSongIndex - 1 + songs.length) % songs.length;
        loadSong(prevIndex);
        if (isPlaying) audioPlayer.play();
    }
}

function handleSongEnd() {
    console.log('Song ended, loopMode:', loopMode, 'currentIndex:', currentSongIndex);
    if (loopMode === 1) {
        // Loop satu lagu - restart dari awal
        audioPlayer.currentTime = 0;
        audioPlayer.play().catch(e => console.error('Play error:', e));
    } else if (loopMode === 2) {
        // Loop semua - lanjut ke next
        console.log('Moving to next song');
        let nextIndex = (currentSongIndex + 1) % songs.length;
        console.log('Next index:', nextIndex);
        currentSongIndex = nextIndex;
        const song = songs[nextIndex];
        audioPlayer.src = song.file;
        audioPlayer.playbackRate = parseFloat(speedSelect.value);
        localStorage.setItem('hanzmoni-current-song', nextIndex);
        songTitle.textContent = song.title;
        songArtist.textContent = song.artist;
        coverImage.src = song.cover;
        updatePlaylistHighlight();
        audioPlayer.play().catch(e => console.error('Play error:', e));
    } else {
        // No loop - stop
        audioPlayer.currentTime = 0;
        audioPlayer.pause();
    }
}

// ===== SEEK & PROGRESS =====
function seek(e) {
    const percent = e.target.value / 100;
    audioPlayer.currentTime = percent * audioPlayer.duration;
}

function previewSeek(e) {
    const percent = e.target.value / 100;
    progressFill.style.width = (e.target.value) + '%';
}

let lastUpdateTime = 0;
let lastSaveTime = 0;
function updateProgress() {
    if (audioPlayer.duration && audioPlayer.duration > 0) {
        const now = Date.now();
        // Update max setiap 100ms untuk mobile smoothness
        if (now - lastUpdateTime < 100) return;
        lastUpdateTime = now;
        
        const currentTime = audioPlayer.currentTime || 0;
        const percent = (currentTime / audioPlayer.duration) * 100;
        progressBar.value = percent;
        progressFill.style.width = percent + '%';
        
        // PENTING: update timer text setiap kali dipanggil
        currentTimeEl.textContent = formatTime(currentTime);
        
        // Save current time ke localStorage lebih sering - setiap 2 detik atau setiap perubahan significant
        if (now - lastSaveTime > 2000) {
            localStorage.setItem('hanzmoni-current-time', currentTime);
            lastSaveTime = now;
        }
    }
}

function updateDuration() {
    durationEl.textContent = formatTime(audioPlayer.duration);
}

function formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return '0:00';
    
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

// ===== VOLUME & SPEED =====
function changeVolume(e) {
    const volume = e.target.value / 100;
    audioPlayer.volume = volume;
    volumeValue.textContent = e.target.value + '%';
    
    // Force immediate volume update untuk mobile compatibility
    if (audioPlayer.volume !== volume) {
        // Retry jika volume tidak langsung berubah (mobile bug)
        setTimeout(() => {
            audioPlayer.volume = volume;
        }, 50);
    }
    
    // Jika lagu lagi play, ensure audio terus keluar setelah volume change
    if (!audioPlayer.paused) {
        audioPlayer.play().catch(() => {
            // Ignore error jika lagu sudah playing
        });
    }
    
    saveSettings();
}

function changeSpeed(e) {
    audioPlayer.playbackRate = parseFloat(e.target.value);
    saveSettings();
}

// ===== TOGGLE CONTROLS =====
function toggleLoop() {
    loopMode = (loopMode + 1) % 3;
    
    if (loopMode === 0) {
        loopBtn.classList.remove('active');
        loopBtn.title = 'Loop: Off';
    } else if (loopMode === 1) {
        // Loop satu lagu (default)
        loopBtn.classList.add('active');
        loopBtn.title = 'Loop: One';
    } else {
        // Loop semua
        loopBtn.classList.add('active');
        loopBtn.title = 'Loop: All';
    }
    
    saveSettings();
}

function toggleShuffle() {
    isShuffle = !isShuffle;
    shuffleBtn.classList.toggle('active', isShuffle);
    shuffleBtn.title = isShuffle ? 'Shuffle: On' : 'Shuffle: Off';
    saveSettings();
}

// ===== PLAYLIST =====
function renderPlaylist() {
    if (songs.length === 0) {
        playlistList.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M8 12l4 4 4-4"></path>
                </svg>
                <p>No songs loaded</p>
                <small>Add MP4 files to 'vid offline' folder</small>
            </div>
        `;
        paginationControls.style.display = 'none';
        return;
    }
    
    // Calculate pagination
    const totalPages = Math.ceil(songs.length / songsPerPage);
    const startIndex = (currentPage - 1) * songsPerPage;
    const endIndex = Math.min(startIndex + songsPerPage, songs.length);
    const currentPageSongs = songs.slice(startIndex, endIndex);
    
    // Clear playlist
    playlistList.innerHTML = '';
    
    // Create songs wrapper
    const songsWrapper = document.createElement('div');
    songsWrapper.style.display = 'flex';
    songsWrapper.style.flexDirection = 'column';
    songsWrapper.style.gap = '6px';
    songsWrapper.style.flex = '1';
    
    // Render current page songs
    currentPageSongs.forEach((song, relativeIndex) => {
        const index = startIndex + relativeIndex;
        const item = document.createElement('div');
        item.className = 'playlist-item' + (index === currentSongIndex ? ' active' : '');
        item.dataset.index = index;
        
        item.innerHTML = `
            <div class="playlist-item-index">
                ${index === currentSongIndex && isPlaying ? '<div class="now-playing-indicator active"></div>' : '<div class="now-playing-indicator"></div>'}
                <span>${index + 1}</span>
            </div>
            <div class="playlist-item-info">
                <div class="playlist-item-title">${song.title}</div>
                <div class="playlist-item-artist">${song.artist}</div>
            </div>
        `;
        
        item.addEventListener('click', () => {
            loadSong(index);
            audioPlayer.play();
        });
        
        songsWrapper.appendChild(item);
    });
    
    playlistList.appendChild(songsWrapper);
    
    // Append pagination controls at the end
    playlistList.appendChild(paginationControls);
    
    // Update pagination controls
    if (totalPages > 1) {
        paginationControls.style.display = 'flex';
        paginationInfo.textContent = `Page ${currentPage} of ${totalPages}`;
        prevPageBtn.disabled = currentPage === 1;
        nextPageBtn.disabled = currentPage === totalPages;
    } else {
        paginationControls.style.display = 'none';
    }
}

function changePage(direction) {
    const totalPages = Math.ceil(songs.length / songsPerPage);
    currentPage = Math.max(1, Math.min(currentPage + direction, totalPages));
    
    // Save current page
    localStorage.setItem('hanzmoni-current-page', currentPage);
    
    renderPlaylist();
    playlistList.scrollTop = 0;
}

function handlePlaylistClick(e) {
    const item = e.target.closest('.playlist-item');
    if (!item) return;
    
    const index = parseInt(item.dataset.index);
    loadSong(index);
    audioPlayer.play();
}

function updatePlaylistHighlight() {
    const items = document.querySelectorAll('.playlist-item');
    items.forEach((item) => {
        const itemIndex = parseInt(item.dataset.index);
        const indicator = item.querySelector('.now-playing-indicator');
        if (itemIndex === currentSongIndex) {
            item.classList.add('active');
            if (isPlaying) {
                indicator.classList.add('active');
            } else {
                indicator.classList.remove('active');
            }
        } else {
            item.classList.remove('active');
            indicator.classList.remove('active');
        }
    });
}

// ===== KEYBOARD SHORTCUTS =====
function handleKeyboard(e) {
    // Don't trigger shortcuts when typing in input
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
    
    switch(e.code) {
        case 'Space':
            e.preventDefault();
            togglePlay();
            break;
        case 'ArrowRight':
            nextSong();
            break;
        case 'ArrowLeft':
            prevSong();
            break;
        case 'ArrowUp':
            e.preventDefault();
            volumeSlider.value = Math.min(100, parseInt(volumeSlider.value) + 5);
            volumeSlider.dispatchEvent(new Event('input'));
            break;
        case 'ArrowDown':
            e.preventDefault();
            volumeSlider.value = Math.max(0, parseInt(volumeSlider.value) - 5);
            volumeSlider.dispatchEvent(new Event('input'));
            break;
    }
}

// ===== ANIMATED BACKGROUND =====
function createParticles() {
    // Disable particles - too heavy
    return;
}

// ===== MENU TOGGLE (MOBILE) =====
function toggleMenu() {
    sidebar.classList.toggle('expanded');
    menuToggle.classList.toggle('active');
}

// ===== SEARCH =====
function handleSearch(e) {
    const query = e.target.value.toLowerCase().trim();
    
    // Show/hide clear button
    if (query !== '') {
        searchClearBtn.style.display = 'flex';
    } else {
        searchClearBtn.style.display = 'none';
    }
    
    if (query === '') {
        // Kalo kosong, hide search results
        searchResults.style.display = 'none';
        searchResults.innerHTML = '';
        searchSelectedIndex = -1;
        return;
    }
    
    // Filter songs based on search
    const filteredSongs = songs.filter((song, index) => {
        const title = song.title.toLowerCase();
        const artist = song.artist.toLowerCase();
        return title.includes(query) || artist.includes(query);
    });
    
    // Show search results
    if (filteredSongs.length === 0) {
        searchResults.style.display = 'block';
        searchResults.innerHTML = `
            <div class="search-result-empty">
                <p>No songs found</p>
            </div>
        `;
        searchSelectedIndex = -1;
    } else {
        searchResults.style.display = 'block';
        const fragment = document.createDocumentFragment();
        
        filteredSongs.forEach((song, idx) => {
            const originalIndex = songs.findIndex(s => s.file === song.file);
            
            const item = document.createElement('div');
            item.className = 'search-result-item';
            item.dataset.index = originalIndex;
            item.dataset.searchIndex = idx;
            
            item.innerHTML = `
                <img src="${song.cover}" alt="${song.title}" onerror="this.src='assets/default-cover.svg'">
                <div class="search-result-info">
                    <div class="search-result-title">${song.title}</div>
                    <div class="search-result-artist">${song.artist}</div>
                </div>
                <div class="search-result-duration">0:00</div>
            `;
            
            // Load metadata to get duration - with timeout fallback
            const tempAudio = new Audio();
            tempAudio.preload = 'metadata';
            tempAudio.src = song.file;
            
            let durationLoaded = false;
            const loadTimeoutId = setTimeout(() => {
                // Fallback: jika masih 0:00 setelah 2 detik, gunakan currentAudio duration
                if (!durationLoaded && audioPlayer.src === song.file && audioPlayer.duration) {
                    const durationDiv = item.querySelector('.search-result-duration');
                    durationDiv.textContent = formatTime(audioPlayer.duration);
                    durationLoaded = true;
                }
            }, 2000);
            
            tempAudio.addEventListener('loadedmetadata', () => {
                clearTimeout(loadTimeoutId);
                const durationDiv = item.querySelector('.search-result-duration');
                durationDiv.textContent = formatTime(tempAudio.duration);
                durationLoaded = true;
            });
            
            tempAudio.addEventListener('error', () => {
                clearTimeout(loadTimeoutId);
                // Jika error, ganti ke "-- :--"
                const durationDiv = item.querySelector('.search-result-duration');
                if (!durationLoaded) {
                    durationDiv.textContent = '-- :--';
                }
            });
            
            item.addEventListener('click', () => {
                loadSong(originalIndex);
                audioPlayer.play();
                // Clear search
                clearSearch();
            });
            
            fragment.appendChild(item);
        });
        
        searchResults.innerHTML = '';
        searchResults.appendChild(fragment);
        searchSelectedIndex = -1; // Reset selection
    }
}

function handleSearchKeydown(e) {
    const items = searchResults.querySelectorAll('.search-result-item');
    if (items.length === 0) return;
    
    if (e.key === 'ArrowDown') {
        e.preventDefault();
        searchSelectedIndex = Math.min(searchSelectedIndex + 1, items.length - 1);
        updateSearchSelection(items);
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        searchSelectedIndex = Math.max(searchSelectedIndex - 1, -1);
        updateSearchSelection(items);
    } else if (e.key === 'Enter') {
        e.preventDefault();
        if (searchSelectedIndex >= 0 && searchSelectedIndex < items.length) {
            const selectedItem = items[searchSelectedIndex];
            const index = parseInt(selectedItem.dataset.index);
            loadSong(index);
            audioPlayer.play();
            clearSearch();
        }
    } else if (e.key === 'Escape') {
        clearSearch();
    }
}

function updateSearchSelection(items) {
    items.forEach((item, idx) => {
        if (idx === searchSelectedIndex) {
            item.classList.add('selected');
            item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        } else {
            item.classList.remove('selected');
        }
    });
}

function clearSearch() {
    searchInput.value = '';
    searchResults.style.display = 'none';
    searchResults.innerHTML = '';
    searchClearBtn.style.display = 'none';
    searchSelectedIndex = -1;
}

function renderFilteredPlaylist(filteredSongs) {
    if (filteredSongs.length === 0) {
        playlistList.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M8 12l4 4 4-4"></path>
                </svg>
                <p>No songs found</p>
                <small>Try a different search term</small>
            </div>
        `;
        return;
    }
    
    const fragment = document.createDocumentFragment();
    
    filteredSongs.forEach((song) => {
        // Cari index asli dari song ini
        const originalIndex = songs.findIndex(s => s.file === song.file);
        const isActive = originalIndex === currentSongIndex;
        
        const item = document.createElement('div');
        item.className = 'playlist-item' + (isActive ? ' active' : '');
        item.dataset.index = originalIndex;
        
        item.innerHTML = `
            <div class="playlist-item-index">
                ${isActive && isPlaying ? '<div class="now-playing-indicator active"></div>' : '<div class="now-playing-indicator"></div>'}
                <span>${originalIndex + 1}</span>
            </div>
            <div class="playlist-item-info">
                <div class="playlist-item-title">${song.title}</div>
                <div class="playlist-item-artist">${song.artist}</div>
            </div>
        `;
        
        item.addEventListener('click', () => {
            loadSong(originalIndex);
            audioPlayer.play();
            // Clear search after clicking
            searchInput.value = '';
            renderPlaylist();
        });
        
        fragment.appendChild(item);
    });
    
    playlistList.innerHTML = '';
    playlistList.appendChild(fragment);
}

// ===== LOCAL STORAGE =====
function saveSettings() {
    const settings = {
        volume: volumeSlider.value,
        speed: speedSelect.value,
        shuffle: isShuffle,
        loop: loopMode,
        recentlyPlayed: recentlyPlayed
    };
    localStorage.setItem('hanzmoni-settings', JSON.stringify(settings));
}

function loadSettings() {
    const stored = localStorage.getItem('hanzmoni-settings');
    console.log('Stored settings:', stored);
    if (stored) {
        try {
            const settings = JSON.parse(stored);
            volumeSlider.value = settings.volume || 100;
            speedSelect.value = settings.speed || 1;
            volumeValue.textContent = volumeSlider.value + '%';
            audioPlayer.volume = volumeSlider.value / 100;
            audioPlayer.playbackRate = parseFloat(speedSelect.value);
            
            isShuffle = settings.shuffle || false;
            loopMode = settings.loop !== undefined ? settings.loop : 0;
            
            if (isShuffle) shuffleBtn.classList.add('active');
            if (loopMode > 0) loopBtn.classList.add('active');
            
            recentlyPlayed = settings.recentlyPlayed || [];
        } catch (e) {
            console.error('Error loading settings:', e);
            loopMode = 0;
        }
    } else {
        // Default: volume 100%, loop off
        volumeSlider.value = 100;
        volumeValue.textContent = '100%';
        audioPlayer.volume = 1.0;
        audioPlayer.playbackRate = 1.0;
        loopMode = 0;
    }
    console.log('loadSettings done, loopMode:', loopMode);
}

// ===== LOADING ANIMATION =====
function showLoadingAnimation() {
    // Disable untuk mobile performance
    return;
}

// Listen for loading state
audioPlayer.addEventListener('play', showLoadingAnimation);

// ===== ERROR HANDLING =====
audioPlayer.addEventListener('error', (e) => {
    console.error('Error loading audio file:', e);
    songTitle.textContent = 'Error loading song';
    songArtist.textContent = 'Please check the file path';
});

// ===== START THE APP =====
document.addEventListener('DOMContentLoaded', init);

// ===== HANDLE WINDOW RESIZE =====
window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
        sidebar.classList.remove('expanded');
        menuToggle.classList.remove('active');
    }
});
