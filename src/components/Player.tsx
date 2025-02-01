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
  Heart,
} from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { VisuallyHidden } from '@/components/ui/visually-hidden';

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
  } = useAudio();
  const { addToLikedSongs, removeFromLikedSongs, isLiked, isLoading, isProcessing } = useLikedSongs();
  const [showFullScreen, setShowFullScreen] = useState(false);

  const handleLikeClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentTrack || isProcessing(currentTrack.id)) return;
    
    try {
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
    }
  };

  const handleTrackInfoClick = () => setShowFullScreen(true);

  if (!currentTrack) return null;

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-lg p-4 z-50">
        <div className="max-w-lg mx-auto">
          {/* Track Info */}
          <div className="flex flex-col items-center gap-2 mb-4">
            <img
              src={currentTrack.image?.[2]?.link || currentTrack.image?.[0]?.link}
              alt={currentTrack.name}
              className="w-24 h-24 rounded-lg object-cover shadow-lg cursor-pointer"
              onClick={handleTrackInfoClick}
            />
            <div className="text-center">
              <h3 className="font-medium text-sm">{currentTrack.name}</h3>
              <p className="text-xs text-gray-400">{currentTrack.primaryArtists}</p>
            </div>
            <Button
              size="icon"
              variant="ghost"
              className={cn(
                "h-8 w-8",
                (isProcessing(currentTrack.id) || isLoading) && "opacity-50 cursor-not-allowed"
              )}
              onClick={handleLikeClick}
              disabled={isProcessing(currentTrack.id) || isLoading}
            >
              <Heart className={cn(
                "h-4 w-4",
                isLiked(currentTrack) && "fill-current text-red-500",
                (isProcessing(currentTrack.id) || isLoading) && "animate-pulse"
              )} />
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs text-gray-400 w-10 text-right">
              {formatTime(progress)}
            </span>
            <Slider
              value={[progress]}
              max={duration}
              step={1}
              className="w-full"
              onValueChange={(value) => seek(value[0])}
            />
            <span className="text-xs text-gray-400 w-10">
              {formatTime(duration)}
            </span>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            <Button
              size="icon"
              variant="ghost"
              className="h-10 w-10"
              onClick={previousTrack}
            >
              <SkipBack className="h-5 w-5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-12 w-12"
              onClick={togglePlay}
            >
              {isPlaying ? (
                <Pause className="h-6 w-6" />
              ) : (
                <Play className="h-6 w-6" />
              )}
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-10 w-10"
              onClick={nextTrack}
            >
              <SkipForward className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Fullscreen Dialog */}
      <Dialog open={showFullScreen} onOpenChange={setShowFullScreen}>
        <DialogContent className="max-w-4xl bg-black/95 border-none text-white p-8">
          <VisuallyHidden>
            <DialogTitle>Now Playing: {currentTrack.name}</DialogTitle>
          </VisuallyHidden>
          <div className="flex flex-col items-center gap-8">
            <img
              src={currentTrack.image?.[2]?.link || currentTrack.image?.[0]?.link}
              alt={currentTrack.name}
              className="w-64 h-64 rounded-lg object-cover shadow-2xl"
            />
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">{currentTrack.name}</h2>
              <p className="text-lg text-muted-foreground">{currentTrack.primaryArtists}</p>
            </div>
            
            {/* Playback Controls */}
            <div className="flex items-center gap-6">
              <Button
                size="icon"
                variant="ghost"
                className="h-12 w-12"
                onClick={previousTrack}
              >
                <SkipBack className="h-6 w-6" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-16 w-16"
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
                className="h-12 w-12"
                onClick={nextTrack}
              >
                <SkipForward className="h-6 w-6" />
              </Button>
            </div>

            {/* Progress Bar */}
            <div className="w-full max-w-2xl flex items-center gap-4">
              <span className="text-sm text-muted-foreground w-12 text-right">
                {formatTime(progress)}
              </span>
              <Slider
                value={[progress]}
                max={duration}
                step={1}
                className="w-full"
                onValueChange={(value) => seek(value[0])}
              />
              <span className="text-sm text-muted-foreground w-12">
                {formatTime(duration)}
              </span>
            </div>
          </div>
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
