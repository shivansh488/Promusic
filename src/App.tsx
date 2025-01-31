import { AudioProvider } from "@/contexts/AudioContext";
import { PlaylistProvider } from "@/contexts/PlaylistContext";
import { LikedSongsProvider } from "@/contexts/LikedSongsContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { SpotifyProvider } from "@/contexts/SpotifyContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Player } from "@/components/Player";
import { SearchDialog } from "@/components/SearchDialog";
import { LikedSongs } from "@/components/LikedSongs";
import { SignInOverlay } from "@/components/SignInOverlay";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { MainContent } from "@/components/layout/MainContent";

const queryClient = new QueryClient();

function AppContent() {
  const [showSearch, setShowSearch] = useState(false);
  const [showLikedSongs, setShowLikedSongs] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [currentSection, setCurrentSection] = useState<'home' | 'search' | 'radio' | 'albums' | 'songs' | 'explore' | 'library'>('home');
  const { user, loading } = useAuth();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!user) return;
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'q') {
        event.preventDefault();
        setShowSearch(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [user]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-white">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-black text-white">
      {!user && <SignInOverlay />}

      <TopBar setShowMobileMenu={setShowMobileMenu} />

      <div className="flex-1 flex overflow-hidden lg:pt-16 pt-14 pb-[140px] lg:pb-[90px]">
        {showMobileMenu && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setShowMobileMenu(false)}
          />
        )}

        <Sidebar
          showMobileMenu={showMobileMenu}
          setShowMobileMenu={setShowMobileMenu}
          currentSection={currentSection}
          setCurrentSection={setCurrentSection}
          setShowSearch={setShowSearch}
          setShowLikedSongs={setShowLikedSongs}
        />

        <MainContent currentSection={currentSection} />
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-40">
        <div className="h-[90px] border-t border-[#2a2a2a] bg-[#1a1a1a]">
          <Player />
        </div>
        <div className="lg:hidden h-[50px] bg-[#1a1a1a] border-t border-[#2a2a2a] flex items-center justify-around">
          <button 
            onClick={() => setCurrentSection('home')}
            className={`flex flex-col items-center text-xs ${currentSection === 'home' ? 'text-primary' : 'text-white'} transition-colors`}
          >
            <span className="material-icons-round text-lg mb-0.5">home</span>
            <span className="opacity-80">Home</span>
          </button>
          <button 
            onClick={() => setCurrentSection('explore')}
            className={`flex flex-col items-center text-xs ${currentSection === 'explore' ? 'text-primary' : 'text-white'} transition-colors`}
          >
            <span className="material-icons-round text-lg mb-0.5">explore</span>
            <span className="opacity-80">Explore</span>
          </button>
          <button 
            onClick={() => setCurrentSection('library')}
            className={`flex flex-col items-center text-xs ${currentSection === 'library' ? 'text-primary' : 'text-white'} transition-colors`}
          >
            <span className="material-icons-round text-lg mb-0.5">library_music</span>
            <span className="opacity-80">Library</span>
          </button>
        </div>
      </div>

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