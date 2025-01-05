import { useState, useCallback, useEffect } from "react";
import { Search, Loader2 } from "lucide-react";
import {
  Command,
  CommandInput,
  CommandList,
} from "@/components/ui/command";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useDebounce } from "../hooks/use-debounce";
import { searchSongs } from "@/lib/search-api";
import { SearchResults } from "./SearchResults";

export const SearchDialog = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  // Reduce debounce time for faster response
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

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
        setError(results.length === 0 && query.trim() ? "No results found for your search." : null);
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
    if (isOpen) {
      handleSearch(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, handleSearch, isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl p-0 gap-0">
        <Command className="rounded-lg border-none bg-[#1a1a1a] text-white">
          <div className="flex items-center border-b border-[#2a2a2a] px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <CommandInput
              placeholder="Search for songs, albums, or artists..."
              value={searchTerm}
              onValueChange={setSearchTerm}
              className="h-14 text-lg bg-transparent text-white placeholder:text-gray-400"
            />
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          </div>
          <CommandList className="max-h-[500px] overflow-y-auto py-2">
            <span id="search-description" className="sr-only">
              Search for songs, albums, or artists and use arrow keys to navigate results
            </span>
            <SearchResults
              results={searchResults}
              error={error}
              searchTerm={debouncedSearchTerm}
              onSelect={onClose}
            />
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
};