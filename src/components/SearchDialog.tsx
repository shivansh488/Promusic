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
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  // Increase debounce time slightly to prevent too many requests
  const debouncedSearchTerm = useDebounce(searchTerm, 400);

  // Reset search state when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm("");
      setSearchResults([]);
      setError(null);
      if (abortController) {
        abortController.abort();
      }
    }
  }, [isOpen]);

  const handleSearch = useCallback(async (query: string) => {
    // Cancel previous request if it exists
    if (abortController) {
      abortController.abort();
    }

    // Clear results if query is empty
    if (!query.trim()) {
      setSearchResults([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    // Create new abort controller for this request
    const newAbortController = new AbortController();
    setAbortController(newAbortController);
    setIsLoading(true);
    setError(null);

    try {
      const results = await searchSongs(query);
      // Only update if this is still the current request
      if (!newAbortController.signal.aborted) {
        setSearchResults(results);
        if (results.length === 0) {
          setError("No results found for your search.");
        }
      }
    } catch (error: any) {
      if (!newAbortController.signal.aborted) {
        console.error("Error searching:", error);
        setError(error.message || "An error occurred while searching. Please try again.");
        setSearchResults([]);
      }
    } finally {
      if (!newAbortController.signal.aborted) {
        setIsLoading(false);
      }
    }
  }, []);

  // Search when the debounced term changes
  useEffect(() => {
    if (isOpen && debouncedSearchTerm.trim()) {
      handleSearch(debouncedSearchTerm);
    } else {
      setSearchResults([]);
      setError(null);
    }
    
    // Cleanup function to cancel pending requests when component unmounts
    return () => {
      if (abortController) {
        abortController.abort();
      }
    };
  }, [debouncedSearchTerm, handleSearch, isOpen]);

  return (
    <CommandDialog open={isOpen} onOpenChange={onClose}>
      <Command className="rounded-lg border shadow-md">
        <div className="flex items-center border-b px-3">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <CommandInput
            placeholder="Search for songs, albums, or artists..."
            value={searchTerm}
            onValueChange={setSearchTerm}
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