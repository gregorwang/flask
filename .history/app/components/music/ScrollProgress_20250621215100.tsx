import { forwardRef } from "react";

interface ScrollProgressProps {
  className?: string;
}

export const ScrollProgress = forwardRef<HTMLDivElement, ScrollProgressProps>(
  ({ className = "" }, ref) => {
    return (
      <div
        ref={ref}
        className={`scroll-progress fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 transform-gpu origin-left scale-x-0 z-50 ${className}`}
        style={{
          background: 'linear-gradient(90deg, #8b5cf6 0%, #ec4899 50%, #3b82f6 100%)',
          boxShadow: '0 0 10px rgba(139, 92, 246, 0.5)',
        }}
      >
        {/* 发光效果 */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 blur-sm opacity-75" />
        
        {/* 脉冲效果 */}
        <div className="absolute right-0 top-0 w-20 h-full bg-gradient-to-l from-white/30 to-transparent animate-pulse" />
      </div>
    );
  }
);

ScrollProgress.displayName = 'ScrollProgress';

export default ScrollProgress;