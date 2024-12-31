import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";

const CORS_PROXY = "https://cors-anywhere.herokuapp.com/";

async function fetchTrendingTracks() {
  const response = await fetch(
    `${CORS_PROXY}https://api.deezer.com/chart/0/tracks?limit=20`,
    {
      headers: {
        'X-Requested-With': 'XMLHttpRequest'
      }
    }
  );
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  const data = await response.json();
  return data.data;
}

const Index = () => {
  const { data: tracks, isLoading, error } = useQuery({
    queryKey: ["trending-tracks"],
    queryFn: fetchTrendingTracks,
  });

  if (isLoading) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">Loading...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">Error loading tracks</h1>
        <p className="text-red-500">{(error as Error).message}</p>
      </div>
    );
  }

  return (
    <div className="p-8 pb-32">
      <h1 className="text-3xl font-bold mb-6">Trending Now</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {tracks?.map((track: any) => (
          <Card key={track.id} className="group hover:bg-secondary/50 transition-colors">
            <div className="p-4">
              <img
                src={track.album.cover_medium}
                alt={track.title}
                className="w-full aspect-square object-cover rounded-md mb-4"
              />
              <h3 className="font-medium truncate">{track.title}</h3>
              <p className="text-sm text-muted-foreground truncate">
                {track.artist.name}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default Index;