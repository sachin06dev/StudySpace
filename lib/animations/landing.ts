import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

let activeLenis: Lenis | null = null

/**
 * Initialize Lenis smooth scroll and wire it to the GSAP ticker.
 *
 * Returns a cleanup function that removes the EXACT same ticker fn reference
 * and calls lenis.destroy() — preventing ticker accumulation on React remounts.
 *
 * Usage:
 *   useEffect(() => {
 *     const cleanup = initLenis()
 *     return cleanup
 *   }, [])
 */
export function initLenis(): () => void {
  const lenis = new Lenis({
    duration: 1.2,
    anchors: true,          // Fix #2: handle #hash anchor links with smooth glide
    smoothWheel: true,
  })

  activeLenis = lenis

  // Keep GSAP ScrollTrigger in sync with Lenis scroll position
  lenis.on('scroll', ScrollTrigger.update)

  // Capture the exact fn reference so gsap.ticker.remove can find it
  const tick = (t: number) => lenis.raf(t * 1000)
  gsap.ticker.add(tick)
  gsap.ticker.lagSmoothing(0)

  // Return cleanup: removes THIS tick fn (not an anonymous wrapper)
  return () => {
    gsap.ticker.remove(tick)
    lenis.destroy()
    if (activeLenis === lenis) {
      activeLenis = null
    }
  }
}

export function stopLenis() {
  activeLenis?.stop()
}

export function startLenis() {
  activeLenis?.start()
}

/**
 * Reusable fade-up + ScrollTrigger factory. Returns the GSAP tween for
 * cleanup, or null when reduced motion is active.
 */
export function createScrollReveal(
  element: HTMLElement | null,
  opts: { delay?: number; distance?: number; start?: string } = {}
): gsap.core.Tween | null {
  if (!element || isReducedMotion()) return null
  return gsap.fromTo(
    element,
    { y: opts.distance ?? 30, opacity: 0 },
    {
      y: 0,
      opacity: 1,
      duration: 0.7,
      ease: 'power2.out',
      delay: opts.delay ?? 0,
      scrollTrigger: {
        trigger: element,
        start: opts.start ?? 'top 88%',
        toggleActions: 'play none none none',
      },
    }
  )
}

/**
 * Reusable stagger reveal factory for lists of elements.
 */
export function createStaggerReveal(
  elements: (HTMLElement | null)[],
  opts: { stagger?: number; distance?: number; start?: string } = {}
): gsap.core.Tween | null {
  const valid = elements.filter((e): e is HTMLElement => e !== null)
  if (!valid.length || isReducedMotion()) return null
  return gsap.fromTo(
    valid,
    { y: opts.distance ?? 20, opacity: 0 },
    {
      y: 0,
      opacity: 1,
      duration: 0.55,
      ease: 'power2.out',
      stagger: opts.stagger ?? 0.08,
      scrollTrigger: {
        trigger: valid[0],
        start: opts.start ?? 'top 85%',
        toggleActions: 'play none none none',
      },
    }
  )
}

/**
 * Check whether the user has requested reduced motion.
 */
export function isReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Splits plain text nodes of an element into masked span.word > span elements
 * for high-end typographic word-by-word reveal animations.
 */
export function splitTextIntoWords(element: HTMLElement): HTMLElement[] {
  if (!element) return []
  const childNodes = Array.from(element.childNodes)
  const wordInnerSpans: HTMLElement[] = []

  childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE && node.textContent) {
      const words = node.textContent.split(/(\s+)/)
      const fragment = document.createDocumentFragment()

      words.forEach((part) => {
        if (!part) return
        if (/^\s+$/.test(part)) {
          fragment.appendChild(document.createTextNode(part))
        } else {
          const outer = document.createElement('span')
          outer.className = 'inline-block overflow-hidden align-top'
          const inner = document.createElement('span')
          inner.className = 'inline-block word-inner'
          inner.textContent = part
          outer.appendChild(inner)
          fragment.appendChild(outer)
          wordInnerSpans.push(inner)
        }
      })

      element.replaceChild(fragment, node)
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      wordInnerSpans.push(...splitTextIntoWords(node as HTMLElement))
    }
  })

  return wordInnerSpans
}

/**
 * Creates magnetic hover physics for buttons on desktop pointer devices.
 */
export function setupMagnetic(
  element: HTMLElement | null,
  strengthX: number = 0.25,
  strengthY: number = 0.35
): () => void {
  if (!element || isReducedMotion()) return () => {}

  // Only enable on fine pointer (mouse)
  if (window.matchMedia('(pointer: coarse)').matches) return () => {}

  const qx = gsap.quickTo(element, 'x', { duration: 0.45, ease: 'power3.out' })
  const qy = gsap.quickTo(element, 'y', { duration: 0.45, ease: 'power3.out' })

  const onMouseMove = (e: MouseEvent) => {
    const rect = element.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    qx(x * strengthX)
    qy(y * strengthY)
  }

  const onMouseLeave = () => {
    qx(0)
    qy(0)
  }

  element.addEventListener('mousemove', onMouseMove)
  element.addEventListener('mouseleave', onMouseLeave)

  return () => {
    element.removeEventListener('mousemove', onMouseMove)
    element.removeEventListener('mouseleave', onMouseLeave)
  }
}

/**
 * Creates subtle 3D card tilt for desktop hover.
 */
export function setupCardTilt(
  element: HTMLElement | null,
  maxDegrees: number = 4
): () => void {
  if (!element || isReducedMotion()) return () => {}
  if (window.matchMedia('(pointer: coarse)').matches) return () => {}

  const onMouseMove = (e: MouseEvent) => {
    const rect = element.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * maxDegrees
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -maxDegrees
    gsap.to(element, {
      rotationY: x,
      rotationX: y,
      transformPerspective: 1000,
      duration: 0.4,
      ease: 'power2.out',
    })
  }

  const onMouseLeave = () => {
    gsap.to(element, {
      rotationY: 0,
      rotationX: 0,
      duration: 0.6,
      ease: 'power3.out',
    })
  }

  element.addEventListener('mousemove', onMouseMove)
  element.addEventListener('mouseleave', onMouseLeave)

  return () => {
    element.removeEventListener('mousemove', onMouseMove)
    element.removeEventListener('mouseleave', onMouseLeave)
  }
}
