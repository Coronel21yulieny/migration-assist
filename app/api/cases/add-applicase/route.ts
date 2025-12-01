// app/api/cases/add-applicase/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserIdFromHeader } from "@/lib/server-auth";

export const runtime = "nodejs";

type JsonObject = Record<string, unknown>;

const isPlainObject = (v: unknown): v is JsonObject =>
  typeof v === "object" && v !== null && !Array.isArray(v);

// Acepta type del body y lo normaliza a mayúsculas; por defecto I589
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

    // Body opcional
    const raw = (await req.json().catch(() => ({}))) as unknown;
    const payload: JsonObject = isPlainObject(raw) ? raw : {};

    const caseType = normalizeCaseType(payload["type"]);

    // =====================================================================
    // 1) ¿YA EXISTE UN CASO EN BORRADOR (DRAFT) PARA ESTE USUARIO Y TIPO?
    // =====================================================================
    const existing = await prisma.case.findFirst({
      where: {
        ownerId: userId,
        type: caseType as any,   // enum/string según tu schema
        status: "DRAFT" as any,  // enum/string
      },
      select: { id: true },      // 👈 YA NO PEDIMOS `data`
    });

    if (existing) {
      // Reutilizamos el borrador existente
      return NextResponse.json({
        ok: true,
        id: existing.id,
        created: false,
        type: caseType,
      });
    }

    // =====================================================================
    // 2) SI NO EXISTE, CREAMOS UN NUEVO CASO EN ESTADO DRAFT
    // =====================================================================
    const created = await prisma.case.create({
      data: {
        ownerId: userId,
        type: caseType as any,   // enum/string
        status: "DRAFT" as any,  // enum/string
      },
      select: { id: true },
    } as any); // 👈 cast global para evitar que Prisma/TS se queje

    return NextResponse.json({
      ok: true,
      id: created.id,
      created: true,
      type: caseType,
    });
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "ADD_APPLICASE_ERROR";
    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 }
    );
  }
}
