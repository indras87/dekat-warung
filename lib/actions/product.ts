"use server";

import { prisma } from "@/lib/prisma";
import type { Product, Category } from "@prisma/client";

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
