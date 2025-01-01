import React, { createContext, useContext, useState, useEffect } from "react";

type Playlist = {
  id: string;
  name: string;
  songs: any[];
  createdAt: Date;
};

type PlaylistContextType = {
  playlists: Playlist[];
  createPlaylist: (name: string) => void;
  addToPlaylist: (playlistId: string, song: any) => void;
  removeFromPlaylist: (playlistId: string, songId: string) => void;
  deletePlaylist: (playlistId: string) => void;
  getPlaylist: (playlistId: string) => Playlist | undefined;
};

const PlaylistContext = createContext<PlaylistContextType | null>(null);

export function PlaylistProvider({ children }: { children: React.ReactNode }) {
  const [playlists, setPlaylists] = useState<Playlist[]>(() => {
    // Load playlists from localStorage on initial render
    const savedPlaylists = localStorage.getItem("playlists");
    return savedPlaylists ? JSON.parse(savedPlaylists) : [];
  });

  // Save playlists to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("playlists", JSON.stringify(playlists));
  }, [playlists]);

  const createPlaylist = (name: string) => {
    const newPlaylist: Playlist = {
      id: crypto.randomUUID(),
      name,
      songs: [],
      createdAt: new Date(),
    };
    setPlaylists((prev) => [...prev, newPlaylist]);
  };

  const addToPlaylist = (playlistId: string, song: any) => {
    setPlaylists((prev) =>
      prev.map((playlist) => {
        if (playlist.id === playlistId) {
          // Check if song already exists in playlist
          const songExists = playlist.songs.some((s) => s.id === song.id);
          if (songExists) return playlist;
          
          return {
            ...playlist,
            songs: [...playlist.songs, song],
          };
        }
        return playlist;
      })
    );
  };

  const removeFromPlaylist = (playlistId: string, songId: string) => {
    setPlaylists((prev) =>
      prev.map((playlist) => {
        if (playlist.id === playlistId) {
          return {
            ...playlist,
            songs: playlist.songs.filter((song) => song.id !== songId),
          };
        }
        return playlist;
      })
    );
  };

  const deletePlaylist = (playlistId: string) => {
    setPlaylists((prev) => prev.filter((playlist) => playlist.id !== playlistId));
  };

  const getPlaylist = (playlistId: string) => {
    return playlists.find((playlist) => playlist.id === playlistId);
  };

  return (
    <PlaylistContext.Provider
      value={{
        playlists,
        createPlaylist,
        addToPlaylist,
        removeFromPlaylist,
        deletePlaylist,
        getPlaylist,
      }}
    >
      {children}
    </PlaylistContext.Provider>
  );
}

export function usePlaylist() {
  const context = useContext(PlaylistContext);
  if (!context) {
    throw new Error("usePlaylist must be used within a PlaylistProvider");
  }
  return context;
} 