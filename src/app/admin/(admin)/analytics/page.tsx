import type { Metadata } from "next";
import AnalyticsClient from "./AnalyticsClient";

export const metadata: Metadata = { title: "Analytics - BMAC Admin" };

export default function AnalyticsPage() {
  return <AnalyticsClient />;
}
