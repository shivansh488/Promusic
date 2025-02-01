import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";

interface PlaylistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  playlists: any[];
  onPlaylistSelect: (playlistId: string) => void;
}

export const PlaylistDialog = ({
  open,
  onOpenChange,
  playlists,
  onPlaylistSelect,
}: PlaylistDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1a1a1a] text-white border-none">
        <DialogHeader>
          <DialogTitle>Add to Playlist</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-1">
            {playlists.map((playlist) => (
              <Card
                key={playlist.id}
                className="p-3 flex items-center justify-between bg-[#2a2a2a] hover:bg-[#3a3a3a] border-none cursor-pointer"
                onClick={() => onPlaylistSelect(playlist.id)}
              >
                <div>
                  <h3 className="font-medium text-sm">{playlist.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {playlist.songs.length} songs
                  </p>
                </div>
                <Plus className="h-4 w-4" />
              </Card>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};