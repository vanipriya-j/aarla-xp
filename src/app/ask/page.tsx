import { AskExperience } from "@/components/recommendations/ask-experience";
import { AskLoading } from "@/components/recommendations/ask-loading";
import { Suspense } from "react";

export default function AskPage() {
  return (
    <Suspense fallback={<AskLoading />}>
      <AskExperience />
    </Suspense>
  );
}
