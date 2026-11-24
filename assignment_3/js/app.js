// The songs array comes from data/songs.js
const songList = document.getElementById("song-list");
const playlistList = document.getElementById("playlist-list");
const searchInput = document.getElementById("search-input");
const genreFilter = document.getElementById("genre-filter");
const sortSelect = document.getElementById("sort-select");
const songCount = document.getElementById("song-count");
const collectionEmpty = document.getElementById("collection-empty");
const playlistEmpty = document.getElementById("playlist-empty");
const playlistDuration = document.getElementById("playlist-duration");

// Get the saved playlist when the page opens
let myPlaylist = [];

try {
    myPlaylist = JSON.parse(localStorage.getItem("myPlaylist")) || [];
} catch (error) {
    myPlaylist = [];
}

// Only keep songs that still exist in the provided song list
myPlaylist = myPlaylist.filter(function(id) {
    return songs.some(function(song) {
        return song.id === id;
    });
});

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return minutes + ":" + String(remainingSeconds).padStart(2, "0");
}

function savePlaylist() {
    localStorage.setItem("myPlaylist", JSON.stringify(myPlaylist));
}

function fillGenreFilter() {
    const genres = [];

    songs.forEach(function(song) {
        if (!genres.includes(song.genre)) {
            genres.push(song.genre);
        }
    });

    genres.sort();

    genres.forEach(function(genre) {
        const option = document.createElement("option");
        option.value = genre;
        option.textContent = genre;
        genreFilter.appendChild(option);
    });
}

function showSongs() {
    const searchText = searchInput.value.toLowerCase();
    const selectedGenre = genreFilter.value;
    const sortBy = sortSelect.value;

    let filteredSongs = songs.filter(function(song) {
        const matchesSearch = song.title.toLowerCase().includes(searchText) ||
            song.artist.toLowerCase().includes(searchText);
        const matchesGenre = selectedGenre === "all" || song.genre === selectedGenre;

        return matchesSearch && matchesGenre;
    });

    filteredSongs.sort(function(a, b) {
        if (sortBy === "duration") {
            return a.duration - b.duration;
        }

        return a[sortBy].localeCompare(b[sortBy]);
    });

    songList.innerHTML = "";
    songCount.textContent = filteredSongs.length + (filteredSongs.length === 1 ? " song" : " songs");

    if (filteredSongs.length === 0) {
        collectionEmpty.hidden = false;
    } else {
        collectionEmpty.hidden = true;
    }

    filteredSongs.forEach(function(song) {
        const alreadyAdded = myPlaylist.includes(song.id);
        const card = document.createElement("article");
        card.className = "song-card";

        card.innerHTML = `
            <div class="album-art">♫</div>
            <div class="song-info">
                <h3>${song.title}</h3>
                <p>${song.artist}</p>
                <div class="song-meta">
                    <span class="genre-tag">${song.genre}</span>
                    <span class="duration">${formatTime(song.duration)}</span>
                </div>
            </div>
            <button class="add-button" type="button" aria-label="Add ${song.title}" title="Add to playlist" ${alreadyAdded ? "disabled" : ""}>
                ${alreadyAdded ? "✓" : "+"}
            </button>
        `;

        const addButton = card.querySelector("button");
        addButton.addEventListener("click", function() {
            addSong(song.id);
        });

        songList.appendChild(card);
    });
}

function showPlaylist() {
    playlistList.innerHTML = "";
    let totalSeconds = 0;

    const playlistSongs = myPlaylist.map(function(id) {
        return songs.find(function(song) {
            return song.id === id;
        });
    }).filter(Boolean);

    playlistSongs.forEach(function(song, index) {
        totalSeconds += song.duration;

        const row = document.createElement("div");
        row.className = "playlist-song";
        row.innerHTML = `
            <span class="track-number">${index + 1}</span>
            <div class="album-art">♫</div>
            <div class="song-info">
                <h3>${song.title}</h3>
                <p>${song.artist}</p>
            </div>
            <span class="duration">${formatTime(song.duration)}</span>
            <button class="remove-button" type="button" aria-label="Remove ${song.title}" title="Remove song">×</button>
        `;

        row.querySelector("button").addEventListener("click", function() {
            removeSong(song.id);
        });

        playlistList.appendChild(row);
    });

    playlistDuration.textContent = formatTime(totalSeconds);
    playlistEmpty.hidden = playlistSongs.length > 0;
}

function addSong(songId) {
    if (!myPlaylist.includes(songId)) {
        myPlaylist.push(songId);
        savePlaylist();
        showSongs();
        showPlaylist();
    }
}

function removeSong(songId) {
    myPlaylist = myPlaylist.filter(function(id) {
        return id !== songId;
    });

    savePlaylist();
    showSongs();
    showPlaylist();
}

// Update the collection when the user changes a filter
searchInput.addEventListener("input", showSongs);
genreFilter.addEventListener("change", showSongs);
sortSelect.addEventListener("change", showSongs);

// Start the app
fillGenreFilter();
showSongs();
showPlaylist();
