import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export const ExplorePage = () => {
  const genres = [
    { name: "Kpop", color: "bg-green-500" },
    { name: "Indie", color: "bg-pink-500" },
    { name: "R&B", color: "bg-blue-500" },
    { name: "Pop", color: "bg-orange-500" }
  ];

  const browseCategories = [
    { name: "Made for You", color: "bg-cyan-500" },
    { name: "RELEASED", color: "bg-purple-500" },
    { name: "Music Charts", color: "bg-blue-600" },
    { name: "Podcasts", color: "bg-red-500" },
    { name: "Bollywood", color: "bg-yellow-600" },
    { name: "Pop Fusion", color: "bg-green-600" }
  ];

  return (
    <ScrollArea className="h-full">
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6 text-cyan-400">Search</h1>
        
        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Songs, Artists, Podcasts & More..."
            className="pl-10 bg-[#2a2a2a] border-none h-12 text-base"
          />
        </div>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">Your Top Genres</h2>
          <div className="grid grid-cols-2 gap-4">
            {genres.map((genre) => (
              <Card
                key={genre.name}
                className={`${genre.color} border-none p-6 h-32 flex items-end`}
              >
                <h3 className="font-bold text-lg">{genre.name}</h3>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">Browse All</h2>
          <div className="grid grid-cols-2 gap-4">
            {browseCategories.map((category) => (
              <Card
                key={category.name}
                className={`${category.color} border-none p-6 h-32 flex items-end`}
              >
                <h3 className="font-bold text-lg">{category.name}</h3>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </ScrollArea>
  );
};