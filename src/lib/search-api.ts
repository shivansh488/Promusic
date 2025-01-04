interface SearchResult {
  id: string;
  name: string;
  primaryArtists: string;
  image: Array<{ link: string }>;
  downloadUrl: Array<{ link: string }>;
}

export async function searchSongs(query: string): Promise<SearchResult[]> {
  if (!query) return [];

  const apiUrl = `https://jiosaavn-api.vercel.app/search?query=${encodeURIComponent(query)}`;
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

    if (!data || !Array.isArray(data.results)) {
      console.error('Unexpected API response structure:', JSON.stringify(data, null, 2));
      throw new Error("Invalid response format from server");
    }

    // Map the response to match our interface
    const songs = data.results.map((song: any) => {
      // Extract the highest quality image URL
      const imageUrls = song.images || {};
      const highestQualityImage = 
        imageUrls['500x500'] || 
        imageUrls['150x150'] || 
        imageUrls['50x50'] || 
        song.image || // Fallback to direct image URL if available
        'https://i.imgur.com/QxoJ9Co.png';

      // Extract download URL from more_info if available
      const downloadUrl = song.more_info?.vlink || '';

      const mappedSong = {
        id: song.id || String(Math.random()),
        name: song.title || song.name || 'Unknown Title',
        primaryArtists: song.more_info?.singers || song.description?.split('·')[1]?.trim() || 'Unknown Artist',
        image: [{ link: highestQualityImage }],
        downloadUrl: [{ link: downloadUrl }]
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