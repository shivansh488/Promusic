import { AlbumCard } from "./AlbumCard";

type Album = {
  id: string;
  name: string;
  image: { link: string }[];
  songs: any[];
};

type AlbumSectionProps = {
  title: string;
  albums: Album[];
  onAlbumClick: (album: Album) => void;
};

export const AlbumSection = ({ title, albums, onAlbumClick }: AlbumSectionProps) => {
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">{title}</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {albums?.slice(0, 5).map((album) => (
          <AlbumCard
            key={album.id}
            album={album}
            onClick={() => onAlbumClick(album)}
          />
        ))}
      </div>
    </section>
  );
};