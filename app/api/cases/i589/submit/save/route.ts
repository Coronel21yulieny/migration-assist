// app/api/cases/i589/submit/save/route.ts
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

    // Acepta { patch: {...} } o directamente un objeto
    const raw = (await req.json().catch(() => ({}))) as unknown;
    const maybeObj = isPlainObject(raw) ? raw : {};
    const patch: JsonObject = isPlainObject((maybeObj as any).patch)
      ? ((maybeObj as any).patch as JsonObject)
      : isPlainObject(maybeObj)
      ? (maybeObj as JsonObject)
      : {};

    // Busca draft I-589 del usuario
    const existing = await prisma.case.findFirst({
      where: { ownerId: userId, type: "I589" as any, status: "DRAFT" as any },
      select: { id: true, data: true },
    });

    const existingData: JsonObject = isPlainObject(existing?.data)
      ? (existing!.data as JsonObject)
      : {};

    // ✅ Merge seguro (solo objetos)
    const merged: JsonObject = { ...existingData, ...patch };

    // Upsert sencillo
    const rec = existing
      ? await prisma.case.update({
          where: { id: existing.id },
          data: { data: merged as any }, // cast puntual a JSON
          select: { id: true },
        })
      : await prisma.case.create({
          data: {
            ownerId: userId,
            type: "I589" as any,
            status: "DRAFT" as any,
            data: merged as any, // cast puntual a JSON
          },
          select: { id: true },
        });

    return NextResponse.json({ ok: true, id: rec.id });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "SAVE_ERROR";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
