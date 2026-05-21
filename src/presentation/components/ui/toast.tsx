import * as ToastPrimitive from '@radix-ui/react-toast';
import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

export type ToastMessage = {
  id: string;
  title: string;
  message: string;
};

export const ToastProvider = ToastPrimitive.Provider;

export function ToastViewport() {
  return (
    <ToastPrimitive.Viewport className="fixed right-4 top-4 z-[70] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-3 outline-none md:right-6 md:top-6" />
  );
}

export function ToastStack({
  toasts,
  onDismiss
}: {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}) {
  return (
    <>
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastPrimitive.Root asChild key={toast.id} open>
            <motion.div
              animate={{ opacity: 1, x: 0, scale: 1 }}
              className="relative overflow-hidden rounded-lg border border-border bg-card p-4 pr-11 text-card-foreground shadow-2xl"
              exit={{ opacity: 0, x: 24, scale: 0.98 }}
              initial={{ opacity: 0, x: 24, scale: 0.98 }}
              transition={{ duration: 0.18 }}
            >
              <div className="celebra-progress-fill absolute inset-y-0 left-0 w-1" />
              <ToastPrimitive.Title className="text-sm font-semibold">{toast.title}</ToastPrimitive.Title>
              <ToastPrimitive.Description className="mt-1 text-sm leading-5 text-muted-foreground">
                {toast.message}
              </ToastPrimitive.Description>
              <ToastPrimitive.Close
                className="absolute right-3 top-3 rounded-md p-1 text-muted-foreground hover:bg-white/10 hover:text-foreground"
                onClick={() => onDismiss(toast.id)}
              >
                <X size={16} />
              </ToastPrimitive.Close>
            </motion.div>
          </ToastPrimitive.Root>
        ))}
      </AnimatePresence>
      <ToastViewport />
    </>
  );
}
