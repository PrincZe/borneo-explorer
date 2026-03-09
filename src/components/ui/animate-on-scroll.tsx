'use client'

import { useIntersectionObserver } from '@/hooks/use-intersection-observer'

type AnimationType = 'fade-in' | 'slide-up' | 'slide-left' | 'slide-right' | 'scale-up'

interface AnimateOnScrollProps {
  children: React.ReactNode
  animation?: AnimationType
  delay?: number
  duration?: number
  className?: string
}

export function AnimateOnScroll({
  children,
  animation = 'fade-in',
  delay = 0,
  duration = 0.6,
  className = '',
}: AnimateOnScrollProps) {
  const { ref, isVisible } = useIntersectionObserver()

  return (
    <div
      ref={ref}
      className={`animate-on-scroll ${isVisible ? `animate-${animation}` : ''} ${className}`}
      style={{
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
      }}
    >
      {children}
    </div>
  )
}
