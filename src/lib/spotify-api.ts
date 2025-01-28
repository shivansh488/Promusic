const SPOTIFY_API_URL = 'https://api.spotify.com/v1';

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
  const response = await fetch(`${SPOTIFY_API_URL}/me/tracks`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const data = await response.json();
  return data.items.map((item: any) => ({
    id: item.track.id,
    name: item.track.name,
    primaryArtists: item.track.artists.map((artist: any) => artist.name).join(', '),
  }));
};
