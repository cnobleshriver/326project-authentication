document.addEventListener('DOMContentLoaded', () => {
  const AUTHORIZE = 'https://accounts.spotify.com/authorize';
  const REDIRECT_URI = 'http://localhost:3000';
  const CLIENT_ID = 'd438496e304746c49414f6282f0a9477';

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
