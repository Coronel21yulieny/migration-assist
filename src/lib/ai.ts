import OpenAI from "openai";
import { I589Schema, I765Schema } from "./zodSchemas";

// Solo inicializa OpenAI si hay una clave definida
const apiKey = process.env.OPENAI_API_KEY;
const client = apiKey ? new OpenAI({ apiKey }) : null;

/**
 * Convierte la narrativa libre de un usuario en un objeto JSON
 * validado por Zod para los formularios I-589 o I-765 (c)(8).
 */
export async function normalizeIntake(
  narrative: string,
  form: "i589" | "i765"
) {
  // Si no hay cliente (no hay clave), devuelve un JSON vacío
  if (!client) {
    console.warn("⚠️ No hay clave de OpenAI configurada, se omite llamada a la API.");
    return form === "i589"
      ? I589Schema.parse({})
      : I765Schema.parse({});
  }

  const system =
    "Eres un asistente de migración. Extrae campos en JSON válido para el esquema indicado. " +
    "Usa null cuando falte un dato. Responde SOLO JSON sin texto adicional.";

  const user =
    form === "i589"
      ? `Convierte la narrativa en un JSON que cumpla el I589Schema. Narrativa:\n${narrative}`
      : `Convierte la narrativa en un JSON que cumpla el I765Schema (categoría c8). Narrativa:\n${narrative}`;

  const resp = await client.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  });

  const raw = resp.choices[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(raw);
  return form === "i589" ? I589Schema.parse(parsed) : I765Schema.parse(parsed);
}
