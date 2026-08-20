"use client";

import Link from "next/link";
import Image from "next/image";
import { useLayoutEffect, useRef, useState } from "react";
import { Corkboard, type ExcludeRect } from "@/app/components/corkboard/Corkboard";
import { getCorkboardMedia } from "@/lib/corkboard";

const TAB_CARDS = [
    { href: "/artwork", label: "Artwork", description: "Fine art and graphic art" },
    { href: "mailto:hindyhamburger@gmail.com", label: "Email", description: "Get in touch" },
    { href: "https://github.com/HindyH", label: "Github", description: "Code & repositories" },
    { href: "https://www.linkedin.com/in/hindy-hamburger-1737a63b2/", label: "LinkedIn", description: "LinkedIn profile" },
    { href: "/photography", label: "Photography", description: "Photo collections" },
    { href: "/Resume.pdf", label: "Resume", description: "View my resume" },
];

const media = getCorkboardMedia();

export default function HomePage() {
    // measure only the actual visible content blocks - not their full-width section containers
    const heroContentRef = useRef<HTMLDivElement>(null);
    const cardsRef = useRef<HTMLDivElement>(null);
    const [exclude, setExclude] = useState<ExcludeRect | null>(null);

    useLayoutEffect(() => {
        let resizeTimer: ReturnType<typeof setTimeout> | undefined;

        function measure() {
            const boxes = [heroContentRef.current, cardsRef.current]
                .filter((el): el is HTMLDivElement => el !== null)
                .map((el) => el.getBoundingClientRect());
            if (boxes.length === 0) return;

            const left = Math.min(...boxes.map((b) => b.left));
            const right = Math.max(...boxes.map((b) => b.right));
            const top = Math.min(...boxes.map((b) => b.top));
            const bottom = Math.max(...boxes.map((b) => b.bottom));

            setExclude({
                xMinPct: (left / window.innerWidth) * 100,
                xMaxPct: (right / window.innerWidth) * 100,
                yMinPct: (top / window.innerHeight) * 100,
                yMaxPct: (bottom / window.innerHeight) * 100,
            });
        }

        function onResize() {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(measure, 200);
        }

        measure();
        window.addEventListener("resize", onResize);
        return () => {
            clearTimeout(resizeTimer);
            window.removeEventListener("resize", onResize);
        };
    }, []);

    return (
        <main className="relative isolate pointer-events-none">
            <Corkboard media={media} exclude={exclude} className="fixed inset-0 -z-20 h-full w-full" />
            {/* translucent layer for text legibility - pointer-events-none lets clicks reach the corkboard underneath */}
            <div className="pointer-events-none fixed inset-0 -z-10 bg-white/20"/>

            <section className="flex min-h-[55vh] flex-col items-center justify-center gap-6 px-4 text-center">
                {/* inline-flex sizes to its content instead of stretching full width, so the measured box matches what's actually visible */}
                <div ref={heroContentRef} className="inline-flex flex-col items-center gap-6">
                    <div className="relative h-56 w-56 overflow-hidden rounded-full sm:h-64 sm:w-64">
                        <Image
                            src="/profile.webp"
                            alt="Hindy Hamburger"
                            fill
                            sizes="(min-width: 640px) 256px, 224px"
                            className="object-cover"
                            priority
                        />
                    </div>
                    <h1 className="text-4xl font-semibold tracking-tight text-black sm:text-5xl">
                        Hindy Hamburger
                    </h1>

                    <p className="max-w-xl text-lg text-black">
                        Computer Scientist, Artist, Photographer
                    </p>
                </div>
            </section>

            <section
                id="sections"
                ref={cardsRef}
                className="mx-auto grid max-w-4xl grid-cols-1 gap-6 px-4 pb-24 sm:grid-cols-3"
            >
                {TAB_CARDS.map((card) => (
                    <TabCard key={card.href} {...card} />
                ))}
            </section>
        </main>
    );
}

function TabCard({href, label, description}: { href: string; label: string; description: string }) {
    const isExternal = href.startsWith("http") || href.startsWith("mailto:") || href.endsWith(".pdf");

    const className =
        "pointer-events-auto group flex flex-col items-center gap-2 rounded-lg border border-neutral-200 bg-white p-8 text-center transition hover:border-neutral-400 hover:shadow-sm";

    if (isExternal) {
        return (
            <a
                href={href}
                target={href.startsWith("mailto:") ? undefined : "_blank"}
                rel={href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
                className={className}
            >
                <span className="text-xl font-medium text-neutral-900">{label}</span>
                <span className="text-sm text-neutral-500">{description}</span>
            </a>
        );
    }

    return (
        <Link href={href} className={className}>
            <span className="text-xl font-medium text-neutral-900">{label}</span>
            <span className="text-sm text-neutral-500">{description}</span>
        </Link>
    );
}