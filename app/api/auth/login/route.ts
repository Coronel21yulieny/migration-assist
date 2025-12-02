// app/api/auth/login/route.ts
import { NextResponse } from "next/server";

export async function POST() {
  // 🔥 MODO DEMO:
  // Siempre responde éxito, sin tocar base de datos ni nada.
  return NextResponse.json({
    ok: true,
    message: "Login demo exitoso",
  });
}
