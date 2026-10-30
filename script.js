/* ═══════════════════════════════════════════════════════════════
   MUSIFY — script.js
   Full app logic: state, views, player, search, playlists, modals
═══════════════════════════════════════════════════════════════ */
'use strict';

/* ────────────────────────────────────────────────
   STATE
──────────────────────────────────────────────── */
const state = {
  currentSongId : null,
  isPlaying     : false,
  isShuffle     : false,
  isRepeat      : false,
  isMuted       : false,
  volume        : 70,
  prevVolume    : 70,
  liked         : new Set(),   // Set<song id>
  downloaded    : new Set(),   // Set<song id>
  playlists     : [],          // [{id, name, songIds:[]}]
  currentPlId   : null,        // playlist currently open in view
  recentlyPlayed: [],          // song ids, max 8
  currentView   : 'home',
  queue         : [],          // list of song ids for next/prev
  queueIndex    : 0,
  addingSongId  : null,        // which song the "add to playlist" modal is for
  renamingPlId  : null,        // which playlist the rename modal targets
};

/* ────────────────────────────────────────────────
   DOM SHORTCUTS
──────────────────────────────────────────────── */
const audio       = document.getElementById('audioEl');
const pbTitle     = document.getElementById('pbTitle');
const pbArtist    = document.getElementById('pbArtist');
const pbArt       = document.getElementById('pbArt');
const pbPlayBtn   = document.getElementById('pbPlayBtn');
const pbPlayIcon  = document.getElementById('pbPlayIcon');
const pbPrevBtn   = document.getElementById('pbPrevBtn');
const pbNextBtn   = document.getElementById('pbNextBtn');
const pbShuffleBtn= document.getElementById('pbShuffleBtn');
const pbRepeatBtn = document.getElementById('pbRepeatBtn');
const pbProgressBar   = document.getElementById('pbProgressBar');
const pbProgressFill  = document.getElementById('pbProgressFill');
const pbCurrentTime   = document.getElementById('pbCurrentTime');
const pbTotalTime     = document.getElementById('pbTotalTime');
const pbLikeBtn   = document.getElementById('pbLikeBtn');
const pbLikeIcon  = document.getElementById('pbLikeIcon');
const pbDlBtn     = document.getElementById('pbDlBtn');
const pbDlIcon    = document.getElementById('pbDlIcon');
const pbMuteBtn   = document.getElementById('pbMuteBtn');
const pbVolIcon   = document.getElementById('pbVolIcon');
const pbVolSlider = document.getElementById('pbVolumeSlider');
const likedCount  = document.getElementById('likedCount');
const dlCount     = document.getElementById('dlCount');
const toast       = document.getElementById('toast');

/* ────────────────────────────────────────────────
   HELPERS
──────────────────────────────────────────────── */
const getSong = id => SONGS.find(s => s.id === id);
const fmt     = s  => isNaN(s)||s<0 ? '0:00' : `${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`;
const uid     = () => Date.now().toString(36) + Math.random().toString(36).slice(2);
const artGrad = (song, radius='6px') =>
  `<div style="width:100%;height:100%;border-radius:${radius};background:linear-gradient(135deg,${song.color[0]},${song.color[1]});display:flex;align-items:center;justify-content:center;font-size:1rem;color:rgba(255,255,255,.75);"><i class="fa-solid fa-music"></i></div>`;

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning ☀️' : h < 17 ? 'Good afternoon 🌤' : 'Good evening 🌙';
}

let _toastTimer;
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
}

/* ────────────────────────────────────────────────
   LOCAL-STORAGE  (persist state)
──────────────────────────────────────────────── */
function saveState() {
  localStorage.setItem('musify_liked',     JSON.stringify([...state.liked]));
  localStorage.setItem('musify_dl',        JSON.stringify([...state.downloaded]));
  localStorage.setItem('musify_playlists', JSON.stringify(state.playlists));
  localStorage.setItem('musify_recent',    JSON.stringify(state.recentlyPlayed));
  localStorage.setItem('musify_volume',    state.volume);
}

function loadState() {
  try {
    state.liked      = new Set(JSON.parse(localStorage.getItem('musify_liked')     || '[]'));
    state.downloaded = new Set(JSON.parse(localStorage.getItem('musify_dl')        || '[]'));
    state.playlists  = JSON.parse(localStorage.getItem('musify_playlists') || '[]');
    state.recentlyPlayed = JSON.parse(localStorage.getItem('musify_recent') || '[]');
    state.volume     = parseInt(localStorage.getItem('musify_volume') || '70', 10);
  } catch(e) { console.warn('loadState error', e); }
}

/* ────────────────────────────────────────────────
   NAVIGATION
──────────────────────────────────────────────── */
function navigate(view, plId) {
  if (plId === undefined) plId = null;
  state.currentView = view;
  if (plId) state.currentPlId = plId;

  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  const el = document.getElementById('view-' + view);
  if (el) { el.classList.add('active'); el.scrollTop = 0; }

  document.querySelectorAll('[data-view]').forEach(a => {
    a.classList.toggle('active',
      a.dataset.view === view ||
      (view === 'playlist' && a.dataset.view === ('pl:' + plId)));
  });

  switch(view) {
    case 'home':       renderHome();             break;
    case 'search':     renderSearch('');         break;
    case 'liked':      renderLiked();            break;
    case 'downloaded': renderDownloaded();       break;
    case 'playlist':   renderPlaylistView(plId); break;
  }
}

