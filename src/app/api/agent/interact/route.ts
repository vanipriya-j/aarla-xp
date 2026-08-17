import { recordInteraction } from "@/application/contracts";
import { ensureSeeded } from "@/db/ensure";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  await ensureSeeded();
  const body = (await request.json()) as {
    personId?: string;
    type: string;
    targetType: string;
    targetId: string;
    reason?: string;
    circleId?: string;
  };
  const result = await recordInteraction(body);
  return NextResponse.json(result);
}
