import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchSpotifyPlaylists, fetchSpotifyLikedSongs, SpotifyPlaylist } from '@/lib/spotify-api';

interface SpotifyContextType {
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
  playlists: SpotifyPlaylist[];
  likedSongs: any[];
  error: string | null;
}

const SpotifyContext = createContext<SpotifyContextType | undefined>(undefined);

export const SpotifyProvider = ({ children }: { children: React.ReactNode }) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [likedSongs, setLikedSongs] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Function to extract token from URL hash
  const processAuthResponse = (hash: string) => {
    try {
      const params = new URLSearchParams(hash.substring(1));
      const token = params.get('access_token');
      const expiresIn = params.get('expires_in');
      
      if (token) {
        setAccessToken(token);
        // Store token and expiration time
        localStorage.setItem('spotify_token', token);
        const expirationTime = Date.now() + (parseInt(expiresIn || '3600') * 1000);
        localStorage.setItem('spotify_token_expiry', expirationTime.toString());
        return true;
      }
    } catch (error) {
      setError('Failed to process authentication response');
    }
    return false;
  };

  useEffect(() => {
    // Check for access token in URL hash after Spotify OAuth redirect
    const hash = window.location.hash;
    if (hash && hash.includes('access_token=')) {
      if (processAuthResponse(hash)) {
        // Remove hash from URL but maintain the current path
        const path = window.location.pathname;
        window.history.pushState({}, '', path);
      }
    } else {
      // Check if we have a valid token in storage
      const expirationTime = localStorage.getItem('spotify_token_expiry');
      if (expirationTime && Date.now() < parseInt(expirationTime)) {
        const token = localStorage.getItem('spotify_token');
        if (token) {
          setAccessToken(token);
        }
      }
    }
  }, []);

  useEffect(() => {
    if (accessToken) {
      fetchSpotifyPlaylists(accessToken)
        .then(setPlaylists)
        .catch(() => setError('Failed to fetch playlists'));
      
      fetchSpotifyLikedSongs(accessToken)
        .then(setLikedSongs)
        .catch(() => setError('Failed to fetch liked songs'));
    }
  }, [accessToken]);

  const connect = () => {
    const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
    // Use current origin and path for the redirect
    const currentPath = window.location.pathname;
    const REDIRECT_URI = `${window.location.origin}${currentPath}`;
    const scope = 'user-library-read playlist-read-private';
    
    // Clear any existing tokens before starting new auth flow
    localStorage.removeItem('spotify_token');
    localStorage.removeItem('spotify_token_expiry');
    
    window.location.href = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=token&redirect_uri=${REDIRECT_URI}&scope=${scope}&show_dialog=true`;
  };

  const disconnect = () => {
    setAccessToken(null);
    setPlaylists([]);
    setLikedSongs([]);
    setError(null);
    localStorage.removeItem('spotify_token');
    localStorage.removeItem('spotify_token_expiry');
  };

  return (
    <SpotifyContext.Provider
      value={{
        isConnected: !!accessToken,
        connect,
        disconnect,
        playlists,
        likedSongs,
        error,
      }}
    >
      {children}
    </SpotifyContext.Provider>
  );
};

export const useSpotify = () => {
  const context = useContext(SpotifyContext);
  if (context === undefined) {
    throw new Error('useSpotify must be used within a SpotifyProvider');
  }
  return context;
};