/* ────────────────────────────────────────────────
   SONG CARD  (used on Home)
──────────────────────────────────────────────── */
function songCardHTML(song, queue) {
  const isCurrentlyPlaying = state.currentSongId === song.id && state.isPlaying;
  const liked = state.liked.has(song.id);
  const dl    = state.downloaded.has(song.id);
  const queueStr = JSON.stringify(queue);
  return [
    '<div class="song-card" data-id="' + song.id + '">',
      '<div class="card-art-wrap">',
        '<div class="card-art">' + artGrad(song) + '</div>',
        '<button class="card-play' + (isCurrentlyPlaying?' playing':'') + '"',
          ' data-action="play" data-id="' + song.id + '" data-queue=\'' + queueStr + '\'',
          ' title="' + (isCurrentlyPlaying?'Pause':'Play') + '">',
          '<i class="fa-solid ' + (isCurrentlyPlaying?'fa-pause':'fa-play') + '"></i>',
        '</button>',
      '</div>',
      '<div class="card-title">' + song.title + '</div>',
      '<div class="card-artist">' + song.artist + '</div>',
      '<div class="card-actions">',
        '<button class="card-action-btn' + (liked?' liked':'') + '" data-action="like" data-id="' + song.id + '" title="Like">',
          '<i class="fa-' + (liked?'solid':'regular') + ' fa-heart"></i>',
        '</button>',
        '<button class="card-action-btn' + (dl?' downloaded':'') + '" data-action="download" data-id="' + song.id + '" title="Download">',
          '<i class="fa-solid fa-' + (dl?'circle-check':'download') + '"></i>',
        '</button>',
        '<button class="card-action-btn" data-action="add-to-playlist" data-id="' + song.id + '" title="Add to playlist">',
          '<i class="fa-solid fa-plus"></i>',
        '</button>',
      '</div>',
    '</div>',
  ].join('');
}

/* ────────────────────────────────────────────────
   SONG ROW  (used in tables)
──────────────────────────────────────────────── */
function songRowHTML(song, num, queue, opts) {
  if (!opts) opts = {};
  const showRemove = opts.showRemove || false;
  const plId       = opts.plId       || null;
  const isCurrentlyPlaying = state.currentSongId === song.id && state.isPlaying;
  const isCurrent  = state.currentSongId === song.id;
  const liked = state.liked.has(song.id);
  const dl    = state.downloaded.has(song.id);
  const queueStr = JSON.stringify(queue);
  const numCell = isCurrent
    ? '<i class="fa-solid fa-volume-high" style="color:var(--accent)"></i>'
    : num;
  const removeBtn = showRemove
    ? '<button class="sr-action-btn remove" data-action="remove-from-playlist" data-id="' + song.id + '" data-plid="' + plId + '" title="Remove"><i class="fa-solid fa-xmark"></i></button>'
    : '';
  return [
    '<div class="song-row' + (isCurrent?' playing':'') + '" data-id="' + song.id + '" data-role="song-row" data-queue=\'' + queueStr + '\'>',
      '<div class="sr-num-wrap">',
        '<span class="sr-num">' + numCell + '</span>',
        '<span class="sr-play"><i class="fa-solid ' + (isCurrentlyPlaying?'fa-pause':'fa-play') + '"></i></span>',
      '</div>',
      '<div class="sr-info-wrap">',
        '<div class="sr-art">' + artGrad(song, '4px') + '</div>',
        '<div class="sr-title-block">',
          '<div class="sr-title">' + song.title + '</div>',
          '<div class="sr-artist">' + song.artist + '</div>',
        '</div>',
      '</div>',
      '<div class="sr-album">' + song.album + '</div>',
      '<div class="sr-album">' + song.genre + '</div>',
      '<div class="sr-actions">',
        '<button class="sr-action-btn' + (liked?' liked':'') + '" data-action="like" data-id="' + song.id + '" title="Like"><i class="fa-' + (liked?'solid':'regular') + ' fa-heart"></i></button>',
        '<button class="sr-action-btn' + (dl?' downloaded':'') + '" data-action="download" data-id="' + song.id + '" title="Download"><i class="fa-solid fa-' + (dl?'circle-check':'download') + '"></i></button>',
        '<button class="sr-action-btn" data-action="add-to-playlist" data-id="' + song.id + '" title="Add to playlist"><i class="fa-solid fa-plus"></i></button>',
        removeBtn,
      '</div>',
    '</div>',
  ].join('');
}

