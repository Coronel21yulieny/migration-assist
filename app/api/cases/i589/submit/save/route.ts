import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserIdFromHeader } from '@/lib/server-auth';
export async function POST(req: NextRequest) {
  try {
    const userId = getUserIdFromHeader(req);
    if (!userId) {
      return NextResponse.json({ ok: false, error: 'UNAUTHENTICATED' }, { status: 401 });
    }

    const { step, patch } = await req.json();
    if (!patch || typeof patch !== 'object') {
      return NextResponse.json({ ok: false, error: 'INVALID_PATCH' }, { status: 400 });
    }

    // Busca borrador I-589 del usuario
    const existing = await prisma.case.findFirst({
      where: { ownerId: userId, type: 'I589' as any, status: 'DRAFT' as any },
      select: { id: true, data: true },
    });

    const merged = { ...(existing?.data || {}), ...(patch || {}) };

    const rec = existing
      ? await prisma.case.update({
          where: { id: existing.id },
          data: { data: merged },
          select: { id: true },
        })
      : await prisma.case.create({
          data: {
            ownerId: userId,
            type: 'I589' as any,
            status: 'DRAFT' as any,
            data: merged,
          },
          select: { id: true },
        });

    // Cookie opcional para la ruta del PDF
    const res = NextResponse.json({ ok: true, caseId: rec.id });
    res.cookies.set('i589_case', rec.id, { httpOnly: false, sameSite: 'lax', path: '/' });
    return res;
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'SAVE_ERROR' }, { status: 500 });
  }
}
