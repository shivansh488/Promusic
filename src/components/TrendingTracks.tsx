import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

async function fetchTrendingTracks() {
  const response = await fetch(
    "https://jiosaavn-api-privatecvc2.vercel.app/modules?language=hindi,english",
    {
      method: "GET",
    }
  );

  if (!response.ok) {
    throw new Error("Network response was not ok");
  }

  const data = await response.json();
  console.log("API Response:", data);

  if (!data?.data?.trending?.albums) {
    throw new Error("Invalid data format received from API");
  }

  const albumsWithSongs = await Promise.all(
    data.data.trending.albums.map(async (album: any) => {
      try {
        const songResponse = await fetch(
          `https://jiosaavn-api-privatecvc2.vercel.app/albums?id=${album.id}`,
          {
            method: "GET",
          }
        );
        const songData = await songResponse.json();
        console.log("Song data for album:", songData);
        return {
          ...album,
          songs: songData.data.songs || [],
        };
      } catch (error) {
        console.error("Error fetching songs for album:", error);
        return {
          ...album,
          songs: [],
        };
      }
    })
  );

  return albumsWithSongs;
}

export const TrendingTracks = () => {
  const { data: tracks, isLoading, error } = useQuery({
    queryKey: ["trending-tracks"],
    queryFn: fetchTrendingTracks,
  });

  if (isLoading) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">Loading...</h1>
      </div>
    );
  }

  if (error) {
    console.error("Error fetching tracks:", error);
    return (
      <div className="p-8">
        <Alert className="max-w-2xl mb-6">
          <AlertTitle className="text-lg">Error Loading Music</AlertTitle>
          <AlertDescription>
            There was an error loading the music tracks. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!Array.isArray(tracks) || tracks.length === 0) {
    return (
      <div className="p-8">
        <Alert className="max-w-2xl mb-6">
          <AlertTitle className="text-lg">No Tracks Found</AlertTitle>
          <AlertDescription>
            No music tracks are currently available. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {tracks.map((album: any) => (
        <Card
          key={album.id}
          className="group hover:bg-secondary/50 transition-colors"
        >
          <div className="p-4">
            <img
              src={album.image?.[2]?.link || album.image?.[0]?.link}
              alt={album.name}
              className="w-full aspect-square object-cover rounded-md mb-4"
            />
            <h3 className="font-medium truncate">{album.name}</h3>
            <p className="text-sm text-muted-foreground truncate">
              {Array.isArray(album.primaryArtists)
                ? album.primaryArtists.map((artist: any) => artist.name).join(", ")
                : "Unknown Artist"}
            </p>
            {album.songs && album.songs.length > 0 && album.songs[0].downloadUrl && (
              <audio
                src={
                  album.songs[0].downloadUrl[4]?.link ||
                  album.songs[0].downloadUrl[0]?.link
                }
                className="w-full mt-4"
                controls
                preload="none"
              />
            )}
          </div>
        </Card>
      ))}
    </div>
  );
};