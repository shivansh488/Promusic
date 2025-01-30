import { Card } from "@/components/ui/card";

export const LoadingState = () => {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Loading...</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {[...Array(10)].map((_, i) => (
          <Card key={i} className="bg-[#2a2a2a] border-none">
            <div className="p-4">
              <div className="w-full aspect-square bg-[#3a3a3a] animate-pulse rounded-md mb-4" />
              <div className="h-4 bg-[#3a3a3a] animate-pulse rounded mb-2" />
              <div className="h-3 bg-[#3a3a3a] animate-pulse rounded w-2/3" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};