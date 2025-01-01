import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAudio } from "@/contexts/AudioContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { useState } from "react";

const fetchContent = async () => {
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

export const TrendingTracks = () => {
  const { data: content, isLoading, error } = useQuery({
    queryKey: ["music-content"],
    queryFn: fetchContent,
    retry: 3,
    staleTime: 5 * 60 * 1000,
  });
  const { playTrack } = useAudio();
  const [selectedAlbum, setSelectedAlbum] = useState<any>(null);

  if (isLoading) {
    // Show loading skeleton
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">Loading...</h1>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {[...Array(10)].map((_, i) => (
            <Card key={i} className="p-4">
              <div className="w-full aspect-square bg-secondary animate-pulse rounded-md mb-4" />
              <div className="h-4 bg-secondary animate-pulse rounded mb-2" />
              <div className="h-3 bg-secondary animate-pulse rounded w-2/3" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    console.error("Error fetching content:", error);
    return (
      <div className="p-8">
        <Alert className="max-w-2xl mb-6" variant="destructive">
          <AlertTitle className="text-lg">Error Loading Music</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : "There was an error loading the music content. Please try again later."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!content || (!content.trending.length && !content.newReleases.length && !content.charts.length)) {
    return (
      <div className="p-8">
        <Alert className="max-w-2xl mb-6">
          <AlertTitle className="text-lg">No Content Found</AlertTitle>
          <AlertDescription>
            No music content is currently available. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const handleAlbumClick = (album: any) => {
    setSelectedAlbum(album);
  };

  return (
    <>
      <Tabs defaultValue="trending" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="trending">Trending Now</TabsTrigger>
          <TabsTrigger value="new">New Releases</TabsTrigger>
          <TabsTrigger value="charts">Top Charts</TabsTrigger>
        </TabsList>

        <TabsContent value="trending" className="mt-0">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {content.trending.map((album: any) => (
              <Card
                key={album.id}
                className="group hover:bg-secondary/50 transition-colors cursor-pointer"
                onClick={() => handleAlbumClick(album)}
              >
                <div className="p-4">
                  <img
                    src={album.image?.[2]?.link || album.image?.[0]?.link}
                    alt={album.name}
                    className="w-full aspect-square object-cover rounded-md mb-4"
                    loading="lazy"
                  />
                  <h3 className="font-medium truncate">{album.name}</h3>
                  <p className="text-sm text-muted-foreground truncate">
                    {album.songs[0]?.primaryArtists}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="new" className="mt-0">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {content.newReleases.map((album: any) => (
              <Card
                key={album.id}
                className="group hover:bg-secondary/50 transition-colors cursor-pointer"
                onClick={() => handleAlbumClick(album)}
              >
                <div className="p-4">
                  <img
                    src={album.image?.[2]?.link || album.image?.[0]?.link}
                    alt={album.name}
                    className="w-full aspect-square object-cover rounded-md mb-4"
                    loading="lazy"
                  />
                  <h3 className="font-medium truncate">{album.name}</h3>
                  <p className="text-sm text-muted-foreground truncate">
                    {album.songs[0]?.primaryArtists}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="charts" className="mt-0">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {content.charts.map((chart: any) => (
              <Card
                key={chart.id}
                className="group hover:bg-secondary/50 transition-colors cursor-pointer"
                onClick={() => handleAlbumClick(chart)}
              >
                <div className="p-4">
                  <img
                    src={chart.image?.[2]?.link || chart.image?.[0]?.link}
                    alt={chart.name}
                    className="w-full aspect-square object-cover rounded-md mb-4"
                    loading="lazy"
                  />
                  <h3 className="font-medium truncate">{chart.name}</h3>
                  <p className="text-sm text-muted-foreground truncate">
                    {chart.songs.length} songs
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={!!selectedAlbum} onOpenChange={(open) => !open && setSelectedAlbum(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedAlbum && (
            <>
              <DialogHeader>
                <div className="flex items-start gap-4">
                  <img
                    src={selectedAlbum.image?.[2]?.link || selectedAlbum.image?.[0]?.link}
                    alt={selectedAlbum.name}
                    className="w-32 h-32 rounded-md object-cover"
                  />
                  <div className="flex-1">
                    <DialogTitle className="text-xl mb-2">{selectedAlbum.name}</DialogTitle>
                    <p className="text-sm text-muted-foreground">
                      {selectedAlbum.songs[0]?.primaryArtists}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedAlbum.songs.length} songs
                    </p>
                  </div>
                </div>
              </DialogHeader>

              <div className="mt-6 space-y-2">
                {selectedAlbum.songs.map((song: any, index: number) => (
                  <div
                    key={song.id}
                    className="flex items-center gap-4 p-2 rounded-md hover:bg-secondary/50 cursor-pointer group"
                    onClick={() => {
                      playTrack(song);
                      setSelectedAlbum(null);
                    }}
                  >
                    <div className="w-8 text-center text-sm text-muted-foreground">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{song.name}</h4>
                      <p className="text-sm text-muted-foreground truncate">
                        {song.primaryArtists}
                      </p>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};