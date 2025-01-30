import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Play, Plus } from "lucide-react";
import { useState } from "react";
import { useAudio } from "@/contexts/AudioContext";

const Albums = () => {
  const { playTrack } = useAudio();
  const [selectedAlbum, setSelectedAlbum] = useState<any>(null);

  const { data: albums, isLoading } = useQuery({
    queryKey: ["albums"],
    queryFn: async () => {
      const response = await fetch(
        "https://jiosaavn-api-privatecvc2.vercel.app/modules?language=hindi,english"
      );
      if (!response.ok) throw new Error("Failed to fetch albums");
      const data = await response.json();
      return data.data?.albums || [];
    }
  });

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {[...Array(10)].map((_, i) => (
            <Card key={i} className="bg-[#2a2a2a] border-none">
              <div className="p-4">
                <div className="w-full aspect-square bg-[#3a3a3a] animate-pulse rounded-md mb-4" />
                <div className="h-4 bg-[#3a3a3a] animate-pulse rounded mb-2" />
                <div className="h-3 bg-[#3a3a3a] animate-pulse rounded w-2/3" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">Albums</h1>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {albums?.map((album: any) => (
            <Card
              key={album.id}
              className="bg-[#2a2a2a] hover:bg-[#3a3a3a] transition-colors border-none cursor-pointer group"
              onClick={() => setSelectedAlbum(album)}
            >
              <div className="p-4">
                <div className="relative">
                  <img
                    src={album.image?.[2]?.link || album.image?.[0]?.link}
                    alt={album.name}
                    className="w-full aspect-square object-cover rounded-md mb-4"
                    loading="lazy"
                  />
                  <Button
                    size="icon"
                    className="absolute bottom-6 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-[#1a1a1a] hover:bg-[#2a2a2a] text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (album.songs?.[0]) {
                        playTrack(album.songs[0]);
                      }
                    }}
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                </div>
                <h3 className="font-medium truncate text-sm">{album.name}</h3>
                <p className="text-sm text-muted-foreground truncate">
                  {album.songs?.[0]?.primaryArtists || "Various Artists"}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </ScrollArea>
  );
};

export default Albums;