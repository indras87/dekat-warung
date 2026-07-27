/**
 * Session management menggunakan iron-session.
 * Menyimpan data autentikasi di cookie terenkripsi.
 */
import { getIronSession, SessionOptions } from "iron-session";
import { cookies } from "next/headers";
import type { Role } from "@prisma/client";

/** Data yang disimpan dalam cookie session. */
export interface SessionData {
  /** ID user yang sedang login. */
  userId: string;
  /** Role user (ADMIN/PEMBELI/WARUNG). */
  role: Role;
  /** ID warung yang dimiliki (hanya untuk role WARUNG). */
  warungId?: string;
}

/** Opsi konfigurasi iron-session. */
function getSessionOptions(): SessionOptions {
  return {
    password: process.env.SESSION_SECRET || "fallback_minimum_32_characters_secret_change_me",
    cookieName: process.env.SESSION_COOKIE_NAME || "dw-session",
    cookieOptions: {
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      httpOnly: true,
      path: "/",
    },
  };
}

/** Mendapatkan session saat ini. Dapat dipanggil dari Server Component/Action. */
export async function getSession(): Promise<SessionData> {
  const sessionOptions = getSessionOptions();
  const session = await getIronSession<SessionData>(cookies(), sessionOptions);

  // Default values jika session kosong (first visit)
  if (!session.userId) {
    session.userId = "";
    session.role = "PEMBELI" as Role;
  }

  return session;
}

/** Menyimpan data ke session (update/create). */
export async function saveSession(data: SessionData): Promise<void> {
  const session = await getSession();
  session.userId = data.userId;
  session.role = data.role;
  session.warungId = data.warungId;
  await session.save();
}

/** Menghapus session (logout). */
export async function destroySession(): Promise<void> {
  const session = await getSession();
  session.destroy();
}

/**
 * Helper untuk mengecek apakah user memiliki role tertentu.
 * Dapat dipanggil dari Server Component/Action.
 */
export async function requireRole(role: Role): Promise<SessionData | null> {
  const session = await getSession();
  if (!session.userId || session.role !== role) {
    return null;
  }
  return session;
}

/** Cek apakah user saat ini sudah login (ada userId). */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return !!session.userId;
}
