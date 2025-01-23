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

    if (!response.ok) {
      throw new Error(`Failed to fetch search results: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Raw API response:', data);
    
    if (!data || !Array.isArray(data.results)) {
      console.error('Unexpected API response structure:', data);
      throw new Error("Invalid response format from server");
    }

    // Map the response to match our interface
    const songs = data.results.map((song: any) => {
      // Extract the highest quality image URL
      const imageUrls = song.images || {};
      const highestQualityImage = 
        imageUrls['500x500'] || 
        imageUrls['150x150'] || 
        Object.values(imageUrls)[0] || 
        song.image || // Fallback to direct image URL
        'https://i.imgur.com/QxoJ9Co.png';

      // Extract artists
      const artists = song.more_info?.singers || 
                     song.more_info?.primary_artists || 
                     song.artist || 
                     'Unknown Artist';

      const result = {
        id: song.id,
        name: song.title || song.name || 'Unknown Title',
        primaryArtists: artists,
        image: [{ link: highestQualityImage }],
        downloadUrl: [{ link: song.downloadUrl || song.more_info?.media_url || '' }]
      };

      console.log('Mapped song:', result);
      return result;
    });

    console.log('Final results:', songs);
    return songs;
  } catch (error) {
    console.error("Error searching:", error);
    throw error;
  }
}