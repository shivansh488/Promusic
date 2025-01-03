import { useLikedSongs } from "@/contexts/LikedSongsContext";
import { useAudio } from "@/contexts/AudioContext";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Play, Heart } from "lucide-react";
import { Track } from "@/lib/types";

export const LikedSongs = () => {
  const { likedSongs, removeFromLikedSongs } = useLikedSongs();
  const { playTrack } = useAudio();

  const handleRemoveSong = async (song: Track) => {
    try {
      await removeFromLikedSongs(song);
    } catch (error) {
      console.error('Error removing song:', error);
    }
  };

  return (
    <ScrollArea className="flex-1">
      <div className="p-2 space-y-1">
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
  );
};