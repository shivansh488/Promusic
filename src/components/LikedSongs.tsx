import { useLikedSongs } from "@/contexts/LikedSongsContext";
import { useAudio } from "@/contexts/AudioContext";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Play, Heart, Shuffle } from "lucide-react";
import { Track } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface LikedSongsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LikedSongs = ({ isOpen, onClose }: LikedSongsProps) => {
  const { likedSongs, removeFromLikedSongs } = useLikedSongs();
  const { playTrack, playQueue } = useAudio();

  const handleRemoveSong = async (song: Track) => {
    try {
      await removeFromLikedSongs(song);
    } catch (error) {
      console.error('Error removing song:', error);
    }
  };

  const handleShufflePlay = () => {
    if (likedSongs.length === 0) return;
    // Create a shuffled copy of the liked songs
    const shuffledSongs = [...likedSongs]
      .sort(() => Math.random() - 0.5);
    playQueue(shuffledSongs);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] bg-[#1a1a1a]/95 backdrop-blur-xl text-white border-none">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold">Liked Songs</DialogTitle>
              <p className="text-sm text-muted-foreground">{likedSongs.length} songs</p>
            </div>
            {likedSongs.length > 0 && (
              <Button
                size="icon"
                variant="ghost"
                className="h-10 w-10 text-white hover:text-primary hover:bg-[#2a2a2a]"
                onClick={handleShufflePlay}
              >
                <Shuffle className="h-5 w-5" />
              </Button>
            )}
          </div>
        </DialogHeader>
        <ScrollArea className="flex-1 h-[60vh] pr-4">
          <div className="space-y-1">
            {likedSongs.map((song) => (
              <div
                key={song.id}
                className="flex items-center gap-2 p-2 rounded-md hover:bg-[#2a2a2a] group"
              >
                <img
                  src={song.image?.[2]?.link || song.image?.[0]?.link}
                  alt={song.name}
                  className="h-10 w-10 rounded object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium truncate text-sm">{song.name}</h4>
                  <p className="text-xs text-muted-foreground truncate">
                    {song.primaryArtists}
                  </p>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={() => playTrack(song)}
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-red-500"
                    onClick={() => handleRemoveSong(song)}
                  >
                    <Heart className="h-4 w-4 fill-current" />
                  </Button>
                </div>
              </div>
            ))}
            {likedSongs.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No liked songs yet
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};