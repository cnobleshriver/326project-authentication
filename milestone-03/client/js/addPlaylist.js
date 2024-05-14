document.addEventListener('DOMContentLoaded', () => {
    const accessToken = localStorage.getItem('accessToken');
    const userName = localStorage.getItem('userName');
    const userProfilePicture = localStorage.getItem('userProfilePicture');

    if (!accessToken) {
        window.location.href = '/index.html'; // Redirect to home if not logged in
    }

    // Display user info
    const userInfo = document.getElementById('user-info');
    const loginButton = document.getElementById('login-button');
    const logoutButton = document.getElementById('logout-button');

    if (userName && userProfilePicture) {
        userInfo.innerHTML = `
            <img src="${userProfilePicture}" alt="${userName}" class="profile-picture">
            <span class="user-name">${userName}</span>
        `;
        loginButton.style.display = 'none';
        logoutButton.style.display = 'block';
    } else {
        loginButton.style.display = 'block';
        logoutButton.style.display = 'none';
    }

    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userName');
        localStorage.removeItem('userProfilePicture');
        window.location.href = '/index.html'; // Redirect to home after logout
    });

    // Fetch and display playlists
    fetchPlaylists(accessToken);

    const addPlaylistForm = document.getElementById('add-playlist-form');

    addPlaylistForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const playlistSelect = document.getElementById('playlist-select');
        const playlistId = playlistSelect.value;

        if (playlistId) {
            addPlaylist(accessToken, playlistId);
        }
    });
});

function fetchPlaylists(accessToken) {
    fetch('https://api.spotify.com/v1/me/playlists', {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    })
    .then(response => response.json())
    .then(data => {
        const playlistSelect = document.getElementById('playlist-select');
        data.items.forEach(playlist => {
            const option = document.createElement('option');
            option.value = playlist.id;
            option.textContent = playlist.name;
            playlistSelect.appendChild(option);
        });
    })
    .catch(error => {
        console.error('Error fetching playlists:', error);
    });
}

function addPlaylist(accessToken, playlistId) {
    fetch('http://localhost:3001/addPlaylist', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accessToken, playlistId }),
    })
    .then(response => response.json())
    .then(data => {
        console.log(data.message);
        window.location.href = '/index.html'; // Redirect to home after adding playlist
    })
    .catch(error => {
        console.error('Error adding playlist:', error);
    });
}
