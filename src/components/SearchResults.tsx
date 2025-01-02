import { useAudio } from "@/contexts/AudioContext";
import {
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";

interface SearchResult {
  id: string;
  name: string;
  primaryArtists: string;
  image: Array<{ link: string }>;
  downloadUrl: Array<{ link: string }>; // Added this line to match Track type
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

  return (
    <CommandGroup heading={`Search Results (${results.length})`}>
      {results.map((song) => (
        <CommandItem
          key={song.id}
          className="flex items-center gap-4 p-4 cursor-pointer"
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
        </CommandItem>
      ))}
    </CommandGroup>
  );
};