import { submitLeisurePrompt } from "@/application/contracts";
import { ensureSeeded } from "@/db/ensure";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  await ensureSeeded();
  const body = (await request.json()) as { text?: string; circleId?: string; personId?: string };
  if (!body.text?.trim()) {
    return NextResponse.json({ error: "text is required" }, { status: 400 });
  }
  const result = await submitLeisurePrompt({
    text: body.text,
    circleId: body.circleId,
    personId: body.personId,
  });
  return NextResponse.json(result);
}
