"use client";

// Halaman fallback offline untuk PWA
// Ditampilkan ketika user offline dan navigasi ke route yang belum di-cache

export default function OfflinePage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-canvas-soft px-4">
      <div className="max-w-md w-full">
        <div className="bg-body rounded-pill p-8 text-center">
          {/* Ikon offline sederhana */}
          <div className="mb-6 flex justify-center">
            <div className="w-24 h-24 rounded-full bg-mute flex items-center justify-center">
              <svg
                className="w-12 h-12 text-lime"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414l-6.364 6.364a1 1 0 01-1.414-1.414l6.364-6.364zm4.95 4.95a2.5 2.5 0 01-3.536 0l-6.364-6.364a2.5 2.5 0 013.536-3.536l6.364 6.364a2.5 2.5 0 010 3.536z"
                />
              </svg>
            </div>
          </div>

          {/* Pesan offline */}
          <h1 className="font-black text-3xl text-lime mb-3">
            Anda Sedang Offline
          </h1>
          <p className="text-ink-deep mb-8 max-w-sm mx-auto">
            Koneksi internet terputus. Periksa koneksi Anda dan coba lagi.
          </p>

          {/* Tombol coba lagi */}
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-lime hover:bg-lime-hover text-body font-black text-lg py-4 rounded-pill transition-colors active:scale-[0.98] transform"
          >
            Coba Lagi
          </button>

          {/* Info tambahan */}
          <p className="text-mute text-sm mt-6">
            Halaman yang sudah dikunjungi masih dapat diakses secara offline.
          </p>
        </div>
      </div>
    </main>
  );
}
