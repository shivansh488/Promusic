import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAudio } from "@/contexts/AudioContext";
import { usePlaylist } from "@/contexts/PlaylistContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Play, Plus } from "lucide-react";
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

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

type Album = {
  id: string;
  name: string;
  image: { link: string }[];
  songs: any[];
};

export const TrendingTracks = () => {
  const { data: content, isLoading, error } = useQuery({
    queryKey: ["music-content"],
    queryFn: fetchContent,
    retry: 3,
    staleTime: 5 * 60 * 1000,
  });
  const { playTrack } = useAudio();
  const { playlists, addToPlaylist } = usePlaylist();
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [selectedSong, setSelectedSong] = useState<any>(null);

  const handleAlbumClick = (album: Album) => {
    setSelectedAlbum(album);
  };

  const handleAddToPlaylist = (playlistId: string) => {
    if (selectedSong) {
      addToPlaylist(playlistId, selectedSong);
      setSelectedSong(null);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">Loading...</h1>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {[...Array(10)].map((_, i) => (
            <Card key={i} className="bg-[#2a2a2a] border-none">
              <div className="p-4">
                <div className="w-full aspect-square bg-[#3a3a3a] animate-pulse rounded-md mb-4" />
                <div className="h-4 bg-[#3a3a3a] animate-pulse rounded mb-2" />
                <div className="h-3 bg-[#3a3a3a] animate-pulse rounded w-2/3" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <Alert className="max-w-2xl mb-6 bg-[#2a2a2a] border-none">
          <AlertTitle className="text-lg">Error Loading Music</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : "There was an error loading the music content. Please try again later."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">New</h1>
      <div className="space-y-12">
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Happy New Year!</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {content?.trending.slice(0, 5).map((album: Album) => (
              <Card
                key={album.id}
                className="bg-[#2a2a2a] hover:bg-[#3a3a3a] transition-colors border-none cursor-pointer group"
                onClick={() => handleAlbumClick(album)}
              >
                <div className="p-4">
                  <div className="relative">
                    <img
                      src={album.image?.[2]?.link || album.image?.[0]?.link}
                      alt={album.name}
                      className="w-full aspect-square object-cover rounded-md mb-4"
                      loading="lazy"
                    />
                    <Button
                      size="icon"
                      className="absolute bottom-6 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-[#1a1a1a] hover:bg-[#2a2a2a] text-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        playTrack(album.songs[0], album);
                      }}
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                  </div>
                  <h3 className="font-medium truncate text-sm">{album.name}</h3>
                  <p className="text-sm text-muted-foreground truncate">
                    {album.songs[0]?.primaryArtists}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">New Releases</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {content?.newReleases.slice(0, 5).map((album: Album) => (
              <Card
                key={album.id}
                className="bg-[#2a2a2a] hover:bg-[#3a3a3a] transition-colors border-none cursor-pointer group"
                onClick={() => handleAlbumClick(album)}
              >
                <div className="p-4">
                  <div className="relative">
                    <img
                      src={album.image?.[2]?.link || album.image?.[0]?.link}
                      alt={album.name}
                      className="w-full aspect-square object-cover rounded-md mb-4"
                      loading="lazy"
                    />
                    <Button
                      size="icon"
                      className="absolute bottom-6 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-[#1a1a1a] hover:bg-[#2a2a2a] text-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        playTrack(album.songs[0], album);
                      }}
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                  </div>
                  <h3 className="font-medium truncate text-sm">{album.name}</h3>
                  <p className="text-sm text-muted-foreground truncate">
                    {album.songs[0]?.primaryArtists}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Top Charts</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {content?.charts.slice(0, 5).map((chart: Album) => (
              <Card
                key={chart.id}
                className="bg-[#2a2a2a] hover:bg-[#3a3a3a] transition-colors border-none cursor-pointer group"
                onClick={() => handleAlbumClick(chart)}
              >
                <div className="p-4">
                  <div className="relative">
                    <img
                      src={chart.image?.[2]?.link || chart.image?.[0]?.link}
                      alt={chart.name}
                      className="w-full aspect-square object-cover rounded-md mb-4"
                      loading="lazy"
                    />
                    <Button
                      size="icon"
                      className="absolute bottom-6 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-[#1a1a1a] hover:bg-[#2a2a2a] text-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        playTrack(chart.songs[0], chart);
                      }}
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                  </div>
                  <h3 className="font-medium truncate text-sm">{chart.name}</h3>
                  <p className="text-sm text-muted-foreground truncate">
                    {chart.songs.length} songs
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </section>
      </div>

      <Dialog open={!!selectedAlbum} onOpenChange={(open) => !open && setSelectedAlbum(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-[#1a1a1a] text-white border-none">
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

              <div className="mt-6 space-y-1">
                {selectedAlbum.songs.map((song: any, index: number) => (
                  <div
                    key={song.id}
                    className="flex items-center gap-4 p-2 rounded-md hover:bg-[#2a2a2a] group"
                  >
                    <div className="w-8 text-center text-sm text-muted-foreground">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate text-sm">{song.name}</h4>
                      <p className="text-sm text-muted-foreground truncate">
                        {song.primaryArtists}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="opacity-0 group-hover:opacity-100"
                        onClick={() => playTrack(song, selectedAlbum)}
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="opacity-0 group-hover:opacity-100"
                        onClick={() => setSelectedSong(song)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedSong} onOpenChange={(open) => !open && setSelectedSong(null)}>
        <DialogContent className="bg-[#1a1a1a] text-white border-none">
          <DialogHeader>
            <DialogTitle>Add to Playlist</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-1">
              {playlists.map((playlist) => (
                <Card
                  key={playlist.id}
                  className="p-3 flex items-center justify-between bg-[#2a2a2a] hover:bg-[#3a3a3a] border-none cursor-pointer"
                  onClick={() => handleAddToPlaylist(playlist.id)}
                >
                  <div>
                    <h3 className="font-medium text-sm">{playlist.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {playlist.songs.length} songs
                    </p>
                  </div>
                  <Plus className="h-4 w-4" />
                </Card>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};