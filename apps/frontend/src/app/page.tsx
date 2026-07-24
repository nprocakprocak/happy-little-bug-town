import { GroundGrid } from "../components/ground-grid/GroundGrid";
import { HomeBanner } from "../components/home/HomeBanner";
import { GROUND_GRID_MAX_WIDTH_PX } from "../constants";

export default async function HomePage() {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/grid`, {
    cache: "no-store",
  });
  const { width, height } = await response.json();

  return (
    <main className="flex w-full flex-col items-center">
      <div
        className="w-full"
        style={{ containerType: "inline-size", maxWidth: GROUND_GRID_MAX_WIDTH_PX }}
      >
        <HomeBanner />
        <GroundGrid rows={height} cols={width} />
      </div>
    </main>
  );
}
