import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Track } from '@/lib/types';
import { db } from '@/lib/firebase';
import { useAuth } from './AuthContext';
import { 
  doc, 
  setDoc, 
  getDoc,
  updateDoc,
  onSnapshot
} from 'firebase/firestore';

interface Playlist {
  id: string;
  name: string;
  songs: Track[];
  createdAt: string;
  updatedAt: string;
}

interface PlaylistContextType {
  playlists: Playlist[];
  createPlaylist: (name: string) => Promise<void>;
  deletePlaylist: (id: string) => Promise<void>;
  addToPlaylist: (playlistId: string, track: Track) => Promise<void>;
  removeFromPlaylist: (playlistId: string, trackId: string) => Promise<void>;
}

const PlaylistContext = createContext<PlaylistContextType | null>(null);

export function PlaylistProvider({ children }: { children: ReactNode }) {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const loadUserData = async () => {
      if (!user) {
        setPlaylists([]);
        return;
      }

      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
          // Create initial user document if it doesn't exist
          const initialData = {
            uid: user.uid,
            email: user.email,
            likedSongs: [],
            playlists: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          await setDoc(userDocRef, initialData);
          setPlaylists([]);
        } else {
          const userData = userDoc.data();
          setPlaylists(userData.playlists || []);
        }

        // Set up real-time listener for updates
        unsubscribe = onSnapshot(userDocRef, (doc) => {
          if (doc.exists()) {
            const data = doc.data();
            setPlaylists(data.playlists || []);
          }
        }, (error) => {
          console.error('Error in real-time listener:', error);
        });

      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };

    loadUserData();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user]);

  const createPlaylist = async (name: string) => {
    if (!user) return;

    try {
      const userDocRef = doc(db, 'users', user.uid);
      
      const newPlaylist: Playlist = {
        id: crypto.randomUUID(),
        name,
        songs: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const updatedPlaylists = [...playlists, newPlaylist];

      // Update Firestore first
      await updateDoc(userDocRef, {
        playlists: updatedPlaylists,
        updatedAt: new Date().toISOString()
      });

      // Local state will be updated by the onSnapshot listener
    } catch (error) {
      console.error('Error creating playlist:', error);
    }
  };

  const deletePlaylist = async (playlistId: string) => {
    if (!user) return;

    try {
      const userDocRef = doc(db, 'users', user.uid);
      const updatedPlaylists = playlists.filter(p => p.id !== playlistId);

      // Update Firestore first
      await updateDoc(userDocRef, {
        playlists: updatedPlaylists,
        updatedAt: new Date().toISOString()
      });

      // Local state will be updated by the onSnapshot listener
    } catch (error) {
      console.error('Error deleting playlist:', error);
    }
  };

  const addToPlaylist = async (playlistId: string, track: Track) => {
    if (!user) return;

    try {
      const userDocRef = doc(db, 'users', user.uid);
      const playlistIndex = playlists.findIndex(p => p.id === playlistId);
      
      if (playlistIndex === -1) return;

      const updatedPlaylist = {
        ...playlists[playlistIndex],
        songs: [...playlists[playlistIndex].songs, track],
        updatedAt: new Date().toISOString()
      };

      const updatedPlaylists = [...playlists];
      updatedPlaylists[playlistIndex] = updatedPlaylist;

      // Update Firestore first
      await updateDoc(userDocRef, {
        playlists: updatedPlaylists,
        updatedAt: new Date().toISOString()
      });

      // Local state will be updated by the onSnapshot listener
    } catch (error) {
      console.error('Error adding song to playlist:', error);
    }
  };

  const removeFromPlaylist = async (playlistId: string, trackId: string) => {
    if (!user) return;

    try {
      const userDocRef = doc(db, 'users', user.uid);
      const playlistIndex = playlists.findIndex(p => p.id === playlistId);
      
      if (playlistIndex === -1) return;

      const updatedPlaylist = {
        ...playlists[playlistIndex],
        songs: playlists[playlistIndex].songs.filter(s => s.id !== trackId),
        updatedAt: new Date().toISOString()
      };

      const updatedPlaylists = [...playlists];
      updatedPlaylists[playlistIndex] = updatedPlaylist;

      // Update Firestore first
      await updateDoc(userDocRef, {
        playlists: updatedPlaylists,
        updatedAt: new Date().toISOString()
      });

      // Local state will be updated by the onSnapshot listener
    } catch (error) {
      console.error('Error removing song from playlist:', error);
    }
  };

  return (
    <PlaylistContext.Provider
      value={{
        playlists,
        createPlaylist,
        deletePlaylist,
        addToPlaylist,
        removeFromPlaylist
      }}
    >
      {children}
    </PlaylistContext.Provider>
  );
}

export function usePlaylist() {
  const context = useContext(PlaylistContext);
  if (!context) {
    throw new Error('usePlaylist must be used within a PlaylistProvider');
  }
  return context;
} 