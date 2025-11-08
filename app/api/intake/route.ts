// app/api/intake/route.ts
import { NextResponse } from "next/server";
import { normalizeIntake } from "@/lib/ai";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;

type SupportedForm = "i589" | "i765";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({} as any));
    const narrative = (body?.narrative ?? "") as string;
    const form = ((body?.form ?? "i589") as SupportedForm);

    const data = await normalizeIntake({ narrative, form });
    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (err: any) {
    console.error("[intake] API error:", err);
    return NextResponse.json(
      { success: false, error: err?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
