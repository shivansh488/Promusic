import { useAuth } from "@/contexts/AuthContext";
import { usePlaylist } from "@/contexts/PlaylistContext";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, Settings, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useAudio } from "@/contexts/AudioContext";
import { Track } from "@/lib/types";

interface Song extends Track {}

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
      return data.data?.trending?.songs?.map((song: any) => ({
        id: song.id || String(Math.random()),
        name: song.name || song.title || 'Unknown Title',
        primaryArtists: song.primary_artists || song.singers || 'Unknown Artist',
        image: song.image ? [{ link: song.image.replace('150x150', '500x500') }] : [{ link: 'https://i.imgur.com/QxoJ9Co.png' }],
        downloadUrl: song.downloadUrl || song.media_url ? [{ link: song.downloadUrl || song.media_url }] : []
      })) || [];
    }
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const categories = [
    { title: "Podcasts", icon: "🎙️" },
    { title: "Music", icon: "🎵" },
    { title: "ASMR", icon: "🎧" },
  ];

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">{getGreeting()}</p>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              {user?.displayName || "Guest"} 
              <span role="img" aria-label="wave">👋</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Bell className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Categories */}
        <div className="flex justify-between gap-4">
          {categories.map((category) => (
            <Button
              key={category.title}
              variant="ghost"
              className="flex-1 h-auto py-3 bg-white/5 hover:bg-white/10 rounded-xl"
            >
              <span className="text-lg mr-2">{category.icon}</span>
              {category.title}
            </Button>
          ))}
        </div>

        {/* Featured Section */}
        <div>
          <h2 className="text-xl font-bold mb-4">Featured</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {isLoading ? (
              Array(3).fill(null).map((_, index) => (
                <Card 
                  key={index}
                  className="bg-white/5 border-none p-4 rounded-xl animate-pulse"
                >
                  <div className="aspect-square rounded-lg bg-white/10 mb-3" />
                  <div className="h-4 bg-white/10 rounded mb-2" />
                  <div className="h-3 bg-white/10 rounded w-2/3" />
                </Card>
              ))
            ) : error ? (
              <div className="col-span-full text-center text-red-500">
                Failed to load featured content
              </div>
            ) : (
              trendingSongs?.slice(0, 3).map((song: Song) => (
                <Card 
                  key={song.id}
                  className="group relative overflow-hidden bg-white/5 hover:bg-white/10 transition-colors border-none rounded-xl"
                >
                  <div className="p-4">
                    <div className="relative aspect-square mb-3">
                      <img 
                        src={song.image?.[0]?.link}
                        alt={song.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <Button
                        size="icon"
                        className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-primary hover:bg-primary/90 text-white rounded-full shadow-lg"
                        onClick={() => playTrack(song)}
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                    </div>
                    <h3 className="font-medium text-sm truncate">
                      {song.name}
                    </h3>
                    <p className="text-xs text-gray-400 truncate">
                      {song.primaryArtists}
                    </p>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* New Releases */}
        <div>
          <h2 className="text-xl font-bold mb-4">New Releases</h2>
          <div className="grid grid-cols-2 gap-4">
            {trendingSongs?.slice(3, 7).map((song: Song) => (
              <Card 
                key={song.id}
                className="group relative overflow-hidden bg-white/5 hover:bg-white/10 transition-colors border-none rounded-xl"
              >
                <div className="p-4">
                  <div className="relative aspect-square mb-3">
                    <img 
                      src={song.image?.[0]?.link}
                      alt={song.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <Button
                      size="icon"
                      className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-primary hover:bg-primary/90 text-white rounded-full shadow-lg"
                      onClick={() => playTrack(song)}
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                  </div>
                  <h3 className="font-medium text-sm truncate">
                    {song.name}
                  </h3>
                  <p className="text-xs text-gray-400 truncate">
                    {song.primaryArtists}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </ScrollArea>
  );
};