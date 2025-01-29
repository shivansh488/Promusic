import { useState } from "react";
import { usePlaylist } from "@/contexts/PlaylistContext";
import { useAudio } from "@/contexts/AudioContext";
import { useSpotify } from "@/contexts/SpotifyContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Play, Plus, Trash2, X, Music2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mapJioSaavnToAppFormat } from "@/lib/song-mapper";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5100';

export const Library = () => {
  const { playlists, createPlaylist, removeFromPlaylist, deletePlaylist } = usePlaylist();
  const { playTrack } = useAudio();
  const { isConnected, connect, disconnect, playlists: spotifyPlaylists, likedSongs, error, isLoading } = useSpotify();
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [selectedPlaylist, setSelectedPlaylist] = useState<any>(null);
  const [selectedSpotifyPlaylist, setSelectedSpotifyPlaylist] = useState<any>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  const handleCreatePlaylist = () => {
    if (newPlaylistName.trim()) {
      createPlaylist(newPlaylistName.trim());
      setNewPlaylistName("");
    }
  };

  const handleSpotifyPlaylistClick = async (playlist: any) => {
    setSelectedSpotifyPlaylist(playlist);
  };

  const handlePlaySpotifySong = async (song: any) => {
    try {
      const searchQuery = `${song.name} ${song.primaryArtists}`;
      console.log('Searching for:', searchQuery);
      
      const response = await fetch(`${API_URL}/song/?query=${encodeURIComponent(searchQuery)}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.error('API Response:', {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries())
        });
        throw new Error(`Failed to search song on JioSaavn: ${response.status}`);
      }

      const data = await response.json();
      console.log('Search result:', data);

      if (data && Array.isArray(data) && data.length > 0) {
        const matchedSong = mapJioSaavnToAppFormat(data[0]);
        console.log('Matched song:', matchedSong);
        playTrack(matchedSong);
        setSearchError(null);
      } else {
        setSearchError('No matching song found on JioSaavn');
      }
    } catch (error) {
      console.error('Error playing song:', error);
      setSearchError(error instanceof Error ? error.message : 'Error searching for song');
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="p-2">
        {!isConnected ? (
          <Button
            onClick={connect}
            className="w-full mb-2 bg-[#1DB954] hover:bg-[#1ed760] text-white"
          >
            <Music2 className="h-4 w-4 mr-2" />
            Connect Spotify
          </Button>
        ) : (
          <Button
            onClick={disconnect}
            className="w-full mb-2 bg-[#2a2a2a] hover:bg-[#3a3a3a]"
          >
            Disconnect Spotify
          </Button>
        )}
        <div className="flex items-center gap-2 mb-2">
          <Input
            placeholder="New playlist name"
            value={newPlaylistName}
            onChange={(e) => setNewPlaylistName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreatePlaylist()}
            className="h-8 bg-[#2a2a2a] border-none text-sm"
          />
          <Button onClick={handleCreatePlaylist} size="icon" className="h-8 w-8 bg-[#2a2a2a] hover:bg-[#3a3a3a]">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="local" className="flex-1 flex flex-col">
        <TabsList className="mx-2 bg-[#2a2a2a]">
          <TabsTrigger value="local" className="flex-1">Local Playlists</TabsTrigger>
          <TabsTrigger value="spotify" className="flex-1">Spotify</TabsTrigger>
        </TabsList>

        <TabsContent value="local" className="flex-1 flex flex-col mt-0">
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-[2px]">
              {playlists.map((playlist) => (
                <div
                  key={playlist.id}
                  className="flex items-center justify-between hover:bg-[#2a2a2a] rounded-md cursor-pointer group p-2"
                  onClick={() => setSelectedPlaylist(playlist)}
                >
                  <div>
                    <h3 className="font-medium text-sm">{playlist.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {playlist.songs.length} songs
                    </p>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      deletePlaylist(playlist.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="spotify" className="flex-1 flex flex-col mt-0">
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-[2px]">
              {isLoading ? (
                <div className="flex items-center justify-center p-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-white"></div>
                </div>
              ) : isConnected && (
                <>
                  <div
                    className="flex items-center justify-between hover:bg-[#2a2a2a] rounded-md cursor-pointer group p-2"
                    onClick={() => setSelectedSpotifyPlaylist({ name: "Liked Songs", songs: likedSongs })}
                  >
                    <div>
                      <h3 className="font-medium text-sm">Liked Songs</h3>
                      <p className="text-xs text-muted-foreground">
                        {likedSongs.length} songs
                      </p>
                    </div>
                  </div>
                  {spotifyPlaylists.map((playlist) => (
                    <div
                      key={playlist.id}
                      className="flex items-center justify-between hover:bg-[#2a2a2a] rounded-md cursor-pointer group p-2"
                      onClick={() => handleSpotifyPlaylistClick(playlist)}
                    >
                      <div>
                        <h3 className="font-medium text-sm">{playlist.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          {playlist.tracks.total} songs
                        </p>
                      </div>
                    </div>
                  ))}
                </>
              )}
              {error && (
                <p className="text-sm text-red-500 p-2">{error}</p>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      <Dialog open={!!selectedPlaylist || !!selectedSpotifyPlaylist} 
             onOpenChange={(open) => {
               if (!open) {
                 setSelectedPlaylist(null);
                 setSelectedSpotifyPlaylist(null);
                 setSearchError(null);
               }
             }}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-[#1a1a1a] text-white border-none">
          {selectedPlaylist && !selectedSpotifyPlaylist && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-xl">{selectedPlaylist.name}</DialogTitle>
                  <p className="text-sm text-muted-foreground">
                    {selectedPlaylist.songs.length} songs
                  </p>
                </div>
              </DialogHeader>

              <div className="mt-6 space-y-[2px]">
                {selectedPlaylist.songs.map((song: any, index: number) => (
                  <div
                    key={song.id}
                    className="flex items-center gap-4 p-2 rounded-md hover:bg-[#2a2a2a] group"
                  >
                    <div className="w-8 text-center text-sm text-muted-foreground">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate text-sm">{song.name}</h4>
                      <p className="text-xs text-muted-foreground truncate">
                        {song.primaryArtists}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100"
                        onClick={() => playTrack(song)}
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100"
                        onClick={() => removeFromPlaylist(selectedPlaylist.id, song.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
          {selectedSpotifyPlaylist && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-xl">{selectedSpotifyPlaylist.name}</DialogTitle>
                  <p className="text-sm text-muted-foreground">
                    {selectedSpotifyPlaylist.name === "Liked Songs" 
                      ? selectedSpotifyPlaylist.songs.length
                      : selectedSpotifyPlaylist.tracks.total} songs
                  </p>
                </div>
              </DialogHeader>

              <div className="mt-6 space-y-[2px]">
                {searchError && (
                  <p className="text-sm text-red-500 p-2 mb-4">{searchError}</p>
                )}
                {(selectedSpotifyPlaylist.name === "Liked Songs" 
                  ? selectedSpotifyPlaylist.songs
                  : selectedSpotifyPlaylist.tracks.items.map((item: any) => ({
                      id: item.track.id,
                      name: item.track.name,
                      primaryArtists: item.track.artists.map((artist: any) => artist.name).join(', ')
                    }))
                ).map((song: any, index: number) => (
                  <div
                    key={song.id}
                    className="flex items-center gap-4 p-2 rounded-md hover:bg-[#2a2a2a] group"
                  >
                    <div className="w-8 text-center text-sm text-muted-foreground">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate text-sm">{song.name}</h4>
                      <p className="text-xs text-muted-foreground truncate">
                        {song.primaryArtists}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100"
                        onClick={() => handlePlaySpotifySong(song)}
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
