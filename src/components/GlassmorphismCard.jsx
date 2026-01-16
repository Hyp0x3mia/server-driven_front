import React from 'react';
import { cn } from '@/lib/utils';

const GlassmorphismCard = ({ children, className, ...props }) => {
  return (
    <div
      className={cn(
        'bg-slate-800/80 backdrop-blur-md border border-slate-700 rounded-xl',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default GlassmorphismCard;

