NOTE : Prompt berikut opsional buat kalian yang mau belajar vibecoding dari awal menggunakan prompt dibawah.

Buatin gue musik player yang keren banget dengan design glassmorphism modern. Berikut requirements lengkapnya:

## STRUKTUR & FITUR UTAMA

### 1. LAYOUT DESKTOP
- Sidebar kiri: 260px width, glassmorphism dengan border accent ungu
- Main content: flex 1, glassmorphism styling
- Responsive untuk desktop, tablet, mobile

### 2. PLAYER SECTION
- Album cover: 100x100px, dengan rounded corners, spin animation pas lagu play
- Equalizer bars di dalam cover: 5 bars yang animate saat play, diam pas pause
- Song info: title, artist, now playing label dengan gradient text
- Progress bar: interactive, bisa click untuk seek, display current/total time
- Playback controls: Loop, Previous, Play/Pause (highlight), Next, Shuffle buttons
- Secondary controls: Volume slider (0-100%), Speed selector (0.5x - 2x)
- Equalizer di bawah volume: sama seperti di cover, hanya 1 yang tampil

### 3. SIDEBAR NAVIGATION
- Logo "Hanz Library" di tengah (desktop), di kanan pojok collapsed (mobile)
- Playlists section dengan "All Songs" item
- Nav item dengan active state highlight
- Desktop: tetap visible
- Mobile: hamburger menu + drawer 50% width dengan blur glassmorphism

### 4. PLAYLIST/QUEUE SECTION
- List semua 10 lagu dengan: nomor urut, title, artist, duration
- Pagination: 5 lagu per halaman, prev/next buttons
- Click lagu = play, tapi jangan restart kalo lagu yang sama sedang play
- Highlight active song
- Now playing indicator (pulsing dot)

### 5. SEARCH FUNCTIONALITY
- Search input di atas player
- Real-time filter: cari by title atau artist
- Dropdown hasil dengan: thumbnail, title, artist, duration
- Keyboard navigation: arrow up/down, enter untuk select
- Clear button saat ada query

### 6. SONG LIBRARY (10 Lagu)
1. Legends Never Die - Against The Current
2. Royalty - Egzod & Maestro Chives ft. Neoni
3. Unstoppable - Sia
4. Decadence - Disturbed
5. Wavin' Flag - K'NAAN
6. Waka Waka - Shakira
7. Ale Ale Ale - Nicky Jam, Will Smith & Era Istrefi
8. Sepenuh Hati - Rony Parulian
9. Jangan Paksa Rindu - Ifan Seventeen
10. Terbuang Dalam Waktu - Barasuara

## FITUR AUDIO & KONTROL

### Playback Features
- Play/Pause toggle dengan icon change
- Previous: restart lagu jika sudah 3 detik, atau ke lagu sebelumnya
- Next: lagu berikutnya (atau random kalo shuffle on)
- Loop modes: Off → Loop One → Loop All (cycle)
- Shuffle: random song selection
- **PENTING:** Loop dan Shuffle tidak bisa aktif bersamaan:
  - Kalo Loop ON → Shuffle jadi gelap/disabled (opacity 0.4)
  - Kalo Shuffle ON → Loop jadi gelap/disabled + auto-off loop

### Volume & Speed
- Volume slider: 0-100%, simpan ke localStorage
- Speed: 0.5x, 0.75x, 1x (default), 1.25x, 1.5x, 2x, simpan setting
- Volume di mobile: handle mobile autoplay restrictions

### Settings Persistence
- Simpan: volume, speed, loop mode, shuffle state ke localStorage key 'hanzmoni-settings'
- Simpan: current song index ke 'hanzmoni-current-song'
- Simpan: current page pagination ke 'hanzmoni-current-page'
- Load ulang: restore semua setting saat page refresh

### Song Refresh Behavior
- Pas page refresh: load last played song by index
- Reset playback time ke 0 (gak resume dari detik terakhir)
- Auto-play OFF (user harus klik play manual)

