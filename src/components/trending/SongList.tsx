import { Button } from "@/components/ui/button";
import { Plus, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { Track } from "@/lib/types";

interface SongListProps {
  songs: any[];
  onLikeClick: (e: React.MouseEvent, song: any) => void;
  onAddToPlaylist: (song: any) => void;
  isProcessing: (id: string) => boolean;
  isLiked: (song: any) => boolean;
}

export const SongList = ({ 
  songs, 
  onLikeClick, 
  onAddToPlaylist, 
  isProcessing, 
  isLiked 
}: SongListProps) => {
  return (
    <div className="mt-6 space-y-1">
      {songs.map((song: any, index: number) => (
        <div
          key={song.id}
          className="flex items-center cursor-pointer gap-4 p-2 rounded-md hover:bg-[#2a2a2a] group"
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
              className={cn(
                "opacity-0 group-hover:opacity-100",
                isProcessing(song.id) && "opacity-50 cursor-not-allowed"
              )}
              onClick={(e) => onLikeClick(e, song)}
              disabled={isProcessing(song.id)}
            >
              <Heart className={cn(
                "h-4 w-4",
                isLiked(song) && "fill-current text-red-500",
                isProcessing(song.id) && "animate-pulse"
              )} />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="opacity-0 group-hover:opacity-100"
              onClick={() => onAddToPlaylist(song)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};