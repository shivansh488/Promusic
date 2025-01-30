import { TrendingTracks } from "@/components/TrendingTracks";
import Albums from "@/pages/Albums";
import Songs from "@/pages/Songs";
import Explore from "@/pages/Explore";

type MainContentProps = {
  currentSection: 'home' | 'search' | 'radio' | 'albums' | 'songs' | 'explore';
};

export const MainContent = ({ currentSection }: MainContentProps) => {
  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-b from-[#1a1a1a] to-black">
      {currentSection === 'home' && (
        <div className="p-4">
          <TrendingTracks />
        </div>
      )}
      {currentSection === 'albums' && <Albums />}
      {currentSection === 'songs' && <Songs />}
      {currentSection === 'explore' && <Explore />}
    </div>
  );
};