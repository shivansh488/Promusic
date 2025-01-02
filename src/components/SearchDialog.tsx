import { useState, useCallback, useEffect } from "react";
import { Search, Loader2 } from "lucide-react";
import {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
} from "@/components/ui/command";
import { useDebounce } from "../hooks/use-debounce";
import { searchSongs } from "@/lib/search-api";
import { SearchResults } from "./SearchResults";

export const SearchDialog = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 300); // Reduced debounce time for better responsiveness

  // Reset search state when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm("");
      setSearchResults([]);
      setError(null);
    }
  }, [isOpen]);

  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const results = await searchSongs(query);
      console.log("Search results for query:", query, results); // Debug log
      setSearchResults(results);
    } catch (error) {
      console.error("Error searching:", error);
      setError("An error occurred while searching. Please try again.");
      setSearchResults([]); // Clear results on error
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Perform search when debounced term changes and dialog is open
  useEffect(() => {
    if (isOpen) {
      console.log("Searching with term:", debouncedSearchTerm); // Debug log
      handleSearch(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, handleSearch, isOpen]);

  return (
    <CommandDialog open={isOpen} onOpenChange={onClose}>
      <Command className="rounded-lg border shadow-md">
        <div className="flex items-center border-b px-3">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <CommandInput
            placeholder="Search for songs, albums, or artists..."
            value={searchTerm}
            onValueChange={(value) => {
              setSearchTerm(value);
              if (!value.trim()) {
                setSearchResults([]); // Clear results when search is empty
              }
            }}
            className="h-14 text-lg"
          />
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        </div>
        <CommandList className="h-[80vh]">
          <SearchResults
            results={searchResults}
            error={error}
            searchTerm={debouncedSearchTerm}
            onSelect={onClose}
          />
        </CommandList>
      </Command>
    </CommandDialog>
  );
};