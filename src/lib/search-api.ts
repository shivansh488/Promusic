interface SearchResult {
  id: string;
  name: string;
  primaryArtists: string;
  image: Array<{ link: string }>;
  downloadUrl: Array<{ link: string }>;
}

export async function searchSongs(query: string): Promise<SearchResult[]> {
  if (!query) return [];

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5100';
  const searchUrl = `${apiUrl}/song/?query=${encodeURIComponent(query)}`;

  try {
    const response = await fetch(searchUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.error('Search API Response:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });
      throw new Error(`Failed to fetch search results: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      console.error('Invalid response format:', data);
      throw new Error("Invalid response format from server");
    }

    return data.map((song: any) => ({
      id: song.id || String(Math.random()),
      name: song.song || song.title || 'Unknown Title',
      primaryArtists: song.singers || song.primary_artists || 'Unknown Artist',
      image: song.image ? [{ 
        link: song.image.replace('150x150', '500x500')
      }] : [{ 
        link: 'https://i.imgur.com/QxoJ9Co.png'
      }],
      downloadUrl: song.media_url ? [{
        link: song.media_url
      }] : []
    }));

  } catch (error) {
    console.error("Error searching:", error);
    throw error;
  }
}
