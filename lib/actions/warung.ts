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

/** Demo MVP: first warung owns the merchant terminal (no auth yet). */
export async function getDefaultMerchantWarung(): Promise<WarungDTO | null> {
  const w = await prisma.warung.findFirst({ orderBy: { createdAt: "asc" } });
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
