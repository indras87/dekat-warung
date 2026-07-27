"use server";

import { prisma } from "@/lib/prisma";
import { haversineMeters } from "@/lib/geo";
import { DISCOVERY_RADIUS_M } from "@/lib/constants";
import type { Warung } from "@prisma/client";

/** Plain serializable warung shape (Date → ISO string). */
export type WarungDTO = Omit<Warung, "createdAt" | "updatedAt"> & {
  createdAt: string;
  updatedAt: string;
  distanceM?: number;
};

function toDTO(w: Warung & { distanceM?: number }): WarungDTO {
  return {
    ...w,
    createdAt: w.createdAt.toISOString(),
    updatedAt: w.updatedAt.toISOString(),
  };
}

/**
 * Discovery: warungs within DISCOVERY_RADIUS_M of the buyer, sorted nearest-first.
 * Mirrors PRD §2 Haversine/PostGIS geolocation spec.
 */
export async function getNearbyWarungs(
  lat: number,
  lng: number,
  radiusM: number = DISCOVERY_RADIUS_M,
): Promise<WarungDTO[]> {
  // SQLite dev has no native geo — fetch all and filter in-app (fine for MVP scale).
  const all = await prisma.warung.findMany({ orderBy: { namaWarung: "asc" } });
  const withDist = all
    .map((w) => ({ ...w, distanceM: haversineMeters(lat, lng, w.latitude, w.longitude) }))
    .filter((w) => w.distanceM <= radiusM)
    .sort((a, b) => a.distanceM - b.distanceM);
  return withDist.map(toDTO);
}

export async function getWarungById(id: string): Promise<WarungDTO | null> {
  const w = await prisma.warung.findUnique({ where: { id } });
  return w ? toDTO(w) : null;
}

/** Demo MVP: first warung owns the merchant terminal (no auth yet). @deprecated gunakan getCurrentMerchantWarung */
export async function getDefaultMerchantWarung(): Promise<WarungDTO | null> {
  const w = await prisma.warung.findFirst({ orderBy: { createdAt: "asc" } });
  return w ? toDTO(w) : null;
}

/**
 * Mendapatkan warung yang dimiliki oleh user yang sedang login.
 * Hanya untuk role WARUNG. Return null jika user tidak login atau bukan WARUNG.
 */
export async function getCurrentMerchantWarung(): Promise<WarungDTO | null> {
  const { getSession } = await import("@/lib/session");
  const session = await getSession();

  // Hanya role WARUNG yang memiliki warung
  if (!session.userId || session.role !== "WARUNG" || !session.warungId) {
    return null;
  }

  const w = await prisma.warung.findUnique({
    where: { id: session.warungId },
  });

  return w ? toDTO(w) : null;
}

export async function setWarungOpen(id: string, isOpen: boolean): Promise<WarungDTO> {
  const w = await prisma.warung.update({ where: { id }, data: { isOpen } });
  return toDTO(w);
}

export async function updateWarungSettings(
  id: string,
  data: {
    namaWarung: string;
    deliveryFee: number;
    isDeliveryAvailable: boolean;
    acceptCash: boolean;
    acceptQris: boolean;
    acceptTransfer: boolean;
    qrisImageUrl?: string | null;
    whatsappNumber?: string | null;
  },
): Promise<WarungDTO> {
  const w = await prisma.warung.update({ where: { id }, data });
  return toDTO(w);
}

export interface CreateWarungInput {
  namaWarung: string;
  latitude: number;
  longitude: number;
  deliveryFee: number;
  isDeliveryAvailable: boolean;
  acceptCash: boolean;
  acceptQris: boolean;
  acceptTransfer: boolean;
  whatsappNumber?: string | null;
}

export interface CreateWarungResult {
  success: boolean;
  warung?: WarungDTO;
  error?: string;
}

/**
 * Membuat warung baru untuk user tertentu.
 * Membungkus update role User dan create Warung dalam satu transaction.
 * Satu user hanya boleh memiliki satu warung (ownerId @unique di schema).
 */
export async function createWarungForUser(
  ownerId: string,
  data: CreateWarungInput,
): Promise<CreateWarungResult> {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Update role User menjadi WARUNG
      const user = await tx.user.update({
        where: { id: ownerId },
        data: { role: "WARUNG" },
      });

      // 2. Buat Warung dengan ownerId
      const warung = await tx.warung.create({
        data: {
          ownerId: user.id,
          namaWarung: data.namaWarung,
          latitude: data.latitude,
          longitude: data.longitude,
          deliveryFee: data.deliveryFee,
          isDeliveryAvailable: data.isDeliveryAvailable,
          acceptCash: data.acceptCash,
          acceptQris: data.acceptQris,
          acceptTransfer: data.acceptTransfer,
          whatsappNumber: data.whatsappNumber,
          isOpen: true, // Default buka saat pendaftaran
        },
      });

      return { user, warung };
    });

    return {
      success: true,
      warung: toDTO(result.warung),
    };
  } catch (error: any) {
    // Tangani error uniqueness (satu user = satu warung)
    if (error.code === "P2002") {
      return {
        success: false,
        error: "Anda sudah memiliki warung. Satu user hanya boleh mendaftarkan satu warung.",
      };
    }
    // Tangani error user tidak ditemukan (P2025)
    if (error.code === "P2025") {
      return {
        success: false,
        error: "User tidak ditemukan.",
      };
    }
    console.error("createWarungForUser error:", error);
    return {
      success: false,
      error: "Gagal mendaftarkan warung. Silakan coba lagi.",
    };
  }
}
