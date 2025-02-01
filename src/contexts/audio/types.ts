export type Track = {
  id: string;
  name: string;
  primaryArtists: string;
  downloadUrl: { link: string }[];
  image: { link: string }[];
};

export type Album = {
  id: string;
  name: string;
  songs: Track[];
  image: { link: string }[];
};

export type RepeatMode = 'off' | 'all' | 'one';

export type AudioContextType = {
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