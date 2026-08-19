import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
    return (
        <main>
            <section className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
                <div className="relative h-40 w-40 overflow-hidden rounded-full sm:h-48 sm:w-48">
                    <Image src="/profile.jpg" alt="Hindy Hamburger" fill className="object-cover" priority/>
                </div>
                <h1 className="text-4xl font-semibold tracking-tight text-neutral-900 sm:text-5xl">
                    Hindy Hamburger
                </h1>
                <p className="max-w-xl text-neutral-600">
                    A short blurb about me and what this site is about.
                </p>
                <a href="#sections" className="mt-8 animate-bounce text-neutral-400">↓</a>
            </section>

            <section id="sections" className="mx-auto grid max-w-4xl grid-cols-1 gap-6 px-4 py-24 sm:grid-cols-3">
                <TabCard href="/code" label="Code" description="Projects & experiments"/>
                <TabCard href="/artwork" label="Artwork" description="Paintings & drawings"/>
                <TabCard href="/photography" label="Photography" description="Photo collections"/>
            </section>
        </main>
    );
}

function TabCard({ href, label, description }: { href: string; label: string; description: string }) {
    return (
        <Link
            href={href}
            className="group flex flex-col items-center gap-2 rounded-lg border border-neutral-200 p-8 text-center transition hover:border-neutral-400 hover:shadow-sm"
        >
            <span className="text-xl font-medium text-neutral-900">{label}</span>
            <span className="text-sm text-neutral-500">{description}</span>
        </Link>
    );
}