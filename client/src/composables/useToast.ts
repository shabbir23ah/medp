import { ref } from 'vue';

export interface Toast {
  id: number;
  type: 'success' | 'error' | 'info';
  message: string;
}

// Module-level singleton — shared across all components
const toasts = ref<Toast[]>([]);
let seq = 0;

function push(type: Toast['type'], message: string, duration: number) {
  const id = ++seq;
  toasts.value.push({ id, type, message });
  setTimeout(() => dismiss(id), duration);
}

function dismiss(id: number) {
  toasts.value = toasts.value.filter((t) => t.id !== id);
}

export function useToast() {
  return {
    toasts,
    dismiss,
    success: (message: string) => push('success', message, 3200),
    error: (message: string) => push('error', message, 4500),
    info: (message: string) => push('info', message, 3200),
  };
}
