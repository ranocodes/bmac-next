import type { Metadata } from "next";
import { editorial } from "./editorial-font";
import GetInvolvedClient from "./GetInvolvedClient";

export const metadata: Metadata = {
  title: "Get Involved",
  description:
    "Join BMAC as a member, volunteer, school chapter, donor or partner — and help empower young minds in Jos, Nigeria.",
  alternates: { canonical: "/get-involved" },
};

export default function GetInvolvedPage() {
  return (
    <div className={editorial.variable}>
      <GetInvolvedClient />
    </div>
  );
}
