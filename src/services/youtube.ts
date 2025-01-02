const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || '';

type YouTubeVideo = {
  id: string;
  name: string;
  primaryArtists: string;
  image: { link: string }[];
  downloadUrl: { link: string }[];
  duration: number;
  type: 'youtube';
};

export async function searchYouTubeVideos(query: string): Promise<YouTubeVideo[]> {
  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=${encodeURIComponent(
        query + ' music'
      )}&type=video&videoCategoryId=10&key=${YOUTUBE_API_KEY}`,
      { method: 'GET' }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch YouTube videos');
    }

    const data = await response.json();
    
    // Get video durations in a separate request
    const videoIds = data.items.map((item: any) => item.id.videoId).join(',');
    const detailsResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoIds}&key=${YOUTUBE_API_KEY}`,
      { method: 'GET' }
    );

    if (!detailsResponse.ok) {
      throw new Error('Failed to fetch video details');
    }

    const detailsData = await detailsResponse.json();
    const durationMap = new Map(
      detailsData.items.map((item: any) => [
        item.id,
        convertYouTubeDuration(item.contentDetails.duration),
      ])
    );

    return data.items.map((item: any) => ({
      id: `yt-${item.id.videoId}`,
      name: item.snippet.title,
      primaryArtists: item.snippet.channelTitle,
      image: [
        { link: item.snippet.thumbnails.high.url },
        { link: item.snippet.thumbnails.medium.url },
        { link: item.snippet.thumbnails.default.url },
      ],
      downloadUrl: [
        { link: `https://www.youtube.com/watch?v=${item.id.videoId}` },
      ],
      duration: durationMap.get(item.id.videoId) || 0,
      type: 'youtube' as const,
    }));
  } catch (error) {
    console.error('Error searching YouTube:', error);
    return [];
  }
}

function convertYouTubeDuration(duration: string): number {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  if (!match) return 0;

  const [, hours, minutes, seconds] = match;
  let totalSeconds = 0;

  if (hours) totalSeconds += parseInt(hours, 10) * 3600;
  if (minutes) totalSeconds += parseInt(minutes, 10) * 60;
  if (seconds) totalSeconds += parseInt(seconds, 10);

  return totalSeconds;
}

export async function getYouTubeVideoDetails(videoId: string): Promise<YouTubeVideo | null> {
  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoId}&key=${YOUTUBE_API_KEY}`,
      { method: 'GET' }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch video details');
    }

    const data = await response.json();
    if (!data.items?.[0]) return null;

    const item = data.items[0];
    return {
      id: `yt-${item.id}`,
      name: item.snippet.title,
      primaryArtists: item.snippet.channelTitle,
      image: [
        { link: item.snippet.thumbnails.high.url },
        { link: item.snippet.thumbnails.medium.url },
        { link: item.snippet.thumbnails.default.url },
      ],
      downloadUrl: [
        { link: `https://www.youtube.com/watch?v=${item.id}` },
      ],
      duration: convertYouTubeDuration(item.contentDetails.duration),
      type: 'youtube',
    };
  } catch (error) {
    console.error('Error fetching video details:', error);
    return null;
  }
}

// Function to convert YouTube video URL to audio stream URL using yt-dlp
export async function getYouTubeAudioUrl(videoId: string): Promise<string | null> {
  try {
    // This should be replaced with your backend endpoint that uses yt-dlp
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/youtube/audio?videoId=${videoId}`,
      { method: 'GET' }
    );

    if (!response.ok) {
      throw new Error('Failed to get audio URL');
    }

    const data = await response.json();
    return data.audioUrl;
  } catch (error) {
    console.error('Error getting audio URL:', error);
    return null;
  }
} 