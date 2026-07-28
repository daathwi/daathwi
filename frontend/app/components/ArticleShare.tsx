"use client";

import { useState } from "react";

type Props = {
  title: string;
  url: string;
};

export default function ArticleShare({ title, url }: Props) {
  const [copied, setCopied] = useState(false);
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="font-label-caps text-label-caps text-on-surface-variant">
        Share
      </span>
      <a
        href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`}
        target="_blank"
        rel="noreferrer"
        className="border border-divider px-3 py-2 font-label-caps text-[11px] tracking-widest text-on-surface-variant transition-colors hover:border-primary hover:text-primary"
      >
        X
      </a>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
        target="_blank"
        rel="noreferrer"
        className="border border-divider px-3 py-2 font-label-caps text-[11px] tracking-widest text-on-surface-variant transition-colors hover:border-primary hover:text-primary"
      >
        LinkedIn
      </a>
      <button
        type="button"
        onClick={copyLink}
        className="border border-divider px-3 py-2 font-label-caps text-[11px] tracking-widest text-on-surface-variant transition-colors hover:border-primary hover:text-primary"
      >
        {copied ? "Copied" : "Copy link"}
      </button>
    </div>
  );
}
