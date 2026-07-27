"use server";

import { prisma } from "@/lib/prisma";
import type { Product, Category, Warung } from "@prisma/client";
import { getNearbyWarungs, type WarungDTO } from "@/lib/actions/warung";
import { DISCOVERY_RADIUS_M } from "@/lib/constants";

export type ProductDTO = Omit<Product, "createdAt"> & { createdAt: string };
export type CategoryDTO = Omit<Category, "products">;

function toProductDTO(p: Product): ProductDTO {
  return { ...p, createdAt: p.createdAt.toISOString() };
}

function toCategoryDTO(c: Category): CategoryDTO {
  return { id: c.id, warungId: c.warungId, nama: c.nama };
}

export async function getProductsByWarung(warungId: string): Promise<ProductDTO[]> {
  const list = await prisma.product.findMany({
    where: { warungId },
    orderBy: [{ isAvailable: "desc" }, { nama: "asc" }],
  });
  return list.map(toProductDTO);
}

/** Quick stock toggle (PRD §3.4 — "Ada / Habis"). */
export async function toggleProductStock(
  id: string,
  isAvailable: boolean,
): Promise<ProductDTO> {
  const p = await prisma.product.update({
    where: { id },
    data: { isAvailable },
  });
  return toProductDTO(p);
}

export async function createProduct(data: {
  warungId: string;
  nama: string;
  harga: number;
  categoryId?: string | null;
  imageUrl?: string | null;
}): Promise<ProductDTO> {
  const p = await prisma.product.create({
    data: {
      warungId: data.warungId,
      nama: data.nama,
      harga: data.harga,
      categoryId: data.categoryId ?? null,
      imageUrl: data.imageUrl ?? null,
      isAvailable: true,
    },
  });
  return toProductDTO(p);
}

export async function updateProduct(
  id: string,
  data: {
    nama?: string;
    harga?: number;
    categoryId?: string | null;
    imageUrl?: string | null;
  },
): Promise<ProductDTO> {
  const p = await prisma.product.update({
    where: { id },
    data,
  });
  return toProductDTO(p);
}

export async function deleteProduct(id: string): Promise<void> {
  await prisma.product.delete({
    where: { id },
  });
}

/** Kategori operations */
export async function getCategoriesByWarung(warungId: string): Promise<CategoryDTO[]> {
  const list = await prisma.category.findMany({
    where: { warungId },
    orderBy: { nama: "asc" },
  });
  return list.map(toCategoryDTO);
}

export async function createCategory(
  warungId: string,
  nama: string,
): Promise<CategoryDTO> {
  const c = await prisma.category.create({
    data: { warungId, nama },
  });
  return toCategoryDTO(c);
}

export async function deleteCategory(id: string): Promise<void> {
  await prisma.category.delete({
    where: { id },
  });
}

/** DTO untuk hasil pencarian produk lintas warung */
export type ProductWithWarungDTO = ProductDTO & {
  warung: {
    id: string;
    namaWarung: string;
    isOpen: boolean;
    latitude: number;
    longitude: number;
  };
  distanceM: number;
};

/**
 * Pencarian produk lintas warung dalam radius.
 * Mencari produk yang namanya mengandung query (case-insensitive)
 * dari warung-warnug dalam radius pengguna.
 *
 * @param query - Kata kunci pencarian (max 60 karakter)
 * @param lat - Latitude pengguna
 * @param lng - Longitude pengguna
 * @param radiusM - Radius pencarian dalam meter (default DISCOVERY_RADIUS_M)
 * @returns Array produk dikelompokkan per warung, diurutkan kecocokan & jarak
 */
export async function searchProducts(
  query: string,
  lat: number,
  lng: number,
  radiusM: number = DISCOVERY_RADIUS_M,
): Promise<ProductWithWarungDTO[]> {
  // Batasi panjang query untuk cegah abuse
  const sanitizedQuery = query.trim().slice(0, 60);

  if (!sanitizedQuery) {
    return [];
  }

  // 1. Ambil warung dalam radius (reuse getNearbyWarungs)
  const nearbyWarungs = await getNearbyWarungs(lat, lng, radiusM);

  if (nearbyWarungs.length === 0) {
    return [];
  }

  // 2. Ambil ID warung untuk query produk
  const warungIds = nearbyWarungs.map((w) => w.id);

  // 3. Query produk dengan nama contains query (case-insensitive untuk PostgreSQL)
  const products = await prisma.product.findMany({
    where: {
      warungId: { in: warungIds },
      nama: { contains: sanitizedQuery, mode: "insensitive" },
    },
    include: {
      warung: {
        select: {
          id: true,
          namaWarung: true,
          isOpen: true,
          latitude: true,
          longitude: true,
        },
      },
    },
  });

  // 4. Map distanceM dari warung ke setiap produk
  const warungDistanceMap = new Map<string, number>();
  nearbyWarungs.forEach((w) => {
    warungDistanceMap.set(w.id, w.distanceM ?? 0);
  });

  const results: ProductWithWarungDTO[] = products.map((p) => ({
    ...p,
    createdAt: p.createdAt.toISOString(),
    warung: p.warung,
    distanceM: warungDistanceMap.get(p.warungId) ?? 0,
  }));

  // 5. Urutkan: prefix match dulu, lalu jarak terdekat
  const queryLower = sanitizedQuery.toLowerCase();
  results.sort((a, b) => {
    const aStartsWith = a.nama.toLowerCase().startsWith(queryLower);
    const bStartsWith = b.nama.toLowerCase().startsWith(queryLower);

    if (aStartsWith && !bStartsWith) return -1;
    if (!aStartsWith && bStartsWith) return 1;

    // Jika sama-sama prefix/sama-sama tidak, urutkan by jarak
    return a.distanceM - b.distanceM;
  });

  return results;
}
