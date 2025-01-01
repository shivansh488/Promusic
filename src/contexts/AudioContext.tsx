import React, { createContext, useContext, useState, useRef } from "react";

type AudioContextType = {
  currentTrack: any;
  isPlaying: boolean;
  playTrack: (track: any) => void;
  pauseTrack: () => void;
  togglePlay: () => void;
  setProgress: (value: number) => void;
  progress: number;
  duration: number;
  volume: number;
  setVolume: (value: number) => void;
};

const AudioContext = createContext<AudioContextType | null>(null);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, updateProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  React.useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      const handleError = (e: Event) => {
        console.error('Audio playback error:', e);
        setIsPlaying(false);
      };
  
      const handleEnded = () => {
        setIsPlaying(false);
        updateProgress(0);
      };

      audio.addEventListener('error', handleError);
      audio.addEventListener('ended', handleEnded);
  
      return () => {
        audio.removeEventListener('error', handleError);
        audio.removeEventListener('ended', handleEnded);
      };
    }
  }, []);

  const playTrack = (track: any) => {
    if (currentTrack?.id === track.id) {
      togglePlay();
      return;
    }
    
    setCurrentTrack(track);
    setIsPlaying(true);
    if (audioRef.current) {
      audioRef.current.src = track.downloadUrl[4]?.link || track.downloadUrl[0]?.link;
      audioRef.current.play();
    }
  };

  const pauseTrack = () => {
    setIsPlaying(false);
    audioRef.current?.pause();
  };

  const togglePlay = () => {
    if (isPlaying) {
      pauseTrack();
    } else {
      setIsPlaying(true);
      audioRef.current?.play();
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      updateProgress(audioRef.current.currentTime);
      setDuration(audioRef.current.duration);
    }
  };

  const setProgress = (value: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value;
      updateProgress(value);
    }
  };

  React.useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  return (
    <AudioContext.Provider
      value={{
        currentTrack,
        isPlaying,
        playTrack,
        pauseTrack,
        togglePlay,
        setProgress,
        progress,
        duration,
        volume,
        setVolume,
      }}
    >
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
      />
      {children}
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