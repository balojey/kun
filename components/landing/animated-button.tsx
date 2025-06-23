'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AnimatedButtonProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  onClick?: () => void;
  href?: string;
}

export function AnimatedButton({ 
  children, 
  className, 
  variant = 'default', 
  size = 'default',
  onClick,
  href
}: AnimatedButtonProps) {
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = () => {
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 300);
    onClick?.();
  };

  const buttonContent = (
    <motion.div
      whileHover={{ 
        scale: 1.02,
        boxShadow: variant === 'default' 
          ? '0 10px 25px -5px rgba(59, 130, 246, 0.3), 0 10px 10px -5px rgba(59, 130, 246, 0.1)'
          : '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className="relative overflow-hidden"
    >
      <Button
        variant={variant}
        size={size}
        className={cn(
          'relative transition-all duration-200',
          variant === 'default' && 'bg-primary hover:bg-primary/90 shadow-lg',
          className
        )}
        onClick={handleClick}
      >
        {children}
        
        {/* Ripple effect */}
        {isClicked && (
          <motion.div
            className="absolute inset-0 bg-white/20 rounded-full"
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 4, opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        )}
        
        {/* Glow effect for primary buttons */}
        {variant === 'default' && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-primary/50 to-blue-500/50 rounded-lg opacity-0"
            whileHover={{ opacity: 0.1 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </Button>
    </motion.div>
  );

  if (href) {
    return (
      <a href={href} className="inline-block">
        {buttonContent}
      </a>
    );
  }

  return buttonContent;
}