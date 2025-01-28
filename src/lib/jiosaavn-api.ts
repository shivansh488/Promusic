export interface JioSaavnSearchResponse {
  id: string;
  title: string;
  more_info: {
    vlink?: string;
    artist_map: {
      primary_artists: string[];
    };
    singers: string;
  };
  image: string;
  url: string;
  duration: string;
}

export const searchJioSaavn = async (query: string): Promise<any> => {
  try {
    const response = await fetch(`${window.location.origin}/api/song?query=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error('Failed to fetch from JioSaavn API');
    const data = await response.json();
    return data[0] || null; // Return first result or null if no results
  } catch (error) {
    console.error('JioSaavn search error:', error);
    return null;
  }
};
