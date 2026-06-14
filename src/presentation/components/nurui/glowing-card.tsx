'use client';
import { cn } from '@/shared/utils/cn';
import React, { useEffect, useState } from 'react';

interface GlowingCardProps {
  className?: string;
  children?: React.ReactNode;
  colors?: string[];
}

export function GlowingCard({
  className,
  children,
  colors = ['#a855f7', '#ec4899', '#f97316', '#3b82f6', '#10b981', '#a855f7'],
}: GlowingCardProps) {
  const [angle, setAngle] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setAngle((prev) => (prev + 1) % 360);
    }, 10);
    return () => clearInterval(interval);
  }, []);

  const colorStr = colors.join(', ');

  return (
    <div className={cn('relative overflow-hidden rounded-xl p-[2px]', className)}>
      <div
        className="absolute -inset-4 -z-10 pointer-events-none blur-lg border-[20px] rounded-xl"
        style={{
          borderImage: `conic-gradient(from ${angle}deg, ${colorStr}) 1`,
          borderStyle: 'solid',
        }}
      />
      <div className="relative z-10 rounded-xl overflow-hidden">{children}</div>
    </div>
  );
}
