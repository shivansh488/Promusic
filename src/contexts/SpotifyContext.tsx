// src/contexts/SpotifyContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

interface SpotifyContextType {
  spotifyToken: string | null;
  spotifyPlaylists: any[];
  spotifyLikedSongs: any[];
  connectSpotify: () => Promise<void>;
  importSpotifyLibrary: () => Promise<void>;
}

const SpotifyContext = createContext<SpotifyContextType | null>(null);

export function SpotifyProvider({ children }: { children: ReactNode }) {
  const [spotifyToken, setSpotifyToken] = useState<string | null>(() => {
    return localStorage.getItem('spotify_token');
  });
  const [spotifyPlaylists, setSpotifyPlaylists] = useState<any[]>([]);
  const [spotifyLikedSongs, setSpotifyLikedSongs] = useState<any[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (spotifyToken) {
      importSpotifyLibrary();
    }
  }, [spotifyToken]);

  const connectSpotify = async () => {
    const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
    // Using the exact redirect URI that should be registered in Spotify Dashboard
    const redirectUri = 'http://localhost:5173/callback';
    const scope = 'user-library-read playlist-read-private';
    
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&response_type=token`;
    window.location.href = authUrl;
  };

  const importSpotifyLibrary = async () => {
    if (!spotifyToken) return;

    try {
      // Fetch liked songs from Spotify
      const likedResponse = await fetch('https://api.spotify.com/v1/me/tracks', {
        headers: { 'Authorization': `Bearer ${spotifyToken}` }
      });
      const likedData = await likedResponse.json();
      
      if (likedResponse.ok) {
        setSpotifyLikedSongs(likedData.items);
      } else {
        console.error('Error fetching liked songs:', likedData);
        if (likedResponse.status === 401) {
          // Token expired
          localStorage.removeItem('spotify_token');
          setSpotifyToken(null);
        }
      }

      // Fetch playlists from Spotify
      const playlistResponse = await fetch('https://api.spotify.com/v1/me/playlists', {
        headers: { 'Authorization': `Bearer ${spotifyToken}` }
      });
      const playlistData = await playlistResponse.json();
      
      if (playlistResponse.ok) {
        setSpotifyPlaylists(playlistData.items);
      } else {
        console.error('Error fetching playlists:', playlistData);
        if (playlistResponse.status === 401) {
          // Token expired
          localStorage.removeItem('spotify_token');
          setSpotifyToken(null);
        }
      }
    } catch (error) {
      console.error('Error importing Spotify library:', error);
    }
  };

  return (
    <SpotifyContext.Provider value={{ 
      spotifyToken, 
      spotifyPlaylists, 
      spotifyLikedSongs, 
      connectSpotify,
      importSpotifyLibrary 
    }}>
      {children}
    </SpotifyContext.Provider>
  );
}

export function useSpotify() {
  const context = useContext(SpotifyContext);
  if (!context) {
    throw new Error('useSpotify must be used within a SpotifyProvider');
  }
  return context;
}