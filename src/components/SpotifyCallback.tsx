import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSpotify } from '@/contexts/SpotifyContext';

export const SpotifyCallback = () => {
  const navigate = useNavigate();
  const { importSpotifyLibrary } = useSpotify();

  useEffect(() => {
    const handleCallback = async () => {
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);
      const accessToken = params.get('access_token');

      if (accessToken) {
        localStorage.setItem('spotify_token', accessToken);
        await importSpotifyLibrary();
        navigate('/library');
      } else {
        navigate('/');
      }
    };

    handleCallback();
  }, [navigate, importSpotifyLibrary]);

  return (
    <div className="flex items-center justify-center h-screen">
      <p>Connecting to Spotify...</p>
    </div>
  );
};
