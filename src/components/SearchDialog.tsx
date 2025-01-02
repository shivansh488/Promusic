import { useState, useCallback, useEffect } from "react";
import { Search, Loader2, Youtube } from "lucide-react";
import { useAudio } from "@/contexts/AudioContext";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useDebounce } from "../hooks/use-debounce";
import { searchYouTubeVideos } from "@/services/youtube";
import { Badge } from "@/components/ui/badge";

export const SearchDialog = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { playTrack } = useAudio();

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const handleSearch = useCallback(async (query: string) => {
    if (!query) {
      setSearchResults([]);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Fetch from JioSaavn API
      const [songsResponse, albumsResponse, playlistsResponse] = await Promise.all([
        fetch(
          `https://jiosaavn-api-privatecvc2.vercel.app/search/songs?query=${encodeURIComponent(query)}&page=1&limit=10`,
          { method: "GET" }
        ),
        fetch(
          `https://jiosaavn-api-privatecvc2.vercel.app/search/albums?query=${encodeURIComponent(query)}&page=1&limit=5`,
          { method: "GET" }
        ),
        fetch(
          `https://jiosaavn-api-privatecvc2.vercel.app/search/playlists?query=${encodeURIComponent(query)}&page=1&limit=5`,
          { method: "GET" }
        ),
      ]);

      if (!songsResponse.ok || !albumsResponse.ok || !playlistsResponse.ok) {
        throw new Error("Failed to fetch search results");
      }

      const [songsData, albumsData, playlistsData] = await Promise.all([
        songsResponse.json(),
        albumsResponse.json(),
        playlistsResponse.json(),
      ]);

      // Process songs
      const songs = songsData.data?.results || [];

      // Process albums and fetch their songs
      const albumSongs = await Promise.all(
        (albumsData.data?.results || []).map(async (album: any) => {
          try {
            const albumResponse = await fetch(
              `https://jiosaavn-api-privatecvc2.vercel.app/albums?id=${album.id}`,
              { method: "GET" }
            );
            if (!albumResponse.ok) return [];
            const albumData = await albumResponse.json();
            return (albumData.data.songs || []).map((song: any) => ({
              ...song,
              albumInfo: {
                name: album.name,
                id: album.id,
              },
            }));
          } catch (error) {
            console.error("Error fetching album songs:", error);
            return [];
          }
        })
      );

      // Process playlists and fetch their songs
      const playlistSongs = await Promise.all(
        (playlistsData.data?.results || []).map(async (playlist: any) => {
          try {
            const playlistResponse = await fetch(
              `https://jiosaavn-api-privatecvc2.vercel.app/playlists?id=${playlist.id}`,
              { method: "GET" }
            );
            if (!playlistResponse.ok) return [];
            const playlistData = await playlistResponse.json();
            return (playlistData.data.songs || []).map((song: any) => ({
              ...song,
              playlistInfo: {
                name: playlist.name,
                id: playlist.id,
              },
            }));
          } catch (error) {
            console.error("Error fetching playlist songs:", error);
            return [];
          }
        })
      );

      // Fetch YouTube results
      const youtubeResults = await searchYouTubeVideos(query);

      // Combine all results and remove duplicates based on song ID
      const allSongs = [
        ...songs,
        ...albumSongs.flat(),
        ...playlistSongs.flat(),
        ...youtubeResults,
      ].filter((song, index, self) => 
        song && song.id && index === self.findIndex((s) => s.id === song.id)
      );

      setSearchResults(allSongs);
    } catch (error) {
      console.error("Error searching:", error);
      setError("An error occurred while searching. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    handleSearch(debouncedSearchTerm);
  }, [debouncedSearchTerm, handleSearch]);

  return (
    <CommandDialog open={isOpen} onOpenChange={onClose}>
      <Command className="rounded-lg border shadow-md">
        <div className="flex items-center border-b px-3">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <CommandInput
            placeholder="Search for songs, albums, artists, or YouTube videos..."
            value={searchTerm}
            onValueChange={setSearchTerm}
            className="h-14 text-lg"
          />
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        </div>
        <CommandList className="h-[80vh]">
          {error ? (
            <CommandEmpty className="py-6 text-center text-sm text-destructive">
              {error}
            </CommandEmpty>
          ) : searchResults.length === 0 && debouncedSearchTerm ? (
            <CommandEmpty>No results found.</CommandEmpty>
          ) : (
            <CommandGroup heading={`Search Results (${searchResults.length})`}>
              {searchResults.map((song) => (
                <CommandItem
                  key={song.id}
                  className="flex items-center gap-4 p-4 cursor-pointer"
                  onSelect={() => {
                    playTrack(song);
                    onClose();
                  }}
                >
                  <div className="relative">
                    <img
                      src={song.image?.[2]?.link || song.image?.[0]?.link}
                      alt={song.name}
                      className="w-16 h-16 rounded object-cover"
                    />
                    {song.type === 'youtube' && (
                      <Badge
                        variant="secondary"
                        className="absolute bottom-1 right-1 bg-red-600 text-white"
                      >
                        <Youtube className="h-3 w-3 mr-1" />
                        YT
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="font-medium text-lg truncate">{song.name}</span>
                    <span className="text-sm text-muted-foreground truncate">
                      {song.primaryArtists}
                    </span>
                    {song.albumInfo && (
                      <span className="text-xs text-muted-foreground truncate">
                        Album: {song.albumInfo.name}
                      </span>
                    )}
                    {song.playlistInfo && (
                      <span className="text-xs text-muted-foreground truncate">
                        Playlist: {song.playlistInfo.name}
                      </span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </Command>
    </CommandDialog>
  );
};