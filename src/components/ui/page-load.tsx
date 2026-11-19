import { PageSkeleton } from "@/components/ui/page-skeleton";
import { Suspense, type ReactNode } from "react";

export function PageLoad({
  children,
  message,
}: {
  children: ReactNode;
  message?: string;
}) {
  return <Suspense fallback={<PageSkeleton message={message} />}>{children}</Suspense>;
}
