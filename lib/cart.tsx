"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type CartItem = {
  productId: string;
  productName: string;
  price: number;
  qty: number;
};

type CartState = {
  warungId: string | null;
  warungName: string | null;
  items: CartItem[];
  customNote: string;
};

type CartContextValue = CartState & {
  setWarung: (id: string, name: string) => void;
  setQty: (productId: string, productName: string, price: number, qty: number) => void;
  setCustomNote: (note: string) => void;
  clear: () => void;
  itemCount: number;
  subtotal: number;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "dw-cart-v1";
const EMPTY: CartState = {
  warungId: null,
  warungName: null,
  items: [],
  customNote: "",
};

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CartState>(EMPTY);

  // Hydrate from localStorage after mount (avoids SSR mismatch).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setState({ ...EMPTY, ...JSON.parse(raw) });
    } catch {
      /* ignore */
    }
  }, []);

  // Persist on change.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state]);

  const setWarung = useCallback((id: string, name: string) => {
    setState((s) =>
      s.warungId === id ? s : { ...EMPTY, warungId: id, warungName: name },
    );
  }, []);

  const setQty = useCallback(
    (productId: string, productName: string, price: number, qty: number) => {
      setState((s) => {
        const others = s.items.filter((i) => i.productId !== productId);
        if (qty <= 0) return { ...s, items: others };
        return { ...s, items: [...others, { productId, productName, price, qty }] };
      });
    },
    [],
  );

  const setCustomNote = useCallback((note: string) => {
    setState((s) => ({ ...s, customNote: note }));
  }, []);

  const clear = useCallback(() => setState(EMPTY), []);

  const itemCount = useMemo(
    () => state.items.reduce((n, i) => n + i.qty, 0),
    [state.items],
  );
  const subtotal = useMemo(
    () => state.items.reduce((s, i) => s + i.price * i.qty, 0),
    [state.items],
  );

  const value: CartContextValue = {
    ...state,
    setWarung,
    setQty,
    setCustomNote,
    clear,
    itemCount,
    subtotal,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
