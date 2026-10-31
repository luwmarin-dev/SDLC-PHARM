import { create } from "zustand";

export type ToastTone = "success" | "error" | "info";

export interface Toast {
  id: string;
  tone: ToastTone;
  title: string;
  description?: string;
  /** Milliseconds before the toast auto-dismisses. 0 keeps it until dismissed. */
  duration: number;
}

export interface ToastInput {
  tone?: ToastTone;
  title: string;
  description?: string;
  duration?: number;
}

interface ToastState {
  toasts: Toast[];
  push: (input: ToastInput) => string;
  dismiss: (id: string) => void;
  clear: () => void;
}

const MAX_VISIBLE = 3;

let counter = 0;
const nextId = () => `toast-${Date.now()}-${counter++}`;

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: ({ tone = "info", title, description, duration = 4000 }) => {
    const id = nextId();
    set((state) => ({
      // Keep the stack short so a burst of toasts never covers the viewport.
      toasts: [...state.toasts, { id, tone, title, description, duration }].slice(
        -MAX_VISIBLE,
      ),
    }));
    return id;
  },
  dismiss: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
  clear: () => set({ toasts: [] }),
}));

/**
 * Imperative helper for code outside React (services, event handlers).
 * Inside components prefer `useToast()` so the call site stays declarative.
 */
export const toast = {
  success: (title: string, description?: string) =>
    useToastStore.getState().push({ tone: "success", title, description }),
  error: (title: string, description?: string) =>
    useToastStore.getState().push({ tone: "error", title, description }),
  info: (title: string, description?: string) =>
    useToastStore.getState().push({ tone: "info", title, description }),
};
