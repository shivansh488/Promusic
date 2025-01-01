import { TrendingTracks } from "@/components/TrendingTracks";

const Index = () => {
  return (
    <div className="p-8 pb-32">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Trending Hindi & English Songs</h1>
      </div>
      <TrendingTracks />
    </div>
  );
};

export default Index;