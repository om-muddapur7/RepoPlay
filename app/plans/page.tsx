import { PlansSection } from "../../components/plans-section";

import type { Metadata } from "next";
export const metadata: Metadata = { title: "Pricing", description: "Plans for previewing GitHub projects with RepoPlay." };

export default function Plans() {
  return <PlansSection />;
}
