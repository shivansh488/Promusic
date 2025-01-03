import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useAudio } from '@/contexts/AudioContext';
import { useLikedSongs } from '@/contexts/LikedSongsContext';
import { cn } from '@/lib/utils';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Repeat,
  Shuffle,
  Heart,
  Volume1,
  Volume
} from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

export const Player = () => {
  const {
    currentTrack,
    isPlaying,
    togglePlay,
    nextTrack,
    previousTrack,
    progress,
    duration,
    seek,
    volume,
    setVolume,
    isShuffle,
    toggleShuffle,
    repeatMode,
    toggleRepeat
  } = useAudio();
  const { addToLikedSongs, removeFromLikedSongs, isLiked, isLoading } = useLikedSongs();
  const [showFullScreen, setShowFullScreen] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  const handleLikeClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentTrack || isLiking || isLoading) return;
    
    try {
      setIsLiking(true);
      const trackData = {
        id: currentTrack.id,
        name: currentTrack.name,
        primaryArtists: currentTrack.primaryArtists,
        image: currentTrack.image || [],
        downloadUrl: currentTrack.downloadUrl || []
      };

      const liked = isLiked(trackData);
      if (liked) {
        await removeFromLikedSongs(trackData);
      } else {
        await addToLikedSongs(trackData);
      }
    } catch (error) {
      console.error('Error handling like click:', error);
    } finally {
      setIsLiking(false);
    }
  };

  const VolumeIcon = volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  if (!currentTrack) return null;

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-[#1a1a1a] border-t border-[#2a2a2a] p-4 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Track Info */}
          <div 
            className="flex items-center gap-3 lg:w-[30%] w-[40%] min-w-0 cursor-pointer group"
            onClick={() => setShowFullScreen(true)}
          >
            {currentTrack && (
              <>
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
                <Button
                  size="icon"
                  variant="ghost"
                  className={cn(
                    "h-8 w-8 hover:bg-[#2a2a2a]",
                    (isLiking || isLoading) && "opacity-50 cursor-not-allowed"
                  )}
                  onClick={handleLikeClick}
                  disabled={isLiking || isLoading}
                >
                  <Heart className={cn(
                    "h-4 w-4 transition-colors",
                    isLiked(currentTrack) && "fill-current text-red-500",
                    (isLiking || isLoading) && "animate-pulse"
                  )} />
                </Button>
              </>
            )}
          </div>

          {/* Controls */}
          <div className="flex-1 flex flex-col items-center max-w-[800px] gap-2">
            <div className="flex items-center gap-4">
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-muted-foreground hover:text-white hidden sm:flex"
                onClick={toggleShuffle}
              >
                <Shuffle className={`h-4 w-4 ${isShuffle ? 'text-primary' : ''}`} />
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
                className="h-8 w-8 text-muted-foreground hover:text-white hidden sm:flex"
                onClick={toggleRepeat}
              >
                <div className="relative">
                  <Repeat className={`h-4 w-4 ${repeatMode !== 'off' ? 'text-primary' : ''}`} />
                  {repeatMode === 'one' && (
                    <span className="absolute -bottom-1 -right-1 text-[10px] text-primary">1</span>
                  )}
                </div>
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
                  seek(value[0]);
                }}
              />
              <span className="text-xs text-muted-foreground w-10">
                {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* Volume */}
          <div className="lg:w-[30%] w-[40%] flex justify-end">
            <div className="relative flex items-center gap-2">
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-muted-foreground hover:text-white"
                onClick={() => setShowVolumeSlider(!showVolumeSlider)}
              >
                <VolumeIcon className="h-4 w-4" />
              </Button>
              <div className={cn(
                "absolute bottom-full mb-2 p-4 bg-[#2a2a2a] rounded-lg transition-all",
                showVolumeSlider ? "opacity-100 visible" : "opacity-0 invisible"
              )}>
                <Slider
                  orientation="vertical"
                  value={[volume * 100]}
                  max={100}
                  step={1}
                  className="h-24"
                  onValueChange={(value) => setVolume(value[0] / 100)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Player */}
      <Dialog open={showFullScreen} onOpenChange={setShowFullScreen}>
        <DialogContent className="max-w-4xl bg-gradient-to-b from-[#2a2a2a] to-[#1a1a1a] border-none text-white">
          {/* ... rest of the fullscreen player code ... */}
        </DialogContent>
      </Dialog>
    </>
  );
};

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}