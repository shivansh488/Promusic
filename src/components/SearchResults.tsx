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
  console.log('also in here', results)
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

  return (
    <>
      {results.map((song) => {
        console.log(song)
        return (
          <div
            key={song.id}
            className="flex items-center gap-4 p-4 cursor-pointer group"
            onSelect={() => {
              playTrack(song);
              onSelect();
            }}
          >
            <img
              src={song.image?.[2]?.link || song.image?.[0]?.link}
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
                  "p-2 rounded-full hover:bg-white/10 transition-colors",
                  "opacity-0 group-hover:opacity-100 focus:opacity-100",
                  isProcessing(song.id) && "cursor-not-allowed opacity-50"
                )}
              >
                <Heart
                  className={cn(
                    "w-6 h-6 transition-colors",
                    isLiked(song) ? "fill-red-500 stroke-red-500" : "stroke-white"
                  )}
                />
              </button>
            )}
          </div>
        )
      })}
    </>
  );
};