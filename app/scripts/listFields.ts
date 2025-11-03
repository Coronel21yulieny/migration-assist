import fs from "fs";
import { PDFDocument } from "pdf-lib";

async function run(p: string) {
  const bytes = fs.readFileSync(p);
  const pdf = await PDFDocument.load(bytes);
  const form = pdf.getForm();
  for (const f of form.getFields()) {
    // @ts-ignore
    console.log(f.getName());
  }
}
run(process.argv[2]!).catch(console.error);
