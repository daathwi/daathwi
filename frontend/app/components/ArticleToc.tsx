"use client";

import { useEffect, useState } from "react";
import type { TocItem } from "../../lib/blog-toc";

type Props = {
  items: TocItem[];
  variant?: "sidebar" | "mobile";
};

export default function ArticleToc({ items, variant = "sidebar" }: Props) {
  const topLevel = items.filter((item) => item.level === 2);
  const [activeId, setActiveId] = useState<string>("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const headings = items
      .filter((item) => item.level === 2)
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => Boolean(el));

    if (headings.length === 0) return;
    setActiveId(headings[0].id);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]?.target.id) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-18% 0px -70% 0px", threshold: [0, 1] },
    );

    headings.forEach((heading) => observer.observe(heading));
    return () => observer.disconnect();
  }, [items]);

  useEffect(() => {
    if (variant !== "mobile") return;
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open, variant]);

  if (topLevel.length === 0) return null;

  const list = (
    <ol className="space-y-1">
      {topLevel.map((item, index) => {
        const active = item.id === activeId;
        return (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              onClick={() => setOpen(false)}
              className={`flex gap-3 border-l-2 py-2.5 pl-4 transition-colors ${
                active
                  ? "border-primary text-primary"
                  : "border-transparent text-on-surface-variant hover:border-divider-emphasis hover:text-primary"
              }`}
            >
              <span className="shrink-0 font-label-caps text-[11px] tracking-widest opacity-60">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="font-body-md text-sm leading-snug">{item.text}</span>
            </a>
          </li>
        );
      })}
    </ol>
  );

  if (variant === "sidebar") {
    return (
      <nav aria-label="Table of contents" className="article-toc">
        <p className="mb-4 font-label-caps text-label-caps text-on-surface-variant">
          Contents
        </p>
        {list}
      </nav>
    );
  }

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-5 z-40 flex items-center gap-2 border border-divider bg-background/95 px-4 py-3 font-label-caps text-label-caps text-primary shadow-lg backdrop-blur-md"
        aria-expanded={open}
        aria-controls="article-toc-sheet"
      >
        <span className="material-symbols-outlined text-[18px]">list</span>
        Contents
      </button>

      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/50"
            aria-label="Close contents"
            onClick={() => setOpen(false)}
          />
          <nav
            id="article-toc-sheet"
            aria-label="Table of contents"
            className="fixed inset-x-0 bottom-0 z-50 max-h-[70vh] overflow-y-auto rounded-t-lg border-t border-divider bg-background px-margin-mobile py-6 shadow-2xl"
          >
            <div className="mb-5 flex items-center justify-between">
              <p className="font-label-caps text-label-caps text-on-surface-variant">
                Contents
              </p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="flex h-9 w-9 items-center justify-center text-on-surface-variant"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            {list}
          </nav>
        </>
      )}
    </div>
  );
}
