import React from 'react';
import { cn } from '../../lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className }) => (
  <div className={cn('rounded-lg border bg-white p-6 shadow-sm', className)}>
    {children}
  </div>
);

export const CardHeader: React.FC<CardProps> = ({ children, className }) => (
  <div className={cn('flex flex-col space-y-1.5 mb-4', className)}>
    {children}
  </div>
);

export const CardTitle: React.FC<CardProps> = ({ children, className }) => (
  <h3 className={cn('text-2xl font-semibold leading-none tracking-tight', className)}>
    {children}
  </h3>
);

export const CardContent: React.FC<CardProps> = ({ children, className }) => (
  <div className={cn('', className)}>
    {children}
  </div>
);
