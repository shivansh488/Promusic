import { TrendingTracks } from "@/components/TrendingTracks";
import { HomePage } from "@/pages/HomePage";
import { ExplorePage } from "@/pages/ExplorePage";
import { LibraryPage } from "@/pages/LibraryPage";

type MainContentProps = {
  currentSection: 'home' | 'search' | 'radio' | 'albums' | 'songs' | 'explore' | 'library';
};

export const MainContent = ({ currentSection }: MainContentProps) => {
  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-b from-[#1a1a1a] to-black">
      {currentSection === 'home' && <HomePage />}
      {currentSection === 'explore' && <ExplorePage />}
      {currentSection === 'library' && <LibraryPage />}
    </div>
  );
};