/* data.js — Song Library (30 songs across 6 genres) */
'use strict';

const SONGS = [
  /* ── POP ─────────────────────────────────────── */
  {
    id: 1, title: "Blinding Lights", artist: "The Weeknd",
    album: "After Hours", genre: "Pop",
    color: ["#e91e63","#311b92"],
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
  },
  {
    id: 2, title: "As It Was", artist: "Harry Styles",
    album: "Harry's House", genre: "Pop",
    color: ["#00bcd4","#1a237e"],
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
  },
  {
    id: 3, title: "Levitating", artist: "Dua Lipa",
    album: "Future Nostalgia", genre: "Pop",
    color: ["#7c4dff","#e040fb"],
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"
  },
  {
    id: 4, title: "Stay", artist: "The Kid LAROI",
    album: "F*CK LOVE 3", genre: "Pop",
    color: ["#ff6f00","#f50057"],
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3"
  },
  {
    id: 5, title: "Bad Guy", artist: "Billie Eilish",
    album: "When We All Fall Asleep", genre: "Pop",
    color: ["#69f0ae","#00b0ff"],
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3"
  },

  /* ── ROCK ────────────────────────────────────── */
  {
    id: 6, title: "Bohemian Rhapsody", artist: "Queen",
    album: "A Night at the Opera", genre: "Rock",
    color: ["#ffd740","#ff6d00"],
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3"
  },
  {
    id: 7, title: "Hotel California", artist: "Eagles",
    album: "Hotel California", genre: "Rock",
    color: ["#ff7043","#b71c1c"],
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3"
  },
  {
    id: 8, title: "Smells Like Teen Spirit", artist: "Nirvana",
    album: "Nevermind", genre: "Rock",
    color: ["#78909c","#37474f"],
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3"
  },
  {
    id: 9, title: "Sweet Child O' Mine", artist: "Guns N' Roses",
    album: "Appetite for Destruction", genre: "Rock",
    color: ["#ff8a65","#6a1b9a"],
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3"
  },
  {
    id: 10, title: "Stairway to Heaven", artist: "Led Zeppelin",
    album: "Led Zeppelin IV", genre: "Rock",
    color: ["#a5d6a7","#1b5e20"],
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3"
  },

  /* ── JAZZ ────────────────────────────────────── */
  {
    id: 11, title: "Take Five", artist: "Dave Brubeck",
    album: "Time Out", genre: "Jazz",
    color: ["#90caf9","#1565c0"],
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3"
  },
  {
    id: 12, title: "So What", artist: "Miles Davis",
    album: "Kind of Blue", genre: "Jazz",
    color: ["#b0bec5","#455a64"],
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3"
  },
  {
    id: 13, title: "Autumn Leaves", artist: "Chet Baker",
    album: "Chet", genre: "Jazz",
    color: ["#ffcc02","#e65100"],
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3"
  },
  {
    id: 14, title: "Blue in Green", artist: "Miles Davis",
    album: "Kind of Blue", genre: "Jazz",
    color: ["#4dd0e1","#006064"],
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3"
  },
  {
    id: 15, title: "Round Midnight", artist: "Thelonious Monk",
    album: "Genius of Modern Music", genre: "Jazz",
    color: ["#ce93d8","#4a148c"],
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3"
  },

  /* ── CLASSICAL ───────────────────────────────── */
  {
    id: 16, title: "Moonlight Sonata", artist: "Ludwig van Beethoven",
    album: "Piano Works", genre: "Classical",
    color: ["#b0bec5","#263238"],
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3"
  },
  {
    id: 17, title: "Für Elise", artist: "Ludwig van Beethoven",
    album: "Piano Works", genre: "Classical",
    color: ["#f8bbd0","#880e4f"],
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-17.mp3"
  },
  {
    id: 18, title: "Canon in D", artist: "Johann Pachelbel",
    album: "Baroque Collection", genre: "Classical",
    color: ["#fff9c4","#f57f17"],
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
  },
  {
    id: 19, title: "Symphony No. 5", artist: "Ludwig van Beethoven",
    album: "Symphonies", genre: "Classical",
    color: ["#ef9a9a","#b71c1c"],
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
  },
  {
    id: 20, title: "Clair de Lune", artist: "Claude Debussy",
    album: "Suite Bergamasque", genre: "Classical",
    color: ["#b3e5fc","#01579b"],
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"
  },

  /* ── ELECTRONIC ──────────────────────────────── */
  {
    id: 21, title: "One More Time", artist: "Daft Punk",
    album: "Discovery", genre: "Electronic",
    color: ["#ff6e40","#ffab00"],
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3"
  },
  {
    id: 22, title: "Strobe", artist: "deadmau5",
    album: "4×4=12", genre: "Electronic",
    color: ["#ea80fc","#aa00ff"],
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3"
  },
  {
    id: 23, title: "Levels", artist: "Avicii",
    album: "True", genre: "Electronic",
    color: ["#f9a825","#e65100"],
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3"
  },
  {
    id: 24, title: "Animals", artist: "Martin Garrix",
    album: "Gold Skies", genre: "Electronic",
    color: ["#69f0ae","#00600f"],
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3"
  },
  {
    id: 25, title: "Titanium", artist: "David Guetta ft. Sia",
    album: "Nothing but the Beat", genre: "Electronic",
    color: ["#80d8ff","#0091ea"],
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3"
  },

  /* ── CHILL ───────────────────────────────────── */
  {
    id: 26, title: "Redbone", artist: "Childish Gambino",
    album: "Awaken, My Love!", genre: "Chill",
    color: ["#d7ccc8","#4e342e"],
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3"
  },
  {
    id: 27, title: "Sunflower", artist: "Post Malone",
    album: "Spider-Man: Into the Spider-Verse", genre: "Chill",
    color: ["#fff59d","#f9a825"],
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3"
  },
  {
    id: 28, title: "Peaches", artist: "Justin Bieber",
    album: "Justice", genre: "Chill",
    color: ["#ffccbc","#bf360c"],
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3"
  },
  {
    id: 29, title: "Golden", artist: "Harry Styles",
    album: "Fine Line", genre: "Chill",
    color: ["#ffe082","#ff6f00"],
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3"
  },
  {
    id: 30, title: "Watermelon Sugar", artist: "Harry Styles",
    album: "Fine Line", genre: "Chill",
    color: ["#ef5350","#e91e63"],
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3"
  },
];

const GENRES = [
  { name: "Pop",        icon: "fa-star",            color: ["#e91e63","#9c27b0"] },
  { name: "Rock",       icon: "fa-guitar",           color: ["#ff7043","#b71c1c"] },
  { name: "Jazz",       icon: "fa-saxophone",        color: ["#90caf9","#1565c0"] },
  { name: "Classical",  icon: "fa-music",            color: ["#b0bec5","#263238"] },
  { name: "Electronic", icon: "fa-bolt",             color: ["#ea80fc","#aa00ff"] },
  { name: "Chill",      icon: "fa-leaf",             color: ["#a5d6a7","#1b5e20"] },
];
