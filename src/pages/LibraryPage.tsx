import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Plus, Heart, Search, Clock } from "lucide-react";

export const LibraryPage = () => {
  const categories = ["Folders", "Playlists", "Artists", "Albums", "Podcasts"];
  
  const recentlyPlayed = [
    {
      title: "3:00am vibes",
      artist: "Conan Gray",
      songs: "18 songs",
      image: "/lovable-uploads/conan-gray.jpg"
    },
    {
      title: "Wiped Out!",
      artist: "The Neighbourhood",
      songs: "12 songs",
      image: "/lovable-uploads/wiped-out.jpg"
    },
    {
      title: "Extra Dynamic",
      artist: "Updated Aug 10 • ur mom ashley",
      songs: "24 songs",
      image: "/lovable-uploads/extra-dynamic.jpg"
    }
  ];

  return (
    <ScrollArea className="h-full">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-cyan-400">Your Library</h1>
          <Button variant="ghost" size="icon">
            <Search className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant="outline"
              className="whitespace-nowrap bg-[#2a2a2a] border-none hover:bg-[#3a3a3a]"
            >
              {category}
            </Button>
          ))}
        </div>

        <div className="space-y-4 mb-8">
          <Button
            className="w-full justify-start gap-3 bg-transparent hover:bg-[#2a2a2a]"
          >
            <div className="w-10 h-10 rounded-full bg-cyan-400 flex items-center justify-center">
              <Plus className="w-6 h-6 text-black" />
            </div>
            <span>Add New Playlist</span>
          </Button>

          <Button
            className="w-full justify-start gap-3 bg-transparent hover:bg-[#2a2a2a]"
          >
            <div className="w-10 h-10 rounded-full bg-cyan-400 flex items-center justify-center">
              <Heart className="w-6 h-6 text-black" />
            </div>
            <span>Your Liked Songs</span>
          </Button>
        </div>

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-medium text-cyan-400">Recently played</h2>
          </div>

          <div className="space-y-4">
            {recentlyPlayed.map((item) => (
              <div
                key={item.title}
                className="flex items-center gap-3 hover:bg-[#2a2a2a] p-2 rounded-lg cursor-pointer"
              >
                <div className="w-12 h-12 bg-[#2a2a2a] rounded-md flex-shrink-0"></div>
                <div>
                  <h3 className="font-medium">{item.title}</h3>
                  <p className="text-sm text-gray-400">{item.artist}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ScrollArea>
  );
};