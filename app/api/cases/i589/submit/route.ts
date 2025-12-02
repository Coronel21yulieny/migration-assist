// app/api/cases/i589/submit/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserIdFromHeader } from "@/lib/server-auth";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const userId = getUserIdFromHeader(req);

    // El frontend manda todo el formulario, pero para la demo no lo usamos.
    const _body = await req.json().catch(() => ({}));

    // 1) Buscar borrador existente de I-589
    const draft = await prisma.case.findFirst({
      where: {
        type: "I589" as any,
        status: "DRAFT" as any,
        ...(userId ? { ownerId: userId } : {}),
      },
      select: { id: true }, // 👈 SOLO id, nada de data
    });

    let finalId: string;

    if (draft) {
      // 2) Actualizar el borrador y marcarlo como SUBMITTED
      const updated = await prisma.case.update({
        where: { id: draft.id },
        data: {
          status: "SUBMITTED" as any,
        },
        select: { id: true },
      });

      finalId = updated.id;
    } else {
      // 3) Si no hay borrador, crear un caso nuevo ya SUBMITTED
      const created = await prisma.case.create({
        data: {
          ownerId: userId || null,
          type: "I589" as any,
          status: "SUBMITTED" as any,
        },
        select: { id: true },
      });

      finalId = created.id;
    }

    return NextResponse.json({
      ok: true,
      id: finalId,
      status: "SUBMITTED",
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "SUBMIT_I589_ERROR";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
