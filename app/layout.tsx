import "./globals.css";
import type { Metadata } from "next";
import { Fredoka, Luckiest_Guy } from "next/font/google";

const fredoka = Fredoka({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const luckiest = Luckiest_Guy({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
  weight: "400",
});

export const metadata: Metadata = {
  title: "Daily Recall | Awaiz Builds Softwares",
  description: "Log your day in under a minute and generate standup-ready summaries.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${fredoka.variable} ${luckiest.variable}`}>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
