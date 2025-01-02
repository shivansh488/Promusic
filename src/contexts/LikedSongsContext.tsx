import React, { createContext, useContext, useState, useEffect } from "react";

type Track = {
  id: string;
  name: string;
  primaryArtists: string;
  image: Array<{ link: string }>;
  downloadUrl: Array<{ link: string }>;
};

type LikedSongsContextType = {
  likedSongs: Track[];
  addLikedSong: (song: Track) => void;
  removeLikedSong: (songId: string) => void;
  isLiked: (songId: string) => boolean;
};

const LikedSongsContext = createContext<LikedSongsContextType | null>(null);

export function LikedSongsProvider({ children }: { children: React.ReactNode }) {
  const [likedSongs, setLikedSongs] = useState<Track[]>(() => {
    const saved = localStorage.getItem("likedSongs");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("likedSongs", JSON.stringify(likedSongs));
  }, [likedSongs]);

  const addLikedSong = (song: Track) => {
    setLikedSongs((prev) => {
      if (prev.some((s) => s.id === song.id)) return prev;
      return [...prev, song];
    });
  };

  const removeLikedSong = (songId: string) => {
    setLikedSongs((prev) => prev.filter((song) => song.id !== songId));
  };

  const isLiked = (songId: string) => {
    return likedSongs.some((song) => song.id === songId);
  };

  return (
    <LikedSongsContext.Provider
      value={{ likedSongs, addLikedSong, removeLikedSong, isLiked }}
    >
      {children}
    </LikedSongsContext.Provider>
  );
}

export function useLikedSongs() {
  const context = useContext(LikedSongsContext);
  if (!context) {
    throw new Error("useLikedSongs must be used within a LikedSongsProvider");
  }
  return context;
}