/* ────────────────────────────────────────────────
   RENDER: HOME
──────────────────────────────────────────────── */
function renderHome() {
  document.getElementById('homeGreeting').textContent = greeting();

  // Quick access grid
  const qg = document.getElementById('quickGrid');
  const plItems = state.playlists.slice(0,4).map(pl =>
    '<div class="quick-item" onclick="navigate(\'playlist\',\'' + pl.id + '\')">' +
      '<div class="qi-icon" style="background:var(--surface3)"><i class="fa-solid fa-list-music"></i></div>' +
      '<span>' + escHtml(pl.name) + '</span>' +
      '<div class="qi-play"><i class="fa-solid fa-play"></i></div>' +
    '</div>');
  qg.innerHTML =
    '<div class="quick-item" onclick="navigate(\'liked\')">' +
      '<div class="qi-icon" style="background:linear-gradient(135deg,#450af5,#c4efd9)"><i class="fa-solid fa-heart"></i></div>' +
      '<span>Liked Songs</span>' +
      '<div class="qi-play"><i class="fa-solid fa-play"></i></div>' +
    '</div>' +
    '<div class="quick-item" onclick="navigate(\'downloaded\')">' +
      '<div class="qi-icon" style="background:linear-gradient(135deg,#1db954,#007a33)"><i class="fa-solid fa-download"></i></div>' +
      '<span>Downloaded</span>' +
      '<div class="qi-play"><i class="fa-solid fa-play"></i></div>' +
    '</div>' +
    plItems.join('');

  // Genre sections
  const sections = document.getElementById('homeSections');
  let html = '';

  // Recently played
  if (state.recentlyPlayed.length > 0) {
    const recentSongs = state.recentlyPlayed.map(id => getSong(id)).filter(Boolean).slice(0,6);
    const queue = recentSongs.map(s => s.id);
    html += '<div class="section"><div class="section-header"><h2>🕓 Recently Played</h2></div><div class="cards-grid">' +
      recentSongs.map(s => songCardHTML(s, queue)).join('') + '</div></div>';
  }

  const icons = { Pop:'🎵', Rock:'🎸', Jazz:'🎷', Classical:'🎹', Electronic:'🎧', Chill:'🌿' };
  GENRES.forEach(genre => {
    const genreSongs = SONGS.filter(s => s.genre === genre.name);
    const queue = genreSongs.map(s => s.id);
    const icon = icons[genre.name] || '🎵';
    html += '<div class="section">' +
      '<div class="section-header"><h2>' + icon + ' ' + genre.name + '</h2>' +
      '<a onclick="filterByGenre(\'' + genre.name + '\')">Show all</a></div>' +
      '<div class="cards-grid">' + genreSongs.slice(0,6).map(s => songCardHTML(s, queue)).join('') + '</div>' +
      '</div>';
  });
  sections.innerHTML = html;
}

/* ────────────────────────────────────────────────
   RENDER: SEARCH
──────────────────────────────────────────────── */
function renderSearch(query) {
  const cg = document.getElementById('categoryGrid');
  if (!cg.children.length) {
    cg.innerHTML = GENRES.map(g =>
      '<div class="category-card" onclick="filterByGenre(\'' + g.name + '\')" style="background:linear-gradient(135deg,' + g.color[0] + ',' + g.color[1] + ')">' +
        g.name + '<i class="fa-solid ' + g.icon + '"></i></div>'
    ).join('');
  }

  const browse   = document.getElementById('searchBrowse');
  const results  = document.getElementById('searchResults');
  const noResult = document.getElementById('searchNoResults');
  const table    = document.getElementById('searchTable');
  const label    = document.getElementById('searchQueryLabel');

  if (!query.trim()) {
    browse.style.display   = '';
    results.style.display  = 'none';
    noResult.style.display = 'none';
    return;
  }

  const q = query.trim().toLowerCase();
  const matched = SONGS.filter(s =>
    s.title.toLowerCase().includes(q)  ||
    s.artist.toLowerCase().includes(q) ||
    s.album.toLowerCase().includes(q)  ||
    s.genre.toLowerCase().includes(q)
  );

  browse.style.display = 'none';
  label.textContent    = query.trim();

  if (!matched.length) {
    results.style.display  = 'none';
    noResult.style.display = '';
    return;
  }

  noResult.style.display = 'none';
  results.style.display  = '';
  const queue = matched.map(s => s.id);
  table.innerHTML = matched.map((s, i) => songRowHTML(s, i+1, queue)).join('');
}

function filterByGenre(genre) {
  navigate('search');
  const input = document.getElementById('searchInput');
  input.value = genre;
  document.getElementById('searchClearBtn').classList.add('visible');
  renderSearch(genre);
}

/* ────────────────────────────────────────────────
   RENDER: LIKED SONGS
──────────────────────────────────────────────── */
function renderLiked() {
  const songs = [...state.liked].map(id => getSong(id)).filter(Boolean);
  document.getElementById('likedHeaderCount').textContent = songs.length;
  document.getElementById('likedCount').textContent = songs.length;
  const table = document.getElementById('likedTable');
  const empty = document.getElementById('likedEmpty');
  if (!songs.length) { table.innerHTML = ''; empty.style.display = ''; return; }
  empty.style.display = 'none';
  const queue = songs.map(s => s.id);
  table.innerHTML = songs.map((s,i) => songRowHTML(s, i+1, queue)).join('');
}

/* ────────────────────────────────────────────────
   RENDER: DOWNLOADED
──────────────────────────────────────────────── */
function renderDownloaded() {
  const songs = [...state.downloaded].map(id => getSong(id)).filter(Boolean);
  document.getElementById('dlHeaderCount').textContent = songs.length;
  document.getElementById('dlCount').textContent       = songs.length;
  const table = document.getElementById('downloadedTable');
  const empty = document.getElementById('dlEmpty');
  if (!songs.length) { table.innerHTML = ''; empty.style.display = ''; return; }
  empty.style.display = 'none';
  const queue = songs.map(s => s.id);
  table.innerHTML = songs.map((s,i) => songRowHTML(s, i+1, queue)).join('');
}

/* ────────────────────────────────────────────────
   RENDER: PLAYLIST VIEW
──────────────────────────────────────────────── */
function renderPlaylistView(plId) {
  const pl = state.playlists.find(p => p.id === plId);
  if (!pl) { navigate('home'); return; }

  document.getElementById('playlistViewTitle').textContent = pl.name;
  const songs = pl.songIds.map(id => getSong(id)).filter(Boolean);
  document.getElementById('playlistViewMeta').textContent = songs.length + ' song' + (songs.length!==1?'s':'');

  const table = document.getElementById('playlistTable');
  const empty = document.getElementById('playlistEmpty');

  if (!songs.length) {
    table.innerHTML = '';
    empty.style.display = '';
  } else {
    empty.style.display = 'none';
    const queue = songs.map(s => s.id);
    table.innerHTML = songs.map((s,i) => songRowHTML(s, i+1, queue, { showRemove:true, plId })).join('');
  }
  document.getElementById('renamePlaylistBtn').onclick = function() { showRenameModal(plId); };
  document.getElementById('deletePlaylistBtn').onclick = function() { deletePlaylist(plId); };
}

