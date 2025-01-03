import React, { createContext, useContext, useState, useRef, useCallback } from "react";

type Track = {
  id: string;
  name: string;
  primaryArtists: string;
  downloadUrl: { link: string }[];
  image: { link: string }[];
};

type Album = {
  id: string;
  name: string;
  songs: Track[];
  image: { link: string }[];
};

type RepeatMode = 'off' | 'all' | 'one';

type AudioContextType = {
  currentTrack: Track | null;
  isPlaying: boolean;
  togglePlay: () => void;
  progress: number;
  duration: number;
  volume: number;
  setVolume: (volume: number) => void;
  playTrack: (track: Track, album?: Album) => void;
  playQueue: (tracks: Track[]) => void;
  nextTrack: () => void;
  previousTrack: () => void;
  isShuffle: boolean;
  toggleShuffle: () => void;
  seek: (time: number) => void;
  repeatMode: RepeatMode;
  toggleRepeat: () => void;
};

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

  const togglePlay = useCallback(() => {
    if (!currentTrack) return;
    
    if (isPlaying) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying, currentTrack]);

  const playQueue = useCallback((tracks: Track[]) => {
    if (tracks.length === 0) return;
    
    // Create a virtual album from the tracks
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
  }, []);

  const playTrack = useCallback((track: Track, album?: Album) => {
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
      // If no album is provided, treat the track as a single song
      setCurrentAlbum({ id: track.id, name: track.name, songs: [track], image: track.image });
      setCurrentIndex(0);
    }
    setIsPlaying(true);
  }, [currentTrack, togglePlay]);

  const toggleRepeat = useCallback(() => {
    setRepeatMode(current => {
      switch (current) {
        case 'off':
          return 'all';
        case 'all':
          return 'one';
        case 'one':
          return 'off';
      }
    });
  }, []);

  const toggleShuffle = useCallback(() => {
    setIsShuffle(prev => !prev);
  }, []);

  const getNextIndex = useCallback(() => {
    if (!currentAlbum) return -1;
    
    if (isShuffle) {
      // Get a random index excluding the current one
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
      // If we're at the end and repeat is on, start from the beginning
      setCurrentIndex(0);
      setCurrentTrack(currentAlbum.songs[0]);
      setIsPlaying(true);
    }
  }, [currentAlbum, currentIndex, getNextIndex, repeatMode]);

  const previousTrack = useCallback(() => {
    if (!currentAlbum || currentIndex === -1) return;
    
    const prevIndex = currentIndex - 1;
    if (prevIndex >= 0) {
      setCurrentIndex(prevIndex);
      setCurrentTrack(currentAlbum.songs[prevIndex]);
      setIsPlaying(true);
    }
  }, [currentAlbum, currentIndex]);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      updateProgress(time);
    }
  }, []);

  const handleVolumeChange = useCallback((newVolume: number) => {
    if (!audioRef.current) return;
    
    try {
      // Store current playback state
      wasPlayingRef.current = !audioRef.current.paused;
      
      // Update volume
      audioRef.current.volume = newVolume;
      setVolume(newVolume);

      // Resume playback if it was playing
      if (wasPlayingRef.current && audioRef.current.paused) {
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
  }, []);

  React.useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleVolumeUpdate = () => {
      if (audio.volume !== volume) {
        setVolume(audio.volume);
      }
    };

    const handlePlay = () => {
      setIsPlaying(true);
    };

    const handlePause = () => {
      if (!wasPlayingRef.current) {
        setIsPlaying(false);
      }
    };

    audio.addEventListener('volumechange', handleVolumeUpdate);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    
    // Set initial volume without affecting playback
    if (audio.volume !== volume) {
      audio.volume = volume;
    }

    return () => {
      audio.removeEventListener('volumechange', handleVolumeUpdate);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
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
    
    if (repeatMode === 'one') {
      // Repeat single track
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
        setIsPlaying(true);
      }
    } else {
      // Handle next track (with repeat all if enabled)
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
