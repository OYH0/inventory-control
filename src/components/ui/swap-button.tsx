import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SwapButtonProps {
  onSwipe: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
  swipeThreshold?: number;
}

export function SwapButton({ 
  onSwipe, 
  disabled = false, 
  children, 
  className,
  swipeThreshold = 80 
}: SwapButtonProps) {
  const [isSwipeActive, setIsSwipeActive] = useState(false);
  const [swipeDistance, setSwipeDistance] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const startX = useRef<number>(0);
  const currentX = useRef<number>(0);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleStart = (clientX: number) => {
    if (disabled || isCompleted) return;
    setIsSwipeActive(true);
    startX.current = clientX;
    currentX.current = clientX;
  };

  const handleMove = (clientX: number) => {
    if (!isSwipeActive || disabled || isCompleted) return;
    
    currentX.current = clientX;
    const deltaX = Math.max(0, currentX.current - startX.current);
    const maxDistance = buttonRef.current ? buttonRef.current.offsetWidth - 60 : 200;
    const clampedDistance = Math.min(deltaX, maxDistance);
    
    setSwipeDistance(clampedDistance);
  };

  const handleEnd = () => {
    if (!isSwipeActive || disabled || isCompleted) return;
    
    setIsSwipeActive(false);
    
    if (swipeDistance >= swipeThreshold) {
      setIsCompleted(true);
      setSwipeDistance(buttonRef.current ? buttonRef.current.offsetWidth - 60 : 200);
      
      // Trigger action after animation
      setTimeout(() => {
        onSwipe();
      }, 200);
    } else {
      setSwipeDistance(0);
    }
  };

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleStart(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handleMove(e.clientX);
  };

  const handleMouseUp = () => {
    handleEnd();
  };

  const handleMouseLeave = () => {
    if (isSwipeActive) {
      handleEnd();
    }
  };

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    handleStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    handleMove(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    handleEnd();
  };

  return (
    <div className="relative">
      <Button
        ref={buttonRef}
        className={cn(
          "relative overflow-hidden bg-success hover:bg-success/90 text-success-foreground font-medium",
          "transition-all duration-200 select-none cursor-grab active:cursor-grabbing",
          isCompleted && "bg-success cursor-default",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
        disabled={disabled}
        onMouseDown={handleMouseDown}
        onMouseMove={isSwipeActive ? handleMouseMove : undefined}
        onMouseUp={isSwipeActive ? handleMouseUp : undefined}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={isSwipeActive ? handleTouchMove : undefined}
        onTouchEnd={isSwipeActive ? handleTouchEnd : undefined}
      >
        {/* Background track */}
        <div className="absolute inset-0 bg-success/40" />

        {/* Sliding thumb */}
        <div
          className={cn(
            "absolute left-1 top-1 bottom-1 w-12 bg-card rounded-sm shadow-md",
            "flex items-center justify-center transition-transform duration-200",
            "z-10"
          )}
          style={{
            transform: `translateX(${swipeDistance}px)`,
            transition: isSwipeActive ? 'none' : 'transform 200ms ease-out'
          }}
        >
          {isCompleted ? (
            <Check className="w-4 h-4 text-success" />
          ) : (
            <ArrowRight className="w-4 h-4 text-success" />
          )}
        </div>

        {/* Button text */}
        <div className="relative z-0 flex items-center justify-center w-full">
          <span className="text-sm font-medium text-success-foreground">
            {isCompleted ? "Concluído!" : children}
          </span>
        </div>

        {/* Progress indicator */}
        {isSwipeActive && (
          <div
            className="absolute bottom-0 left-0 h-1 bg-success transition-all duration-100"
            style={{ width: `${(swipeDistance / swipeThreshold) * 100}%` }}
          />
        )}
      </Button>

      {/* Instruction text */}
      {!isCompleted && (
        <p className="text-xs text-muted-foreground mt-1 text-center">
          Deslize para confirmar →
        </p>
      )}
    </div>
  );
}