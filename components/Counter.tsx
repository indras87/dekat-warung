"use client";

/** Quantity stepper per design.md §Halaman 1.2. */
export function Counter({
  value,
  onChange,
  min = 0,
  max = 99,
}: {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
}) {
  /** Helper penahan (clamp) nilai ke rentang [min, max] sebelum dikembalikan via onChange. */
  const set = (n: number) => onChange(Math.max(min, Math.min(max, n)));
  return (
    <div className="flex items-center gap-3 bg-canvas-soft p-1.5 rounded-[16px]">
      <button
        type="button"
        aria-label="Kurangi"
        onClick={() => set(value - 1)}
        className="w-8 h-8 bg-canvas-pure text-ink font-black rounded-full flex items-center justify-center disabled:opacity-40"
        disabled={value <= min}
      >
        −
      </button>
      <span className="w-6 text-center text-sm font-black text-ink">{value}</span>
      <button
        type="button"
        aria-label="Tambah"
        onClick={() => set(value + 1)}
        className="w-8 h-8 bg-canvas-pure text-ink font-black rounded-full flex items-center justify-center disabled:opacity-40"
        disabled={value >= max}
      >
        +
      </button>
    </div>
  );
}
