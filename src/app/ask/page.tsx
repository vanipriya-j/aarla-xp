import { AskExperience } from "@/components/recommendations/ask-experience";
import { DEFAULT_ASK_QUERY } from "@/lib/constants";

export default async function AskPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const query = typeof params.q === "string" && params.q.trim() ? params.q : DEFAULT_ASK_QUERY;
  return <AskExperience query={query} />;
}
