import SearchBar from "../Components/SearchBar/SearchBar";

const clientId = '21f50e41e8c243efa3ee1961c218643c';
const redirectUri = 'http://localhost:3000';
let accessToken;

const Spotify =  {


    getAccessToken () {

        if (accessToken) {

            return accessToken;
        }

        //check for an access token match

        const accessTokenMatch = window.location.href.match(/access_token=([^&]*)/);
        const expiresInMatch = window.location.href.match(/expires_in=([^&]*)/);

        if (accessTokenMatch && expiresInMatch) {

            accessToken = accessTokenMatch[1];
            const expiresIn = Number(expiresInMatch[1]);
            // this clears parameters and allows us to grab a new access token
            window.setTimeout( () => accessToken='', expiresIn * 1000 );
            window.history.pushState('Access Token', null, '/');
            return accessToken;
            
        }

        else {

            const accessUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirectUri}`;
            window.location = accessUrl;
        }

    },

    search(term) {
    

        //fetches track information and returns a json response then maps the data to an array object.
        const accessToken = Spotify.getAccessToken();
        return fetch(`https://api.spotify.com/v1/search?type=track&q=${term}`, {headers:{
            Authorization: `Bearer ${accessToken}`,
        }
        }).then(response => {
            return response.json();
        }).then(jsonResponse => {

            if (!jsonResponse.tracks){

                return [];
            }
            else {

                return jsonResponse.tracks.items.map(track => ({

                        id:track.id,
                        name: track.name,
                        artists: track.artists[0].name,
                        album: track.album.name,
                        uri:track.uri
                    }));

            }
        })

    },
    // saves a users custom playlist
    //gets current ID
    //POSTS playlist
    //POSTs track URI

    savePlaylist(name, trackUris) {

        if (!name || !trackUris.length) {

            return;
        }

        const accessToken = Spotify.getAccessToken();
        const headers = { Authorization: `Bearer ${accessToken}`};
        let userId;

        return fetch('https://api.spotify.com/v1/me',{headers: headers}
        ).then(response => response.json()
        ).then(jsonResponse => {

            userId = jsonResponse.id;
            return fetch(`https://api.spotify.com/v1/users/${userId}/playlists`,
            
            {
                headers:headers,
                method: 'POST',
                body: JSON.stringify({name: name})

            }
            
            ).then( response => response.json() 
            
            ).then(jsonResponse => {
              const playlistId = jsonResponse.id;
             return fetch (`https://api.spotify.com/v1/users/${userId}/playlists/${playlistId}/tracks`, 
             {

                header:headers,
                method:'POST',
                body: JSON.stringify({uris: trackUris})
             })
            })
        })

    }

}

export default Spotify;