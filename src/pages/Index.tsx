import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Search } from "lucide-react";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useState, useEffect } from "react";

async function fetchTrendingTracks() {
  const response = await fetch(
    "https://jiosaavn-api-privatecvc2.vercel.app/modules?language=hindi,english",
    {
      method: 'GET',
    }
  );
  
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  
  const data = await response.json();
  console.log("API Response:", data);
  
  if (!data?.data?.trending?.albums) {
    throw new Error('Invalid data format received from API');
  }

  // Fetch songs for each album
  const albumsWithSongs = await Promise.all(
    data.data.trending.albums.map(async (album: any) => {
      try {
        const songResponse = await fetch(
          `https://jiosaavn-api-privatecvc2.vercel.app/albums?id=${album.id}`,
          {
            method: 'GET',
          }
        );
        const songData = await songResponse.json();
        console.log("Song data for album:", songData);
        return {
          ...album,
          songs: songData.data.songs || []
        };
      } catch (error) {
        console.error("Error fetching songs for album:", error);
        return {
          ...album,
          songs: []
        };
      }
    })
  );
  
  return albumsWithSongs;
}

const Index = () => {
  const [open, setOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const { data: tracks, isLoading, error } = useQuery({
    queryKey: ["trending-tracks"],
    queryFn: fetchTrendingTracks,
  });

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSearch = async (query: string) => {
    if (!query) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await fetch(
        `https://jiosaavn-api-privatecvc2.vercel.app/search/songs?query=${encodeURIComponent(
          query
        )}`,
        {
          method: "GET",
        }
      );
      const data = await response.json();
      console.log("Search results:", data);
      setSearchResults(data.data.results || []);
    } catch (error) {
      console.error("Error searching songs:", error);
      setSearchResults([]);
    }
  };

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
    <div className="p-8 pb-32">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Trending Hindi & English Songs</h1>
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-lg glass-effect cursor-pointer"
          onClick={() => setOpen(true)}
        >
          <Search className="w-4 h-4" />
          <span className="text-sm">Search songs...</span>
          <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
            <span className="text-xs">⌘</span>K
          </kbd>
        </div>
      </div>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command className="rounded-lg border shadow-md">
          <CommandInput
            placeholder="Search for songs..."
            onValueChange={handleSearch}
          />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Search Results">
              {searchResults.map((song) => (
                <CommandItem
                  key={song.id}
                  className="flex items-center gap-4 p-2 cursor-pointer"
                >
                  <img
                    src={song.image?.[0]?.link}
                    alt={song.name}
                    className="w-12 h-12 rounded"
                  />
                  <div className="flex flex-col">
                    <span className="font-medium">{song.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {song.primaryArtists}
                    </span>
                  </div>
                  {song.downloadUrl && (
                    <audio
                      src={song.downloadUrl[4]?.link || song.downloadUrl[0]?.link}
                      className="w-48 ml-auto"
                      controls
                      preload="none"
                    />
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>

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
    </div>
  );
};

export default Index;