/* ────────────────────────────────────────────────
   RENDER: SIDEBAR
──────────────────────────────────────────────── */
function renderSidebar() {
  likedCount.textContent = state.liked.size;
  dlCount.textContent    = state.downloaded.size;

  const container = document.getElementById('sidebarPlaylists');
  container.innerHTML = state.playlists.map(pl =>
    '<a class="library-item' + (state.currentView==='playlist'&&state.currentPlId===pl.id?' active':'') + '"' +
      ' data-view="pl:' + pl.id + '" onclick="navigate(\'playlist\',\'' + pl.id + '\')">' +
      '<div class="li-icon pl-icon"><i class="fa-solid fa-music"></i></div>' +
      '<div class="li-info">' +
        '<div class="li-name">' + escHtml(pl.name) + '</div>' +
        '<div class="li-meta">Playlist \u2022 ' + pl.songIds.length + ' songs</div>' +
      '</div>' +
    '</a>'
  ).join('');
}

function escHtml(str) {
  return String(str)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;');
}

/* ────────────────────────────────────────────────
   PLAYER: play / pause / next / prev
──────────────────────────────────────────────── */
function playSong(id, queue) {
  if (queue === undefined) queue = null;
  const song = getSong(id);
  if (!song) return;

  if (queue && queue.length) {
    state.queue = queue;
    state.queueIndex = queue.indexOf(id);
  } else if (!state.queue.includes(id)) {
    state.queue = SONGS.map(s => s.id);
    state.queueIndex = state.queue.indexOf(id);
  } else {
    state.queueIndex = state.queue.indexOf(id);
  }

  const wasSame = state.currentSongId === id;
  state.currentSongId = id;

  if (!wasSame) {
    audio.src = song.src;
    audio.load();
  }
  audio.play().then(function() {
    state.isPlaying = true;
    updatePlayerBar();
    state.recentlyPlayed = [id].concat(state.recentlyPlayed.filter(function(x){return x!==id;})).slice(0,8);
    saveState();
    refreshCurrentView();
  }).catch(function(err) { console.warn('Playback error:', err); });
}

function pauseSong() {
  audio.pause();
  state.isPlaying = false;
  updatePlayerBar();
  refreshCurrentView();
}

function togglePlay() {
  if (!state.currentSongId) {
    playSong(SONGS[0].id, SONGS.map(function(s){return s.id;}));
    return;
  }
  if (state.isPlaying) pauseSong(); else playSong(state.currentSongId);
}

function nextSong() {
  if (!state.queue.length) return;
  if (state.isRepeat) { audio.currentTime = 0; audio.play(); return; }
  var nextIdx;
  if (state.isShuffle) {
    do { nextIdx = Math.floor(Math.random() * state.queue.length); }
    while (nextIdx === state.queueIndex && state.queue.length > 1);
  } else {
    nextIdx = (state.queueIndex + 1) % state.queue.length;
  }
  state.queueIndex = nextIdx;
  playSong(state.queue[nextIdx]);
}

function prevSong() {
  if (audio.currentTime > 3) { audio.currentTime = 0; return; }
  if (!state.queue.length) return;
  var prevIdx = (state.queueIndex - 1 + state.queue.length) % state.queue.length;
  state.queueIndex = prevIdx;
  playSong(state.queue[prevIdx]);
}

/* ────────────────────────────────────────────────
   PLAYER BAR: update UI
──────────────────────────────────────────────── */
function updatePlayerBar() {
  var song = getSong(state.currentSongId);
  if (song) {
    pbTitle.textContent  = song.title;
    pbArtist.textContent = song.artist;
    pbArt.innerHTML      = artGrad(song, '4px');
  } else {
    pbTitle.textContent  = '—';
    pbArtist.textContent = 'Choose a song';
    pbArt.innerHTML      = '<i class="fa-solid fa-music"></i>';
  }
  var liked = song && state.liked.has(song.id);
  pbLikeBtn.classList.toggle('liked', liked);
  pbLikeIcon.className = 'fa-' + (liked?'solid':'regular') + ' fa-heart';
  var dl = song && state.downloaded.has(song.id);
  if (pbDlBtn) {
    pbDlBtn.classList.toggle('downloaded', dl);
    pbDlIcon.className = 'fa-solid fa-' + (dl ? 'circle-check' : 'download');
    pbDlBtn.title = dl ? 'Downloaded (click to remove)' : 'Download song';
  }
  pbPlayIcon.className = 'fa-solid fa-' + (state.isPlaying ? 'pause' : 'play');
  pbShuffleBtn.classList.toggle('active', state.isShuffle);
  pbRepeatBtn.classList.toggle('active', state.isRepeat);
}

/* ────────────────────────────────────────────────
   AUDIO events
──────────────────────────────────────────────── */
audio.addEventListener('timeupdate', function() {
  if (!audio.duration) return;
  var pct = (audio.currentTime / audio.duration) * 100;
  pbProgressFill.style.width = pct + '%';
  pbCurrentTime.textContent  = fmt(audio.currentTime);
});

audio.addEventListener('loadedmetadata', function() {
  pbTotalTime.textContent = fmt(audio.duration);
});

audio.addEventListener('ended', function() {
  if (state.isRepeat) { audio.currentTime = 0; audio.play(); return; }
  nextSong();
});

audio.addEventListener('error', function() {
  showToast('⚠️ Could not load track — check your connection');
  state.isPlaying = false;
  updatePlayerBar();
});

