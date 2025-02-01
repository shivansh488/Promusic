import React, { createContext, useContext, useState, useRef } from "react";
import { AudioContextType, Track, Album, RepeatMode } from "./audio/types";
import { useAudioHandlers } from "./audio/useAudioHandlers";
import { useVolumeHandler } from "./audio/useVolumeHandler";

const AudioContext = createContext<AudioContextType | null>(null);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, updateProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');
  const [isShuffle, setIsShuffle] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentAlbum, setCurrentAlbum] = useState<Album | null>(null);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const wasPlayingRef = useRef(false);

  const { togglePlay, playQueue, nextTrack, previousTrack } = useAudioHandlers(
    audioRef,
    setIsPlaying,
    setCurrentTrack,
    setCurrentAlbum,
    setCurrentIndex,
    currentAlbum,
    currentIndex,
    repeatMode,
    isShuffle,
    wasPlayingRef
  );

  const handleVolumeChange = useVolumeHandler(audioRef, wasPlayingRef, setVolume);

  const playTrack = React.useCallback((track: Track, album?: Album) => {
    if (currentTrack?.id === track.id) {
      togglePlay();
      return;
    }
    setCurrentTrack(track);
    if (album) {
      setCurrentAlbum(album);
      const index = album.songs.findIndex((song) => song.id === track.id);
      setCurrentIndex(index);
    } else {
      setCurrentAlbum({ id: track.id, name: track.name, songs: [track], image: track.image });
      setCurrentIndex(0);
    }
    setIsPlaying(true);
  }, [currentTrack, togglePlay]);

  const toggleRepeat = React.useCallback(() => {
    setRepeatMode(current => {
      switch (current) {
        case 'off': return 'all';
        case 'all': return 'one';
        case 'one': return 'off';
      }
    });
  }, []);

  const toggleShuffle = React.useCallback(() => {
    setIsShuffle(prev => !prev);
  }, []);

  const seek = React.useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      updateProgress(time);
    }
  }, []);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      updateProgress(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    updateProgress(0);
    
    if (repeatMode === 'one') {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
        setIsPlaying(true);
      }
    } else {
      nextTrack();
    }
  };

  React.useEffect(() => {
    if (!audioRef.current || !currentTrack) return;

    if (isPlaying) {
      audioRef.current.play();
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, currentTrack]);

  return (
    <AudioContext.Provider
      value={{
        currentTrack,
        isPlaying,
        togglePlay,
        progress,
        duration,
        volume,
        setVolume: handleVolumeChange,
        playTrack,
        playQueue,
        nextTrack,
        previousTrack,
        isShuffle,
        toggleShuffle,
        seek,
        repeatMode,
        toggleRepeat,
      }}
    >
      {children}
      <audio
        ref={audioRef}
        src={currentTrack?.downloadUrl?.[4]?.link || currentTrack?.downloadUrl?.[0]?.link}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error("useAudio must be used within an AudioProvider");
  }
  return context;
}