import { useState } from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2 } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

export function Player() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(100);

  return (
    <div className="fixed bottom-0 left-0 right-0 glass-effect p-4">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img
            src="/placeholder.svg"
            alt="Album art"
            className="h-14 w-14 rounded-md"
          />
          <div>
            <h3 className="font-medium">No track playing</h3>
            <p className="text-sm text-muted-foreground">Select a track to play</p>
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
              onClick={() => setIsPlaying(!isPlaying)}
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
          <Slider
            className="w-[400px]"
            defaultValue={[0]}
            max={100}
            step={1}
          />
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