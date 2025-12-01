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
    const raw = (await req.json().catch(() => ({}))) as unknown;
    const body: JsonObject = isPlainObject(raw) ? raw : {};

    // Buscar un borrador existente (del usuario o general)
    let draft = await prisma.case.findFirst({
      where: {
        type: "I589",
        status: "DRAFT",
        ...(userId ? { ownerId: userId } : {}),
      },
      select: { id: true, data: true },
    });

    // Si no hay borrador, crear uno nuevo sin owner
    if (!draft) {
      draft = await prisma.case.create({
        data: {
          ownerId: userId ?? null,
          type: "I589",
          status: "DRAFT",
          data: {},
        },
        select: { id: true, data: true },
      });
    }

    // Fusionar datos previos con nuevos
    const merged = { ...(draft.data as JsonObject), ...body };

    // Actualizar estado y datos
    await prisma.case.update({
      where: { id: draft.id },
      data: {
        status: "READY_FOR_REVIEW",
        data: merged as any,
      },
    });

    return NextResponse.json({
      ok: true,
      id: draft.id,
      message: "Formulario enviado correctamente ✅",
    });
  } catch (e: any) {
    console.error("❌ Error en submit:", e);
    return NextResponse.json(
      { ok: false, error: e?.message || "SUBMIT_ERROR" },
      { status: 500 }
    );
  }
}
