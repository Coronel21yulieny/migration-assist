import { PDFDocument, PDFField } from "pdf-lib";

function get(obj: any, path: string) {
  return path.split(".").reduce((o, k) => (o ? o[k] : undefined), obj);
}

function getFieldByName(form: any, name: string): PDFField | undefined {
  const fields = form.getFields?.() ?? [];
  for (const f of fields) {
    // @ts-ignore
    if (f.getName && f.getName() === name) return f as PDFField;
  }
  return undefined;
}

export async function fillPdf(
  templateBytes: Uint8Array,
  data: any,
  mapping: Record<string, string>
) {
  const pdf = await PDFDocument.load(templateBytes);
  const form = pdf.getForm();
  for (const [fieldName, path] of Object.entries(mapping)) {
    const v = get(data, path);
    if (v === undefined || v === null) continue;
    const f = getFieldByName(form, fieldName);
    if (!f) continue;
    // @ts-ignore
    if (typeof (f as any).setText === "function") (f as any).setText(String(v));
  }
  form.updateFieldAppearances();
  return await pdf.save();
}
