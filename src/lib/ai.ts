// src/lib/ai.ts
type SupportedForm = "i589" | "i765";

export async function normalizeIntake(input: {
  narrative: string;
  form: SupportedForm;
}) {
  const apiKey = process.env.OPENAI_API_KEY; // dentro de la función
  if (!apiKey) {
    return {
      ok: false,
      reason: "OPENAI_API_KEY not set",
      normalized: input.narrative?.trim() ?? "",
      form: input.form,
    };
  }

  // Si usas OpenAI:
  // const openai = new (await import("openai")).default({ apiKey });
  // ... tu llamada real ...

  return {
    ok: true,
    normalized: input.narrative?.trim() ?? "",
    form: input.form,
  };
}

