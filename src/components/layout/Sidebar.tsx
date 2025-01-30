import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Search, Home, Radio, Library as LibraryIcon, Heart, X, Disc, Music, Compass } from "lucide-react";
import { Logo } from "@/components/Logo";
import { cn } from "@/lib/utils";
import { Library } from "@/components/Library";
import { LikedSongs } from "@/components/LikedSongs";

type SidebarProps = {
  showMobileMenu: boolean;
  setShowMobileMenu: (show: boolean) => void;
  currentSection: 'home' | 'search' | 'radio' | 'albums' | 'songs' | 'explore' | 'library';
  setCurrentSection: (section: 'home' | 'search' | 'radio' | 'albums' | 'songs' | 'explore' | 'library') => void;
  setShowSearch: (show: boolean) => void;
  setShowLikedSongs: (show: boolean) => void;
};

export const Sidebar = ({
  showMobileMenu,
  setShowMobileMenu,
  currentSection,
  setCurrentSection,
  setShowSearch,
  setShowLikedSongs
}: SidebarProps) => {
  const [showLibrary, setShowLibrary] = useState(false);

  const handleLikedSongsClick = () => {
    setShowLikedSongs(true);
    setShowMobileMenu(false);
  };

  return (
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
            currentSection === 'explore' && "bg-[#2a2a2a]"
          )}
          onClick={() => {
            setCurrentSection('explore');
            setShowMobileMenu(false);
          }}
        >
          <Compass className="h-4 w-4" />
          Explore
        </Button>
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-2 text-sm font-medium",
            currentSection === 'albums' && "bg-[#2a2a2a]"
          )}
          onClick={() => {
            setCurrentSection('albums');
            setShowMobileMenu(false);
          }}
        >
          <Disc className="h-4 w-4" />
          Albums
        </Button>
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-2 text-sm font-medium",
            currentSection === 'songs' && "bg-[#2a2a2a]"
          )}
          onClick={() => {
            setCurrentSection('songs');
            setShowMobileMenu(false);
          }}
        >
          <Music className="h-4 w-4" />
          Songs
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
      </div>
    </div>
  );
};