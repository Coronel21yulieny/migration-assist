// app/api/cases/i589/submit/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserIdFromHeader } from "@/lib/server-auth";

export const runtime = "nodejs";

type JsonObject = Record<string, unknown>;
const isPlainObject = (v: unknown): v is JsonObject =>
  typeof v === "object" && v !== null && !Array.isArray(v);

export async function POST(req: NextRequest) {
  try {
    const userId = getUserIdFromHeader(req);
    if (!userId) {
      return NextResponse.json(
        { ok: false, error: "UNAUTHENTICATED" },
        { status: 401 }
      );
    }

    // Body desde el front, normalizado a objeto
    const raw = (await req.json().catch(() => ({}))) as unknown;
    const body: JsonObject = isPlainObject(raw) ? raw : {};

    // Busca el draft I-589 del usuario
    const draft = await prisma.case.findFirst({
      where: { ownerId: userId, type: "I589" as any, status: "DRAFT" as any },
      select: { id: true, data: true },
    });

    if (!draft) {
      return NextResponse.json(
        { ok: false, error: "NO_DRAFT" },
        { status: 404 }
      );
    }

    // Merge seguro de JSON
    const draftData: JsonObject = isPlainObject(draft.data) ? draft.data : {};
    const finalData: JsonObject = { ...draftData, ...body };

    // Actualiza a READY_FOR_REVIEW y guarda el JSON final
    await prisma.case.update({
      where: { id: draft.id },
      data: {
        status: "READY_FOR_REVIEW" as any,
        data: finalData as any,
      },
    });

    return NextResponse.json({ ok: true, id: draft.id });
  } catch (e) {
    const message = e instanceof Error ? e.message : "SUBMIT_ERROR";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
