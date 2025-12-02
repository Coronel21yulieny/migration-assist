// app/api/cases/add-applicase/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserIdFromHeader } from "@/lib/server-auth";

export const runtime = "nodejs";

type JsonObject = Record<string, unknown>;
const isPlainObject = (v: unknown): v is JsonObject =>
  typeof v === "object" && v !== null && !Array.isArray(v);

/** Normaliza tipo de caso; default="I589" */
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

    // Buscar si YA hay un borrador DRAFT de ese tipo
    const existing = await prisma.case.findFirst({
      where: {
        ownerId: userId,
        type: caseType as any,
        status: "DRAFT" as any,
      },
      select: { id: true }, // 👈 ya no pide data
    });

    if (existing) {
      return NextResponse.json({
        ok: true,
        id: existing.id,
        created: false,
        type: caseType,
      });
    }

    // Si no existe, creamos un nuevo DRAFT vacío
    const created = await prisma.case.create({
      data: {
        ownerId: userId,
        type: caseType as any,
        status: "DRAFT" as any,
      },
      select: { id: true },
    } as any); // 👈 cast para que TS/Prisma no marquen error de tipo

    return NextResponse.json({
      ok: true,
      id: created.id,
      created: true,
      type: caseType,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "ADD_APPLICASE_ERROR";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
