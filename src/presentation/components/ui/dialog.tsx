import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { motion } from 'motion/react';
import type * as React from 'react';

import { cn } from '@/shared/utils/cn';

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

export function DialogContent({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay asChild>
        <motion.div
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 bg-background/75 backdrop-blur-md"
          initial={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
        />
      </DialogPrimitive.Overlay>
      <DialogPrimitive.Content asChild {...props}>
        <motion.div
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className={cn(
            'fixed left-1/2 top-1/2 z-50 grid max-h-[88vh] w-[calc(100vw-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 gap-4 overflow-y-auto rounded-lg border border-border bg-card p-5 text-card-foreground shadow-2xl md:p-6',
            className
          )}
          initial={{ opacity: 0, y: 18, scale: 0.98 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
        >
          {children}
          <DialogPrimitive.Close className="absolute right-4 top-4 rounded-md p-1 text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground">
            <X size={18} />
          </DialogPrimitive.Close>
        </motion.div>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('grid gap-1.5 pr-8', className)} {...props} />
);

export const DialogTitle = DialogPrimitive.Title;
export const DialogDescription = DialogPrimitive.Description;
