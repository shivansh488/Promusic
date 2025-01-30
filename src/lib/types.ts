export interface Track {
  id: string;
  name: string;
  primaryArtists: string;
  image: Array<{ link: string }>;
  downloadUrl: Array<{ link: string }>;
  albumInfo?: {
    name: string;
    id: string;
  };
  playlistInfo?: {
    name: string;
    id: string;
  };
}