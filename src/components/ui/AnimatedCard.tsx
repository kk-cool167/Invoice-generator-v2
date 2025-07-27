import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Card, CardProps } from './card';
import { cn } from '@/lib/utils';

interface AnimatedCardProps extends CardProps {
  animationType?: 'slideUp' | 'fade' | 'scale';
  delay?: number;
  children: React.ReactNode;
}

export function AnimatedCard({ 
  animationType = 'slideUp',
  delay = 0,
  className,
  children,
  ...props 
}: AnimatedCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!cardRef.current) return;

    const animations = {
      slideUp: {
        from: { opacity: 0, y: 30, scale: 0.95 },
        to: { opacity: 1, y: 0, scale: 1 }
      },
      fade: {
        from: { opacity: 0 },
        to: { opacity: 1 }
      },
      scale: {
        from: { opacity: 0, scale: 0.8 },
        to: { opacity: 1, scale: 1 }
      }
    };

    const { from, to } = animations[animationType];

    gsap.fromTo(cardRef.current, from, {
      ...to,
      duration: 0.6,
      ease: "power2.out",
      delay
    });
  }, { scope: cardRef });

  return (
    <Card 
      ref={cardRef}
      className={cn(
        "transform transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/30",
        className
      )}
      {...props}
    >
      {children}
    </Card>
  );
}