// src/lib/ai.ts
import OpenAI from "openai";
import { I589Schema, I765Schema } from "./zodSchemas";

// Necesitas OPENAI_API_KEY en .env
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Convierte la narrativa libre de un usuario en un objeto JSON
 * validado por Zod para los formularios I-589 o I-765 (c)(8).
 */
export async function normalizeIntake(
  narrative: string,
  form: "i589" | "i765"
) {
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

  // Parseo y validación estricta con Zod
  const parsed = JSON.parse(raw);
  return form === "i589" ? I589Schema.parse(parsed) : I765Schema.parse(parsed);
}
