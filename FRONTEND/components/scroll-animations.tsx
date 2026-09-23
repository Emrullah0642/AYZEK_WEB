"use client"

import type React from "react"
import { motion, useInView, Variants } from "framer-motion"
import { useRef } from "react"

interface ScrollAnimationProps {
  children: React.ReactNode
  className?: string
  animation?: "fade-up" | "fade-in" | "slide-left" | "slide-right" | "slide-in-left" | "slide-in-right" | "scale-up"
  delay?: number
}

export function ScrollAnimation({ 
  children, 
  className = "", 
  animation = "fade-up", 
  delay = 0 
}: ScrollAnimationProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { 
    once: true,
    margin: "-50px 0px -50px 0px"
  })

  const getAnimationVariants = (): Variants => {
    const baseTransition = {
      duration: 0.8,
      delay: delay / 1000,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number]
    }

    switch (animation) {
      case "fade-up":
        return {
          hidden: { opacity: 0, y: 40 },
          visible: { 
            opacity: 1, 
            y: 0,
            transition: baseTransition
          }
        }
      case "fade-in":
        return {
          hidden: { opacity: 0 },
          visible: { 
            opacity: 1,
            transition: baseTransition
          }
        }
      case "slide-left":
        return {
          hidden: { opacity: 0, x: -40 },
          visible: { 
            opacity: 1, 
            x: 0,
            transition: baseTransition
          }
        }
      case "slide-right":
        return {
          hidden: { opacity: 0, x: 40 },
          visible: { 
            opacity: 1, 
            x: 0,
            transition: baseTransition
          }
        }
      case "slide-in-left":
        return {
          hidden: { opacity: 0, x: -60 },
          visible: { 
            opacity: 1, 
            x: 0,
            transition: { ...baseTransition, duration: 0.9 }
          }
        }
      case "slide-in-right":
        return {
          hidden: { opacity: 0, x: 60 },
          visible: { 
            opacity: 1, 
            x: 0,
            transition: { ...baseTransition, duration: 0.9 }
          }
        }
      case "scale-up":
        return {
          hidden: { opacity: 0, scale: 0.92 },
          visible: { 
            opacity: 1, 
            scale: 1,
            transition: baseTransition
          }
        }
      default:
        return {
          hidden: { opacity: 0, y: 40 },
          visible: { 
            opacity: 1, 
            y: 0,
            transition: baseTransition
          }
        }
    }
  }

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={getAnimationVariants()}
      className={className}
    >
      {children}
    </motion.div>
  )
}
