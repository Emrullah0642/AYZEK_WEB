"use client"

import { useRef, type ReactNode } from "react"
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion"

interface TiltCardProps {
  children: ReactNode
  className?: string
  maxTilt?: number
  onClick?: () => void
}

/**
 * Pointer'a duyarlı hafif 3D tilt sarmalayıcı. İçindeki kartın kendi stilini
 * (spotlight, hover glow vb.) bozmadan sadece perspektif/döndürme ekler.
 * `prefers-reduced-motion` açık olan kullanıcılarda tilt tamamen devre dışı kalır.
 */
export function TiltCard({ children, className, maxTilt = 6, onClick }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduceMotion = useReducedMotion()
  const mvX = useMotionValue(0.5)
  const mvY = useMotionValue(0.5)

  const springX = useSpring(mvX, { stiffness: 250, damping: 20, mass: 0.5 })
  const springY = useSpring(mvY, { stiffness: 250, damping: 20, mass: 0.5 })

  const rotateX = useTransform(springY, [0, 1], [maxTilt, -maxTilt])
  const rotateY = useTransform(springX, [0, 1], [-maxTilt, maxTilt])
  const scale = useSpring(1, { stiffness: 250, damping: 20 })

  if (reduceMotion) {
    return (
      <div className={className} onClick={onClick}>
        {children}
      </div>
    )
  }

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    mvX.set((e.clientX - rect.left) / rect.width)
    mvY.set((e.clientY - rect.top) / rect.height)
  }

  const handleLeave = () => {
    mvX.set(0.5)
    mvY.set(0.5)
    scale.set(1)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseEnter={() => scale.set(1.015)}
      onMouseLeave={handleLeave}
      onClick={onClick}
      style={{ rotateX, rotateY, scale, transformPerspective: 1000 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
