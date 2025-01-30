import { useAuth } from "@/contexts/AuthContext";
import { usePlaylist } from "@/contexts/PlaylistContext";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

export const HomePage = () => {
  const { user } = useAuth();
  const { playlists } = usePlaylist();

  const recentPlaylists = [
    {
      title: "Coffee & Jazz",
      image: "/lovable-uploads/coffee-jazz.jpg"
    },
    {
      title: "Anything Goes",
      image: "/lovable-uploads/anything-goes.jpg"
    },
    {
      title: "Anime OSTs",
      image: "/lovable-uploads/anime-osts.jpg"
    },
    {
      title: "Lo-Fi Beats",
      image: "/lovable-uploads/lofi-beats.jpg"
    }
  ];

  const topMixes = [
    {
      title: "Pop Mix",
      image: "/lovable-uploads/pop-mix.jpg"
    },
    {
      title: "Chill Mix",
      image: "/lovable-uploads/chill-mix.jpg"
    }
  ];

  return (
    <ScrollArea className="h-full">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <img
              src={user?.photoURL || "https://github.com/shadcn.png"}
              alt="Profile"
              className="w-10 h-10 rounded-full"
            />
            <div>
              <h1 className="text-xl font-bold">Welcome back!</h1>
              <p className="text-sm text-gray-400">{user?.displayName || "Guest"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Bell className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Continue Listening */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">Continue Listening</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {recentPlaylists.map((playlist) => (
              <Card key={playlist.title} className="bg-[#1e1e1e] border-none p-3">
                <div className="aspect-square mb-2 bg-[#2a2a2a] rounded-md"></div>
                <h3 className="font-medium text-sm">{playlist.title}</h3>
              </Card>
            ))}
          </div>
        </section>

        {/* Your Top Mixes */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">Your Top Mixes</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {topMixes.map((mix) => (
              <Card key={mix.title} className="bg-[#1e1e1e] border-none p-3">
                <div className="aspect-square mb-2 bg-[#2a2a2a] rounded-md"></div>
                <h3 className="font-medium text-sm">{mix.title}</h3>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </ScrollArea>
  );
};