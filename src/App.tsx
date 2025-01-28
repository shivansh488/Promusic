import { AudioProvider } from "@/contexts/AudioContext";
import { PlaylistProvider } from "@/contexts/PlaylistContext";
import { LikedSongsProvider } from "@/contexts/LikedSongsContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { SpotifyProvider } from "@/contexts/SpotifyContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TrendingTracks } from "@/components/TrendingTracks";
import { Player } from "@/components/Player";
import { SearchDialog } from "@/components/SearchDialog";
import { Library } from "@/components/Library";
import { LikedSongs } from "@/components/LikedSongs";
import { Auth } from "@/components/Auth";
import { SignInOverlay } from "@/components/SignInOverlay";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Search, Home, Radio, Library as LibraryIcon, Heart, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useAudio } from "@/contexts/AudioContext";
import { useLikedSongs } from "@/contexts/LikedSongsContext";
import { useAuth } from "@/contexts/AuthContext";

const queryClient = new QueryClient();

function AppContent() {
  const [showSearch, setShowSearch] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [showLikedSongs, setShowLikedSongs] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [currentSection, setCurrentSection] = useState<'home' | 'search' | 'radio'>('home');
  const { playQueue } = useAudio();
  const { likedSongs } = useLikedSongs();
  const { user, loading } = useAuth();

  // Add keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!user) return; // Disable shortcuts when not signed in
      // Check for Ctrl + Q (or Cmd + Q on Mac)
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'q') {
        event.preventDefault(); // Prevent default browser behavior
        setShowSearch(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [user]);

  const handleLikedSongsClick = () => {
    setShowLikedSongs(true);
    setShowMobileMenu(false);
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-white"></div>
      </div>
    );
  }

  const Sidebar = () => (
    <div className={cn(
      "lg:w-[240px] bg-[#1a1a1a] flex flex-col",
      "fixed inset-y-0 left-0 z-40 w-[80%] lg:relative",
      "transform transition-transform duration-300 ease-in-out",
      !showMobileMenu && "lg:translate-x-0 -translate-x-full"
    )}>
      <div className="flex items-center justify-between p-4">
        <Logo />
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={() => setShowMobileMenu(false)}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
      <div className="p-2 space-y-1 flex-1 overflow-y-auto">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-2 text-sm font-medium",
            currentSection === 'home' && "bg-[#2a2a2a]"
          )}
          onClick={() => {
            setCurrentSection('home');
            setShowMobileMenu(false);
          }}
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
            setShowMobileMenu(false);
          }}
        >
          <Search className="h-4 w-4" />
          Search
          <kbd className="ml-auto text-xs text-muted-foreground hidden lg:inline">
            Ctrl+Q
          </kbd>
        </Button>
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-2 text-sm font-medium",
            currentSection === 'radio' && "bg-[#2a2a2a]"
          )}
          onClick={() => {
            setCurrentSection('radio');
            setShowMobileMenu(false);
          }}
        >
          <Radio className="h-4 w-4" />
          Radio
        </Button>
        <div className="pt-4 space-y-1">
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-sm font-medium"
            onClick={() => {
              setShowLibrary(!showLibrary);
              setShowMobileMenu(false);
            }}
          >
            <LibraryIcon className="h-4 w-4" />
            Library
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-sm font-medium"
            onClick={handleLikedSongsClick}
          >
            <Heart className="h-4 w-4" />
            Liked Songs
          </Button>
        </div>
        {showLibrary && <Library />}
        {showLikedSongs && <LikedSongs  />}
      </div>
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-black text-white">
      {!user && <SignInOverlay />}

      {/* Top Bar */}
      <div className="lg:h-16 h-14 bg-[#1a1a1a] fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4">
        {/* Left Side - Menu Button (Mobile Only) */}
        <div className="lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowMobileMenu(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        {/* Center - Logo (Mobile Only) */}
        <div className="lg:hidden">
          <Logo className="!gap-2" />
        </div>

        {/* Right Side - Auth */}
        <div className="ml-auto">
          <Auth />
        </div>
      </div>

      {/* Main Content Area with proper padding for header and player */}
      <div className="flex-1 flex overflow-hidden lg:pt-16 pt-14 pb-[90px]">
        {/* Overlay for mobile menu */}
        {showMobileMenu && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setShowMobileMenu(false)}
          />
        )}

        <Sidebar />

        {/* Main content */}
        <div className="flex-1 overflow-y-auto bg-gradient-to-b from-[#1a1a1a] to-black">
          <div className="p-4">
            <TrendingTracks />
          </div>
        </div>
      </div>

      {/* Player - Fixed at bottom */}
      <div className="h-[90px] border-t border-[#2a2a2a] bg-[#1a1a1a] fixed bottom-0 left-0 right-0 z-40">
        <Player />
      </div>

      {/* Search dialog */}
      <SearchDialog isOpen={showSearch} onClose={() => setShowSearch(false)} />
      <LikedSongs isOpen={showLikedSongs} onClose={() => setShowLikedSongs(false)} />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AudioProvider>
          <PlaylistProvider>
            <LikedSongsProvider>
              <SpotifyProvider>
                <AppContent />
              </SpotifyProvider>
            </LikedSongsProvider>
          </PlaylistProvider>
        </AudioProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
