import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Track } from '@/lib/types';
import { db } from '@/lib/firebase';
import { useAuth } from './AuthContext';
import { 
  doc, 
  setDoc,
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  query,
  where,
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

export function useLikedSongs() {
  const context = useContext(LikedSongsContext);
  if (!context) {
    throw new Error('useLikedSongs must be used within a LikedSongsProvider');
  }
  return context;
}

export function LikedSongsProvider({ children }: { children: ReactNode }) {
  const [likedSongs, setLikedSongs] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingTracks, setProcessingTracks] = useState<Set<string>>(new Set());
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setLikedSongs([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const userLikedSongsRef = collection(db, 'users', user.uid, 'likedSongs');
    
    // Set up real-time listener for liked songs
    const unsubscribe = onSnapshot(userLikedSongsRef, 
      (snapshot) => {
        const songs: Track[] = [];
        snapshot.forEach((doc) => {
          songs.push({ id: doc.id, ...doc.data() } as Track);
        });
        setLikedSongs(songs);
        setIsLoading(false);
      },
      (error) => {
        console.error('Error fetching liked songs:', error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const addToLikedSongs = async (track: Track) => {
    if (!user) return;
    
    try {
      setProcessingTracks(prev => new Set(prev).add(track.id));
      const userLikedSongsRef = collection(db, 'users', user.uid, 'likedSongs');
      
      // Add the song to Firestore
      await setDoc(doc(userLikedSongsRef, track.id), {
        name: track.name,
        primaryArtists: track.primaryArtists,
        image: track.image || [],
        downloadUrl: track.downloadUrl || [],
        albumInfo: track.albumInfo || null,
        playlistInfo: track.playlistInfo || null,
        addedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error adding song to liked songs:', error);
      throw error;
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
    
    try {
      setProcessingTracks(prev => new Set(prev).add(track.id));
      const songRef = doc(db, 'users', user.uid, 'likedSongs', track.id);
      await deleteDoc(songRef);
    } catch (error) {
      console.error('Error removing song from liked songs:', error);
      throw error;
    } finally {
      setProcessingTracks(prev => {
        const next = new Set(prev);
        next.delete(track.id);
        return next;
      });
    }
  };

  const isLiked = (track: Track): boolean => {
    return likedSongs.some(song => song.id === track.id);
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