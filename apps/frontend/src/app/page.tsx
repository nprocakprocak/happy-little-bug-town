import { GroundGrid } from "../components/GroundGrid";

export default async function HomePage() {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/grid`, {
    cache: "no-store",
  });
  const { width, height } = await response.json();

  return (
    <main>
      <GroundGrid rows={height} cols={width} />
    </main>
  );
}
