"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/artwork", label: "Artwork", internal: true },
  { href: "mailto:hindyhamburger@gmail.com", label: "Email", internal: false },
  { href: "https://github.com/HindyH", label: "Github", internal: false },
  { href: "https://www.linkedin.com/in/hindy-hamburger-1737a63b2/", label: "LinkedIn", internal: false },
  { href: "/photography", label: "Photography", internal: true },
  { href: "/Resume.pdf", label: "Resume", internal: false },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/80 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="text-sm font-semibold tracking-tight text-neutral-900">
          Hindy Hamburger
        </Link>

        <ul className="flex gap-6">
          {NAV_LINKS.map((link) => {
            if (link.internal) {
              const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`text-sm transition-colors ${
                      isActive
                        ? "font-medium text-neutral-900"
                        : "text-neutral-500 hover:text-neutral-900"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            }

            return (
              <li key={link.href}>
                <a
                  href={link.href}
                  target={link.href.startsWith("http") || link.href.endsWith(".pdf") ? "_blank" : undefined}
                  rel={link.href.startsWith("http") || link.href.endsWith(".pdf") ? "noopener noreferrer" : undefined}
                  className="text-sm text-neutral-500 underline underline-offset-2 transition-colors hover:text-neutral-900"
                >
                  {link.label}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}