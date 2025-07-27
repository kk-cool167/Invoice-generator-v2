import React, { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Button, ButtonProps } from './button';
import { cn } from '@/lib/utils';

interface AnimatedButtonProps extends ButtonProps {
  animationType?: 'scale' | 'lift' | 'bounce';
}

export function AnimatedButton({ 
  animationType = 'scale',
  className,
  children,
  ...props 
}: AnimatedButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleMouseEnter = () => {
    if (props.disabled || !buttonRef.current) return;

    const animations = {
      scale: { scale: 1.05, duration: 0.2 },
      lift: { y: -2, scale: 1.02, duration: 0.2 },
      bounce: { y: -3, scale: 1.05, duration: 0.3, ease: "back.out(2)" }
    };

    gsap.to(buttonRef.current, animations[animationType]);
  };

  const handleMouseLeave = () => {
    if (props.disabled || !buttonRef.current) return;

    gsap.to(buttonRef.current, {
      y: 0,
      scale: 1,
      duration: 0.2,
      ease: "power2.out"
    });
  };

  return (
    <Button
      ref={buttonRef}
      className={cn("transition-all duration-200", className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {children}
    </Button>
  );
}