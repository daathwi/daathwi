# Daathwi Naagh — Portfolio

Personal portfolio site for Daathwi Naagh, Senior AI Engineer. Built with Next.js (App Router), Tailwind CSS v4, and Plus Jakarta Sans.

## Design language

White editorial marketplace UI — tight bold headlines, full-bleed lifestyle hero with a white scrim and slow Ken Burns pan, coral (`#FF385C`) primary buttons, a dark proof-stats band, and staggered fade-up motion.

Design tokens live in `app/globals.css` (`--color-ink`, `--color-body`, `--color-pressed`, `--color-coral`, etc.) and are consumed as Tailwind utilities (`text-ink`, `border-pressed`, `rounded-pill`, …).

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Production

```bash
npm run build
npm start
```

The site is fully static and deploys cleanly to Vercel or any static host.

## Structure

- `app/layout.tsx` — font loading (Plus Jakarta Sans) and metadata
- `app/page.tsx` — all sections: hero, stats band, experience, projects, skills, education, contact, footer
- `app/globals.css` — design tokens, `label-caps` / `panel` utilities, hero-pan and fade-up keyframes
- `public/hero.jpg` — hero photograph
