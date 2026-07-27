/**
 * Web Push Notification Helper
 * Mengirim notifikasi push ke browser klien berdasarkan subscription.
 */
import webpush from "web-push";
import { prisma } from "@/lib/prisma";

/** Payload notifikasi push */
export interface PushPayload {
  /** Judul notifikasi */
  title: string;
  /** Isi notifikasi */
  body: string;
  /** URL yang dibuka saat notifikasi diklik */
  url?: string;
}

/** Setup VAPID detail dari environment variable */
function configureVapid() {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT;

  if (!publicKey || !privateKey || !subject) {
    console.error("[push] VAPID keys tidak lengkap di environment");
    return false;
  }

  webpush.setVapidDetails(
    subject,
    publicKey,
    privateKey,
  );
  return true;
}

/** Konfigurasi VAPID (sekali saat modul dimuat) */
const vapidConfigured = configureVapid();

/**
 * Mengirim notifikasi push ke semua subscription milik user tertentu.
 * Fire-and-forget: error senyap, tidak throw ke caller.
 */
export async function sendPush(
  userId: string,
  payload: PushPayload,
): Promise<void> {
  if (!vapidConfigured) {
    console.warn("[push] VAPID tidak terkonfigurasi, skip kirim push");
    return;
  }

  if (!userId) {
    console.warn("[push] userId kosong, skip kirim push");
    return;
  }

  try {
    // Ambil semua subscription aktif user
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId },
    });

    if (subscriptions.length === 0) {
      return; // Tidak ada subscription, bukan error
    }

    const payloadString = JSON.stringify(payload);

    // Kirim ke semua subscription secara paralel
    const results = await Promise.allSettled(
      subscriptions.map((sub) =>
        webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          },
          payloadString,
        )
      ),
    );

    // Hapus subscription yang gagal (410/404) atau kedaluwarsa
    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      const sub = subscriptions[i];

      if (result.status === "rejected") {
        const error = result.reason;
        // 410 Gone / 404 Not Found = subscription tidak valid lagi
        if (
          error?.statusCode === 410 ||
          error?.statusCode === 404
        ) {
          console.log(`[push] Subscription ${sub.id} kedaluwarsa, hapus dari DB`);
          await prisma.pushSubscription.delete({
            where: { id: sub.id },
          }).catch((e) =>
            console.error("[push] Gagal hapus subscription:", e)
          );
        } else {
          console.error(
            `[push] Gagal kirim ke ${sub.id}:`,
            error?.statusCode || error?.message || error,
          );
        }
      }
    }
  } catch (error) {
    console.error("[push] Error kirim push:", error);
    // Jangan throw, biarkan flow berlanjut
  }
}

/**
 * Menyimpan subscription push baru dari klien.
 * Returns subscription yang dibuat.
 */
export async function subscribeUser(
  userId: string,
  subscription: {
    endpoint: string;
    keys: { p256dh: string; auth: string };
  },
) {
  // Cek apakah endpoint sudah ada (hindari duplikat)
  const existing = await prisma.pushSubscription.findUnique({
    where: { endpoint: subscription.endpoint },
  });

  if (existing) {
    // Update userId bila endpoint sudah ada (mungkin user ganti perangkat/login ulang)
    return await prisma.pushSubscription.update({
      where: { endpoint: subscription.endpoint },
      data: { userId },
    });
  }

  // Buat subscription baru
  return await prisma.pushSubscription.create({
    data: {
      userId,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    },
  });
}

/**
 * Menghapus subscription push berdasarkan endpoint.
 * Dipanggil saat user unsubscribe atau SW reset.
 */
export async function unsubscribeUser(endpoint: string): Promise<void> {
  try {
    await prisma.pushSubscription.deleteMany({
      where: { endpoint },
    });
  } catch (error) {
    console.error("[push] Gagal unsubscribe:", error);
  }
}
