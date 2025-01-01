import { useAudio } from "@/contexts/AudioContext";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Volume1,
  VolumeX,
  Repeat,
  Shuffle,
  X,
} from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export const Player = () => {
  const {
    currentTrack,
    isPlaying,
    togglePlay,
    progress,
    duration,
    volume,
    setVolume,
    nextTrack,
    previousTrack,
  } = useAudio();

  const [showFullScreen, setShowFullScreen] = useState(false);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const VolumeIcon = volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  if (!currentTrack) return null;

  return (
    <>
      <div className="h-full flex items-center px-4 gap-4">
        {/* Track Info */}
        <div 
          className="flex items-center gap-3 w-[30%] min-w-[300px] cursor-pointer group"
          onClick={() => setShowFullScreen(true)}
        >
          <img
            src={currentTrack.image?.[2]?.link || currentTrack.image?.[0]?.link}
            alt={currentTrack.name}
            className="h-14 w-14 rounded-md object-cover transition-transform group-hover:scale-105"
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm truncate">{currentTrack.name}</h3>
            <p className="text-xs text-muted-foreground truncate">
              {currentTrack.primaryArtists}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex-1 flex flex-col items-center max-w-[800px] gap-2">
          <div className="flex items-center gap-4">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-muted-foreground hover:text-white"
            >
              <Shuffle className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={previousTrack}
            >
              <SkipBack className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={togglePlay}
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={nextTrack}
            >
              <SkipForward className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-muted-foreground hover:text-white"
            >
              <Repeat className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2 w-full">
            <span className="text-xs text-muted-foreground w-10 text-right">
              {formatTime(progress)}
            </span>
            <Slider
              value={[progress]}
              max={duration}
              step={1}
              className="w-full"
              onValueChange={(value) => {
                // TODO: Implement seek
              }}
            />
            <span className="text-xs text-muted-foreground w-10">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Volume */}
        <div className="flex items-center gap-2 w-[30%] min-w-[200px] justify-end">
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={() => setVolume(volume === 0 ? 1 : 0)}
          >
            <VolumeIcon className="h-4 w-4" />
          </Button>
          <Slider
            value={[volume * 100]}
            max={100}
            step={1}
            className="w-[100px]"
            onValueChange={(value) => setVolume(value[0] / 100)}
          />
        </div>
      </div>

      {/* Full Screen Album Art */}
      <Dialog open={showFullScreen} onOpenChange={setShowFullScreen}>
        <DialogContent className="max-w-none w-screen h-screen p-0 bg-transparent border-none overflow-hidden">
          <div 
            className="relative w-full h-full flex flex-col items-center justify-center"
            style={{
              backgroundImage: `url(${currentTrack.image?.[2]?.link || currentTrack.image?.[0]?.link})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {/* Blur Overlay */}
            <div className="absolute inset-0 backdrop-blur-xl bg-black/50" />

            {/* Close Button */}
            <Button
              size="icon"
              variant="ghost"
              className="absolute top-4 right-4 text-white hover:bg-white/20"
              onClick={() => setShowFullScreen(false)}
            >
              <X className="h-6 w-6" />
            </Button>

            {/* Album Art and Info */}
            <div className="relative z-10 text-center">
              <img
                src={currentTrack.image?.[2]?.link || currentTrack.image?.[0]?.link}
                alt={currentTrack.name}
                className="w-[400px] h-[400px] rounded-lg shadow-2xl object-cover mb-8"
              />
              <h2 className="text-2xl font-bold text-white mb-2">
                {currentTrack.name}
              </h2>
              <p className="text-lg text-white/80">
                {currentTrack.primaryArtists}
              </p>
            </div>

            {/* Player Controls */}
            <div className="relative z-10 mt-12 flex items-center gap-8">
              <Button
                size="icon"
                variant="ghost"
                className="h-12 w-12 text-white hover:bg-white/20"
                onClick={previousTrack}
              >
                <SkipBack className="h-6 w-6" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-16 w-16 text-white hover:bg-white/20"
                onClick={togglePlay}
              >
                {isPlaying ? (
                  <Pause className="h-8 w-8" />
                ) : (
                  <Play className="h-8 w-8" />
                )}
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-12 w-12 text-white hover:bg-white/20"
                onClick={nextTrack}
              >
                <SkipForward className="h-6 w-6" />
              </Button>
            </div>

            {/* Progress Bar */}
            <div className="relative z-10 w-full max-w-3xl mt-8 px-8">
              <div className="flex items-center gap-4">
                <span className="text-sm text-white/80">
                  {formatTime(progress)}
                </span>
                <Slider
                  value={[progress]}
                  max={duration}
                  step={1}
                  className="flex-1"
                  onValueChange={(value) => {
                    // TODO: Implement seek
                  }}
                />
                <span className="text-sm text-white/80">
                  {formatTime(duration)}
                </span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};