import { NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const templatePath = path.join(process.cwd(), 'public', 'i-589-original.pdf');
  const templateBytes = fs.readFileSync(templatePath);
  const pdfDoc = await PDFDocument.load(templateBytes);
  const form = pdfDoc.getForm();

  const fields = form.getFields().map(f => {
    const type = f.constructor.name; // PDFTextField, PDFCheckBox, PDFRadioGroup, etc.
    const name = f.getName();
    return { name, type };
  });

  return NextResponse.json({ ok: true, fields });
}
