"use client";

import { FormEvent, useState } from "react";
import { submitContactInquiry } from "../../lib/api";
import type { ContactInquiryOption } from "../../lib/types";

type SubmitState = "idle" | "sending" | "sent" | "error";

type Props = {
  contactEmail: string;
  inquiryOptions: ContactInquiryOption[];
};

export default function ContactForm({ contactEmail, inquiryOptions }: Props) {
  const [state, setState] = useState<SubmitState>("idle");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state !== "idle" && state !== "error") return;

    const form = e.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") ?? "");
    const email = String(data.get("email") ?? "");
    const service = String(data.get("service") ?? "");
    const message = String(data.get("message") ?? "");

    setState("sending");

    try {
      await submitContactInquiry({ name, email, service, message });
      setState("sent");
      form.reset();
      window.setTimeout(() => setState("idle"), 3000);
    } catch {
      const inquiry =
        inquiryOptions.find((o) => o.value === service)?.label ?? "Contact inquiry";
      const body = [
        `Name: ${name}`,
        `Email: ${email}`,
        `Inquiry: ${inquiry}`,
        "",
        message,
      ].join("\n");

      window.location.href = `mailto:${contactEmail}?subject=${encodeURIComponent(`${inquiry} — daathwi.jpg`)}&body=${encodeURIComponent(body)}`;
      setState("sent");
      form.reset();
      window.setTimeout(() => setState("idle"), 3000);
    }
  }

  return (
    <form className="space-y-12" onSubmit={handleSubmit}>
      <div className="float-field relative">
        <input
          id="name"
          name="name"
          type="text"
          required
          placeholder=" "
          className="w-full border-0 border-b border-divider-strong bg-transparent py-4 outline-none transition-colors focus:border-on-surface focus:ring-0"
        />
        <label
          htmlFor="name"
          className="pointer-events-none absolute left-0 top-4 font-label-caps text-label-caps text-on-surface-variant transition-all duration-300"
        >
          Full Name
        </label>
      </div>

      <div className="float-field relative">
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder=" "
          className="w-full border-0 border-b border-divider-strong bg-transparent py-4 outline-none transition-colors focus:border-on-surface focus:ring-0"
        />
        <label
          htmlFor="email"
          className="pointer-events-none absolute left-0 top-4 font-label-caps text-label-caps text-on-surface-variant transition-all duration-300"
        >
          Email Address
        </label>
      </div>

      <div className="relative">
        <select
          id="service"
          name="service"
          required
          defaultValue=""
          className="w-full cursor-pointer appearance-none border-0 border-b border-divider-strong bg-transparent py-4 text-on-surface-variant outline-none transition-colors focus:border-on-surface focus:ring-0"
        >
          <option disabled value="">
            Nature of Inquiry
          </option>
          {inquiryOptions.map((option) => (
            <option key={option.value} value={option.value} className="bg-background">
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="float-field relative">
        <textarea
          id="message"
          name="message"
          rows={4}
          required
          placeholder=" "
          className="w-full resize-none border-0 border-b border-divider-strong bg-transparent py-4 outline-none transition-colors focus:border-on-surface focus:ring-0"
        />
        <label
          htmlFor="message"
          className="pointer-events-none absolute left-0 top-4 font-label-caps text-label-caps text-on-surface-variant transition-all duration-300"
        >
          Tell me about your project
        </label>
      </div>

      <button
        type="submit"
        disabled={state === "sending"}
        className={`group flex items-center gap-4 border-0 bg-transparent px-0 py-4 transition-all duration-300 ${
          state === "sent" ? "text-green-400" : "text-primary"
        } ${state === "sending" ? "opacity-50" : "opacity-100"}`}
      >
        <span className="font-label-caps text-label-caps tracking-widest">
          {state === "sending"
            ? "SENDING..."
            : state === "sent"
              ? "MESSAGE SENT"
              : "SEND MESSAGE"}
        </span>
        {state === "idle" && (
          <>
            <div className="h-px w-12 bg-primary transition-all duration-500 group-hover:w-20" />
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </>
        )}
      </button>
    </form>
  );
}
