import { mockStats } from "@/data/mock-data";
import HomeClient from "../HomeClient";

export default function HomePage() {
  return (
    <main suppressHydrationWarning className="bg-background">
      <HomeClient 
        stats={mockStats}
      />
    </main>
  );
}
