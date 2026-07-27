import { mkdir, writeFile } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";
import { cwd } from "process";

/**
 * Validasi dan simpan file gambar ke public/uploads/
 * @param file - File dari FormData
 * @returns URL publik relatif (/uploads/<nama>)
 * @throws Error bila tipe/ukuran tidak valid
 */
export async function saveImageFile(file: File): Promise<string> {
  // Validasi MIME type
  const allowedMimeTypes = ["image/png", "image/jpeg", "image/webp"];
  if (!allowedMimeTypes.includes(file.type)) {
    throw new Error(`Tipe file tidak didukung: ${file.type}. Gunakan PNG, JPEG, atau WebP.`);
  }

  // Validasi ukuran (maks 2 MB)
  const MAX_SIZE = 2 * 1024 * 1024; // 2 MB
  if (file.size > MAX_SIZE) {
    throw new Error(`Ukuran file terlalu besar: ${Math.round(file.size / 1024)} KB. Maksimum 2 MB.`);
  }

  // Pastikan direktori uploads ada
  const uploadDir = join(cwd(), "public", "uploads");
  if (!existsSync(uploadDir)) {
    await mkdir(uploadDir, { recursive: true });
  }

  // Generate nama unik: UUID + ekstensi asli
  const ext = file.name.split(".").pop() ?? "jpg";
  const uniqueName = `${crypto.randomUUID()}.${ext}`;
  const filePath = join(uploadDir, uniqueName);

  // Konversi File ke Buffer dan simpan
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  await writeFile(filePath, buffer);

  // Kembalikan URL publik relatif
  return `/uploads/${uniqueName}`;
}
