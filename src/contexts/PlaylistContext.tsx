import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Track } from '@/lib/types';
import { db } from '@/lib/firebase';
import { useAuth } from './AuthContext';
import { 
  doc, 
  setDoc, 
  getDoc,
  updateDoc
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

  // Load playlists from Firebase when user logs in
  useEffect(() => {
    const loadPlaylists = async () => {
      if (!user) {
        setPlaylists([]);
        return;
      }

      try {
        const userDocRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userDocRef);

        if (!docSnap.exists()) {
          // If document doesn't exist, create it with initial data
          const initialData = {
            uid: user.uid,
            email: user.email,
            playlists: [],
            likedSongs: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          await setDoc(userDocRef, initialData);
          setPlaylists([]);
        } else {
          // Document exists, load playlists
          const data = docSnap.data();
          setPlaylists(data.playlists || []);
        }
      } catch (error) {
        console.error('Error loading playlists:', error);
        setPlaylists([]);
      }
    };

    loadPlaylists();
  }, [user]);

  const createPlaylist = async (name: string) => {
    if (!user) return;

    try {
      const userDocRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(userDocRef);
      
      if (!docSnap.exists()) return;

      const newPlaylist: Playlist = {
        id: crypto.randomUUID(),
        name,
        songs: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Update local state
      const updatedPlaylists = [...playlists, newPlaylist];
      setPlaylists(updatedPlaylists);

      // Update Firebase
      await updateDoc(userDocRef, {
        playlists: updatedPlaylists,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error creating playlist:', error);
      // Revert local state if Firebase update fails
      setPlaylists(prev => prev.filter(p => p.id !== newPlaylist.id));
    }
  };

  const deletePlaylist = async (playlistId: string) => {
    if (!user) return;

    try {
      const userDocRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(userDocRef);
      
      if (!docSnap.exists()) return;

      // Update local state
      const updatedPlaylists = playlists.filter(p => p.id !== playlistId);
      setPlaylists(updatedPlaylists);

      // Update Firebase
      await updateDoc(userDocRef, {
        playlists: updatedPlaylists,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error deleting playlist:', error);
      // Revert local state if Firebase update fails
      const docSnap = await getDoc(doc(db, 'users', user.uid));
      if (docSnap.exists()) {
        setPlaylists(docSnap.data().playlists || []);
      }
    }
  };

  const addToPlaylist = async (playlistId: string, track: Track) => {
    if (!user) return;

    try {
      const userDocRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(userDocRef);
      
      if (!docSnap.exists()) return;

      const playlistIndex = playlists.findIndex(p => p.id === playlistId);
      if (playlistIndex === -1) return;

      // Create new playlist with added song
      const updatedPlaylist = {
        ...playlists[playlistIndex],
        songs: [...playlists[playlistIndex].songs, track],
        updatedAt: new Date().toISOString()
      };

      // Update local state
      const updatedPlaylists = [...playlists];
      updatedPlaylists[playlistIndex] = updatedPlaylist;
      setPlaylists(updatedPlaylists);

      // Update Firebase
      await updateDoc(userDocRef, {
        playlists: updatedPlaylists,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error adding song to playlist:', error);
      // Revert local state if Firebase update fails
      const docSnap = await getDoc(doc(db, 'users', user.uid));
      if (docSnap.exists()) {
        setPlaylists(docSnap.data().playlists || []);
      }
    }
  };

  const removeFromPlaylist = async (playlistId: string, trackId: string) => {
    if (!user) return;

    try {
      const userDocRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(userDocRef);
      
      if (!docSnap.exists()) return;

      const playlistIndex = playlists.findIndex(p => p.id === playlistId);
      if (playlistIndex === -1) return;

      // Create new playlist with removed song
      const updatedPlaylist = {
        ...playlists[playlistIndex],
        songs: playlists[playlistIndex].songs.filter(s => s.id !== trackId),
        updatedAt: new Date().toISOString()
      };

      // Update local state
      const updatedPlaylists = [...playlists];
      updatedPlaylists[playlistIndex] = updatedPlaylist;
      setPlaylists(updatedPlaylists);

      // Update Firebase
      await updateDoc(userDocRef, {
        playlists: updatedPlaylists,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error removing song from playlist:', error);
      // Revert local state if Firebase update fails
      const docSnap = await getDoc(doc(db, 'users', user.uid));
      if (docSnap.exists()) {
        setPlaylists(docSnap.data().playlists || []);
      }
    }
  };

  return (
    <PlaylistContext.Provider
      value={{
        playlists,
        createPlaylist,
        deletePlaylist,
        addToPlaylist,
        removeFromPlaylist,
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