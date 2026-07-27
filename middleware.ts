/**
 * Middleware Next.js untuk proteksi route.
 * Berjalan di Edge Runtime - JANGAN impor @prisma/client.
 *
 * Proteksi:
 * - /warung-admin/*: hanya user dengan role WARUNG yang bisa akses.
 * - Redirect ke /login?next=/warung-admin jika belum login atau role tidak sesuai.
 */
import type { NextRequest } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

interface SessionData {
  userId: string;
  role: "ADMIN" | "PEMBELI" | "WARUNG";
  warungId?: string;
}

function getSessionOptions() {
  return {
    password: process.env.SESSION_SECRET || "fallback_minimum_32_characters_secret_change_me",
    cookieName: process.env.SESSION_COOKIE_NAME || "dw-session",
  };
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Hanya proteksi route /warung-admin/*
  if (pathname.startsWith("/warung-admin")) {
    const session = await getIronSession<SessionData>(cookies(), getSessionOptions());

    // Cek apakah user login dan role WARUNG
    if (!session.userId || session.role !== "WARUNG") {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      // Simpan target URL untuk redirect setelah login
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url, 302);
    }
  }

  return NextResponse.next();
}

// Konfigurasi matcher untuk route yang diproteksi
export const config = {
  matcher: "/warung-admin/:path*",
};
