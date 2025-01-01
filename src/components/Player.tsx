import { Play, Pause, SkipBack, SkipForward, Volume2 } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { useAudio } from "@/contexts/AudioContext";

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export function Player() {
  const {
    currentTrack,
    isPlaying,
    togglePlay,
    progress,
    duration,
    setProgress,
    volume,
    setVolume,
  } = useAudio();

  if (!currentTrack) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 glass-effect p-4">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img
            src={currentTrack.image?.[2]?.link || currentTrack.image?.[0]?.link}
            alt={currentTrack.name}
            className="h-14 w-14 rounded-md"
          />
          <div>
            <h3 className="font-medium">{currentTrack.name}</h3>
            <p className="text-sm text-muted-foreground">
              {currentTrack.primaryArtists}
            </p>
          </div>
        </div>
        
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon">
              <SkipBack className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-10 w-10"
              onClick={togglePlay}
            >
              {isPlaying ? (
                <Pause className="h-6 w-6" />
              ) : (
                <Play className="h-6 w-6" />
              )}
            </Button>
            <Button variant="ghost" size="icon">
              <SkipForward className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">{formatTime(progress)}</span>
            <Slider
              className="w-[400px]"
              value={[progress]}
              max={duration}
              step={1}
              onValueChange={(value) => setProgress(value[0])}
            />
            <span className="text-muted-foreground">{formatTime(duration)}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Volume2 className="h-5 w-5" />
          <Slider
            className="w-[100px]"
            value={[volume]}
            onValueChange={(value) => setVolume(value[0])}
            max={100}
            step={1}
          />
        </div>
      </div>
    </div>
  );
}