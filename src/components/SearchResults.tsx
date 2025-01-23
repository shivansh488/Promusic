import { useAudio } from "@/contexts/AudioContext";
import { useLikedSongs } from "@/contexts/LikedSongsContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface SearchResult {
  id: string;
  name: string;
  primaryArtists: string;
  image: Array<{ link: string }>;
  downloadUrl: Array<{ link: string }>;
  albumInfo?: {
    name: string;
    id: string;
  };
  playlistInfo?: {
    name: string;
    id: string;
  };
}

interface SearchResultsProps {
  results: SearchResult[];
  error: string | null;
  searchTerm: string;
  onSelect: () => void;
}

export const SearchResults = ({ results, error, searchTerm, onSelect }: SearchResultsProps) => {
  const { playTrack } = useAudio();
  const { user } = useAuth();
  const { addToLikedSongs, removeFromLikedSongs, isLiked, isProcessing } = useLikedSongs();

  if (error) {
    return (
      <CommandEmpty className="py-6 text-center text-sm text-destructive">
        {error}
      </CommandEmpty>
    );
  }

  if (results.length === 0 && searchTerm) {
    return <CommandEmpty>No results found.</CommandEmpty>;
  }

  const handleLikeClick = async (e: React.MouseEvent, song: SearchResult) => {
    e.stopPropagation(); // Prevent triggering the parent's onClick
    if (!user) return; // Do nothing if user is not logged in

    if (isLiked(song)) {
      await removeFromLikedSongs(song);
    } else {
      await addToLikedSongs(song);
    }
  };

  const handlePlayTrack = (song: SearchResult) => {
    if (!song.downloadUrl?.[0]?.link) {
      toast.error("This song is not available for playback");
      return;
    }
    playTrack(song);
    onSelect();
  };

  return (
    <CommandGroup>
      {results.map((song) => (
        <CommandItem
          key={song.id}
          onSelect={() => handlePlayTrack(song)}
          className="flex items-center gap-4 p-4 cursor-pointer"
        >
          <img
            src={song.image[0]?.link || 'https://i.imgur.com/QxoJ9Co.png'}
            alt={song.name}
            className="w-16 h-16 rounded object-cover"
          />
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
          {user && (
            <button
              onClick={(e) => handleLikeClick(e, song)}
              disabled={isProcessing(song.id)}
              className={cn(
                "opacity-0 group-hover:opacity-100 transition-opacity",
                isLiked(song) ? "text-red-500" : "text-muted-foreground hover:text-red-500"
              )}
            >
              <Heart className="h-5 w-5" fill={isLiked(song) ? "currentColor" : "none"} />
            </button>
          )}
        </CommandItem>
      ))}
    </CommandGroup>
  );
};