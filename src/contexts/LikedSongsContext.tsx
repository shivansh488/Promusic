import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Track } from '@/lib/types';
import { db } from '@/lib/firebase';
import { useAuth } from './AuthContext';
import { 
  doc, 
  setDoc, 
  getDoc,
  updateDoc,
  collection,
  onSnapshot,
  runTransaction,
  enableIndexedDbPersistence
} from 'firebase/firestore';

interface LikedSongsContextType {
  likedSongs: Track[];
  addToLikedSongs: (track: Track) => Promise<void>;
  removeFromLikedSongs: (track: Track) => Promise<void>;
  isLiked: (track: Track) => boolean;
}

const LikedSongsContext = createContext<LikedSongsContextType | null>(null);

// Enable offline persistence
try {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
    } else if (err.code === 'unimplemented') {
      console.warn('The current browser does not support persistence.');
    }
  });
} catch (error) {
  console.warn('Error enabling persistence:', error);
}

export function LikedSongsProvider({ children }: { children: ReactNode }) {
  const [likedSongs, setLikedSongs] = useState<Track[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const { user } = useAuth();

  // Load liked songs from Firebase when user logs in
  useEffect(() => {
    let unsubscribe: () => void;

    const setupListener = async () => {
      if (!user) {
        setLikedSongs([]);
        setIsInitialized(false);
        return;
      }

      try {
        // First, ensure the user document exists
        const userDocRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userDocRef);

        if (!docSnap.exists()) {
          // Create initial document if it doesn't exist
          const initialData = {
            uid: user.uid,
            email: user.email,
            likedSongs: [],
            playlists: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          await setDoc(userDocRef, initialData);
        }

        // Set up real-time listener
        unsubscribe = onSnapshot(
          userDocRef,
          { includeMetadataChanges: true }, // This ensures we get updates even when offline
          (doc) => {
            if (doc.exists()) {
              const data = doc.data();
              setLikedSongs(data.likedSongs || []);
              if (!isInitialized) setIsInitialized(true);
            }
          },
          (error) => {
            console.error('Error listening to liked songs:', error);
            setLikedSongs([]);
          }
        );
      } catch (error) {
        console.error('Error setting up liked songs listener:', error);
        setLikedSongs([]);
      }
    };

    setupListener();

    // Cleanup subscription
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user]);

  const addToLikedSongs = async (track: Track) => {
    if (!user || !isInitialized) return;
    
    try {
      const userDocRef = doc(db, 'users', user.uid);

      // Use a simple update instead of transaction for better offline support
      const docSnap = await getDoc(userDocRef);
      if (!docSnap.exists()) {
        // Create document if it doesn't exist
        const initialData = {
          uid: user.uid,
          email: user.email,
          likedSongs: [track],
          playlists: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        await setDoc(userDocRef, initialData);
        return;
      }

      const currentData = docSnap.data();
      const currentLikedSongs = currentData.likedSongs || [];

      // Check if song is already liked
      if (currentLikedSongs.some((s: Track) => s.id === track.id)) {
        return;
      }

      const trackToAdd = {
        id: track.id,
        name: track.name,
        primaryArtists: track.primaryArtists,
        image: track.image || [],
        downloadUrl: track.downloadUrl || []
      };

      const updatedLikedSongs = [...currentLikedSongs, trackToAdd];

      await updateDoc(userDocRef, {
        likedSongs: updatedLikedSongs,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error adding song to liked songs:', error);
    }
  };

  const removeFromLikedSongs = async (track: Track) => {
    if (!user || !isInitialized) return;
    
    try {
      const userDocRef = doc(db, 'users', user.uid);

      // Use a simple update instead of transaction for better offline support
      const docSnap = await getDoc(userDocRef);
      if (!docSnap.exists()) return;

      const currentData = docSnap.data();
      const currentLikedSongs = currentData.likedSongs || [];
      const updatedLikedSongs = currentLikedSongs.filter((s: Track) => s.id !== track.id);

      await updateDoc(userDocRef, {
        likedSongs: updatedLikedSongs,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error removing song from liked songs:', error);
    }
  };

  const isLiked = (track: Track): boolean => {
    if (!track?.id || !likedSongs?.length || !isInitialized) return false;
    return likedSongs.some(likedTrack => likedTrack.id === track.id);
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