import React from 'react';
import { cn } from '../../utils/cn';

interface SkeletonProps {
  className?: string;
  rows?: number;
}

const Skeleton: React.FC<SkeletonProps> = ({ className, rows = 1 }) => (
  <>
    {Array.from({ length: rows }).map((_, i) => (
      <div
        key={i}
        className={cn('animate-pulse rounded-md bg-raised h-4', className)}
      />
    ))}
  </>
);

export default Skeleton;
