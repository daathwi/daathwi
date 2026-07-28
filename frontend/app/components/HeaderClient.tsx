"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { NavLink } from "../../lib/types";
import ThemeToggle from "./ThemeToggle";

type Props = {
  navLinks: NavLink[];
  contactEmail: string;
};

function isHeroOverlayPath(pathname: string) {
  return pathname === "/";
}

function navLinkClass(isActive: boolean, overlay: boolean, mobile = false) {
  if (mobile) {
    return isActive
      ? "border-l-2 border-primary pl-4 font-label-caps text-label-caps text-primary"
      : "pl-4 font-label-caps text-label-caps text-on-surface-variant transition-colors hover:text-primary";
  }

  return overlay
    ? isActive
      ? "border-b border-hero-fg pb-1 text-hero-fg"
      : "nav-item nav-item-light text-hero-fg/85 hover:text-hero-fg"
    : isActive
      ? "border-b border-primary pb-1 text-primary"
      : "nav-item text-on-surface-variant hover:text-primary";
}

export default function HeaderClient({ navLinks, contactEmail }: Props) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const heroOverlay = isHeroOverlayPath(pathname);
  const transparent = heroOverlay && !scrolled && !menuOpen;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  return (
    <header
      className={`fixed left-0 top-0 z-50 w-full transition-all duration-300 ${
        transparent
          ? "border-b border-transparent bg-transparent py-6 md:py-8"
          : "border-b border-divider bg-background/85 py-4 shadow-sm backdrop-blur-md"
      } ${scrolled && !transparent ? "shadow-md" : ""}`}
    >
      <nav
        className="relative mx-auto flex w-full max-w-container-max items-center justify-between px-margin-mobile md:px-margin-desktop"
        aria-label="Main"
      >
        <Link
          href="/"
          className={`font-display-lg text-headline-sm tracking-tighter transition-colors ${
            transparent ? "text-hero-fg" : "text-primary"
          }`}
        >
          daathwi.jpg
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          {navLinks.map(({ href, label }) => {
            const isActive = !href.includes("#") && pathname === href;

            return (
              <Link
                key={href}
                href={href}
                className={`relative font-label-caps text-label-caps transition-colors ${navLinkClass(isActive, transparent)}`}
              >
                {label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <ThemeToggle overlay={transparent} />

          <a
            href={`mailto:${contactEmail}`}
            className={`hidden px-6 py-2 font-label-caps text-label-caps transition-all md:inline-flex ${
              transparent
                ? "border border-hero-fg/40 bg-hero-fg/10 text-hero-fg backdrop-blur-sm hover:bg-hero-fg/20"
                : "bg-primary text-on-primary hover:opacity-70"
            }`}
          >
            Contact
          </a>

          <button
            type="button"
            className={`inline-flex h-10 w-10 items-center justify-center rounded border transition-colors md:hidden ${
              transparent
                ? "border-hero-fg/35 bg-hero-fg/10 text-hero-fg backdrop-blur-sm hover:bg-hero-fg/15"
                : "border-divider-strong bg-surface-container-low text-on-surface-variant hover:text-primary"
            }`}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav-menu"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className="material-symbols-outlined text-[22px]">
              {menuOpen ? "close" : "menu"}
            </span>
          </button>
        </div>
      </nav>

      {menuOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/40 md:hidden"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
          />
          <div
            id="mobile-nav-menu"
            className="absolute left-0 right-0 top-full z-50 border-b border-divider bg-background/95 px-margin-mobile py-6 shadow-lg backdrop-blur-md md:hidden"
          >
            <ul className="space-y-1">
              {navLinks.map(({ href, label }) => {
                const isActive = !href.includes("#") && pathname === href;

                return (
                  <li key={href}>
                    <Link
                      href={href}
                      className={`block py-3 ${navLinkClass(isActive, false, true)}`}
                      onClick={() => setMenuOpen(false)}
                    >
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>
            <a
              href={`mailto:${contactEmail}`}
              className="mt-6 inline-flex w-full items-center justify-center bg-primary px-6 py-3 font-label-caps text-label-caps text-on-primary transition-opacity hover:opacity-90"
              onClick={() => setMenuOpen(false)}
            >
              Contact
            </a>
          </div>
        </>
      )}
    </header>
  );
}