/* ── Progress bar click/drag ── */
var pbDragging = false;
pbProgressBar.addEventListener('mousedown', startSeek);
pbProgressBar.addEventListener('touchstart', startSeek, { passive: true });
document.addEventListener('mousemove',  function(e) { if (pbDragging) doSeek(e); });
document.addEventListener('touchmove',  function(e) { if (pbDragging) doSeek(e); }, { passive: true });
document.addEventListener('mouseup',  function() { pbDragging = false; });
document.addEventListener('touchend', function() { pbDragging = false; });

function startSeek(e) { pbDragging = true; doSeek(e); }
function doSeek(e) {
  var rect   = pbProgressBar.getBoundingClientRect();
  var clientX = e.touches ? e.touches[0].clientX : e.clientX;
  var ratio  = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
  if (audio.duration) {
    audio.currentTime = ratio * audio.duration;
    pbProgressFill.style.width = (ratio * 100) + '%';
    pbCurrentTime.textContent  = fmt(audio.currentTime);
  }
}

/* ── Volume ── */
function setVolume(val) {
  var v = Math.min(Math.max(val, 0), 100);
  state.volume  = v;
  audio.volume  = v / 100;
  pbVolSlider.value = v;
  pbVolSlider.style.background = 'linear-gradient(to right,#fff ' + v + '%,var(--surface3) ' + v + '%)';
  if (v === 0)    { pbVolIcon.className = 'fa-solid fa-volume-xmark'; state.isMuted = true; }
  else if (v < 40){ pbVolIcon.className = 'fa-solid fa-volume-low';   state.isMuted = false; }
  else            { pbVolIcon.className = 'fa-solid fa-volume-high';  state.isMuted = false; }
}

pbVolSlider.addEventListener('input', function() {
  state.prevVolume = parseInt(pbVolSlider.value, 10) || state.prevVolume;
  setVolume(parseInt(pbVolSlider.value, 10));
  saveState();
});

pbMuteBtn.addEventListener('click', function() {
  if (state.isMuted) setVolume(state.prevVolume || 70);
  else { state.prevVolume = state.volume; setVolume(0); }
});

/* ────────────────────────────────────────────────
   ACTIONS: Like / Download / Add to playlist
──────────────────────────────────────────────── */
function toggleLike(id) {
  var song = getSong(id);
  if (!song) return;
  if (state.liked.has(id)) { state.liked.delete(id); showToast('Removed from Liked Songs'); }
  else                     { state.liked.add(id);    showToast('❤️ Added to Liked Songs'); }
  saveState(); renderSidebar(); updatePlayerBar(); refreshCurrentView();
}

function triggerBrowserDownload(song) {
  if (!song || !song.src) return;
  try {
    var a = document.createElement('a');
    a.style.display = 'none';
    a.href = song.src;
    a.download = (song.artist || 'Artist') + ' - ' + (song.title || 'Song') + '.mp3';
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    setTimeout(function() {
      if (a.parentNode) a.parentNode.removeChild(a);
    }, 1000);
  } catch(err) {
    console.warn('Browser download error:', err);
  }
}

function toggleDownload(id) {
  var song = getSong(id);
  if (!song) return;
  if (state.downloaded.has(id)) {
    state.downloaded.delete(id);
    showToast('Removed "' + song.title + '" from Downloaded');
  } else {
    state.downloaded.add(id);
    showToast('⬇️ "' + song.title + '" saved to Downloaded');
    triggerBrowserDownload(song);
  }
  saveState();
  renderSidebar();
  updatePlayerBar();
  if (typeof updateNowPlaying === 'function' && npIsOpen) updateNowPlaying();
  refreshCurrentView();
}

function addSongToPlaylist(songId, plId) {
  var pl = state.playlists.find(function(p){ return p.id === plId; });
  if (!pl) return;
  if (pl.songIds.includes(songId)) { showToast('Already in "' + pl.name + '"'); return; }
  pl.songIds.push(songId);
  saveState(); renderSidebar();
  showToast('➕ Added to "' + pl.name + '"');
  if (state.currentView === 'playlist' && state.currentPlId === plId) renderPlaylistView(plId);
}

function removeFromPlaylist(songId, plId) {
  var pl = state.playlists.find(function(p){ return p.id === plId; });
  if (!pl) return;
  pl.songIds = pl.songIds.filter(function(id){ return id !== songId; });
  saveState(); renderSidebar(); renderPlaylistView(plId);
  showToast('Removed from "' + pl.name + '"');
}

/* ────────────────────────────────────────────────
   PLAYLIST CRUD
──────────────────────────────────────────────── */
function createPlaylist(name) {
  var pl = { id: uid(), name: name.trim(), songIds: [] };
  state.playlists.push(pl);
  saveState(); renderSidebar();
  showToast('🎵 Playlist "' + pl.name + '" created');
  navigate('playlist', pl.id);
}

function renamePlaylist(plId, newName) {
  var pl = state.playlists.find(function(p){ return p.id === plId; });
  if (!pl) return;
  pl.name = newName.trim();
  saveState(); renderSidebar();
  if (state.currentView === 'playlist' && state.currentPlId === plId) renderPlaylistView(plId);
  showToast('✏️ Renamed to "' + pl.name + '"');
}

function deletePlaylist(plId) {
  var pl = state.playlists.find(function(p){ return p.id === plId; });
  if (!pl) return;
  if (!confirm('Delete playlist "' + pl.name + '"? This cannot be undone.')) return;
  state.playlists = state.playlists.filter(function(p){ return p.id !== plId; });
  saveState(); renderSidebar();
  showToast('🗑️ Playlist deleted');
  navigate('home');
}

