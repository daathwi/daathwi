"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "../../components/ThemeToggle";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: "dashboard", exact: true },
  { href: "/admin/media", label: "Media", icon: "folder_open" },
  { href: "/admin/photos", label: "Hero Photos", icon: "panorama" },
  { href: "/admin/series", label: "Series", icon: "collections_bookmark" },
  { href: "/admin/gallery", label: "Gallery", icon: "photo_library" },
  { href: "/admin/blog", label: "Blog", icon: "article" },
  { href: "/admin/settings", label: "Settings", icon: "settings" },
] as const;

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-50 flex h-screen w-[280px] flex-col border-r border-divider bg-surface-container py-stack-sm">
      <div className="px-8 py-10">
        <h1 className="font-headline-sm text-headline-sm tracking-tight text-primary">
          Admin Panel
        </h1>
        <p className="mt-1 font-label-caps text-label-caps text-on-surface-variant opacity-60">
          Site maintenance
        </p>
      </div>

      <nav className="flex-1 space-y-2 px-4">
        {NAV.map((item) => {
          const { href, label, icon } = item;
          const exact = "exact" in item && item.exact;
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-4 py-2 pl-4 transition-all duration-200 ${
                active
                  ? "border-l-2 border-primary font-bold text-primary"
                  : "text-on-surface-variant hover:bg-overlay-subtle hover:text-primary"
              }`}
            >
              <span
                className="material-symbols-outlined"
                style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                {icon}
              </span>
              <span className="font-label-caps text-label-caps">{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-divider px-8 py-8">
        <ThemeToggle showLabel className="mb-6 w-full justify-center" />
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-divider-strong bg-surface-container-highest">
            <span className="material-symbols-outlined text-sm text-primary">
              person
            </span>
          </div>
          <div>
            <p className="font-label-caps text-label-caps text-primary">Daathwi Naagh</p>
            <p className="text-[10px] uppercase tracking-widest text-on-surface-variant">
              Photographer
            </p>
          </div>
        </div>
        <Link
          href="/"
          className="mt-4 inline-flex items-center gap-2 font-label-caps text-[10px] uppercase tracking-widest text-on-surface-variant hover:text-primary"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          View site
        </Link>
      </div>
    </aside>
  );
}
