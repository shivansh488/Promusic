interface SaavnSearchResult {
  id: string;
  name: string;
  primaryArtists: string;
  downloadUrl: { link: string }[];
  image: { link: string }[];
}

export async function searchTrackOnSaavn(title: string, artist: string): Promise<SaavnSearchResult | null> {
  try {
    const query = `${title} ${artist}`.replace(/[^\w\s]/gi, '');
    const apiUrl = `https://jiosaavn-api.vercel.app/search?query=${encodeURIComponent(query)}`;
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      mode: 'cors'
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch search results: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data || !Array.isArray(data.results) || data.results.length === 0) {
      return null;
    }

    const track = data.results[0];
    const imageUrls = track.images || {};
    const highestQualityImage = imageUrls['500x500'] || imageUrls['150x150'] || Object.values(imageUrls)[0];

    return {
      id: track.id,
      name: track.name,
      primaryArtists: track.primaryArtists,
      downloadUrl: [{ link: track.downloadUrl }],
      image: [{ link: highestQualityImage }]
    };
  } catch (error) {
    console.error('Error searching track on Saavn:', error);
    return null;
  }
}
