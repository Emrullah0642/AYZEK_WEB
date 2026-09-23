"use client"

import { useRef, type ReactNode } from "react"
import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion"

interface MagneticButtonProps {
  children: ReactNode
  className?: string
  strength?: number
}

/** Butonu imlecin yaklaşmasıyla hafifçe kendine çeken sarmalayıcı. `prefers-reduced-motion`'da devre dışı. */
export function MagneticButton({ children, className, strength = 0.35 }: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduceMotion = useReducedMotion()
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 200, damping: 15, mass: 0.4 })
  const springY = useSpring(y, { stiffness: 200, damping: 15, mass: 0.4 })

  if (reduceMotion) {
    return <div className={className}>{children}</div>
  }

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    const relX = e.clientX - (rect.left + rect.width / 2)
    const relY = e.clientY - (rect.top + rect.height / 2)
    x.set(relX * strength)
    y.set(relY * strength)
  }

  const handleLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ x: springX, y: springY }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
