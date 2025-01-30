import { useQuery } from "@tanstack/react-query";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Play, Heart } from "lucide-react";
import { useAudio } from "@/contexts/AudioContext";
import { useLikedSongs } from "@/contexts/LikedSongsContext";
import { cn } from "@/lib/utils";

const Songs = () => {
  const { playTrack } = useAudio();
  const { addToLikedSongs, removeFromLikedSongs, isLiked, isProcessing } = useLikedSongs();

  const { data: songs, isLoading } = useQuery({
    queryKey: ["songs"],
    queryFn: async () => {
      const response = await fetch(
        "https://jiosaavn-api-privatecvc2.vercel.app/modules?language=hindi,english"
      );
      if (!response.ok) throw new Error("Failed to fetch songs");
      const data = await response.json();
      return data.data?.trending?.songs || [];
    }
  });

  const handleLikeClick = async (e: React.MouseEvent, song: any) => {
    e.stopPropagation();
    if (isProcessing(song.id)) return;

    const trackData = {
      id: song.id,
      name: song.name,
      primaryArtists: song.primaryArtists,
      image: song.image,
      downloadUrl: song.downloadUrl
    };

    try {
      if (isLiked(trackData)) {
        await removeFromLikedSongs(trackData);
      } else {
        await addToLikedSongs(trackData);
      }
    } catch (error) {
      console.error('Error handling like click:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="space-y-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="h-16 bg-[#2a2a2a] rounded-md animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">Songs</h1>
        <div className="space-y-2">
          {songs?.map((song: any, index: number) => (
            <div
              key={song.id}
              onClick={() => playTrack(song)}
              className="flex items-center gap-4 p-3 rounded-md hover:bg-[#2a2a2a] group cursor-pointer"
            >
              <div className="w-8 text-center text-sm text-muted-foreground">
                {index + 1}
              </div>
              <img
                src={song.image?.[2]?.link || song.image?.[0]?.link}
                alt={song.name}
                className="w-12 h-12 rounded object-cover"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-medium truncate text-sm">{song.name}</h4>
                <p className="text-sm text-muted-foreground truncate">
                  {song.primaryArtists}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="icon"
                  variant="ghost"
                  className={cn(
                    "opacity-0 group-hover:opacity-100",
                    isProcessing(song.id) && "opacity-50 cursor-not-allowed"
                  )}
                  onClick={(e) => handleLikeClick(e, song)}
                  disabled={isProcessing(song.id)}
                >
                  <Heart className={cn(
                    "h-4 w-4",
                    isLiked(song) && "fill-current text-red-500",
                    isProcessing(song.id) && "animate-pulse"
                  )} />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="opacity-0 group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    playTrack(song);
                  }}
                >
                  <Play className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ScrollArea>
  );
};

export default Songs;