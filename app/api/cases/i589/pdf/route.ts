// app/api/cases/i589/pdf/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";

export const runtime = "nodejs";
export const revalidate = 0;

const COOKIE_NAME = "i589_case";

export async function GET(req: NextRequest) {
  try {
    const userId = getCurrentUserId(req);
    if (!userId) {
      return NextResponse.json(
        { ok: false, error: "UNAUTHENTICATED" },
        { status: 401 }
      );
    }

    const caseId = req.cookies.get(COOKIE_NAME)?.value;
    if (!caseId) {
      return NextResponse.json(
        { ok: false, error: "NO_CASE_ID" },
        { status: 400 }
      );
    }

    const c = await prisma.case.findFirst({
      where: { id: caseId, ownerId: userId, type: "I589" as any },
      select: { id: true }, // 👈 AQUÍ SOLO id, NUNCA data
    });

    if (!c) {
      return NextResponse.json(
        { ok: false, error: "CASE_NOT_FOUND" },
        { status: 404 }
      );
    }

    // Para la demo: solo confirmamos que el caso existe.
    return NextResponse.json({
      ok: true,
      caseId: c.id,
      message:
        "Ruta PDF activa. (La generación del PDF está deshabilitada en esta versión demo.)",
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { ok: false, error: msg },
      { status: 500 }
    );
  }
}
