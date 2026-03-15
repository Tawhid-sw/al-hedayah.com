import { getQuran } from "@/lib/quran/quran.ts";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/sampel")({
  loader: async () => await getQuran.chapters.findAll(),
  component: RouteComponent,
});

function RouteComponent() {
  const data = Route.useLoaderData();
  console.log(data[0].versesCount);

  // Guard for low-end devices: Don't try to render if data is still hydrating

  return (
    <div>
      {/* <h1>Total Surahs: {data.length}</h1> */}
      {/* Your list logic goes here */}
    </div>
  );
}
