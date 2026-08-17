import { AppShell } from "@/components/layout/app-shell";
import { IMG } from "@/lib/images";
import type { ReactNode } from "react";

export function AppFrame({ children }: { children: ReactNode }) {
  return (
    <AppShell personName="Vanipriya" locationLabel="Chennai, India" avatarUrl={IMG.portrait}>
      {children}
    </AppShell>
  );
}
