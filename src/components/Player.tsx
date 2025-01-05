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
  Volume,
  Download
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
  const { addToLikedSongs, removeFromLikedSongs, isLiked, isLoading, isProcessing } = useLikedSongs();
  const [showFullScreen, setShowFullScreen] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const volumeControlRef = useRef<HTMLDivElement>(null);

  // Handle clicking outside volume control
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (volumeControlRef.current && !volumeControlRef.current.contains(event.target as Node)) {
        setShowVolumeSlider(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleVolumeClick = () => {
    if (window.innerWidth >= 1024) {
      // On desktop, clicking the volume icon toggles mute
      const newVolume = volume === 0 ? 1 : 0;
      setVolume(newVolume);
    } else {
      // On mobile, clicking the volume icon shows/hides the slider
      setShowVolumeSlider(!showVolumeSlider);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0] / 100;
    setVolume(newVolume);
  };

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

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentTrack?.downloadUrl?.[4]?.link) return;
    
    try {
      const response = await fetch(currentTrack.downloadUrl[4].link);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentTrack.name}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading track:', error);
    }
  };

  const VolumeIcon = volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  const handleTrackInfoClick = (e: React.MouseEvent) => {
    // Don't open fullscreen if clicking the like button
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    setShowFullScreen(true);
  };

  if (!currentTrack) return null;

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-[#1a1a1a] border-t border-[#2a2a2a] p-4 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Track Info */}
          <div 
            className="flex items-center gap-3 lg:w-[30%] w-[40%] min-w-0 cursor-pointer group"
            onClick={handleTrackInfoClick}
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
                    (isProcessing(currentTrack.id) || isLoading) && "opacity-50 cursor-not-allowed"
                  )}
                  onClick={handleLikeClick}
                  disabled={isProcessing(currentTrack.id) || isLoading}
                >
                  <Heart className={cn(
                    "h-4 w-4 transition-colors",
                    isLiked(currentTrack) && "fill-current text-red-500",
                    (isProcessing(currentTrack.id) || isLoading) && "animate-pulse"
                  )} />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 hover:bg-[#2a2a2a]"
                  onClick={handleDownload}
                >
                  <Download className="h-4 w-4" />
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
            <div ref={volumeControlRef} className="relative flex items-center gap-2">
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-muted-foreground hover:text-white"
                onClick={handleVolumeClick}
              >
                <VolumeIcon className="h-4 w-4" />
              </Button>

              {/* Desktop Volume Slider */}
              <div className="hidden lg:block w-24">
                <Slider
                  value={[volume * 100]}
                  max={100}
                  step={1}
                  className="w-full"
                  onValueChange={handleVolumeChange}
                />
              </div>

              {/* Mobile Volume Slider Popup */}
              <div className={cn(
                "lg:hidden absolute bottom-full right-0 mb-2 p-4 bg-[#2a2a2a] rounded-lg shadow-lg transition-all transform",
                showVolumeSlider 
                  ? "opacity-100 visible translate-y-0" 
                  : "opacity-0 invisible translate-y-2 pointer-events-none"
              )}>
                <div className="h-32">
                  <Slider
                    orientation="vertical"
                    value={[volume * 100]}
                    max={100}
                    step={1}
                    onValueChange={handleVolumeChange}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Player Dialog */}
      <Dialog open={showFullScreen} onOpenChange={setShowFullScreen}>
        <DialogContent className="max-w-4xl bg-gradient-to-b from-[#2a2a2a] to-[#1a1a1a] border-none text-white p-8">
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
                className="h-12 w-12 text-muted-foreground hover:text-white"
                onClick={toggleShuffle}
              >
                <Shuffle className={`h-6 w-6 ${isShuffle ? 'text-primary' : ''}`} />
              </Button>
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
              <Button
                size="icon"
                variant="ghost"
                className="h-12 w-12 text-muted-foreground hover:text-white"
                onClick={toggleRepeat}
              >
                <div className="relative">
                  <Repeat className={`h-6 w-6 ${repeatMode !== 'off' ? 'text-primary' : ''}`} />
                  {repeatMode === 'one' && (
                    <span className="absolute -bottom-1 -right-1 text-sm text-primary">1</span>
                  )}
                </div>
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