import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAudio } from "@/contexts/AudioContext";

type Album = {
  id: string;
  name: string;
  image: { link: string }[];
  songs: any[];
};

type AlbumCardProps = {
  album: Album;
  onClick: () => void;
};

export const AlbumCard = ({ album, onClick }: AlbumCardProps) => {
  const { playTrack } = useAudio();

  return (
    <Card
      key={album.id}
      className="bg-[#2a2a2a] hover:bg-[#3a3a3a] transition-colors border-none cursor-pointer group"
      onClick={onClick}
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
              playTrack(album.songs[0], album);
            }}
          >
            <Play className="h-4 w-4" />
          </Button>
        </div>
        <h3 className="font-medium truncate text-sm">{album.name}</h3>
        <p className="text-sm text-muted-foreground truncate">
          {album.songs[0]?.primaryArtists}
        </p>
      </div>
    </Card>
  );
};