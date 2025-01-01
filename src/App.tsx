import { AudioProvider } from "@/contexts/AudioContext";
import { PlaylistProvider } from "@/contexts/PlaylistContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TrendingTracks } from "@/components/TrendingTracks";
import { Player } from "@/components/Player";
import { SearchDialog } from "@/components/SearchDialog";
import { Library } from "@/components/Library";
import { Button } from "@/components/ui/button";
import { Search, Home, Radio, Library as LibraryIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const queryClient = new QueryClient();

function App() {
  const [showSearch, setShowSearch] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [currentSection, setCurrentSection] = useState<'home' | 'search' | 'radio'>('home');

  // Add keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check for Ctrl + Q (or Cmd + Q on Mac)
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'q') {
        event.preventDefault(); // Prevent default browser behavior
        setShowSearch(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AudioProvider>
        <PlaylistProvider>
          <div className="h-screen flex flex-col bg-black text-white">
            <div className="flex-1 flex overflow-hidden">
              {/* Sidebar */}
              <div className="w-[240px] bg-[#1a1a1a] flex flex-col">
                <div className="p-2 space-y-1">
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start gap-2 text-sm font-medium",
                      currentSection === 'home' && "bg-[#2a2a2a]"
                    )}
                    onClick={() => setCurrentSection('home')}
                  >
                    <Home className="h-4 w-4" />
                    Home
                  </Button>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start gap-2 text-sm font-medium",
                      currentSection === 'search' && "bg-[#2a2a2a]"
                    )}
                    onClick={() => {
                      setCurrentSection('search');
                      setShowSearch(true);
                    }}
                  >
                    <Search className="h-4 w-4" />
                    Search
                    <kbd className="ml-auto text-xs text-muted-foreground">
                      Ctrl+Q
                    </kbd>
                  </Button>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start gap-2 text-sm font-medium",
                      currentSection === 'radio' && "bg-[#2a2a2a]"
                    )}
                    onClick={() => setCurrentSection('radio')}
                  >
                    <Radio className="h-4 w-4" />
                    Radio
                  </Button>
                  <div className="pt-4">
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-2 text-sm font-medium"
                      onClick={() => setShowLibrary(!showLibrary)}
                    >
                      <LibraryIcon className="h-4 w-4" />
                      Library
                    </Button>
                  </div>
                </div>
                {showLibrary && <Library />}
              </div>

              {/* Main content */}
              <div className="flex-1 overflow-y-auto bg-gradient-to-b from-[#1a1a1a] to-black">
                <TrendingTracks />
              </div>
            </div>

            {/* Player */}
            <div className="h-[90px] border-t border-[#2a2a2a] bg-[#1a1a1a]">
              <Player />
            </div>

            {/* Search dialog */}
            <SearchDialog isOpen={showSearch} onClose={() => setShowSearch(false)} />
          </div>
        </PlaylistProvider>
      </AudioProvider>
    </QueryClientProvider>
  );
}

export default App;