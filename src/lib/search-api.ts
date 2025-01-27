interface SearchResult {
  id: string;
  name: string;
  primaryArtists: string;
  image: Array<{ link: string }>;
  downloadUrl: Array<{ link: string }>;
}

export async function searchSongs(query: string): Promise<SearchResult[]> {
  if (!query) return [];

  // Using local JioSaavnAPI server
  const apiUrl = `http://localhost:5100/song/?query=${encodeURIComponent(query)}`;
  console.log('Fetching from URL:', apiUrl);

  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      mode: 'cors'
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Response not OK:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`Failed to fetch search results: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('API Response data:', JSON.stringify(data, null, 2));

    if (!Array.isArray(data)) {
      console.error('Unexpected API response structure:', JSON.stringify(data, null, 2));
      throw new Error("Invalid response format from server");
    }

    // Map the response to match our interface
    const songs = data.map((song: any) => {
      const mappedSong = {
        id: song.id || String(Math.random()),
        name: song.song || song.title || 'Unknown Title',
        primaryArtists: song.singers || song.primary_artists || 'Unknown Artist',
        image: [{ link: song.image || 'https://i.imgur.com/QxoJ9Co.png' }],
        downloadUrl: [{ link: song.media_url || '' }]
      };
      console.log('Mapped song:', mappedSong);
      return mappedSong;
    });

    return songs;
  } catch (error) {
    console.error("Error searching:", {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    throw new Error(`An error occurred while searching: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
