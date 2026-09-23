"use client"

import { useEffect, useRef, useState } from "react"
import { useInView, useReducedMotion } from "framer-motion"

interface CountUpProps {
  value: string
  className?: string
  duration?: number
}

/**
 * "150+" gibi bir metindeki sayısal kısmı görünüme girince 0'dan yukarı sayar,
 * sayı olmayan önek/sonek (+, yıl vb.) olduğu gibi korunur.
 */
export function CountUp({ value, className, duration = 1200 }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-10px" })
  const reduceMotion = useReducedMotion()
  const [display, setDisplay] = useState(value)

  const match = value.match(/^(\D*)(\d+)(\D*)$/)

  useEffect(() => {
    if (!isInView || !match || reduceMotion) return
    const [, prefix, numStr, suffix] = match
    const target = parseInt(numStr, 10)
    const start = performance.now()

    let raf: number
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = Math.round(target * eased)
      setDisplay(`${prefix}${current}${suffix}`)
      if (progress < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [isInView, duration, match ? match[0] : value]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <span ref={ref} className={className}>
      {match ? display : value}
    </span>
  )
}
