"use client";

import { useTheme } from "./ThemeProvider";

type Props = {
  className?: string;
  showLabel?: boolean;
  overlay?: boolean;
};

export default function ThemeToggle({
  className = "",
  showLabel = false,
  overlay = false,
}: Props) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
      className={`inline-flex items-center gap-2 rounded border px-3 py-2 font-label-caps text-label-caps transition-colors ${
        overlay
          ? "border-hero-fg/35 bg-hero-fg/10 text-hero-fg backdrop-blur-sm hover:border-hero-fg/60 hover:bg-hero-fg/15"
          : "border-divider-strong bg-surface-container-low text-on-surface-variant hover:border-divider-emphasis hover:text-primary"
      } ${className}`}
    >
      <span className="material-symbols-outlined text-[18px]">
        {isDark ? "light_mode" : "dark_mode"}
      </span>
      {showLabel && <span>{isDark ? "Light" : "Dark"}</span>}
    </button>
  );
}
