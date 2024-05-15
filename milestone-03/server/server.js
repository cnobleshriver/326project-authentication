const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const SpotifyWebApi = require('spotify-web-api-node');
const PouchDB = require('pouchdb');
const app = express();

app.use(cors());
app.use(bodyParser.json());

const db = new PouchDB('playlists');

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

app.post("/add_playlist", (req, res) => {
    const { accessToken, playlistId } = req.body;
    spotifyApi.setAccessToken(accessToken);

    spotifyApi.getPlaylist(playlistId)
        .then(data => {
            const playlist = {
                _id: data.body.id,
                name: data.body.name,
                owner: data.body.owner.display_name,
                tracks: data.body.tracks.total,
                href: data.body.external_urls.spotify,
                upvotes: 0,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            return db.put(playlist);
        })
        .then(() => {
            res.status(201).json({ message: "Playlist added successfully" });
        })
        .catch(err => {
            res.status(400).json({ error: err.message });
        });
});

app.get("/playlists", (req, res) => {
    db.allDocs({ include_docs: true })
        .then(result => {
            res.json(result.rows.map(row => row.doc));
        })
        .catch(err => {
            res.status(500).json({ error: err.message });
        });
});

app.post("/upvote_playlist", (req, res) => {
    const { playlistId } = req.body;

    db.get(playlistId).then(doc => {
        doc.upvotes += 1;
        doc.updatedAt = new Date();
        return db.put(doc);
    }).then(() => {
        res.status(200).json({ message: "Playlist upvoted successfully" });
    }).catch(err => {
        res.status(400).json({ error: err.message });
    });
});

app.listen(3001, () => {
    console.log('Server is running on port 3001');
});
