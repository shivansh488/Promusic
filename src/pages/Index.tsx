import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

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
  
  if (response.status === 403) {
    throw new Error('CORS_PROXY_NEEDS_UNLOCK');
  }
  
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
    if ((error as Error).message === 'CORS_PROXY_NEEDS_UNLOCK') {
      return (
        <div className="p-8">
          <Alert className="max-w-2xl mb-6">
            <AlertTitle className="text-lg">One-time Setup Required</AlertTitle>
            <AlertDescription className="mt-2">
              <p className="mb-4">
                To access music data, you need to temporarily unlock our CORS proxy service. This is a one-time step:
              </p>
              <ol className="list-decimal list-inside space-y-2 mb-4">
                <li>Click the button below to visit the CORS Anywhere demo page</li>
                <li>Click the "Request temporary access" button on that page</li>
                <li>Return here and refresh this page</li>
              </ol>
              <Button asChild>
                <a 
                  href="https://cors-anywhere.herokuapp.com/corsdemo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  Visit CORS Anywhere Demo <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      );
    }
    
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