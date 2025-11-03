import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../src/lib/db";
import { normalizeIntake } from "../../../src/lib/ai";
import { I589Schema, I765Schema } from "../../../src/lib/zodSchemas";


function isMockMode() {
  const k = process.env.OPENAI_API_KEY || "";
  return !k || k === "tu-api-key-aqui";
}

function mockData(form: "i589" | "i765") {
  if (form === "i589") {
    return I589Schema.parse({
      applicant: { familyName: "Apellido", givenName: "Nombre", dob: "1990-01-01", pobCountry: "Pais", citizenship: "Pais" },
      usAddress: { line1: "123 Main St", city: "City", state: "CA", zip: "90001" },
      defensive: false,
      narrative: "Narrativa de ejemplo para pruebas locales (30+ caracteres).",
      dependents: [],
    });
  }
  return I765Schema.parse({
    category: "c8",
    applicant: { familyName: "Apellido", givenName: "Nombre", dob: "1990-01-01", pobCountry: "Pais", citizenship: "Pais" },
    usAddress: { line1: "123 Main St", city: "City", state: "CA", zip: "90001" },
    ssnRequested: false,
  });
}

export async function POST(req: NextRequest) {
  try {
    const { narrative, form } = (await req.json()) as { narrative: string; form: "i589" | "i765" };
    if (!["i589", "i765"].includes(form)) return new NextResponse("Formulario inválido", { status: 400 });

    const normalized = isMockMode() ? mockData(form) : await normalizeIntake(narrative, form);

    const created = await prisma.case.create({
      data: {
        type: form === "i589" ? "I589" : "I765",
        data: normalized,
        owner: {
          connectOrCreate: {
            where: { email: "demo@local" },
            create: { email: "demo@local", hash: "" },
          },
        },
      },
    });

    return NextResponse.json({ caseId: created.id, data: normalized });
  } catch (e) {
    console.error(e);
    return new NextResponse("Error procesando la solicitud", { status: 500 });
  }
}
