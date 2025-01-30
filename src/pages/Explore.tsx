import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { useAudio } from "@/contexts/AudioContext";

const Explore = () => {
  const { playTrack } = useAudio();

  const { data: content, isLoading } = useQuery({
    queryKey: ["explore-content"],
    queryFn: async () => {
      const response = await fetch(
        "https://jiosaavn-api-privatecvc2.vercel.app/modules?language=hindi,english"
      );
      if (!response.ok) throw new Error("Failed to fetch explore content");
      const data = await response.json();
      return {
        charts: data.data?.playlists || [],
        newReleases: data.data?.albums || [],
        featured: data.data?.trending?.albums || []
      };
    }
  });

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="space-y-8">
          {[...Array(3)].map((_, sectionIndex) => (
            <div key={sectionIndex}>
              <div className="h-8 w-48 bg-[#2a2a2a] rounded-md animate-pulse mb-4" />
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {[...Array(5)].map((_, i) => (
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
          ))}
        </div>
      </div>
    );
  }

  const renderSection = (title: string, items: any[]) => (
    <section className="mb-8">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {items?.slice(0, 5).map((item: any) => (
          <Card
            key={item.id}
            className="bg-[#2a2a2a] hover:bg-[#3a3a3a] transition-colors border-none cursor-pointer group"
          >
            <div className="p-4">
              <div className="relative">
                <img
                  src={item.image?.[2]?.link || item.image?.[0]?.link}
                  alt={item.name}
                  className="w-full aspect-square object-cover rounded-md mb-4"
                  loading="lazy"
                />
                <Button
                  size="icon"
                  className="absolute bottom-6 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-[#1a1a1a] hover:bg-[#2a2a2a] text-white"
                  onClick={() => {
                    if (item.songs?.[0]) {
                      playTrack(item.songs[0]);
                    }
                  }}
                >
                  <Play className="h-4 w-4" />
                </Button>
              </div>
              <h3 className="font-medium truncate text-sm">{item.name}</h3>
              <p className="text-sm text-muted-foreground truncate">
                {item.songs?.[0]?.primaryArtists || "Various Artists"}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );

  return (
    <ScrollArea className="h-full">
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">Explore</h1>
        {renderSection("Featured", content?.featured || [])}
        {renderSection("Charts", content?.charts || [])}
        {renderSection("New Releases", content?.newReleases || [])}
      </div>
    </ScrollArea>
  );
};

export default Explore;