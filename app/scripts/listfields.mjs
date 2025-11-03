import fs from "node:fs";
import { PDFDocument } from "pdf-lib";

const p = process.argv[2];
if (!p) {
  console.error("Uso: node scripts/listFields.mjs <ruta-al-pdf>");
  process.exit(1);
}

const bytes = fs.readFileSync(p);
const pdf = await PDFDocument.load(bytes);
const form = pdf.getForm();
for (const f of form.getFields()) {
  console.log(f.getName()); // imprime el nombre de cada campo del PDF
}
