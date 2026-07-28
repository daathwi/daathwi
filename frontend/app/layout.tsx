import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { SITE_URL } from "./data/site";
import BackendWakeGate from "./components/BackendWakeGate";
import { ThemeProvider } from "./components/ThemeProvider";
import { themeInitScript } from "../lib/theme";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  style: ["normal", "italic"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "daathwi.jpg — Indian Street & Cultural Stories",
  description:
    "Street photography and visual stories from across India — captured by Daathwi Naagh.",
  keywords: [
    "Daathwi Naagh",
    "Indian street photography",
    "daathwi.jpg",
    "cultural photography India",
    "street stories",
    "Instagram",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "daathwi.jpg — Indian Street & Cultural Stories",
    description:
      "Street photography and visual stories from across India — @daathwi.jpg",
    type: "website",
    url: SITE_URL,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${playfair.variable} ${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full overflow-x-hidden bg-background font-body-md text-body-md text-on-background selection:bg-primary-container selection:text-on-primary-container">
        <ThemeProvider>
          <BackendWakeGate>{children}</BackendWakeGate>
        </ThemeProvider>
      </body>
    </html>
  );
}
