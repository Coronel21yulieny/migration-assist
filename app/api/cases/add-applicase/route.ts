// app/api/cases/add-applicase/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserIdFromHeader } from "@/lib/server-auth";

export const runtime = "nodejs";

type JsonObject = Record<string, unknown>;
const isPlainObject = (v: unknown): v is JsonObject =>
  typeof v === "object" && v !== null && !Array.isArray(v);

// Acepta type del body y lo normaliza a mayúsculas; default I589
function normalizeCaseType(v: unknown): string {
  return typeof v === "string" && v.trim()
    ? v.trim().toUpperCase()
    : "I589";
}

export async function POST(req: NextRequest) {
  try {
    const userId = getUserIdFromHeader(req);
    if (!userId) {
      return NextResponse.json(
        { ok: false, error: "UNAUTHENTICATED" },
        { status: 401 }
      );
    }

    const raw = (await req.json().catch(() => ({}))) as unknown;
    const payload: JsonObject = isPlainObject(raw) ? raw : {};

    const caseType = normalizeCaseType(payload["type"]);
    const initialData: JsonObject = isPlainObject(payload["initialData"])
      ? (payload["initialData"] as JsonObject)
      : {};

    // ¿Ya hay draft de este tipo?
    const existing = await prisma.case.findFirst({
      where: {
        ownerId: userId,
        type: caseType as any,
        status: "DRAFT" as any,
      },
      select: { id: true, data: true },
    });

    if (existing) {
      const merged: JsonObject = {
        ...(isPlainObject(existing.data) ? existing.data : {}),
        ...initialData,
      };

      const updated = await prisma.case.update({
        where: { id: existing.id },
        data: { data: merged as any }, // ✅ cast puntual
        select: { id: true },
      });

      return NextResponse.json({
        ok: true,
        id: updated.id,
        created: false,
        type: caseType,
      });
    }

    // Crea draft
    const created = await prisma.case.create({
      data: {
        ownerId: userId,
        type: caseType as any,       // ✅ enum cast
        status: "DRAFT" as any,      // ✅ enum cast
        data: initialData as any,     // ✅ JSON cast
      },
      select: { id: true },
    });

    return NextResponse.json({
      ok: true,
      id: created.id,
      created: true,
      type: caseType,
    });
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "ADD_APPLICASE_ERROR";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
