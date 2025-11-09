// app/api/cases/i589/submit/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserIdFromHeader } from '@/lib/server-auth';

export async function POST(req: NextRequest) {
  try {
    const userId = getUserIdFromHeader(req);
    if (!userId) {
      return NextResponse.json({ ok: false, error: 'UNAUTHENTICATED' }, { status: 401 });
    }

    // opcional: merge final con datos del front
    const body = await req.json().catch(() => ({}));

    const draft = await prisma.case.findFirst({
      where: { ownerId: userId, type: 'I589' as any, status: 'DRAFT' as any },
      select: { id: true, data: true },
    });

    if (!draft) {
      return NextResponse.json({ ok: false, error: 'NO_DRAFT' }, { status: 404 });
    }

    const finalData = { ...(draft.data || {}), ...(body || {}) };

    await prisma.case.update({
      where: { id: draft.id },
      data: { status: 'READY_FOR_REVIEW' as any, data: finalData },
    });

    return NextResponse.json({ ok: true, id: draft.id });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'SUBMIT_ERROR' }, { status: 500 });
  }
}
