import { useState } from "react";
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

export const SearchDialog = () => {
  const [open, setOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);

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
      if (data.data && Array.isArray(data.data.results)) {
        setSearchResults(data.data.results);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Error searching songs:", error);
      setSearchResults([]);
    }
  };

  return (
    <>
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
    </>
  );
};