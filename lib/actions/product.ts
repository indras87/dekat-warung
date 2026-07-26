"use server";

import { prisma } from "@/lib/prisma";
import type { Product } from "@prisma/client";

export type ProductDTO = Omit<Product, "createdAt"> & { createdAt: string };

function toDTO(p: Product): ProductDTO {
  return { ...p, createdAt: p.createdAt.toISOString() };
}

export async function getProductsByWarung(warungId: string): Promise<ProductDTO[]> {
  const list = await prisma.product.findMany({
    where: { warungId },
    orderBy: [{ isAvailable: "desc" }, { nama: "asc" }],
  });
  return list.map(toDTO);
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
  return toDTO(p);
}

export async function createProduct(data: {
  warungId: string;
  nama: string;
  harga: number;
  categoryId?: string | null;
}): Promise<ProductDTO> {
  const p = await prisma.product.create({
    data: {
      warungId: data.warungId,
      nama: data.nama,
      harga: data.harga,
      categoryId: data.categoryId ?? null,
      isAvailable: true,
    },
  });
  return toDTO(p);
}
