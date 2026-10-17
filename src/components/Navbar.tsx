"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Moon, Sun } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/lib/theme";

export type ActiveTab = "traveler" | "partner" | "phygital";

/** Each section is its own page (separate front doors for travelers and partners). */
const TAB_ROUTES: Record<ActiveTab, string> = {
  traveler: "/traveler",
  partner: "/partner",
  phygital: "/memory",
};

/**
 * One quiet bar: brand, the three sections, language. Status details (AI, partner count)
 * live in the footer so the header only helps people move around.
 */
export function Navbar() {
  const pathname = usePathname();
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const active: ActiveTab | null = pathname.startsWith("/traveler")
    ? "traveler"
    : pathname.startsWith("/partner")
      ? "partner"
      : pathname.startsWith("/memory")
        ? "phygital"
        : null;

  const links: { id: ActiveTab; label: string }[] = [
    { id: "traveler", label: t.nav.tabTraveler },
    { id: "partner", label: t.nav.tabPartner },
    { id: "phygital", label: t.nav.tabPhygital },
  ];

  return (
    <header className="sticky top-0 z-50 bg-stone-900/95 backdrop-blur border-b border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center gap-x-8 gap-y-2 py-3">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-lg"
          aria-label="Experience More Bali 2027 — home"
        >
          <Image
            src="/brand/kossi-adventure-logo.jpg"
            alt=""
            width={580}
            height={208}
            priority
            unoptimized
            className="h-9 w-auto rounded-md"
          />
          <span className="hidden sm:block font-bold text-stone-50 leading-tight">
            Experience More Bali 2027
          </span>
        </Link>

        <nav
          aria-label={language === "id" ? "Utama" : "Main"}
          className="order-3 w-full md:order-none md:w-auto md:flex-1"
        >
          <ul className="flex gap-1 overflow-x-auto no-scrollbar -mx-2 md:mx-0">
            {links.map(({ id, label }) => {
              const current = active === id;
              return (
                <li key={id}>
                  <Link
                    href={TAB_ROUTES[id]}
                    aria-current={current ? "page" : undefined}
                    className={`block whitespace-nowrap px-3 py-2 text-sm font-semibold rounded-md border-b-2 transition-colors ${
                      current
                        ? "text-emerald-400 border-emerald-500"
                        : "text-stone-400 border-transparent hover:text-stone-50 hover:border-stone-700"
                    }`}
                  >
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="ml-auto md:ml-0 flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={
              theme === "dark"
                ? language === "id"
                  ? "Ganti ke mode terang"
                  : "Switch to light mode"
                : language === "id"
                  ? "Ganti ke mode gelap"
                  : "Switch to dark mode"
            }
            title={
              theme === "dark"
                ? language === "id"
                  ? "Mode terang"
                  : "Light mode"
                : language === "id"
                  ? "Mode gelap"
                  : "Dark mode"
            }
            className="w-9 h-9 rounded-lg border border-stone-700 text-stone-300 hover:text-stone-50 hover:border-stone-500 flex items-center justify-center cursor-pointer transition-colors"
          >
            {/* shows the mode you switch TO: sun in dark mode, moon in light mode */}
            {theme === "dark" ? (
              <Sun className="w-4 h-4" aria-hidden="true" />
            ) : (
              <Moon className="w-4 h-4" aria-hidden="true" />
            )}
          </button>
          <div
            role="group"
            aria-label={language === "id" ? "Bahasa" : "Language"}
            className="flex rounded-lg border border-stone-700 p-0.5"
          >
            {(
              [
                ["en", "EN", "English"],
                ["id", "ID", "Bahasa Indonesia"],
              ] as const
            ).map(([code, short, name]) => {
              const on = language === code;
              return (
                <button
                  key={code}
                  type="button"
                  lang={code}
                  onClick={() => setLanguage(code)}
                  aria-pressed={on}
                  aria-label={name}
                  className={`min-w-10 px-2.5 py-1.5 rounded-md text-xs font-bold cursor-pointer transition-colors ${
                    on
                      ? "bg-emerald-600 text-white"
                      : "text-stone-400 hover:text-stone-50"
                  }`}
                >
                  {short}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
}
