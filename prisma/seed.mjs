// Dekat Warung — seed demo data (Bojongsoang micro-radius scenario)
// Run: npm run db:seed  (after db:push)
import { readFileSync, existsSync } from "node:fs";
import { PrismaClient } from "@prisma/client";

// Minimal .env loader (node doesn't auto-load; avoids dotenv dependency).
if (!process.env.DATABASE_URL) {
  for (const p of [".env", ".env.local"]) {
    if (existsSync(p)) {
      for (const line of readFileSync(p, "utf8").split("\n")) {
        const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
        if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
      }
      break;
    }
  }
}

const prisma = new PrismaClient();

async function main() {
  console.log("→ Seeding Dekat Warung demo data…");

  // Clean slate (order matters for FKs)
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.warung.deleteMany();
  await prisma.user.deleteMany();

  // --- Users ---
  const ownerBuAni = await prisma.user.create({
    data: { nama: "Bu Ani", email: "ani@warung.test", noHp: "628123450001", role: "WARUNG" },
  });
  const ownerPakBudi = await prisma.user.create({
    data: { nama: "Pak Budi", email: "budi@warung.test", noHp: "628123450002", role: "WARUNG" },
  });
  const buyer = await prisma.user.create({
    data: { nama: "Pembeli Demo", email: "pembeli@warung.test", noHp: "628123450003", role: "PEMBELI" },
  });

  // --- Warungs (within 200m of buyer -6.9659, 107.6255) ---
  const w1 = await prisma.warung.create({
    data: {
      ownerId: ownerBuAni.id,
      namaWarung: "Warung Bu Ani",
      latitude: -6.9650,
      longitude: 107.6250,
      isOpen: true,
      isDeliveryAvailable: true,
      deliveryFee: 2000,
      acceptCash: true,
      acceptQris: true,
      acceptTransfer: false,
      whatsappNumber: "628123450001",
    },
  });

  const w2 = await prisma.warung.create({
    data: {
      ownerId: ownerPakBudi.id,
      namaWarung: "Warung Pak Budi",
      latitude: -6.9668,
      longitude: 107.6263,
      isOpen: false,
      isDeliveryAvailable: false,
      deliveryFee: 2000,
      acceptCash: true,
      acceptQris: false,
      acceptTransfer: true,
      whatsappNumber: "628123450002",
    },
  });

  // --- Categories + Products ---
  const catMakanan = await prisma.category.create({ data: { warungId: w1.id, nama: "Makanan" } });
  const catMinuman = await prisma.category.create({ data: { warungId: w1.id, nama: "Minuman" } });

  await prisma.product.createMany({
    data: [
      { warungId: w1.id, categoryId: catMakanan.id, nama: "Indomie Goreng", harga: 3500, isAvailable: true },
      { warungId: w1.id, categoryId: catMakanan.id, nama: "Telur Rebus", harga: 3000, isAvailable: true },
      { warungId: w1.id, categoryId: catMakanan.id, nama: "Roti Tawar Sari", harga: 12000, isAvailable: false },
      { warungId: w1.id, categoryId: catMinuman.id, nama: "Aqua Botol 600ml", harga: 4000, isAvailable: true },
      { warungId: w1.id, categoryId: catMinuman.id, nama: "Teh Pucuk 350ml", harga: 5000, isAvailable: true },
      { warungId: w1.id, categoryId: catMinuman.id, nama: "Kopi Kapal Api", harga: 2000, isAvailable: true },
    ],
  });

  const catSnack = await prisma.category.create({ data: { warungId: w2.id, nama: "Snack" } });
  await prisma.product.createMany({
    data: [
      { warungId: w2.id, categoryId: catSnack.id, nama: "Chitato 68g", harga: 11000, isAvailable: true },
      { warungId: w2.id, categoryId: catSnack.id, nama: "Oreo Original", harga: 9000, isAvailable: true },
      { warungId: w2.id, categoryId: catSnack.id, nama: "Beng Beng", harga: 2500, isAvailable: false },
    ],
  });

  // --- One PENDING order (to demo the merchant alert modal) ---
  const products = await prisma.product.findMany({ where: { warungId: w1.id } });
  const p1 = products.find((p) => p.nama === "Indomie Goreng");
  const p2 = products.find((p) => p.nama === "Aqua Botol 600ml");
  const items = [
    { productId: p1.id, productName: p1.nama, price: p1.harga, quantity: 2 },
    { productId: p2.id, productName: p2.nama, price: p2.harga, quantity: 1 },
  ];
  const subtotal = items.reduce((s, it) => s + it.price * it.quantity, 0);
  const deliveryFee = 2000;

  await prisma.order.create({
    data: {
      orderNumber: "ORD-104",
      warungId: w1.id,
      buyerId: buyer.id,
      buyerName: buyer.nama,
      status: "PENDING",
      serviceType: "PICKUP",
      paymentMethod: "CASH",
      subtotal,
      deliveryFee,
      totalAmount: subtotal + deliveryFee,
      items: { create: items },
    },
  });

  console.log("✓ Seed complete.");
  console.log(`  Users: 3 | Warungs: 2 | Products: 9 | 1 PENDING order (ORD-104)`);
  console.log(`  Merchant terminal: /warung-admin (Warung Bu Ani)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
