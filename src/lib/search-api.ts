interface SearchResult {
  id: string;
  name: string;
  primaryArtists: string;
  image: Array<{ link: string }>;
}

export async function searchSongs(query: string): Promise<SearchResult[]> {
  if (!query) return [];

  try {
    // Fetch from multiple endpoints with pagination
    const [songsResponse, albumsResponse, playlistsResponse] = await Promise.all([
      fetch(
        `https://jiosaavn-api-privatecvc2.vercel.app/search/songs?query=${encodeURIComponent(query)}&page=1&limit=20`
      ),
      fetch(
        `https://jiosaavn-api-privatecvc2.vercel.app/search/albums?query=${encodeURIComponent(query)}&page=1&limit=10`
      ),
      fetch(
        `https://jiosaavn-api-privatecvc2.vercel.app/search/playlists?query=${encodeURIComponent(query)}&page=1&limit=5`
      ),
    ]);

    if (!songsResponse.ok || !albumsResponse.ok || !playlistsResponse.ok) {
      throw new Error("Failed to fetch search results");
    }

    const [songsData, albumsData, playlistsData] = await Promise.all([
      songsResponse.json(),
      albumsResponse.json(),
      playlistsResponse.json(),
    ]);

    // Process songs
    const songs = songsData.data?.results || [];

    // Process albums and fetch their songs
    const albumSongs = await Promise.all(
      (albumsData.data?.results || []).map(async (album: any) => {
        try {
          const albumResponse = await fetch(
            `https://jiosaavn-api-privatecvc2.vercel.app/albums?id=${album.id}`
          );
          if (!albumResponse.ok) return [];
          const albumData = await albumResponse.json();
          return (albumData.data.songs || []).map((song: any) => ({
            ...song,
            albumInfo: {
              name: album.name,
              id: album.id,
            },
          }));
        } catch (error) {
          console.error("Error fetching album songs:", error);
          return [];
        }
      })
    );

    // Process playlists and fetch their songs
    const playlistSongs = await Promise.all(
      (playlistsData.data?.results || []).map(async (playlist: any) => {
        try {
          const playlistResponse = await fetch(
            `https://jiosaavn-api-privatecvc2.vercel.app/playlists?id=${playlist.id}`
          );
          if (!playlistResponse.ok) return [];
          const playlistData = await playlistResponse.json();
          return (playlistData.data.songs || []).map((song: any) => ({
            ...song,
            playlistInfo: {
              name: playlist.name,
              id: playlist.id,
            },
          }));
        } catch (error) {
          console.error("Error fetching playlist songs:", error);
          return [];
        }
      })
    );

    // Combine all results and remove duplicates based on song ID
    const allSongs = [
      ...songs,
      ...albumSongs.flat(),
      ...playlistSongs.flat(),
    ].filter(
      (song, index, self) =>
        song && song.id && index === self.findIndex((s) => s.id === song.id)
    );

    return allSongs;
  } catch (error) {
    console.error("Error searching:", error);
    throw new Error("An error occurred while searching. Please try again.");
  }
}