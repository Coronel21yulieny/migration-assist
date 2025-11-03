const fs = require("node:fs");
const { PDFDocument } = require("pdf-lib");

const p = process.argv[2];
if (!p) {
  console.error("Uso: node scripts/listfields.cjs <ruta-al-pdf>");
  process.exit(1);
}

(async () => {
  const bytes = fs.readFileSync(p);
  const pdf = await PDFDocument.load(bytes);
  const form = pdf.getForm();
  for (const f of form.getFields()) {
    console.log(f.getName());
  }
})();
