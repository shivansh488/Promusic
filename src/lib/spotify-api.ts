const SPOTIFY_API_URL = 'https://api.spotify.com/v1';
const ITEMS_PER_REQUEST = 50; // Maximum allowed by Spotify API

export interface SpotifyPlaylist {
  id: string;
  name: string;
  tracks: {
    total: number;
    items: Array<{
      track: {
        id: string;
        name: string;
        artists: Array<{ name: string }>;
      };
    }>;
  };
}

export const fetchSpotifyPlaylists = async (accessToken: string): Promise<SpotifyPlaylist[]> => {
  const response = await fetch(`${SPOTIFY_API_URL}/me/playlists`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const data = await response.json();
  return data.items;
};

export const fetchSpotifyLikedSongs = async (accessToken: string) => {
  let allTracks: any[] = [];
  let offset = 0;
  let total = Infinity;

  while (offset < total) {
    const response = await fetch(
      `${SPOTIFY_API_URL}/me/tracks?limit=${ITEMS_PER_REQUEST}&offset=${offset}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const data = await response.json();
    total = data.total;
    
    const tracks = data.items.map((item: any) => ({
      id: item.track.id,
      name: item.track.name,
      primaryArtists: item.track.artists.map((artist: any) => artist.name).join(', '),
    }));

    allTracks = [...allTracks, ...tracks];
    offset += ITEMS_PER_REQUEST;
  }

  return allTracks;
};
