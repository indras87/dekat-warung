"use client";

import { useEffect, useRef, useState } from "react";
import {
  POLL_INTERVAL_MS,
  SERVICE_EMOJI,
  SERVICE_LABEL,
  PAYMENT_EMOJI,
  PAYMENT_LABEL,
} from "@/lib/constants";
import { formatRupiah } from "@/lib/format";
import { updateOrderStatus } from "@/lib/actions/order";
import type { OrderDTO } from "@/lib/actions/order";

type AudioHandle = {
  ctx: AudioContext;
  osc: OscillatorNode;
  gain: GainNode;
  loop: ReturnType<typeof setInterval>;
};

/**
 * Full-screen merchant alert modal + sound alarm (PRD §3.3 / design.md §2.2).
 * Polls the newest PENDING order; rings a Web-Audio bell loop until the merchant
 * accepts (→ DIPROSES) or rejects (→ BATAL).
 */
export function MerchantAlertModal({ warungId }: { warungId: string }) {
  const [order, setOrder] = useState<OrderDTO | null>(null);
  const [busy, setBusy] = useState(false);
  const ackRef = useRef<string | null>(null);
  const audioRef = useRef<AudioHandle | null>(null);

  // Poll newest pending order
  useEffect(() => {
    let active = true;
    async function tick() {
      try {
        const res = await fetch(`/api/warung/${warungId}/pending-order`, {
          cache: "no-store",
        });
        const data = (await res.json()) as { order: OrderDTO | null };
        if (!active) return;
        const o = data.order;
        if (o && o.id !== ackRef.current) {
          setOrder(o);
          startAlarm();
        } else if (!o) {
          setOrder(null);
          stopAlarm();
        }
      } catch {
        /* transient — keep last state */
      }
    }
    tick();
    const id = setInterval(tick, POLL_INTERVAL_MS);
    return () => {
      active = false;
      clearInterval(id);
      stopAlarm();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [warungId]);

  function startAlarm() {
    stopAlarm();
    try {
      const w = window as unknown as {
        AudioContext?: typeof AudioContext;
        webkitAudioContext?: typeof AudioContext;
      };
      const Ctor = w.AudioContext ?? w.webkitAudioContext;
      if (!Ctor) return;
      const ctx = new Ctor();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.value = 880;
      gain.gain.value = 0;
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      let on = true;
      gain.gain.value = 0.15;
      const loop = setInterval(() => {
        on = !on;
        gain.gain.value = on ? 0.15 : 0;
      }, 500);
      audioRef.current = { ctx, osc, gain, loop };
    } catch {
      /* audio unavailable */
    }
  }

  function stopAlarm() {
    const a = audioRef.current;
    if (!a) return;
    try {
      clearInterval(a.loop);
      a.gain.gain.value = 0;
      a.osc.stop();
      a.ctx.close();
    } catch {
      /* already closed */
    }
    audioRef.current = null;
  }

  // Browsers block autoplay until first user gesture — resume on interaction.
  useEffect(() => {
    const resume = () => {
      audioRef.current?.ctx.resume?.().catch(() => {});
    };
    window.addEventListener("pointerdown", resume, { once: true });
    return () => window.removeEventListener("pointerdown", resume);
  }, []);

  async function act(status: "DIPROSES" | "BATAL") {
    if (!order || busy) return;
    setBusy(true);
    try {
      await updateOrderStatus(order.id, status);
      ackRef.current = order.id;
      setOrder(null);
      stopAlarm();
    } finally {
      setBusy(false);
    }
  }

  if (!order) return null;

  return (
    <div className="fixed inset-0 bg-ink/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-canvas-pure rounded-pill w-full max-w-md p-6 space-y-6 shadow-2xl border-4 border-lime">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-center text-ink">
            🔔 ADA PESANAN BARU!
          </h2>
          <p className="text-xs font-bold text-mute text-center">
            Alarm bel berbunyi…
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-lg font-black text-ink">#{order.orderNumber}</span>
            <span className="bg-lime-pale text-ink-deep text-xs font-black px-3 py-1 rounded-full">
              {SERVICE_EMOJI[order.serviceType]} {SERVICE_LABEL[order.serviceType].toUpperCase()}
            </span>
          </div>

          <div className="bg-canvas-soft p-4 rounded-[16px] text-base font-semibold text-ink space-y-1">
            {order.items.map((it) => (
              <div key={it.id} className="flex justify-between">
                <span>
                  {it.quantity}× {it.productName}
                </span>
                <span>{formatRupiah(it.price * it.quantity)}</span>
              </div>
            ))}
            {order.customNote && (
              <div className="pt-2 border-t border-mute/30 text-sm text-body">
                📝 {order.customNote}
              </div>
            )}
          </div>

          <div className="flex justify-between items-center">
            <span className="text-2xl font-black text-ink">
              {formatRupiah(order.totalAmount)}
            </span>
            <span className="bg-warning text-ink text-xs font-extrabold px-2.5 py-1 rounded-md">
              {PAYMENT_EMOJI[order.paymentMethod]} {PAYMENT_LABEL[order.paymentMethod].toUpperCase()}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => act("BATAL")}
            disabled={busy}
            className="h-16 bg-canvas-soft text-negative font-bold rounded-[16px] disabled:opacity-50"
          >
            Tolak
          </button>
          <button
            type="button"
            onClick={() => act("DIPROSES")}
            disabled={busy}
            className="h-16 bg-lime text-ink text-xl font-black rounded-pill hover:bg-lime-hover active:scale-95 transition-all disabled:opacity-50"
          >
            {busy ? "…" : "TERIMA"}
          </button>
        </div>
      </div>
    </div>
  );
}
