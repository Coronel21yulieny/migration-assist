// app/api/auth/register/route.ts
import { NextResponse } from "next/server";

export async function POST() {
  // 🔥 MODO DEMO:
  // Simula un registro exitoso sin validar nada.
  return NextResponse.json({
    ok: true,
    message: "Registro demo exitoso",
  });
}
