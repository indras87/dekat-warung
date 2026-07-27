"use client";

import { useState, useTransition, useActionState } from "react";
import {
  createProduct,
  updateProduct,
  deleteProduct as deleteProductAction,
  createCategory,
  deleteCategory as deleteCategoryAction,
} from "@/lib/actions/product";
import type { ProductDTO, CategoryDTO } from "@/lib/actions/product";

interface ProdukClientProps {
  warungId: string;
  initialProducts: ProductDTO[];
  initialCategories: CategoryDTO[];
}

type EditingProduct = {
  id: string;
  nama: string;
  harga: number;
  categoryId?: string | null;
  imageUrl?: string | null;
};

export function ProdukClient({
  warungId,
  initialProducts,
  initialCategories,
}: ProdukClientProps) {
  const [products, setProducts] = useState<ProductDTO[]>(initialProducts);
  const [categories, setCategories] = useState<CategoryDTO[]>(initialCategories);
  const [isPending, startTransition] = useTransition();

  // Form tambah produk state
  const [newNama, setNewNama] = useState("");
  const [newHarga, setNewHarga] = useState("");
  const [newCategoryId, setNewCategoryId] = useState<string>("");
  const [newImageUrl, setNewImageUrl] = useState("");

  // Form edit produk state
  const [editingProduct, setEditingProduct] = useState<EditingProduct | null>(null);

  // Kategori management state
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [newCategoryNama, setNewCategoryNama] = useState("");

  // Create product
  const handleCreateProduct = () => {
    if (!newNama.trim() || !newHarga) return;

    const hargaNum = parseInt(newHarga, 10);
    if (isNaN(hargaNum) || hargaNum <= 0) return;

    startTransition(async () => {
      const result = await createProduct({
        warungId,
        nama: newNama.trim(),
        harga: hargaNum,
        categoryId: newCategoryId || null,
        imageUrl: newImageUrl.trim() || null,
      });
      setProducts((prev) => [...prev, result]);
      setNewNama("");
      setNewHarga("");
      setNewCategoryId("");
      setNewImageUrl("");
    });
  };

  // Delete product
  const handleDeleteProduct = (id: string) => {
    if (!confirm("Yakin ingin menghapus produk ini?")) return;

    startTransition(async () => {
      await deleteProductAction(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    });
  };

  // Open edit modal
  const openEditModal = (product: ProductDTO) => {
    setEditingProduct({
      id: product.id,
      nama: product.nama,
      harga: product.harga,
      categoryId: product.categoryId,
      imageUrl: product.imageUrl,
    });
  };

  // Update product
  const handleUpdateProduct = () => {
    if (!editingProduct) return;
    if (!editingProduct.nama.trim() || editingProduct.harga <= 0) return;

    startTransition(async () => {
      const result = await updateProduct(editingProduct.id, {
        nama: editingProduct.nama.trim(),
        harga: editingProduct.harga,
        categoryId: editingProduct.categoryId || null,
        imageUrl: editingProduct.imageUrl || null,
      });
      setProducts((prev) =>
        prev.map((p) => (p.id === result.id ? result : p)),
      );
      setEditingProduct(null);
    });
  };

  // Create category
  const handleCreateCategory = () => {
    if (!newCategoryNama.trim()) return;

    startTransition(async () => {
      const result = await createCategory(warungId, newCategoryNama.trim());
      setCategories((prev) => [...prev, result]);
      setNewCategoryNama("");
    });
  };

  // Delete category
  const handleDeleteCategory = (id: string) => {
    if (!confirm("Yakin ingin menghapus kategori ini? Produk akan kehilangan kategori.")) return;

    startTransition(async () => {
      await deleteCategoryAction(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      // Reset produk yang punya kategori ini
      setProducts((prev) =>
        prev.map((p) => (p.categoryId === id ? { ...p, categoryId: null } : p)),
      );
    });
  };

  return (
    <div className="bg-canvas-soft min-h-screen p-4 pb-20 space-y-4">
      {/* Header */}
      <div className="bg-ink text-white px-5 py-4 rounded-b-pill flex justify-between items-center">
        <h1 className="text-xl font-black text-lime">Kelola Produk</h1>
      </div>

      {/* Form Tambah Produk */}
      <div className="bg-canvas-pure rounded-pill border-2 border-ink p-5 space-y-3">
        <h2 className="text-lg font-black text-ink">Tambah Produk Baru</h2>

        <div>
          <label htmlFor="nama-produk" className="text-sm font-bold text-ink block mb-1">
            Nama Produk
          </label>
          <input
            id="nama-produk"
            type="text"
            value={newNama}
            onChange={(e) => setNewNama(e.target.value)}
            placeholder="Contoh: Keripik Pisang"
            className="w-full bg-canvas-soft border border-ink rounded-xl p-3 text-base text-ink font-medium"
            disabled={isPending}
          />
        </div>

        <div>
          <label htmlFor="harga-produk" className="text-sm font-bold text-ink block mb-1">
            Harga (Rp)
          </label>
          <input
            id="harga-produk"
            type="number"
            value={newHarga}
            onChange={(e) => setNewHarga(e.target.value)}
            placeholder="Contoh: 5000"
            min="0"
            className="w-full bg-canvas-soft border border-ink rounded-xl p-3 text-base text-ink font-medium"
            disabled={isPending}
          />
        </div>

        <div>
          <label htmlFor="kategori-produk" className="text-sm font-bold text-ink block mb-1">
            Kategori (opsional)
          </label>
          <select
            id="kategori-produk"
            value={newCategoryId}
            onChange={(e) => setNewCategoryId(e.target.value)}
            className="w-full bg-canvas-soft border border-ink rounded-xl p-3 text-base text-ink font-medium"
            disabled={isPending}
          >
            <option value="">Tanpa Kategori</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.nama}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="imageUrl-produk" className="text-sm font-bold text-ink block mb-1">
            URL Gambar (opsional)
          </label>
          <input
            id="imageUrl-produk"
            type="url"
            value={newImageUrl}
            onChange={(e) => setNewImageUrl(e.target.value)}
            placeholder="https://example.com/gambar.jpg"
            className="w-full bg-canvas-soft border border-ink rounded-xl p-3 text-base text-ink font-medium"
            disabled={isPending}
          />
        </div>

        <button
          onClick={handleCreateProduct}
          disabled={isPending || !newNama.trim() || !newHarga}
          className="w-full h-14 bg-lime text-ink font-black text-lg rounded-pill hover:bg-lime-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isPending ? "Menambahkan..." : "Tambah Produk"}
        </button>
      </div>

      {/* Daftar Produk */}
      <div className="space-y-3">
        <h2 className="text-lg font-black text-ink px-1">Daftar Produk ({products.length})</h2>

        {products.length === 0 ? (
          <div className="bg-canvas-pure rounded-pill border-2 border-mute p-8 text-center">
            <p className="text-mute font-semibold">Belum ada produk. Tambahkan produk pertama kamu!</p>
          </div>
        ) : (
          products.map((product) => {
            const category = categories.find((c) => c.id === product.categoryId);
            return (
              <div
                key={product.id}
                className={`bg-canvas-pure rounded-pill border-2 p-4 flex justify-between items-start ${
                  product.isAvailable ? "border-ink" : "border-negative"
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-base font-black text-ink">{product.nama}</h3>
                    {!product.isAvailable && (
                      <span className="bg-negative text-white text-xs font-black px-2 py-1 rounded-full">
                        HABIS
                      </span>
                    )}
                    {category && (
                      <span className="bg-lime-pale text-ink-deep text-xs font-bold px-2 py-1 rounded-full">
                        {category.nama}
                      </span>
                    )}
                  </div>
                  <p className="text-lg font-black text-ink">Rp {product.harga.toLocaleString("id-ID")}</p>
                  {product.imageUrl && (
                    <p className="text-xs text-mute mt-1 truncate max-w-xs">{product.imageUrl}</p>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(product)}
                    className="bg-canvas-soft text-ink font-bold px-3 py-2 rounded-xl hover:bg-lime-pole transition-colors"
                    disabled={isPending}
                    aria-label={`Edit ${product.nama}`}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(product.id)}
                    className="text-negative font-bold px-3 py-2 rounded-xl hover:bg-negative/10 transition-colors"
                    disabled={isPending}
                    aria-label={`Hapus ${product.nama}`}
                  >
                    Hapus
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Manajer Kategori (Collapsible) */}
      <div className="bg-canvas-pure rounded-pill border-2 border-ink p-5 space-y-3">
        <button
          onClick={() => setShowCategoryManager(!showCategoryManager)}
          className="w-full flex justify-between items-center text-lg font-black text-ink"
        >
          <span>Kelola Kategori ({categories.length})</span>
          <span>{showCategoryManager ? "▲" : "▼"}</span>
        </button>

        {showCategoryManager && (
          <div className="space-y-3 pt-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={newCategoryNama}
                onChange={(e) => setNewCategoryNama(e.target.value)}
                placeholder="Nama kategori baru..."
                className="flex-1 bg-canvas-soft border border-ink rounded-xl p-3 text-base text-ink font-medium"
                disabled={isPending}
              />
              <button
                onClick={handleCreateCategory}
                disabled={isPending || !newCategoryNama.trim()}
                className="bg-lime text-ink font-black px-4 rounded-xl hover:bg-lime-hover disabled:opacity-50 transition-colors"
              >
                Tambah
              </button>
            </div>

            <div className="space-y-2">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex justify-between items-center bg-canvas-soft p-3 rounded-xl"
                >
                  <span className="text-base font-semibold text-ink">{cat.nama}</span>
                  <button
                    onClick={() => handleDeleteCategory(cat.id)}
                    className="text-negative font-bold text-sm px-2 py-1 rounded-lg hover:bg-negative/10 transition-colors"
                    disabled={isPending}
                  >
                    Hapus
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal Edit Produk */}
      {editingProduct && (
        <div className="fixed inset-0 bg-ink/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-canvas-pure rounded-pill w-full max-w-md p-6 space-y-4 shadow-2xl border-4 border-lime">
            <h2 className="text-2xl font-black text-ink text-center">Edit Produk</h2>

            <div>
              <label htmlFor="edit-nama" className="text-sm font-bold text-ink block mb-1">
                Nama Produk
              </label>
              <input
                id="edit-nama"
                type="text"
                value={editingProduct.nama}
                onChange={(e) => setEditingProduct({ ...editingProduct, nama: e.target.value })}
                className="w-full bg-canvas-soft border border-ink rounded-xl p-3 text-base text-ink font-medium"
                disabled={isPending}
                autoFocus
              />
            </div>

            <div>
              <label htmlFor="edit-harga" className="text-sm font-bold text-ink block mb-1">
                Harga (Rp)
              </label>
              <input
                id="edit-harga"
                type="number"
                value={editingProduct.harga}
                onChange={(e) =>
                  setEditingProduct({ ...editingProduct, harga: parseInt(e.target.value, 10) || 0 })
                }
                min="0"
                className="w-full bg-canvas-soft border border-ink rounded-xl p-3 text-base text-ink font-medium"
                disabled={isPending}
              />
            </div>

            <div>
              <label htmlFor="edit-kategori" className="text-sm font-bold text-ink block mb-1">
                Kategori
              </label>
              <select
                id="edit-kategori"
                value={editingProduct.categoryId || ""}
                onChange={(e) =>
                  setEditingProduct({ ...editingProduct, categoryId: e.target.value || null })
                }
                className="w-full bg-canvas-soft border border-ink rounded-xl p-3 text-base text-ink font-medium"
                disabled={isPending}
              >
                <option value="">Tanpa Kategori</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nama}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="edit-imageUrl" className="text-sm font-bold text-ink block mb-1">
                URL Gambar
              </label>
              <input
                id="edit-imageUrl"
                type="url"
                value={editingProduct.imageUrl || ""}
                onChange={(e) =>
                  setEditingProduct({ ...editingProduct, imageUrl: e.target.value || null })
                }
                placeholder="https://example.com/gambar.jpg"
                className="w-full bg-canvas-soft border border-ink rounded-xl p-3 text-base text-ink font-medium"
                disabled={isPending}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setEditingProduct(null)}
                className="h-14 bg-canvas-soft text-negative font-bold rounded-xl hover:bg-negative/10 transition-colors"
                disabled={isPending}
              >
                Batal
              </button>
              <button
                onClick={handleUpdateProduct}
                disabled={isPending || !editingProduct.nama.trim() || editingProduct.harga <= 0}
                className="h-14 bg-lime text-ink font-black text-lg rounded-xl hover:bg-lime-hover disabled:opacity-50 transition-colors"
              >
                {isPending ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
