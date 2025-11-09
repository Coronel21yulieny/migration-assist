// src/lib/server-auth.ts
import { NextRequest } from 'next/server';

export function getUserIdFromHeader(req: NextRequest): string | null {
  const h = req.headers.get('x-user-id');
  return h && h.trim() ? h.trim() : null;
}
