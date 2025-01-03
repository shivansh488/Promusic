import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Track } from '@/lib/types';
import { db } from '@/lib/firebase';
import { useAuth } from './AuthContext';
import { 
  doc, 
  setDoc, 
  getDoc, 
  arrayUnion, 
  arrayRemove 
} from 'firebase/firestore';

interface LikedSongsContextType {
  likedSongs: Track[];
  addToLikedSongs: (track: Track) => void;
  removeFromLikedSongs: (track: Track) => void;
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
        const userDoc = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userDoc);
        
        if (docSnap.exists()) {
          setLikedSongs(docSnap.data().likedSongs || []);
        } else {
          // Create user document if it doesn't exist
          await setDoc(userDoc, { likedSongs: [] });
        }
      } else {
        setLikedSongs([]); // Clear liked songs when user logs out
      }
    };

    loadLikedSongs();
  }, [user]);

  const addToLikedSongs = async (track: Track) => {
    if (user) {
      const userDoc = doc(db, 'users', user.uid);
      await setDoc(userDoc, {
        likedSongs: arrayUnion(track)
      }, { merge: true });
      
      setLikedSongs((prev) => [...prev, track]);
    }
  };

  const removeFromLikedSongs = async (track: Track) => {
    if (user) {
      const userDoc = doc(db, 'users', user.uid);
      await setDoc(userDoc, {
        likedSongs: arrayRemove(track)
      }, { merge: true });
      
      setLikedSongs((prev) => prev.filter((t) => t.id !== track.id));
    }
  };

  const isLiked = (track: Track) => {
    return likedSongs.some((t) => t.id === track.id);
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