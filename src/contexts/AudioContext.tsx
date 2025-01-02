import React, { createContext, useContext, useState, useRef, useCallback } from "react";
import { getYouTubeAudioUrl } from "@/services/youtube";

type Track = {
  id: string;
  name: string;
  primaryArtists: string;
  downloadUrl: { link: string }[];
  image: { link: string }[];
  type?: 'youtube';
};

type Album = {
  id: string;
  name: string;
  songs: Track[];
  image: { link: string }[];
};

type AudioContextType = {
  currentTrack: Track | null;
  isPlaying: boolean;
  togglePlay: () => void;
  progress: number;
  duration: number;
  volume: number;
  setVolume: (volume: number) => void;
  playTrack: (track: Track, album?: Album) => void;
  nextTrack: () => void;
  previousTrack: () => void;
};

const AudioContext = createContext<AudioContextType | null>(null);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, updateProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentAlbum, setCurrentAlbum] = useState<Album | null>(null);
  const [currentIndex, setCurrentIndex] = useState(-1);

  const togglePlay = useCallback(() => {
    if (!currentTrack) return;
    
    if (isPlaying) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying, currentTrack]);

  const playTrack = useCallback(async (track: Track, album?: Album) => {
    if (currentTrack?.id === track.id) {
      togglePlay();
      return;
    }

    // If it's a YouTube track, get the audio URL
    if (track.type === 'youtube') {
      const videoId = track.downloadUrl[0].link.split('v=')[1];
      const audioUrl = await getYouTubeAudioUrl(videoId);
      if (audioUrl) {
        track.downloadUrl = [{ link: audioUrl }];
      } else {
        console.error('Failed to get YouTube audio URL');
        return;
      }
    }

    setCurrentTrack(track);
    if (album) {
      setCurrentAlbum(album);
      const index = album.songs.findIndex((song) => song.id === track.id);
      setCurrentIndex(index);
    } else {
      // If no album is provided, treat the track as a single song
      setCurrentAlbum({ id: track.id, name: track.name, songs: [track], image: track.image });
      setCurrentIndex(0);
    }
    setIsPlaying(true);
  }, [currentTrack, togglePlay]);

  const nextTrack = useCallback(() => {
    if (!currentAlbum || currentIndex === -1) return;
    
    const nextIndex = currentIndex + 1;
    if (nextIndex < currentAlbum.songs.length) {
      setCurrentIndex(nextIndex);
      const nextTrack = currentAlbum.songs[nextIndex];
      playTrack(nextTrack, currentAlbum);
    }
  }, [currentAlbum, currentIndex, playTrack]);

  const previousTrack = useCallback(() => {
    if (!currentAlbum || currentIndex === -1) return;
    
    const prevIndex = currentIndex - 1;
    if (prevIndex >= 0) {
      setCurrentIndex(prevIndex);
      const prevTrack = currentAlbum.songs[prevIndex];
      playTrack(prevTrack, currentAlbum);
    }
  }, [currentAlbum, currentIndex, playTrack]);

  React.useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = volume;

    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, [volume]);

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
    nextTrack();
  };

  React.useEffect(() => {
    if (!audioRef.current || !currentTrack) return;

    if (isPlaying) {
      audioRef.current.play().catch((error) => {
        console.error('Error playing audio:', error);
        setIsPlaying(false);
      });
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
        setVolume,
        playTrack,
        nextTrack,
        previousTrack,
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