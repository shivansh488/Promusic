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

interface LikedSongsContextType {
  likedSongs: Track[];
  addToLikedSongs: (track: Track) => Promise<void>;
  removeFromLikedSongs: (track: Track) => Promise<void>;
  isLiked: (track: Track) => boolean;
  isLoading: boolean;
  isProcessing: (trackId: string) => boolean;
}

const LikedSongsContext = createContext<LikedSongsContextType | null>(null);

export function LikedSongsProvider({ children }: { children: ReactNode }) {
  const [likedSongs, setLikedSongs] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingTracks, setProcessingTracks] = useState<Set<string>>(new Set());
  const { user } = useAuth();

  // Load liked songs from Firebase when user logs in
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const setupListener = async () => {
      if (!user) {
        setLikedSongs([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const userDocRef = doc(db, 'users', user.uid);

        // Set up real-time listener first
        unsubscribe = onSnapshot(
          userDocRef,
          async (docSnapshot) => {
            if (docSnapshot.exists()) {
              const data = docSnapshot.data();
              setLikedSongs(data.likedSongs || []);
            } else {
              // Create initial document if it doesn't exist
              const initialData = {
                uid: user.uid,
                email: user.email,
                likedSongs: [],
                playlists: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              };
              try {
                await setDoc(userDocRef, initialData);
                setLikedSongs([]);
              } catch (error) {
                console.error('Error creating initial user document:', error);
              }
            }
            setIsLoading(false);
          },
          (error) => {
            console.error('Error listening to liked songs:', error);
            setLikedSongs([]);
            setIsLoading(false);
          }
        );
      } catch (error) {
        console.error('Error setting up liked songs listener:', error);
        setLikedSongs([]);
        setIsLoading(false);
      }
    };

    // Call setupListener immediately when user changes
    setupListener();

    // Cleanup function
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user]);

  const addToLikedSongs = async (track: Track) => {
    if (!user) return;
    
    // Prevent multiple clicks while processing
    if (processingTracks.has(track.id)) return;
    
    try {
      setProcessingTracks(prev => new Set(prev).add(track.id));
      const userDocRef = doc(db, 'users', user.uid);

      // Check if song is already liked in local state
      if (likedSongs.some(s => s.id === track.id)) {
        return;
      }

      const trackToAdd = {
        id: track.id,
        name: track.name,
        primaryArtists: track.primaryArtists,
        image: track.image || [],
        downloadUrl: track.downloadUrl || []
      };

      // Update local state first
      setLikedSongs(prev => [...prev, trackToAdd]);

      // Then try to update Firestore
      const docSnap = await getDoc(userDocRef);

      if (!docSnap.exists()) {
        await setDoc(userDocRef, {
          uid: user.uid,
          email: user.email,
          likedSongs: [trackToAdd],
          playlists: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      } else {
        const currentData = docSnap.data();
        const currentLikedSongs = currentData.likedSongs || [];

        if (!currentLikedSongs.some((s: Track) => s.id === track.id)) {
          await updateDoc(userDocRef, {
            likedSongs: [...currentLikedSongs, trackToAdd],
            updatedAt: new Date().toISOString()
          });
        }
      }
    } catch (error) {
      console.error('Error adding song to liked songs:', error);
      if (!(error instanceof Error && error.message.includes('offline'))) {
        setLikedSongs(prev => prev.filter(s => s.id !== track.id));
      } else {
        console.log('Currently offline. Changes will sync when online.');
      }
    } finally {
      setProcessingTracks(prev => {
        const next = new Set(prev);
        next.delete(track.id);
        return next;
      });
    }
  };

  const removeFromLikedSongs = async (track: Track) => {
    if (!user) return;
    
    // Prevent multiple clicks while processing
    if (processingTracks.has(track.id)) return;
    
    try {
      setProcessingTracks(prev => new Set(prev).add(track.id));
      const userDocRef = doc(db, 'users', user.uid);

      // Optimistically update the UI
      setLikedSongs(prev => prev.filter(s => s.id !== track.id));

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
      // Revert optimistic update on error
      setLikedSongs(prev => [...prev, track]);
      console.error('Error removing song from liked songs:', error);
    } finally {
      setProcessingTracks(prev => {
        const next = new Set(prev);
        next.delete(track.id);
        return next;
      });
    }
  };

  const isLiked = (track: Track): boolean => {
    if (!track?.id || !likedSongs?.length) return false;
    return likedSongs.some(likedTrack => likedTrack.id === track.id);
  };

  const isProcessing = (trackId: string): boolean => {
    return processingTracks.has(trackId);
  };

  return (
    <LikedSongsContext.Provider
      value={{
        likedSongs,
        addToLikedSongs,
        removeFromLikedSongs,
        isLiked,
        isLoading,
        isProcessing
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