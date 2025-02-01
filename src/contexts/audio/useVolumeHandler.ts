import { useCallback } from 'react';

export const useVolumeHandler = (
  audioRef: React.RefObject<HTMLAudioElement>,
  wasPlayingRef: React.MutableRefObject<boolean>,
  setVolume: (volume: number) => void
) => {
  const handleVolumeChange = useCallback((newVolume: number) => {
    if (!audioRef.current) return;
    
    try {
      // Store current playback state using a local variable
      const wasPlaying = !audioRef.current.paused;
      wasPlayingRef.current = wasPlaying;
      
      // Update volume
      audioRef.current.volume = newVolume;
      setVolume(newVolume);

      // Resume playback if it was playing
      if (wasPlaying && audioRef.current.paused) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error("Playback failed:", error);
          });
        }
      }
    } catch (error) {
      console.error("Error changing volume:", error);
    }
  }, [audioRef, wasPlayingRef, setVolume]);

  return handleVolumeChange;
};