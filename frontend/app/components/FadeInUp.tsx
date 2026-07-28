"use client";

import MotionReveal from "./MotionReveal";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

/** @deprecated Prefer MotionReveal — kept for existing pages */
export default function FadeInUp({ children, className = "", delay = 0 }: Props) {
  return (
    <MotionReveal className={className} delay={delay} variant="fade-up">
      {children}
    </MotionReveal>
  );
}
