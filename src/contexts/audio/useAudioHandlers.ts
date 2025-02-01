import { useCallback, useRef } from 'react';
import { Track, Album, RepeatMode } from './types';

export const useAudioHandlers = (
  audioRef: React.RefObject<HTMLAudioElement>,
  setIsPlaying: (playing: boolean) => void,
  setCurrentTrack: (track: Track | null) => void,
  setCurrentAlbum: (album: Album | null) => void,
  setCurrentIndex: (index: number) => void,
  currentAlbum: Album | null,
  currentIndex: number,
  repeatMode: RepeatMode,
  isShuffle: boolean,
  wasPlayingRef: React.RefObject<boolean>
) => {
  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;
    
    if (audioRef.current.paused) {
      audioRef.current.play();
    } else {
      audioRef.current.pause();
    }
    setIsPlaying(!audioRef.current.paused);
  }, [audioRef, setIsPlaying]);

  const playQueue = useCallback((tracks: Track[]) => {
    if (tracks.length === 0) return;
    
    const queueAlbum: Album = {
      id: 'queue',
      name: 'Queue',
      songs: tracks,
      image: tracks[0].image,
    };
    
    setCurrentAlbum(queueAlbum);
    setCurrentIndex(0);
    setCurrentTrack(tracks[0]);
    setIsPlaying(true);
  }, [setCurrentAlbum, setCurrentIndex, setCurrentTrack, setIsPlaying]);

  const getNextIndex = useCallback(() => {
    if (!currentAlbum) return -1;
    
    if (isShuffle) {
      const availableIndices = Array.from(
        { length: currentAlbum.songs.length },
        (_, i) => i
      ).filter(i => i !== currentIndex);
      
      if (availableIndices.length === 0) return -1;
      return availableIndices[Math.floor(Math.random() * availableIndices.length)];
    }
    
    const nextIndex = currentIndex + 1;
    if (nextIndex >= currentAlbum.songs.length) {
      return repeatMode === 'all' ? 0 : -1;
    }
    return nextIndex;
  }, [currentAlbum, currentIndex, isShuffle, repeatMode]);

  const nextTrack = useCallback(() => {
    if (!currentAlbum || currentIndex === -1) return;
    
    const nextIndex = getNextIndex();
    if (nextIndex !== -1) {
      setCurrentIndex(nextIndex);
      setCurrentTrack(currentAlbum.songs[nextIndex]);
      setIsPlaying(true);
    } else if (repeatMode === 'all') {
      setCurrentIndex(0);
      setCurrentTrack(currentAlbum.songs[0]);
      setIsPlaying(true);
    }
  }, [currentAlbum, currentIndex, getNextIndex, repeatMode, setCurrentIndex, setCurrentTrack, setIsPlaying]);

  const previousTrack = useCallback(() => {
    if (!currentAlbum || currentIndex === -1) return;
    
    const prevIndex = currentIndex - 1;
    if (prevIndex >= 0) {
      setCurrentIndex(prevIndex);
      setCurrentTrack(currentAlbum.songs[prevIndex]);
      setIsPlaying(true);
    }
  }, [currentAlbum, currentIndex, setCurrentIndex, setCurrentTrack, setIsPlaying]);

  return {
    togglePlay,
    playQueue,
    nextTrack,
    previousTrack,
  };
};