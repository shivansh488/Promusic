export const fetchContent = async () => {
  try {
    // Fetch trending modules first
    const trendingResponse = await fetch(
      "https://jiosaavn-api-privatecvc2.vercel.app/modules?language=hindi,english",
      { method: "GET" }
    );

    if (!trendingResponse.ok) {
      throw new Error("Failed to fetch trending content");
    }

    const trendingData = await trendingResponse.json();

    // Process trending albums and fetch their songs
    const trendingAlbums = await Promise.all(
      (trendingData.data?.trending?.albums || []).slice(0, 10).map(async (album: any) => {
        try {
          const songResponse = await fetch(
            `https://jiosaavn-api-privatecvc2.vercel.app/albums?id=${album.id}`,
            { method: "GET" }
          );
          if (!songResponse.ok) return null;
          const songData = await songResponse.json();
          return {
            ...album,
            songs: songData.data.songs || [],
          };
        } catch (error) {
          console.error("Error fetching songs for album:", error);
          return null;
        }
      })
    );

    // Fetch new releases
    const newResponse = await fetch(
      "https://jiosaavn-api-privatecvc2.vercel.app/modules?language=hindi",
      { method: "GET" }
    );

    if (!newResponse.ok) {
      throw new Error("Failed to fetch new releases");
    }

    const newData = await newResponse.json();

    // Process new albums
    const newAlbums = await Promise.all(
      (newData.data?.albums || []).slice(0, 10).map(async (album: any) => {
        try {
          const songResponse = await fetch(
            `https://jiosaavn-api-privatecvc2.vercel.app/albums?id=${album.id}`,
            { method: "GET" }
          );
          if (!songResponse.ok) return null;
          const songData = await songResponse.json();
          return {
            ...album,
            songs: songData.data.songs || [],
          };
        } catch (error) {
          console.error("Error fetching songs for album:", error);
          return null;
        }
      })
    );

    // Fetch top charts
    const chartsResponse = await fetch(
      "https://jiosaavn-api-privatecvc2.vercel.app/modules?language=hindi,english",
      { method: "GET" }
    );

    if (!chartsResponse.ok) {
      throw new Error("Failed to fetch charts");
    }

    const chartsData = await chartsResponse.json();

    // Process top charts
    const charts = await Promise.all(
      (chartsData.data?.playlists || []).slice(0, 5).map(async (playlist: any) => {
        try {
          const playlistResponse = await fetch(
            `https://jiosaavn-api-privatecvc2.vercel.app/playlists?id=${playlist.id}`,
            { method: "GET" }
          );
          if (!playlistResponse.ok) return null;
          const playlistData = await playlistResponse.json();
          return {
            ...playlist,
            songs: playlistData.data.songs || [],
          };
        } catch (error) {
          console.error("Error fetching songs for playlist:", error);
          return null;
        }
      })
    );

    return {
      trending: trendingAlbums.filter(album => album && album.songs.length > 0),
      newReleases: newAlbums.filter(album => album && album.songs.length > 0),
      charts: charts.filter(chart => chart && chart.songs.length > 0),
    };
  } catch (error) {
    console.error("Error in fetchContent:", error);
    throw error;
  }
};