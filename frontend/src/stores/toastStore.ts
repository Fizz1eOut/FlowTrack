import { ref } from 'vue';

export type ToastType = 'success' | 'error'

export interface ToastData {
  id: number
  message: string
  type: ToastType
}

export const toasts = ref<ToastData[]>([]);
let idCounter = 0;

export function showToast(message: string, type: ToastType = 'success') {
  const id = ++idCounter;
  toasts.value.push({ id, message, type }); 

  setTimeout(() => {
    removeToast(id);
  }, 3000);
}

export function removeToast(id: number) {
  toasts.value = toasts.value.filter(t => t.id !== id);
}
