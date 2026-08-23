import type { Metadata } from "next";
import DonorLookupClient from "./DonorLookupClient";

export const metadata: Metadata = {
  title: "Donor Lookup",
  description:
    "Look up your donation history and receipts with BMAC Jos using your email address.",
  alternates: { canonical: "/donor-lookup" },
};

export default function DonorLookupPage() {
  return <DonorLookupClient />;
}