/* ────────────────────────────────────────────────
   MODALS
──────────────────────────────────────────────── */
function openModal(id)  { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

/* Create */
function showCreateModal() {
  document.getElementById('newPlaylistNameInput').value = '';
  openModal('modalCreatePlaylist');
  setTimeout(function(){ document.getElementById('newPlaylistNameInput').focus(); }, 100);
}
document.getElementById('confirmCreatePlaylist').addEventListener('click', function() {
  var name = document.getElementById('newPlaylistNameInput').value.trim();
  if (!name) return;
  closeModal('modalCreatePlaylist');
  createPlaylist(name);
});
document.getElementById('cancelCreatePlaylist').addEventListener('click', function() { closeModal('modalCreatePlaylist'); });
document.getElementById('newPlaylistNameInput').addEventListener('keydown', function(e) {
  if (e.key === 'Enter')  document.getElementById('confirmCreatePlaylist').click();
  if (e.key === 'Escape') closeModal('modalCreatePlaylist');
});

/* Rename */
function showRenameModal(plId) {
  var pl = state.playlists.find(function(p){ return p.id === plId; });
  if (!pl) return;
  state.renamingPlId = plId;
  document.getElementById('renamePlaylistNameInput').value = pl.name;
  openModal('modalRenamePlaylist');
  setTimeout(function(){ document.getElementById('renamePlaylistNameInput').focus(); }, 100);
}
document.getElementById('confirmRenamePlaylist').addEventListener('click', function() {
  var name = document.getElementById('renamePlaylistNameInput').value.trim();
  if (!name) return;
  closeModal('modalRenamePlaylist');
  renamePlaylist(state.renamingPlId, name);
});
document.getElementById('cancelRenamePlaylist').addEventListener('click', function() { closeModal('modalRenamePlaylist'); });
document.getElementById('renamePlaylistNameInput').addEventListener('keydown', function(e) {
  if (e.key === 'Enter')  document.getElementById('confirmRenamePlaylist').click();
  if (e.key === 'Escape') closeModal('modalRenamePlaylist');
});

/* Add to Playlist */
function showAddToPlaylistModal(songId) {
  state.addingSongId = songId;
  var list = document.getElementById('playlistPickerList');
  if (!state.playlists.length) {
    list.innerHTML = '<div style="color:var(--text-muted);font-size:.85rem;padding:12px 0">No playlists yet. ' +
      '<a onclick="closeModal(\'modalAddToPlaylist\');showCreateModal()" style="color:var(--accent);cursor:pointer">Create one?</a></div>';
  } else {
    list.innerHTML = state.playlists.map(function(pl) {
      return '<div class="playlist-picker-item" onclick="addSongToPlaylist(' + songId + ',\'' + pl.id + '\');closeModal(\'modalAddToPlaylist\')">' +
        '<div class="ppi-icon"><i class="fa-solid fa-music"></i></div>' +
        '<div><div style="font-weight:600">' + escHtml(pl.name) + '</div>' +
        '<div style="font-size:.75rem;color:var(--text-muted)">' + pl.songIds.length + ' songs</div></div>' +
        '</div>';
    }).join('');
  }
  openModal('modalAddToPlaylist');
}
document.getElementById('cancelAddToPlaylist').addEventListener('click', function() { closeModal('modalAddToPlaylist'); });

/* Close modal on overlay click */
document.querySelectorAll('.modal-overlay').forEach(function(overlay) {
  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) overlay.classList.remove('open');
  });
});

/* ────────────────────────────────────────────────
   EVENT DELEGATION (main content clicks)
──────────────────────────────────────────────── */
document.getElementById('mainContent').addEventListener('click', function(e) {

  // ── 1. Check if an action BUTTON was clicked (like / download / add / remove)
  //       These must be handled FIRST and must NOT bubble up to trigger play.
  var actionBtn = e.target.closest('[data-action="like"],[data-action="download"],[data-action="add-to-playlist"],[data-action="remove-from-playlist"]');
  if (actionBtn) {
    e.stopPropagation();
    var action = actionBtn.dataset.action;
    var songId = parseInt(actionBtn.dataset.id, 10);
    var plId   = actionBtn.dataset.plid;
    if (action === 'like')                      toggleLike(songId);
    else if (action === 'download')             toggleDownload(songId);
    else if (action === 'add-to-playlist')      showAddToPlaylistModal(songId);
    else if (action === 'remove-from-playlist') removeFromPlaylist(songId, plId);
    return;
  }

  // ── 2. Card play button
  var playBtn = e.target.closest('[data-action="play"]');
  if (playBtn) {
    var queue = null;
    try { queue = JSON.parse(playBtn.dataset.queue || 'null'); } catch(err){}
    var id = parseInt(playBtn.dataset.id, 10);
    if (state.currentSongId === id && state.isPlaying) pauseSong();
    else playSong(id, queue);
    return;
  }

  // ── 3. Song row click (anywhere on the row except action buttons)
  var row = e.target.closest('[data-role="song-row"]');
  if (row) {
    var queue = null;
    try { queue = JSON.parse(row.dataset.queue || 'null'); } catch(err){}
    var id = parseInt(row.dataset.id, 10);
    if (state.currentSongId === id && state.isPlaying) pauseSong();
    else playSong(id, queue);
    return;
  }

  // ── 4. Song card click (anywhere on card except action buttons)
  var card = e.target.closest('.song-card');
  if (card) {
    var cardPlayBtn = card.querySelector('[data-action="play"]');
    var queue = null;
    if (cardPlayBtn) {
      try { queue = JSON.parse(cardPlayBtn.dataset.queue || 'null'); } catch(err){}
    }
    var id = parseInt(card.dataset.id, 10);
    if (state.currentSongId === id && state.isPlaying) pauseSong();
    else playSong(id, queue);
    return;
  }
});

