const AUTHORIZE = "https://accounts.spotify.com/authorize"
const TOKEN = "https://accounts.spotify.com/api/token";
const PLAYLISTS = "https://api.spotify.com/v1/me/playlists";
const TRACKS = "https://api.spotify.com/v1/playlists/{{PlaylistId}}/tracks";
const REDIRECT_URI = 'http://localhost:3000';
const CLIENT_ID = 'd438496e304746c49414f6282f0a9477';

document.addEventListener('DOMContentLoaded', () => {
    let url = AUTHORIZE;
    url += "?client_id=" + CLIENT_ID;
    url += "&response_type=code";
    url += "&redirect_uri=" + encodeURI(REDIRECT_URI);
    url += "&scope=user-read-private user-read-email";

    const code = new URLSearchParams(window.location.search).get('code');

    if (code) {
        fetch('http://localhost:3001/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code }),
        })
            .then(response => response.json())
            .then(data => {
                console.log('Access Token:', data.accessToken);
                console.log('User Name:', data.userName);
                console.log('User Profile Picture:', data.userProfilePicture);

                localStorage.setItem('accessToken', data.accessToken);
                localStorage.setItem('userName', data.userName);
                localStorage.setItem('userProfilePicture', data.userProfilePicture);

                displayUser(data.userName, data.userProfilePicture);
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    } else {
        const loginButton = document.getElementById('login-button');
        loginButton.style.display = 'block';
        loginButton.addEventListener('click', () => {
            window.location = url;
        });
    }

    const logoutButton = document.getElementById('logout-button');
    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userName');
        localStorage.removeItem('userProfilePicture');
        window.location.href = '/'; // Redirect to home after logout
    });
});

function displayUser(userName, userProfilePicture) {
    const userInfo = document.getElementById('user-info');
    const loginButton = document.getElementById('login-button');
    const logoutButton = document.getElementById('logout-button');

    userInfo.innerHTML = `
      <img src="${userProfilePicture}" alt="${userName}" class="profile-picture">
      <span class="user-name">${userName}</span>
  `;
    loginButton.style.display = 'none';
    logoutButton.style.display = 'block';
}

function refreshToken() {
    const refreshToken = localStorage.getItem('refreshToken');
    fetch('http://localhost:3001/refresh_token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
    })
        .then(response => response.json())
        .then(data => {
            localStorage.setItem('accessToken', data.accessToken);
        })
        .catch((error) => {
            console.error('Error refreshing token:', error);
        });
}

// Call refreshToken periodically, every 50 minutes
setInterval(refreshToken, 50 * 60 * 1000);

function callApi(method, url, body, callback) {
    let xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('accessToken'));
    xhr.send(body);
    xhr.onload = callback;
}

function refreshPlaylists() {
    callApi("GET", PLAYLISTS, null, handlePlaylistsResponse);
}

function handlePlaylistsResponse() {
    if (this.status == 200) {
        var data = JSON.parse(this.responseText);
        console.log(data);
        removeAllItems("playlists");
        data.items.forEach(item => addPlaylist(item));
        document.getElementById('playlists').value = "";
    }
    else if (this.status == 401) {
        refreshToken()
    }
    else {
        console.log(this.responseText);
        alert(this.responseText);
    }
}

function addPlaylist(item) {
    let node = document.createElement("option");
    node.value = item.id;
    node.innerHTML = item.name + " (" + item.tracks.total + ")";
    document.getElementById("playlists").appendChild(node);
}

function removeAllItems(elementId) {
    let node = document.getElementById(elementId);
    while (node.firstChild) {
        node.removeChild(node.firstChild);
    }
}

function fetchTracks() {
    let playlist_id = document.getElementById("playlists").value;
    if (playlist_id.length > 0) {
        url = TRACKS.replace("{{PlaylistId}}", playlist_id);
        callApi("GET", url, null, handleTracksResponse);
    }
}

function handleTracksResponse() {
    if (this.status == 200) {
        var data = JSON.parse(this.responseText);
        console.log(data);
        removeAllItems("tracks");
        data.items.forEach((item, index) => addTrack(item, index));
    } else if (this.status == 401) {
        refreshAccessToken()
    } else {
        console.log(this.responseText);
        alert(this.responseText);
    }
}

function addTrack(item, index) {
    let node = document.createElement("option");
    node.value = index;
    node.innerHTML = item.track.name + " (" + item.track.artists[0].name + ")";
    document.getElementById("tracks").appendChild(node);
}