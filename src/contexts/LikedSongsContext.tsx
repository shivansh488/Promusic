import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Track } from '@/lib/types';
import { db } from '@/lib/firebase';
import { useAuth } from './AuthContext';
import { 
  doc, 
  setDoc, 
  getDoc,
  updateDoc,
  arrayUnion, 
  arrayRemove 
} from 'firebase/firestore';

interface LikedSongsContextType {
  likedSongs: Track[];
  addToLikedSongs: (track: Track) => Promise<void>;
  removeFromLikedSongs: (track: Track) => Promise<void>;
  isLiked: (track: Track) => boolean;
}

const LikedSongsContext = createContext<LikedSongsContextType | null>(null);

export function LikedSongsProvider({ children }: { children: ReactNode }) {
  const [likedSongs, setLikedSongs] = useState<Track[]>([]);
  const { user } = useAuth();

  // Load liked songs from Firebase when user logs in
  useEffect(() => {
    const loadLikedSongs = async () => {
      if (user) {
        try {
          const userDoc = doc(db, 'users', user.uid);
          const docSnap = await getDoc(userDoc);
          
          if (docSnap.exists()) {
            const data = docSnap.data();
            setLikedSongs(data.likedSongs || []);
          } else {
            // Create user document if it doesn't exist
            await setDoc(userDoc, { likedSongs: [] });
            setLikedSongs([]);
          }
        } catch (error) {
          console.error('Error loading liked songs:', error);
          setLikedSongs([]);
        }
      } else {
        setLikedSongs([]); // Clear liked songs when user logs out
      }
    };

    loadLikedSongs();
  }, [user]);

  const addToLikedSongs = async (track: Track) => {
    if (!user) return;
    try {
      const userDoc = doc(db, 'users', user.uid);
      // First update local state
      setLikedSongs(prev => [...prev, track]);
      // Then update Firebase
      await updateDoc(userDoc, {
        likedSongs: arrayUnion({
          id: track.id,
          name: track.name,
          primaryArtists: track.primaryArtists,
          image: track.image,
          downloadUrl: track.downloadUrl
        })
      });
    } catch (error) {
      console.error('Error adding song to liked songs:', error);
      // Revert local state if Firebase update fails
      setLikedSongs(prev => prev.filter(t => t.id !== track.id));
    }
  };

  const removeFromLikedSongs = async (track: Track) => {
    if (!user) return;
    try {
      const userDoc = doc(db, 'users', user.uid);
      // First update local state
      setLikedSongs(prev => prev.filter(t => t.id !== track.id));
      // Then update Firebase
      await updateDoc(userDoc, {
        likedSongs: arrayRemove({
          id: track.id,
          name: track.name,
          primaryArtists: track.primaryArtists,
          image: track.image,
          downloadUrl: track.downloadUrl
        })
      });
    } catch (error) {
      console.error('Error removing song from liked songs:', error);
      // Revert local state if Firebase update fails
      const docSnap = await getDoc(doc(db, 'users', user.uid));
      if (docSnap.exists()) {
        setLikedSongs(docSnap.data().likedSongs || []);
      }
    }
  };

  const isLiked = (track: Track): boolean => {
    return likedSongs.some(t => t.id === track.id);
  };

  return (
    <LikedSongsContext.Provider
      value={{
        likedSongs,
        addToLikedSongs,
        removeFromLikedSongs,
        isLiked,
      }}
    >
      {children}
    </LikedSongsContext.Provider>
  );
}

export function useLikedSongs() {
  const context = useContext(LikedSongsContext);
  if (!context) {
    throw new Error('useLikedSongs must be used within a LikedSongsProvider');
  }
  return context;
}