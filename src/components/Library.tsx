import { useState } from "react";
import { usePlaylist } from "@/contexts/PlaylistContext";
import { useAudio } from "@/contexts/AudioContext";
import { useSpotify } from "@/contexts/SpotifyContext";
import { searchTrackOnSaavn } from "@/lib/saavn";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Play, Plus, Trash2, X, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

export const Library = () => {
  const { playlists, createPlaylist, removeFromPlaylist, deletePlaylist } = usePlaylist();
  const { playTrack } = useAudio();
  const { spotifyPlaylists, spotifyLikedSongs, connectSpotify, spotifyToken } = useSpotify();
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [selectedPlaylist, setSelectedPlaylist] = useState<any>(null);
  const [selectedSpotifyPlaylist, setSelectedSpotifyPlaylist] = useState<any>(null);
  const [loadingTrack, setLoadingTrack] = useState<string | null>(null);

  const handleCreatePlaylist = () => {
    if (newPlaylistName.trim()) {
      createPlaylist(newPlaylistName.trim());
      setNewPlaylistName("");
    }
  };

  const handleSpotifyPlayTrack = async (track: any) => {
    try {
      setLoadingTrack(track.track.id);
      const saavnTrack = await searchTrackOnSaavn(
        track.track.name,
        track.track.artists[0].name
      );

      if (saavnTrack) {
        await playTrack(saavnTrack);
        toast.success('Playing ' + track.track.name);
      } else {
        toast.error('Could not find this song on Jio Saavn');
      }
    } catch (error) {
      console.error('Error playing track:', error);
      toast.error('Error playing track');
    } finally {
      setLoadingTrack(null);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="p-2">
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
          {!spotifyToken && (
            <Button onClick={connectSpotify} className="h-8 bg-[#1DB954] hover:bg-[#1ed760]">
              Connect Spotify
            </Button>
          )}
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-4">
          {/* Local Playlists */}
          <div>
            <h2 className="font-semibold mb-2">Your Playlists</h2>
            <div className="space-y-[2px]">
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
          </div>

          {/* Spotify Playlists */}
          {spotifyToken && (
            <>
              <div>
                <h2 className="font-semibold mb-2">Spotify Liked Songs</h2>
                <div className="space-y-[2px]">
                  {spotifyLikedSongs.map((track: any) => (
                    <div
                      key={track.track.id}
                      className="flex items-center justify-between hover:bg-[#2a2a2a] rounded-md cursor-pointer group p-2"
                      onClick={() => handleSpotifyPlayTrack(track)}
                    >
                      <div>
                        <h3 className="font-medium text-sm">{track.track.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          {track.track.artists.map((artist: any) => artist.name).join(', ')}
                        </p>
                      </div>
                      <Button 
                        size="icon" 
                        className="h-8 w-8 opacity-0 group-hover:opacity-100"
                        disabled={loadingTrack === track.track.id}
                      >
                        {loadingTrack === track.track.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="font-semibold mb-2">Spotify Playlists</h2>
                <div className="space-y-[2px]">
                  {spotifyPlaylists.map((playlist: any) => (
                    <div
                      key={playlist.id}
                      className="flex items-center justify-between hover:bg-[#2a2a2a] rounded-md cursor-pointer group p-2"
                      onClick={() => setSelectedSpotifyPlaylist(playlist)}
                    >
                      <div>
                        <h3 className="font-medium text-sm">{playlist.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          {playlist.tracks.total} tracks
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </ScrollArea>

      {/* Spotify Playlist Dialog */}
      <Dialog open={!!selectedSpotifyPlaylist} onOpenChange={() => setSelectedSpotifyPlaylist(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedSpotifyPlaylist?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-[2px] max-h-[60vh] overflow-y-auto">
            {selectedSpotifyPlaylist?.tracks?.items?.map((item: any) => (
              <div
                key={item.track.id}
                className="flex items-center justify-between hover:bg-[#2a2a2a] rounded-md cursor-pointer group p-2"
                onClick={() => handleSpotifyPlayTrack(item)}
              >
                <div>
                  <h3 className="font-medium text-sm">{item.track.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {item.track.artists.map((artist: any) => artist.name).join(', ')}
                  </p>
                </div>
                <Button 
                  size="icon" 
                  className="h-8 w-8 opacity-0 group-hover:opacity-100"
                  disabled={loadingTrack === item.track.id}
                >
                  {loadingTrack === item.track.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Local Playlist Dialog */}
      <Dialog open={!!selectedPlaylist} onOpenChange={(open) => !open && setSelectedPlaylist(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-[#1a1a1a] text-white border-none">
          {selectedPlaylist && (
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
        </DialogContent>
      </Dialog>
    </div>
  );
};