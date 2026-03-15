import { Suspense } from "react"; // 1. Import Suspense
import { createFileRoute } from "@tanstack/react-router";
import { HeroSection } from "@/components/hero/index";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shorter } from "@/components/ui/sort-toggle";
import { SurahList } from "@/components/surah-list";

export const Route = createFileRoute("/")({
  component: App,
});

// A simple Skeleton fallback for a smoother experience on slow CPUs
const SurahListSkeleton = () => (
  <div className="mt-6 animate-pulse">
    <div className="h-8 w-48 bg-gray-200 rounded mb-4"></div>
    {[...Array(6)].map((_, i) => (
      <div key={i} className="h-16 w-full bg-gray-100 rounded-lg mb-2"></div>
    ))}
  </div>
);

function App() {
  return (
    <div className="w-full">
      <HeroSection />
      <div>
        <div className="mt-8 flex items-center justify-between w-full">
          <div className="flex flex-1 items-center justify-end gap-4">
            <Tabs defaultValue="surah">
              <TabsList>
                <TabsTrigger value="surah">Surah</TabsTrigger>
                <TabsTrigger value="juz">Juz</TabsTrigger>
                <TabsTrigger value="Revelation_Order">
                  Revelation Order
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <Shorter a="Ascending" b="Descending" className="text-sm" />
          </div>
        </div>

        {/* 2. Wrap the list in Suspense */}
        <Suspense fallback={<SurahListSkeleton />}>
          <SurahList />
        </Suspense>
      </div>
    </div>
  );
}
