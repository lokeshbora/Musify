# 🎵 Musify — Spotify-Style Web Music Player

A modern, responsive, Spotify-inspired Single Page Music Player application built with pure **HTML5**, **CSS3**, and vanilla **JavaScript**.

---

## ✨ Features

- 🎧 **Music Playback**:
  - Play, Pause, Next, Previous controls
  - Interactive clickable & draggable progress bar
  - Volume control with mute toggle
  - Shuffle & Repeat modes
- 🔍 **Live Search & Discovery**:
  - Instant search across 30+ tracks by Title, Artist, Album, and Genre
  - Genre category filters (Pop, Rock, Jazz, Classical, Electronic, Chill)
- ❤️ **Liked Songs**:
  - Save favorite tracks with a single click
  - Dedicated Liked Songs view
  - Persisted across browser sessions using `localStorage`
- ⬇️ **Downloaded Songs**:
  - Download & mark tracks in your library
  - Dedicated Downloaded Songs view
  - Triggers audio file download to your local machine
- 📋 **Custom Playlists**:
  - Create new playlists
  - Add & remove songs to/from playlists
  - Rename and delete playlists
- 📱 **Fullscreen "Now Playing" View**:
  - Click on the album art or title in the bottom player bar to expand into a full-screen view
  - High-resolution album art, complete player controls, and progress scrubbing
- ⌨️ **Keyboard Shortcuts**:
  - `Space` — Play / Pause
  - `ArrowLeft` / `ArrowRight` — Previous / Next Track
  - `ArrowUp` / `ArrowDown` — Volume Up / Down
  - `M` — Mute / Unmute
  - `S` — Shuffle Toggle
  - `R` — Repeat Toggle
  - `L` — Like / Unlike currently playing song
  - `/` — Focus search bar
  - `Escape` — Close modals / Exit fullscreen player

---

## 🚀 Getting Started

No build tools or external dependencies needed! Simply open `index.html` in any modern web browser or serve it locally:

```bash
# Using Python to serve locally:
python3 -m http.server 8000
```

Then visit [http://localhost:8000](http://localhost:8000) in your browser.

---

## 🛠️ Tech Stack

- **HTML5**: Semantic markup & Audio API
- **CSS3**: Custom design, CSS Grid, Flexbox, Spotify dark theme, animations
- **JavaScript (ES6+)**: Custom SPA routing, state management, and `localStorage` persistence
- **FontAwesome**: Clean iconography
