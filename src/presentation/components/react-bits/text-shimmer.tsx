/**
 * TextShimmer — React Bits
 * Source: https://reactbits.dev/text-animations/text-shimmer
 * Animated shimmer effect on text using CSS mask + gradient.
 */
import { cn } from '@/shared/utils/cn';
import React, { type CSSProperties } from 'react';

interface TextShimmerProps {
  children: string;
  as?: React.ElementType;
  className?: string;
  duration?: number;
  spread?: number;
}

export function TextShimmer({
  children,
  as: Component = 'p',
  className,
  duration = 2,
  spread = 2,
}: TextShimmerProps) {
  const dynamicSpread = spread * children.length;

  return (
    <Component
      className={cn(
        'relative inline-block bg-[length:250%_100%,auto] bg-clip-text text-transparent',
        '[--shimmer-color:white]',
        'bg-[linear-gradient(110deg,transparent_25%,var(--shimmer-color)_50%,transparent_75%),linear-gradient(var(--base-color,#a1a1aa),var(--base-color,#a1a1aa))]',
        'animate-shimmer-text',
        className
      )}
      style={
        {
          '--shimmer-duration': `${duration}s`,
          '--spread': dynamicSpread,
          animationDuration: `${duration}s`,
        } as CSSProperties
      }
    >
      {children}
    </Component>
  );
}
