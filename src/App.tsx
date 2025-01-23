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
import { SpotifyCallback } from "@/components/SpotifyCallback";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Search, Home, Radio, Library as LibraryIcon, Heart, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useAudio } from "@/contexts/AudioContext";
import { useLikedSongs } from "@/contexts/LikedSongsContext";
import { useAuth } from "@/contexts/AuthContext";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

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
      <div className="p-4">
        <Logo />
      </div>
      <div className="flex-1 overflow-y-auto px-3">
        <div className="space-y-1">
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start gap-2",
              currentSection === 'home' && "bg-[#282828]"
            )}
            onClick={() => {
              setCurrentSection('home');
              setShowMobileMenu(false);
            }}
          >
            <Home className="h-5 w-5" />
            Home
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2"
            onClick={() => {
              setShowSearch(true);
              setShowMobileMenu(false);
            }}
          >
            <Search className="h-5 w-5" />
            Search
          </Button>
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start gap-2",
              currentSection === 'radio' && "bg-[#282828]"
            )}
            onClick={() => {
              setCurrentSection('radio');
              setShowMobileMenu(false);
            }}
          >
            <Radio className="h-5 w-5" />
            Radio
          </Button>
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start gap-2",
              showLibrary && "bg-[#282828]"
            )}
            onClick={() => {
              setShowLibrary(!showLibrary);
              setShowMobileMenu(false);
            }}
          >
            <LibraryIcon className="h-5 w-5" />
            Library
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2"
            onClick={handleLikedSongsClick}
          >
            <Heart className="h-5 w-5" />
            Liked Songs
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-black text-white">
      {!user && <SignInOverlay />}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        
        <div className={cn(
          "flex-1 relative overflow-hidden",
          showMobileMenu && "lg:pointer-events-auto pointer-events-none"
        )}>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden absolute top-4 left-4 z-50"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            {showMobileMenu ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>

          <main className="h-full overflow-y-auto">
            {currentSection === 'home' && <TrendingTracks />}
            {currentSection === 'radio' && (
              <div className="p-6">
                <h1 className="text-2xl font-bold mb-4">Radio</h1>
                {/* Add radio content here */}
              </div>
            )}
          </main>
        </div>

        {/* Dialogs */}
        <SearchDialog 
          open={showSearch} 
          onOpenChange={(open) => {
            setShowSearch(open);
          }} 
        />
        {showLibrary && (
          <div className="fixed inset-0 z-50 bg-black/80">
            <div className="fixed inset-y-0 right-0 w-full sm:w-[480px] bg-[#1a1a1a] p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Library</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowLibrary(false)}
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>
              <Library />
            </div>
          </div>
        )}
        <LikedSongs open={showLikedSongs} onOpenChange={setShowLikedSongs} />
      </div>

      {playQueue.length > 0 && (
        <div className="h-24 min-h-24 border-t border-[#282828]">
          <Player />
        </div>
      )}
    </div>
  );
}

function MainLayout() {
  return (
    <Routes>
      <Route path="/callback" element={<SpotifyCallback />} />
      <Route path="/*" element={<AppContent />} />
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <SpotifyProvider>
            <AudioProvider>
              <PlaylistProvider>
                <LikedSongsProvider>
                  <MainLayout />
                </LikedSongsProvider>
              </PlaylistProvider>
            </AudioProvider>
          </SpotifyProvider>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;