/* ────────────────────────────────────────────────
   SIDEBAR nav clicks
──────────────────────────────────────────────── */
document.querySelectorAll('[data-view]').forEach(function(el) {
  var v = el.dataset.view;
  if (!v || v.indexOf('pl:') === 0) return;
  el.addEventListener('click', function(e) { e.preventDefault(); navigate(v); });
});

document.getElementById('createPlaylistBtn').addEventListener('click', showCreateModal);

/* ────────────────────────────────────────────────
   PLAYER BAR button listeners
──────────────────────────────────────────────── */
pbPlayBtn.addEventListener('click', togglePlay);
pbPrevBtn.addEventListener('click', prevSong);
pbNextBtn.addEventListener('click', nextSong);

pbShuffleBtn.addEventListener('click', function() {
  state.isShuffle = !state.isShuffle;
  updatePlayerBar();
  showToast(state.isShuffle ? '🔀 Shuffle ON' : 'Shuffle OFF');
});

pbRepeatBtn.addEventListener('click', function() {
  state.isRepeat = !state.isRepeat;
  updatePlayerBar();
  showToast(state.isRepeat ? '🔂 Repeat ON' : 'Repeat OFF');
});

pbLikeBtn.addEventListener('click', function() {
  if (state.currentSongId) toggleLike(state.currentSongId);
});

if (pbDlBtn) {
  pbDlBtn.addEventListener('click', function() {
    if (state.currentSongId) toggleDownload(state.currentSongId);
  });
}

/* ────────────────────────────────────────────────
   SEARCH input
──────────────────────────────────────────────── */
var searchInput    = document.getElementById('searchInput');
var searchClearBtn = document.getElementById('searchClearBtn');

searchInput.addEventListener('input', function() {
  var q = searchInput.value;
  searchClearBtn.classList.toggle('visible', q.length > 0);
  renderSearch(q);
});
searchClearBtn.addEventListener('click', function() {
  searchInput.value = '';
  searchClearBtn.classList.remove('visible');
  renderSearch('');
  searchInput.focus();
});

/* ────────────────────────────────────────────────
   KEYBOARD SHORTCUTS
──────────────────────────────────────────────── */
document.addEventListener('keydown', function(e) {
  if (e.target.tagName === 'INPUT') return;
  switch(e.key) {
    case ' ':         e.preventDefault(); togglePlay();                              break;
    case 'ArrowRight': nextSong();                                                   break;
    case 'ArrowLeft':  prevSong();                                                   break;
    case 'ArrowUp':   e.preventDefault(); setVolume(state.volume + 5); saveState(); break;
    case 'ArrowDown': e.preventDefault(); setVolume(state.volume - 5); saveState(); break;
    case 'm': case 'M': pbMuteBtn.click();                                           break;
    case 's': case 'S': pbShuffleBtn.click();                                        break;
    case 'r': case 'R': pbRepeatBtn.click();                                         break;
    case 'l': case 'L': if (state.currentSongId) toggleLike(state.currentSongId);  break;
    case '/': e.preventDefault(); navigate('search'); searchInput.focus();           break;
  }
});

/* ────────────────────────────────────────────────
   REFRESH current view after state changes
──────────────────────────────────────────────── */
function refreshCurrentView() {
  switch(state.currentView) {
    case 'home':       renderHome();                           break;
    case 'liked':      renderLiked();                         break;
    case 'downloaded': renderDownloaded();                    break;
    case 'playlist':   renderPlaylistView(state.currentPlId); break;
    case 'search':     renderSearch(searchInput.value);       break;
  }
}

/* ────────────────────────────────────────────────
   FULLSCREEN NOW PLAYING PANEL
──────────────────────────────────────────────── */
var npOverlay     = document.getElementById('npOverlay');
var npCloseBtn    = document.getElementById('npCloseBtn');
var npAddBtn      = document.getElementById('npAddBtn');
var npArt         = document.getElementById('npArt');
var npTitle       = document.getElementById('npTitle');
var npArtist      = document.getElementById('npArtist');
var npLikeBtn     = document.getElementById('npLikeBtn');
var npLikeIcon    = document.getElementById('npLikeIcon');
var npDlBtn       = document.getElementById('npDlBtn');
var npDlIcon      = document.getElementById('npDlIcon');
var npPlayBtn     = document.getElementById('npPlayBtn');
var npPlayIcon    = document.getElementById('npPlayIcon');
var npPrevBtn     = document.getElementById('npPrevBtn');
var npNextBtn     = document.getElementById('npNextBtn');
var npShuffleBtn  = document.getElementById('npShuffleBtn');
var npRepeatBtn   = document.getElementById('npRepeatBtn');
var npProgressBar = document.getElementById('npProgressBar');
var npProgressFill= document.getElementById('npProgressFill');
var npProgressThumb= document.getElementById('npProgressThumb');
var npCurrentTime = document.getElementById('npCurrentTime');
var npTotalTime   = document.getElementById('npTotalTime');
var npVolSlider   = document.getElementById('npVolumeSlider');
var npIsOpen      = false;

function openNowPlaying() {
  if (!state.currentSongId) return;
  npIsOpen = true;
  updateNowPlaying();
  npOverlay.classList.add('open');
}

function closeNowPlaying() {
  npIsOpen = false;
  npOverlay.classList.remove('open');
}

