import { saveImageFile } from "@/lib/upload";
import { NextResponse } from "next/server";
import { withRateLimit } from "@/lib/ratelimit";
import { RATE_LIMIT } from "@/lib/constants";

// Wajib nodejs untuk akses file system
export const runtime = "nodejs";

/**
 * Endpoint upload gambar: menerima field `file` dari multipart form, menyimpannya via saveImageFile, dan mengembalikan URL publik.
 * Runtime nodejs (akses filesystem); diproteksi rate limit UPLOAD.
 */
export const POST = withRateLimit(
  RATE_LIMIT.UPLOAD,
  async (req: Request) => {
    try {
      const form = await req.formData();
      const file = form.get("file") as File | null;

      // Validasi keberadaan file
      if (!file) {
        return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 });
      }

      // Simpan file dan dapatkan URL
      const url = await saveImageFile(file);

      return NextResponse.json({ url }, { status: 201 });
    } catch (error) {
      // Pesan error dari saveImageFile atau error umum
      const message = error instanceof Error ? error.message : "Gagal mengupload gambar";

      // Status 413 untuk ukuran terlalu besar, 400 untuk lainnya
      const status = message.includes("terlalu besar") ? 413 : 400;

      return NextResponse.json({ error: message }, { status });
    }
  },
);
