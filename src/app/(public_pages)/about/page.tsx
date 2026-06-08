import { mockStats } from "@/data/mock-data";
import AboutClient from "./AboutClient";

export default function AboutPage() {
  return (
    <main suppressHydrationWarning className="bg-background">
      <AboutClient impact={mockStats} />
    </main>
  );
}