function updateNowPlaying() {
  var song = getSong(state.currentSongId);
  if (!song) return;

  npTitle.textContent  = song.title;
  npArtist.textContent = song.artist;
  npArt.innerHTML      = artGrad(song, '12px');

  var liked = state.liked.has(song.id);
  npLikeBtn.classList.toggle('liked', liked);
  npLikeIcon.className = 'fa-' + (liked?'solid':'regular') + ' fa-heart';

  var dl = state.downloaded.has(song.id);
  if (npDlBtn) {
    npDlBtn.classList.toggle('downloaded', dl);
    npDlIcon.className = 'fa-solid fa-' + (dl ? 'circle-check' : 'download');
    npDlBtn.title = dl ? 'Downloaded (click to remove)' : 'Download song';
  }

  npPlayIcon.className = 'fa-solid fa-' + (state.isPlaying ? 'pause' : 'play');
  npShuffleBtn.classList.toggle('active', state.isShuffle);
  npRepeatBtn.classList.toggle('active', state.isRepeat);

  npVolSlider.value = state.volume;
  npVolSlider.style.background = 'linear-gradient(to right,#fff ' + state.volume + '%,var(--surface3) ' + state.volume + '%)';

  if (audio.duration) {
    npTotalTime.textContent = fmt(audio.duration);
    var pct = (audio.currentTime / audio.duration) * 100;
    npProgressFill.style.width = pct + '%';
    npProgressThumb.style.left = pct + '%';
    npCurrentTime.textContent  = fmt(audio.currentTime);
  }
}

// Open by clicking player bar art/song area
document.getElementById('pbLeftClickable').addEventListener('click', openNowPlaying);

// Close
npCloseBtn.addEventListener('click', closeNowPlaying);
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape' && npIsOpen) { closeNowPlaying(); e.preventDefault(); }
});

// NP controls
npPlayBtn.addEventListener('click', togglePlay);
npPrevBtn.addEventListener('click', prevSong);
npNextBtn.addEventListener('click', nextSong);
npShuffleBtn.addEventListener('click', function() {
  state.isShuffle = !state.isShuffle;
  updatePlayerBar();
  updateNowPlaying();
  showToast(state.isShuffle ? '🔀 Shuffle ON' : 'Shuffle OFF');
});
npRepeatBtn.addEventListener('click', function() {
  state.isRepeat = !state.isRepeat;
  updatePlayerBar();
  updateNowPlaying();
  showToast(state.isRepeat ? '🔂 Repeat ON' : 'Repeat OFF');
});
npLikeBtn.addEventListener('click', function() {
  if (state.currentSongId) toggleLike(state.currentSongId);
});
if (npDlBtn) {
  npDlBtn.addEventListener('click', function() {
    if (state.currentSongId) toggleDownload(state.currentSongId);
  });
}
npAddBtn.addEventListener('click', function() {
  if (state.currentSongId) showAddToPlaylistModal(state.currentSongId);
});

// NP Volume
npVolSlider.addEventListener('input', function() {
  state.prevVolume = parseInt(npVolSlider.value, 10) || state.prevVolume;
  setVolume(parseInt(npVolSlider.value, 10));
  saveState();
  npVolSlider.style.background = 'linear-gradient(to right,#fff ' + state.volume + '%,var(--surface3) ' + state.volume + '%)';
  // Sync player bar slider too
  pbVolSlider.value = state.volume;
  pbVolSlider.style.background = 'linear-gradient(to right,#fff ' + state.volume + '%,var(--surface3) ' + state.volume + '%)';
});

// NP Progress bar scrub
var npDragging = false;
npProgressBar.addEventListener('mousedown', function(e) { npDragging = true; npDoSeek(e); });
npProgressBar.addEventListener('touchstart', function(e) { npDragging = true; npDoSeek(e); }, { passive: true });
document.addEventListener('mousemove',  function(e) { if (npDragging) npDoSeek(e); });
document.addEventListener('touchmove',  function(e) { if (npDragging) npDoSeek(e); }, { passive: true });
document.addEventListener('mouseup',  function() { npDragging = false; });
document.addEventListener('touchend', function() { npDragging = false; });

function npDoSeek(e) {
  var rect   = npProgressBar.getBoundingClientRect();
  var clientX = e.touches ? e.touches[0].clientX : e.clientX;
  var ratio  = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
  if (audio.duration) {
    audio.currentTime = ratio * audio.duration;
    npProgressFill.style.width = (ratio * 100) + '%';
    npProgressThumb.style.left = (ratio * 100) + '%';
    npCurrentTime.textContent  = fmt(audio.currentTime);
    // Sync player bar too
    pbProgressFill.style.width = (ratio * 100) + '%';
    pbCurrentTime.textContent  = fmt(audio.currentTime);
  }
}

// Sync NP panel on audio timeupdate (extend existing listener)
audio.addEventListener('timeupdate', function() {
  if (!audio.duration || npDragging) return;
  if (npIsOpen) {
    var pct = (audio.currentTime / audio.duration) * 100;
    npProgressFill.style.width = pct + '%';
    npProgressThumb.style.left = pct + '%';
    npCurrentTime.textContent  = fmt(audio.currentTime);
  }
});

audio.addEventListener('loadedmetadata', function() {
  if (npIsOpen) npTotalTime.textContent = fmt(audio.duration);
});

// Patch updatePlayerBar to also update NP panel
var _origUpdatePlayerBar = updatePlayerBar;
updatePlayerBar = function() {
  _origUpdatePlayerBar();
  if (npIsOpen) updateNowPlaying();
};

/* ────────────────────────────────────────────────
   INIT
──────────────────────────────────────────────── */
function init() {
  loadState();
  setVolume(state.volume);
  renderSidebar();
  updatePlayerBar();
  navigate('home');
}

init();