### Album Cover Behavior
- Default state: foto album cover normal (0° rotation)
- Pas play: spin animation 360° continuous, smooth
- Pas pause: rotation stop seketika (tetap terlihat di posisi terakhir)
- Load lagu baru: reset rotasi ke 0°, stop animation

### Equalizer Behavior
- **Di dalam album cover (desktop):**
  - Default/pause: visible, bars diam dengan scaleY(0.6)
  - Play: visible, bars animate dengan scaleY(0.4-1)

- **Di bawah volume (universal):**
  - Default/pause: visible, bars diam, background gradient ungu tipis
  - Play: visible, bars animate, background gradient ungu lebih bright
  - Both: pointer-events none (gak bisa di-click)

## DESIGN & STYLING

### Color Scheme
- Background: dark (#0a0e27 to #1a1d3a gradient)
- Glassmorphism: rgba(255,255,255,0.03) dengan blur(8px)
- Accent color: #818cf8 (ungu)
- Secondary accent: #c084fc (ungu lighter)
- Text: #ffffff
- Text dim: #94a3b8

### Components Styling
- Border: rgba(129,140,248,0.3)
- Rounded: 12-16px
- Shadow: subtle drop shadow
- Hover states: slight background brighten, color change
- Active states: accent color + gradient background

### Responsive Breakpoints
- Desktop (>1000px): full sidebar, full player, grid layout
- Tablet (768-1000px): slightly compressed
- Mobile (<768px): hamburger menu, drawer sidebar, vertical stack

## MOBILE SPECIFIC

### Topbar (Mobile)
- Hamburger (X when expanded) on LEFT
- Logo "Hanz Library" on RIGHT (pojok kanan)
- Tetap visible pas sidebar expanded
- Tooltip "Menu" on hover hamburger

### Sidebar Mobile
- Position: fixed, top 0, left 0
- Collapsed: hidden
- Expanded: 50% width, 100vh height, blur glassmorphism
- Background: rgba(10,14,39,0.6) dengan blur(12px)
- Close: click X button atau click outside

### Player Mobile
- Album cover: 140px (smaller than desktop)
- Margin-top: 60px (biar gak ketutup topbar)
- Font slightly smaller: title 18px, artist 12px
- Buttons: 34px (vs 36px desktop), untuk finger-friendly

### Playlist Mobile
- Duration column: hidden (terlalu sempit)
- Title + artist tetap terlihat
- Grid: nomor (40px) + info (1fr)

## KEYBOARD SHORTCUTS
- Space: Play/Pause
- Right Arrow: Next song
- Left Arrow: Previous song
- Up Arrow: Volume +5%
- Down Arrow: Volume -5%
- Search input: Arrow up/down (navigate results), Enter (select), Esc (clear)

## ERROR HANDLING
- Audio error: display "Error loading song"
- Missing cover: fallback ke default-cover.svg
- Metadata load timeout: 2 detik fallback (biar duration cepat keluar)

## ANIMATION & TRANSITIONS
- Album spin: 20s linear continuous
- Equalizer bars: 0.4s ease-in-out infinite
- UI transitions: 0.2s ease
- Hover effects: smooth scale/color change
- Modal/drawer: smooth slide in/out

## FILE STRUCTURE
- song/ folder: 10 MP3 files (sudah diconvert dari MP4)
- assets/ folder: 10 album cover images
- index.html: semantic HTML
- css/style.css: glassmorphism styling
- js/script.js: semua logic & interactivity

Buatin semuanya biar production-ready, mobile-optimized, dengan UX yang smooth!

--------------------------------------------------------------------------------------------------------------------------------

## TUTORIAL

### Clone Repository

git clone https://github.com/farhanadrianto/Hanzmoni.git

### Masuk ke Folder Project

cd Hanzmoni

### Jalankan Project

Buka folder menggunakan Visual Studio Code lalu jalankan menggunakan Live Server atau buka file index.html langsung di browser.

--------------------------------------------------------------------------------------------------------------------------------

### Live Demo Saya

https://hanzmoni.vercel.app

### GitHub Repository Saya

https://github.com/farhanadrianto/Hanzmoni