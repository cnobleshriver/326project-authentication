const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const SpotifyWebApi = require('spotify-web-api-node');
const app = express();

app.use(cors());
app.use(bodyParser.json());

const spotifyApi = new SpotifyWebApi({
    redirectUri: 'http://localhost:3000',
    clientId: 'd438496e304746c49414f6282f0a9477',
    clientSecret: '0773708e90d643b08564da62e8da935d',
});

app.post("/login", (req, res) => {
    const code = req.body.code;
    spotifyApi.authorizationCodeGrant(code).then(data => {
        const accessToken = data.body.access_token;
        spotifyApi.setAccessToken(accessToken);

        // Fetch the user's profile information
        return spotifyApi.getMe().then(userData => {
            res.json({
                accessToken: accessToken,
                userName: userData.body.display_name,
                userProfilePicture: userData.body.images[0] ? userData.body.images[0].url : ''
            });
        });
    }).catch(err => {
        res.sendStatus(400);
    });
});

app.post("/refresh_token", (req, res) => {
    const refreshToken = req.body.refreshToken;
    spotifyApi.setRefreshToken(refreshToken);
    spotifyApi.refreshAccessToken().then(data => {
        res.json({
            accessToken: data.body.access_token,
        });
    }).catch(err => {
        res.sendStatus(400);
    });
});


app.listen(3001, () => {
    console.log('Server is running on port 3001');
});
