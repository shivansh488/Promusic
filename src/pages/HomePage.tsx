import { useAuth } from "@/contexts/AuthContext";
import { usePlaylist } from "@/contexts/PlaylistContext";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, Settings, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useAudio } from "@/contexts/AudioContext";

interface Song {
  id: string;
  name: string;
  url?: string;
  image: { link: string }[];
  type?: string;
  role?: string;
  primaryArtists?: string;
}

export const HomePage = () => {
  const { user } = useAuth();
  const { playlists } = usePlaylist();
  const { playTrack } = useAudio();

  const { data: trendingSongs, isLoading, error } = useQuery({
    queryKey: ["trending-songs"],
    queryFn: async () => {
      const response = await fetch(
        "https://jiosaavn-api-privatecvc2.vercel.app/modules?language=hindi,english"
      );
      if (!response.ok) {
        throw new Error('Failed to fetch trending songs');
      }
      const data = await response.json();
      return data.data?.trending?.songs || [];
    }
  });

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

        {/* Trending Songs */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">Trending Now</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {isLoading ? (
              Array(8).fill(null).map((_, index) => (
                <Card 
                  key={index}
                  className="bg-[#1e1e1e] border-none p-3 animate-pulse"
                >
                  <div className="aspect-square mb-2 bg-[#2a2a2a] rounded-md" />
                  <div className="h-4 bg-[#2a2a2a] rounded mb-2" />
                  <div className="h-3 bg-[#2a2a2a] rounded w-2/3" />
                </Card>
              ))
            ) : error ? (
              <div className="col-span-full text-center text-red-500">
                Failed to load trending songs
              </div>
            ) : (
              trendingSongs?.slice(0, 8).map((song: Song) => (
                <Card 
                  key={song.id} 
                  className="bg-[#1e1e1e] border-none p-3 group cursor-pointer hover:bg-[#2a2a2a] transition-colors"
                >
                  <div className="relative aspect-square mb-2">
                    <img 
                      src={song.image?.[2]?.link || song.image?.[0]?.link || "https://github.com/shadcn.png"} 
                      alt={song.name || "Song cover"}
                      className="w-full h-full object-cover rounded-md"
                    />
                    <Button
                      size="icon"
                      className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-primary hover:bg-primary/90 text-white"
                      onClick={() => playTrack(song)}
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                  </div>
                  <h3 className="font-medium text-sm truncate">
                    {song.name || "Untitled"}
                  </h3>
                  <p className="text-xs text-gray-400 truncate">
                    {song.primaryArtists || "Unknown Artist"}
                  </p>
                </Card>
              ))
            )}
          </div>
        </section>

        {/* Continue Listening */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">Continue Listening</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {recentPlaylists.map((playlist) => (
              <Card 
                key={playlist.title} 
                className="bg-[#1e1e1e] border-none p-3 hover:bg-[#2a2a2a] transition-colors"
              >
                <div className="aspect-square mb-2 bg-[#2a2a2a] rounded-md">
                  <img
                    src={playlist.image}
                    alt={playlist.title}
                    className="w-full h-full object-cover rounded-md"
                  />
                </div>
                <h3 className="font-medium text-sm">{playlist.title}</h3>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </ScrollArea>
  );
};