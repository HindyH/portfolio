"use client";

import Link from "next/link";
import Image from "next/image";
import { Corkboard } from "@/app/components/corkboard/Corkboard";
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
    return (
        <main className="relative isolate pointer-events-none">
            <Corkboard media={media} className="fixed inset-0 -z-20 hidden h-full w-full lg:block" />
            {/* translucent layer for text legibility - pointer-events-none lets clicks reach the corkboard underneath */}
            <div className="pointer-events-none fixed inset-0 -z-10 bg-white/20"/>

            <section className="flex min-h-[55vh] flex-col items-center justify-center gap-6 px-4 text-center">
                {/* inline-flex sizes to its content instead of stretching full width, so the measured box matches what's actually visible */}
                <div className="inline-flex flex-col items-center gap-6">
                    <div className="relative -rotate-2">
                        <div className="bg-white p-3 pb-8 shadow-xl">
                            <div className="relative h-56 w-56 overflow-hidden sm:h-64 sm:w-64">
                                <Image
                                    src="/profile.webp"
                                    alt="Hindy Hamburger"
                                    fill
                                    sizes="(min-width: 640px) 256px, 224px"
                                    className="object-cover"
                                    priority
                                />
                            </div>
                        </div>
                        <div
                            //pins
                            className="absolute left-1/2 top-0 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-600 shadow-md"/>
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
                className="mx-auto grid max-w-2xl grid-cols-1 gap-5 px-4 pb-24 sm:grid-cols-3"
            >
                {TAB_CARDS.map((card, i) => (
                    <TabCard key={card.href} {...card} />
                ))}
            </section>
        </main>
    );
}

function TabCard({
    href,
    label,
    description
}: {
    href: string;
    label: string;
    description: string;
}) {
    const isExternal = href.startsWith("http") || href.startsWith("mailto:") || href.endsWith(".pdf");

    const noteClassName =
        `pointer-events-auto group flex h-28 w-28 flex-col items-center justify-center gap-1 bg-gradient-to-br from-yellow-100 to-yellow-200 p-3 text-center shadow-[0_14px_15px_-6px_rgba(0,0,0,0.55)] transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-[inset_0_6px_5px_-4px_rgba(0,0,0,0.45),0_22px_32px_-8px_rgba(0,0,0,0.6)] sm:h-36 sm:w-36`;

    const inner = (
        <>
            <span className="text-base font-medium text-neutral-900 sm:text-lg">{label}</span>
            <span className="text-xs text-neutral-700 sm:text-sm">{description}</span>
        </>
    );

    return (
        <div className="mx-auto">
            {isExternal ? (
                <a
                    href={href}
                    target={href.startsWith("mailto:") ? undefined : "_blank"}
                    rel={href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
                    className={noteClassName}
                >
                    {inner}
                </a>
            ) : (
                <Link href={href} className={noteClassName}>
                    {inner}
                </Link>
            )}
        </div>
    );
}