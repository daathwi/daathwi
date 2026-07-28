"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";
import { hasMediaSrc } from "../../lib/media";

function isAppLocalSrc(src: string) {
  return src.startsWith("/") && !src.startsWith("//") && !src.startsWith("/uploads/");
}

function JournalImage({ src, alt }: { src: string; alt: string }) {
  if (!hasMediaSrc(src)) {
    return <div className="h-full w-full bg-surface-container" aria-hidden />;
  }

  if (isAppLocalSrc(src)) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover transition-opacity duration-500 group-hover:opacity-70"
        sizes="(max-width: 768px) 100vw, 33vw"
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className="h-full w-full object-cover transition-opacity duration-500 group-hover:opacity-70"
    />
  );
}

export { JournalImage };

type NewsletterProps = {
  contactEmail: string;
};

export function NewsletterForm({ contactEmail }: NewsletterProps) {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const email = new FormData(form).get("email");
    if (typeof email === "string" && email) {
      window.location.href = `mailto:${contactEmail}?subject=${encodeURIComponent("Newsletter subscription")}&body=${encodeURIComponent(`Please add me to the newsletter: ${email}`)}`;
      setSubmitted(true);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 md:flex-row"
    >
      <input
        name="email"
        type="email"
        required
        placeholder="YOUR EMAIL ADDRESS"
        className="flex-grow border-0 border-b border-divider-strong bg-transparent py-4 font-label-caps text-label-caps transition-all focus:border-on-surface focus:ring-0"
      />
      <button
        type="submit"
        className="bg-primary px-10 py-4 font-label-caps text-label-caps text-on-primary transition-colors hover:bg-secondary"
      >
        {submitted ? "SENT" : "SUBSCRIBE"}
      </button>
    </form>
  );
}

export function ArticleNewsletterForm({ contactEmail }: NewsletterProps) {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const email = new FormData(form).get("email");
    if (typeof email === "string" && email) {
      window.location.href = `mailto:${contactEmail}?subject=${encodeURIComponent("Newsletter subscription")}&body=${encodeURIComponent(`Please add me to the newsletter: ${email}`)}`;
      setSubmitted(true);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 md:flex-row"
    >
      <input
        name="email"
        type="email"
        required
        placeholder="EMAIL ADDRESS"
        className="flex-1 rounded border border-divider-strong bg-transparent px-6 py-4 font-label-caps text-label-caps text-primary transition-colors focus:border-on-surface focus:outline-none"
      />
      <button
        type="submit"
        className="whitespace-nowrap bg-primary px-10 py-4 font-label-caps text-label-caps text-on-primary transition-opacity hover:opacity-90"
      >
        {submitted ? "SUBSCRIBED" : "SUBSCRIBE"}
      </button>
    </form>
  );
}

export function BlogNewsletterForm({ contactEmail }: NewsletterProps) {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const email = new FormData(form).get("email");
    if (typeof email === "string" && email) {
      window.location.href = `mailto:${contactEmail}?subject=${encodeURIComponent("Newsletter subscription")}&body=${encodeURIComponent(`Please add me to the newsletter: ${email}`)}`;
      setSubmitted(true);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto flex max-w-md flex-col gap-4 md:flex-row"
    >
      <input
        name="email"
        type="email"
        required
        placeholder="Email Address"
        className="flex-grow border-0 border-b border-divider-emphasis bg-transparent px-0 py-3 font-body-md text-body-md outline-none transition-colors focus:border-primary focus:ring-0"
      />
      <button
        type="submit"
        className="rounded-lg bg-primary px-8 py-3 font-label-caps text-label-caps text-background transition-opacity hover:opacity-90"
      >
        {submitted ? "Sent" : "Subscribe"}
      </button>
    </form>
  );
}
