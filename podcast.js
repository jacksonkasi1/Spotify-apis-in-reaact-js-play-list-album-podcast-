import { useState, useEffect } from 'react';
import axios from 'axios';
import { Typography, List, ListItem } from '@mui/material';

const Playlist = () => {
    /**
     * @see https://developer.spotify.com/documentation/general/guides/authorization/
     * @see https://developer.spotify.com/documentation/web-api/reference/#/operations/get-playlist
     * @see https://developer.spotify.com/community/news/2020/03/20/introducing-podcasts-api/
     * @see https://developer.spotify.com/documentation/web-api/reference/#/operations/get-a-show
     */

    const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET;

    // const playlistId = '37i9dQZF1DXbYM3nMM0oPk';
    const playlistId = '1rWSfztW5ZTH5UK7M2R7JG';
    const albumId = '3Us57CjssWnHjTUIXBuIeH';
    const podcastId = '3MXQRTTDsQGIzCyttaqCOM';
    const limit = 3;

    const [playlistMetaData, setPlaylistMetaData] = useState(null);
    const [playlist, setPlaylist] = useState(null);
    const [accessToken, setAccessToken] = useState(null);

    const getAccessToken = async (clientId, clientSecret) => {
        const url = 'https://accounts.spotify.com/api/token';
        const headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
        };
        const data = 'grant_type=client_credentials';

        try {
            const response = await axios.post(url, data, { headers });
            const accessToken = response.data.access_token;
            setAccessToken(accessToken);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        getAccessToken(clientId, clientSecret);
    }, [clientId, clientSecret]);

    const getPlaylistMetaData = async ({ accessToken, playlistId }) => {
        const url = `https://api.spotify.com/v1/playlists/${playlistId}`;

        const params = {
            fields: 'collaborative,description,followers,images,name',
        };

        const headers = {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        };

        try {
            const response = await axios.get(url, { headers, params });
            return response.data;
        } catch (error) {
            console.error(error.message);
            return null;
        }
    };

    const getPlaylist = async ({ accessToken, playlistId, limit = 5 }) => {
        const url = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`;

        const params = {
            limit,
            fields: 'items(track(id,name,artists(name),preview_url,duration_ms)),total',
        };

        const headers = {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        };

        try {
            const response = await axios.get(url, { headers, params });
            return response.data;
        } catch (error) {
            console.error(error.message);
            return null;
        }
    };

    const getAlbumData = async ({ accessToken, albumId, limit = 5 }) => {
        const url = `https://api.spotify.com/v1/playlists/${albumId}/tracks`;

        const params = {
            limit,
            fields: 'items(track(id,name,preview_url,duration_ms)),total',
        };

        const headers = {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        };

        try {
            const response = await axios.get(url, { headers, params });
            return response.data;
        } catch (error) {
            console.error(error.message);
            return null;
        }
    };

    const getPodcastData = async ({ accessToken, podcastId, limit = 5 }) => {
        const url = `https://api.spotify.com/v1/shows/${podcastId}`;
        const headers = {
            Authorization: `Bearer ${accessToken}`,
        };
        const params = {
            fields: 'description,genres,images,name,publisher,type,uri',
            limit,
        };

        try {
            const response = await axios.get(url, { headers });
            const podcastData = response.data;
            return podcastData;
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (!accessToken) {
            return;
        }
        const fetchData = async () => {
            const data = await getPlaylist({ accessToken, playlistId, limit });
            setPlaylist(data);
            const metaData = await getPlaylistMetaData({
                accessToken,
                playlistId,
            });
            setPlaylistMetaData(metaData);

            // const albumData = await getAlbumData(accessToken, albumId);
            // console.log(albumData);

            const podcastData = await getPodcastData(accessToken, podcastId);
            console.log(podcastData);
        };
        fetchData();
    }, [accessToken, playlistId]);

    if (!playlist) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <Typography variant="h3">{playlistMetaData?.name || ''}</Typography>
            <Typography variant="subtitle1">
                {playlistMetaData?.description || ''}
            </Typography>
            <List>
                {playlist.items.map((item) => (
                    <ListItem key={item.track.id}>
                        <Typography variant="body1">
                            {item.track.name}
                        </Typography>
                        <Typography variant="body1">
                            ({Math.floor(item.track.duration_ms / 60000)}:
                            {(
                                '0' +
                                Math.floor(
                                    (item.track.duration_ms % 60000) / 1000,
                                )
                            ).slice(-2)}
                            )
                        </Typography>
                    </ListItem>
                ))}
            </List>
        </div>
    );
};

export default Playlist;
