"use client";

import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/cn";
import Link from "next/link";
import { useLinkStatus } from "next/link";
import type { ComponentProps, ReactNode } from "react";

export function PendingLink({
  children,
  pendingLabel,
  className,
  ...props
}: ComponentProps<typeof Link> & { pendingLabel?: string }) {
  return (
    <Link {...props} className={className}>
      <PendingBody pendingLabel={pendingLabel}>{children}</PendingBody>
    </Link>
  );
}

function PendingBody({
  children,
  pendingLabel,
}: {
  children: ReactNode;
  pendingLabel?: string;
}) {
  const { pending } = useLinkStatus();
  if (!pending) return children;
  if (!pendingLabel) {
    return <span className="inline-flex items-center gap-2 opacity-70">{children}</span>;
  }
  return (
    <span className={cn("inline-flex items-center gap-2")}>
      <Spinner className="h-3.5 w-3.5" />
      {pendingLabel}
    </span>
  );
}
