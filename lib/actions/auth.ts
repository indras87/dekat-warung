"use server";

import { prisma } from "@/lib/prisma";
import { saveSession, destroySession, getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import type { Role } from "@prisma/client";

export interface SignInResult {
  success: boolean;
  error?: string;
  redirectUrl?: string;
}

/**
 * Server action untuk login (sign in).
 * Mencari user berdasarkan nama atau noHp, lalu mencocokkan PIN.
 */
export async function signIn(input: {
  nama: string;
  pin: string;
}): Promise<SignInResult> {
  try {
    // Cari user berdasarkan nama atau noHp
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ nama: input.nama }, { noHp: input.nama }],
      },
      include: { warung: true },
    });

    if (!user) {
      return { success: false, error: "User tidak ditemukan" };
    }

    // Cek PIN (hanya jika user memiliki PIN)
    if (user.pin && user.pin !== input.pin) {
      return { success: false, error: "PIN salah" };
    }

    // Simpan session
    await saveSession({
      userId: user.id,
      role: user.role,
      warungId: user.warung?.id,
    });

    // Redirect sesuai role
    let redirectUrl = "/";
    switch (user.role) {
      case "WARUNG":
        redirectUrl = "/warung-admin";
        break;
      case "ADMIN":
        redirectUrl = "/admin";
        break;
      case "PEMBELI":
      default:
        redirectUrl = "/";
        break;
    }

    return { success: true, redirectUrl };
  } catch (error) {
    console.error("SignIn error:", error);
    return { success: false, error: "Gagal login. Coba lagi." };
  }
}

/**
 * Server action untuk logout (sign out).
 * Menghapus session dan redirect ke halaman utama.
 */
export async function signOut(): Promise<void> {
  await destroySession();
  redirect("/");
}

/**
 * Mendapatkan user yang sedang login.
 * Mengembalikan null jika belum login.
 */
export async function getCurrentUser() {
  const session = await getSession();
  if (!session.userId) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      nama: true,
      email: true,
      noHp: true,
      role: true,
      warung: {
        select: { id: true, namaWarung: true },
      },
    },
  });

  return user;
}

/**
 * Mendapatkan buyerId dari session untuk pembeli yang login.
 * Dapat dipanggil dari client component untuk checkout.
 */
export async function getCurrentBuyerId(): Promise<string | null> {
  const session = await getSession();
  // Hanya kembalikan userId jika role adalah PEMBELI
  if (!session.userId || session.role !== "PEMBELI") {
    return null;
  }
  return session.userId;
}
