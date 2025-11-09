import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUserId } from '@/lib/auth';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import fs from 'fs';
import path from 'path';

// 👇 NUEVO: importamos el mapper
// 👇 NUEVO: importamos el mapper (ruta correcta)
import { textMap, checkMap, radioMap, getProp, isOn } from '@/lib/mappings/pdfMap-i589';

export const runtime = 'nodejs';       // asegura Node APIs (fs/path)
export const revalidate = 0;           // no cache para esta ruta

const COOKIE_NAME = 'i589_case';

export async function GET(req: NextRequest) {
  try {
    // 1) autenticación
    const userId = getCurrentUserId(req);
    if (!userId) {
      return NextResponse.json({ ok: false, error: 'UNAUTHENTICATED' }, { status: 401 });
    }

    // 2) case id desde cookie
    const caseId = req.cookies.get(COOKIE_NAME)?.value;
    if (!caseId) {
      return NextResponse.json({ ok: false, error: 'NO_CASE_ID' }, { status: 400 });
    }

    // 3) datos del caso
    const c = await prisma.case.findFirst({
      where: { id: caseId, ownerId: userId, type: 'I589' as any },
      select: { id: true, data: true },
    });
    if (!c) {
      return NextResponse.json({ ok: false, error: 'CASE_NOT_FOUND' }, { status: 404 });
    }

    // 4) cargar plantilla desde /public
    const templatePath = path.join(process.cwd(), 'public', 'i-589-original.pdf');
    if (!fs.existsSync(templatePath)) {
      return NextResponse.json({ ok: false, error: 'PDF_TEMPLATE_NOT_FOUND' }, { status: 500 });
    }

    const templateBytes = fs.readFileSync(templatePath);
    const pdfDoc = await PDFDocument.load(templateBytes);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // 5) rellenar campos con el MAPPER
    const form = pdfDoc.getForm();
    const d: any = c.data || {};

    // TEXTOS
    for (const { pdf, path } of textMap) {
      try {
        const val = getProp(d, path);
        form.getTextField(pdf).setText(val ?? '');
      } catch {}
    }

    // CHECKBOXES
    for (const { pdf, path } of checkMap) {
      try {
        const val = getProp(d, path);
        const cb = form.getCheckBox(pdf);
        isOn(val) ? cb.check() : cb.uncheck();
      } catch {}
    }

    // RADIOS
    for (const { pdfGroup, path } of radioMap) {
      try {
        const val = getProp(d, path);
        if (val != null) form.getRadioGroup(pdfGroup).select(String(val));
      } catch {}
    }

    form.updateFieldAppearances(font);

    // 6) generar bytes y responder descarga
    const pdfBytes = await pdfDoc.save();

    return new NextResponse(
      new Uint8Array(pdfBytes), // convierte ArrayBuffer a Uint8Array
      {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="I-589_${c.id}.pdf"`,
          'Cache-Control': 'no-store',
        },
      }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
