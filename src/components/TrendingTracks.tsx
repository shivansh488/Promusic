import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { useLikedSongs } from "@/contexts/LikedSongsContext";
import { usePlaylist } from "@/contexts/PlaylistContext";
import { LoadingState } from "./trending/LoadingState";
import { ErrorState } from "./trending/ErrorState";
import { AlbumSection } from "./trending/AlbumSection";
import { SongList } from "./trending/SongList";
import { PlaylistDialog } from "./trending/PlaylistDialog";
import { fetchContent } from "@/lib/api/music-api";

type Album = {
  id: string;
  name: string;
  image: { link: string }[];
  songs: any[];
};

export const TrendingTracks = () => {
  const { data: content, isLoading, error } = useQuery({
    queryKey: ["music-content"],
    queryFn: fetchContent,
    retry: 3,
    staleTime: 5 * 60 * 1000,
  });
  
  const { playlists, addToPlaylist } = usePlaylist();
  const { addToLikedSongs, removeFromLikedSongs, isLiked, isProcessing } = useLikedSongs();
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [selectedSong, setSelectedSong] = useState<any>(null);

  const handleLikeClick = async (e: React.MouseEvent, song: any) => {
    e.stopPropagation();
    const trackData = {
      id: song.id,
      name: song.name,
      primaryArtists: song.primaryArtists,
      image: song.image,
      downloadUrl: song.downloadUrl
    };

    if (isProcessing(trackData.id)) return;

    try {
      if (isLiked(trackData)) {
        await removeFromLikedSongs(trackData);
      } else {
        await addToLikedSongs(trackData);
      }
    } catch (error) {
      console.error('Error handling like click:', error);
    }
  };

  const handleAddToPlaylist = (playlistId: string) => {
    if (selectedSong) {
      addToPlaylist(playlistId, selectedSong);
      setSelectedSong(null);
    }
  };

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">New</h1>
      <div className="space-y-12">
        <AlbumSection
          title="Happy New Year!"
          albums={content?.trending}
          onAlbumClick={setSelectedAlbum}
        />

        <AlbumSection
          title="New Releases"
          albums={content?.newReleases}
          onAlbumClick={setSelectedAlbum}
        />

        <AlbumSection
          title="Top Charts"
          albums={content?.charts}
          onAlbumClick={setSelectedAlbum}
        />
      </div>

      <Dialog open={!!selectedAlbum} onOpenChange={(open) => !open && setSelectedAlbum(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-[#1a1a1a] text-white border-none">
          {selectedAlbum && (
            <>
              <DialogHeader>
                <div className="flex items-start gap-4">
                  <img
                    src={selectedAlbum.image?.[2]?.link || selectedAlbum.image?.[0]?.link}
                    alt={selectedAlbum.name}
                    className="w-32 h-32 rounded-md object-cover"
                  />
                  <div className="flex-1">
                    <DialogTitle className="text-xl mb-2">{selectedAlbum.name}</DialogTitle>
                    <p className="text-sm text-muted-foreground">
                      {selectedAlbum.songs[0]?.primaryArtists}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedAlbum.songs.length} songs
                    </p>
                  </div>
                </div>
              </DialogHeader>

              <SongList
                songs={selectedAlbum.songs}
                onLikeClick={handleLikeClick}
                onAddToPlaylist={setSelectedSong}
                isProcessing={isProcessing}
                isLiked={isLiked}
              />
            </>
          )}
        </DialogContent>
      </Dialog>

      <PlaylistDialog
        open={!!selectedSong}
        onOpenChange={(open) => !open && setSelectedSong(null)}
        playlists={playlists}
        onPlaylistSelect={handleAddToPlaylist}
      />
    </div>
  );
};