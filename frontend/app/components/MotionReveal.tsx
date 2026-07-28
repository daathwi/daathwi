"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";

export type MotionVariant = "fade-up" | "fade" | "image" | "scale-in";

type Props = {
  children: ReactNode;
  className?: string;
  delay?: number;
  variant?: MotionVariant;
  as?: ElementType;
};

const VARIANT_CLASS: Record<MotionVariant, string> = {
  "fade-up": "motion-fade-up",
  fade: "motion-fade",
  image: "motion-image",
  "scale-in": "motion-scale-in",
};

export default function MotionReveal({
  children,
  className = "",
  delay = 0,
  variant = "fade-up",
  as: Tag = "div",
}: Props) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      node.classList.add("motion-visible");
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          node.classList.add("motion-visible");
          observer.unobserve(node);
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -48px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={`${VARIANT_CLASS[variant]} ${className}`.trim()}
      style={delay > 0 ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}
