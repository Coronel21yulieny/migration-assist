// app/api/cases/i589/submit/save/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserIdFromHeader } from "@/lib/server-auth";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const userId = getUserIdFromHeader(req);
    if (!userId) {
      return NextResponse.json(
        { ok: false, error: "UNAUTHENTICATED" },
        { status: 401 }
      );
    }

    // El body puede traer parches de datos, pero en esta versión
    // ya NO los guardamos en el modelo Case porque no existe `data`.
    await req.json().catch(() => ({}));

    // 1) Buscar borrador existente de I-589
    const existing = await prisma.case.findFirst({
      where: {
        ownerId: userId,
        type: "I589" as any,
        status: "DRAFT" as any,
      },
      select: { id: true }, // 👈 SOLO id, nada de data
    });

    if (existing) {
      return NextResponse.json({
        ok: true,
        id: existing.id,
        created: false,
      });
    }

    // 2) Si no existe, creamos un nuevo DRAFT vacío
    const created = await prisma.case.create({
      data: {
        ownerId: userId,
        type: "I589" as any,
        status: "DRAFT" as any,
      },
      select: { id: true },
    });

    return NextResponse.json({
      ok: true,
      id: created.id,
      created: true,
    });
  } catch (e) {
    const msg =
      e instanceof Error ? e.message : "SUBMIT_SAVE_I589_ERROR";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
