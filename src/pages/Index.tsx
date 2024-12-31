import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

async function fetchTrendingTracks() {
  const response = await fetch(
    "https://jiosaavn-api-privatecvc2.vercel.app/trending/songs",
    {
      method: 'GET',
    }
  );
  
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  
  const data = await response.json();
  console.log("API Response:", data); // Debug log
  
  if (!data.data) {
    throw new Error('Invalid data format received from API');
  }
  
  return data.data || [];
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
    console.error("Error fetching tracks:", error); // Debug log
    return (
      <div className="p-8">
        <Alert className="max-w-2xl mb-6">
          <AlertTitle className="text-lg">Error Loading Music</AlertTitle>
          <AlertDescription>
            There was an error loading the music tracks. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-8 pb-32">
      <h1 className="text-3xl font-bold mb-6">Trending Hindi & English Songs</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {tracks?.map((track: any) => (
          <Card key={track.id} className="group hover:bg-secondary/50 transition-colors">
            <div className="p-4">
              <img
                src={track.image[2].link}
                alt={track.name}
                className="w-full aspect-square object-cover rounded-md mb-4"
              />
              <h3 className="font-medium truncate">{track.name}</h3>
              <p className="text-sm text-muted-foreground truncate">
                {track.primaryArtists}
              </p>
              <audio 
                src={track.downloadUrl[4].link} 
                className="w-full mt-4" 
                controls
              />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default Index;