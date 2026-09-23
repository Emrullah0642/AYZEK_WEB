"use client"

import { useRef } from "react"
import { motion, useInView, useReducedMotion, type Variants } from "framer-motion"

interface Word {
  text: string
  className?: string
  breakBefore?: boolean
}

interface KineticHeadingProps {
  as?: "h1" | "h2"
  words: Word[]
  className?: string
}

const container: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.07, delayChildren: 0.05 },
  },
}

const wordVariant: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}

/**
 * Kelime kelime içeri giren başlık — ScrollAnimation'ın altyapısıyla (framer-motion + useInView) tutarlı.
 * Erişilebilirlik: ekran okuyucular parçalanmış <span>'ları değil, tek/temiz metni okusun diye
 * gerçek metin `aria-hidden` katmanda, tam cümle ayrı bir sr-only düğümde tutulur.
 * `prefers-reduced-motion` açık olan kullanıcılarda stagger/y hareketi devre dışı kalır, sadece fade olur.
 */
export function KineticHeading({ as = "h1", words, className }: KineticHeadingProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-50px 0px -50px 0px" })
  const reduceMotion = useReducedMotion()
  const Tag = motion[as]
  const fullText = words.map((w) => w.text).join(" ")

  const variants = reduceMotion
    ? {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.4 } },
      }
    : wordVariant

  return (
    <Tag
      ref={ref}
      className={className}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={reduceMotion ? undefined : container}
      aria-label={fullText}
    >
      <span aria-hidden="true">
        {words.map((w, i) => (
          <span key={i} style={{ display: "inline" }}>
            {w.breakBefore && <br className="hidden lg:block" />}
            <motion.span
              initial={reduceMotion ? "hidden" : undefined}
              animate={reduceMotion ? (isInView ? "visible" : "hidden") : undefined}
              variants={variants}
              className={w.className}
              style={{ display: "inline-block" }}
            >
              {w.text}
            </motion.span>{" "}
          </span>
        ))}
      </span>
    </Tag>
  )
}
