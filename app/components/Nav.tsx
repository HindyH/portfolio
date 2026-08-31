"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type NavLink =
  | { href: string; label: string; internal: true; categoryKey?: "artwork" | "photography" }
  | { href: string; label: string; internal: false };

const NAV_LINKS: NavLink[] = [
  { href: "/artwork", label: "Artwork", internal: true, categoryKey: "artwork" },
  { href: "mailto:hindyhamburger@gmail.com", label: "Email", internal: false },
  { href: "https://github.com/HindyH", label: "Github", internal: false },
  { href: "https://www.linkedin.com/in/hindy-hamburger-1737a63b2/", label: "LinkedIn", internal: false },
  { href: "/photography", label: "Photography", internal: true, categoryKey: "photography" },
  { href: "/Resume.pdf", label: "Resume", internal: false },
];

function isExternalLinkNewTab(href: string) {
  return href.startsWith("http") || href.endsWith(".pdf");
}

export function Nav({
  artworkCategories,
  photographyCategories,
}: {
  artworkCategories: string[];
  photographyCategories: string[];
}) {
  const pathname = usePathname();
  const showNav = pathname.startsWith("/artwork") || pathname.startsWith("/photography");

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);

  const categoriesFor = (key?: "artwork" | "photography") =>
    key === "artwork" ? artworkCategories : key === "photography" ? photographyCategories : [];

  // Close the desktop dropdown on outside click.
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // Close both menus whenever the route changes. Adjusting state during
  // render (rather than in an effect) is the pattern React recommends for
  // resetting state in response to a prop change — see
  // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setOpenDropdown(null);
    setMobileOpen(false);
    setMobileExpanded(null);
  }

  if (!showNav) return null;

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/80 backdrop-blur">
      <nav ref={navRef} className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="text-sm font-semibold tracking-tight text-neutral-900">
          Hindy Hamburger
        </Link>

        {/* Desktop nav */}
        <ul className="hidden gap-6 md:flex">
          {NAV_LINKS.map((link) => {
            if (!link.internal) {
              return (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target={isExternalLinkNewTab(link.href) ? "_blank" : undefined}
                    rel={isExternalLinkNewTab(link.href) ? "noopener noreferrer" : undefined}
                    className="text-sm text-neutral-500 underline underline-offset-2 transition-colors hover:text-neutral-900"
                  >
                    {link.label}
                  </a>
                </li>
              );
            }

            const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
            const categories = categoriesFor(link.categoryKey);
            const isOpen = openDropdown === link.href;

            if (categories.length === 0) {
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`text-sm transition-colors ${
                      isActive ? "font-medium text-neutral-900" : "text-neutral-500 hover:text-neutral-900"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            }

            return (
              <li
                key={link.href}
                className="relative"
                onMouseEnter={() => setOpenDropdown(link.href)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <button
                  type="button"
                  onClick={() => setOpenDropdown(isOpen ? null : link.href)}
                  aria-expanded={isOpen}
                  className={`flex items-center gap-1 text-sm transition-colors ${
                    isActive ? "font-medium text-neutral-900" : "text-neutral-500 hover:text-neutral-900"
                  }`}
                >
                  {link.label}
                  <svg
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className={`h-3.5 w-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`}
                  >
                    <path d="M5.25 7.5L10 12.25L14.75 7.5H5.25Z" />
                  </svg>
                </button>

                {isOpen && (
                  <div className="absolute left-0 top-full z-50 w-48 pt-2">
                    <div className="rounded-md border border-neutral-200 bg-white py-1 shadow-lg">
                      <Link
                        href={link.href}
                        className="block px-4 py-2 text-sm text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900"
                      >
                        All {link.label}
                      </Link>
                      <div className="my-1 border-t border-neutral-100" />
                      {categories.map((cat) => (
                        <Link
                          key={cat}
                          href={`${link.href}/${encodeURIComponent(cat)}`}
                          className="block px-4 py-2 text-sm capitalize text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900"
                        >
                          {cat}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>

        {/* Mobile hamburger toggle */}
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          className="flex h-9 w-9 items-center justify-center text-neutral-700 md:hidden"
        >
          {mobileOpen ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-6 w-6">
              <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-6 w-6">
              <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          )}
        </button>
      </nav>

      {/* Mobile menu panel */}
      {mobileOpen && (
        <div className="border-t border-neutral-200 bg-white md:hidden">
          <ul className="flex flex-col px-4 py-2 sm:px-6">
            {NAV_LINKS.map((link) => {
              if (!link.internal) {
                return (
                  <li key={link.href} className="border-b border-neutral-100 py-3 last:border-0">
                    <a
                      href={link.href}
                      target={isExternalLinkNewTab(link.href) ? "_blank" : undefined}
                      rel={isExternalLinkNewTab(link.href) ? "noopener noreferrer" : undefined}
                      className="text-sm text-neutral-500"
                    >
                      {link.label}
                    </a>
                  </li>
                );
              }

              const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
              const categories = categoriesFor(link.categoryKey);
              const isExpanded = mobileExpanded === link.href;

              if (categories.length === 0) {
                return (
                  <li key={link.href} className="border-b border-neutral-100 py-3 last:border-0">
                    <Link
                      href={link.href}
                      className={`text-sm ${isActive ? "font-medium text-neutral-900" : "text-neutral-500"}`}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              }

              return (
                <li key={link.href} className="border-b border-neutral-100 py-3 last:border-0">
                  <div className="flex items-center justify-between">
                    <Link
                      href={link.href}
                      className={`text-sm ${isActive ? "font-medium text-neutral-900" : "text-neutral-500"}`}
                    >
                      {link.label}
                    </Link>
                    <button
                      type="button"
                      onClick={() => setMobileExpanded(isExpanded ? null : link.href)}
                      aria-expanded={isExpanded}
                      aria-label={`Toggle ${link.label} categories`}
                      className="flex h-8 w-8 items-center justify-center text-neutral-400"
                    >
                      <svg
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                      >
                        <path d="M5.25 7.5L10 12.25L14.75 7.5H5.25Z" />
                      </svg>
                    </button>
                  </div>
                  {isExpanded && (
                    <ul className="mt-2 flex flex-col gap-2 pl-3">
                      {categories.map((cat) => (
                        <li key={cat}>
                          <Link
                            href={`${link.href}/${encodeURIComponent(cat)}`}
                            className="block text-sm capitalize text-neutral-400 hover:text-neutral-900"
                          >
                            {cat}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </header>
  );
}