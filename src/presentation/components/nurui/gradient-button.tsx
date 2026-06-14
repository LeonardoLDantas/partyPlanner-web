import { cn } from '@/shared/utils/cn';
import React, { type CSSProperties } from 'react';
import './gradient-button.css';

interface GradientButtonProps {
  borderWidth?: number;
  colors?: string[];
  duration?: number;
  borderRadius?: number;
  blur?: number;
  className?: string;
  bgColor?: string;
  children?: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

export function GradientButton({
  borderWidth = 2,
  colors = ['#a855f7', '#ec4899', '#f97316', '#a855f7'],
  duration = 2500,
  borderRadius = 10,
  blur = 4,
  className,
  bgColor = '#0d0f1a',
  children,
  onClick,
  type = 'button',
  disabled,
}: GradientButtonProps) {
  const gradientStyle = {
    '--allColors': colors.join(', '),
    '--duration': `${duration}ms`,
    '--borderWidth': `${borderWidth}px`,
    '--borderRadius': `${borderRadius}px`,
    '--blur': `${blur}px`,
    '--bgColor': bgColor,
  } as CSSProperties;

  return (
    <div className="inline-block">
      <button
        disabled={disabled}
        onClick={onClick}
        style={gradientStyle}
        type={type}
        className={cn(
          'relative flex items-center justify-center min-w-28 min-h-10 overflow-hidden rainbow-btn before:absolute before:-inset-[200%] animate-rainbow disabled:opacity-50 disabled:cursor-not-allowed',
          className
        )}
      >
        <span className="text-white btn-content inline-flex w-full h-full items-center justify-center gap-2 px-4 py-2 text-sm font-semibold">
          {children}
        </span>
      </button>
    </div>
  );
}
