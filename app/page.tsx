import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
    return (
        <main className="relative overflow-hidden">
            <img
                src="/bg.JPG"
                alt=""
                className="fixed inset-0 -z-10 h-full w-full object-cover"
            />
            <div className="fixed inset-0 -z-10 bg-[var(--background)]/40"/>

            <section className="flex min-h-[55vh] flex-col items-center justify-center gap-6 px-4 text-center">
                <div className="relative h-56 w-56 overflow-hidden rounded-full sm:h-64 sm:w-64">
                    <Image src="/profile.png" alt="Hindy Hamburger" fill className="object-cover" priority/>
                </div>
                <h1 className="text-4xl font-semibold tracking-tight text-black sm:text-5xl">
                    Hindy Hamburger
                </h1>
                <p className="max-w-xl text-lg text-black">
                    Computer Scientists, Artist, Photographer
                </p>
            </section>

            <section id="sections" className="mx-auto grid max-w-4xl grid-cols-1 gap-6 px-4 pb-24 sm:grid-cols-3">
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
            className="group flex flex-col items-center gap-2 rounded-lg border border-neutral-200 bg-white p-8 text-center transition hover:border-neutral-400 hover:shadow-sm"
        >
            <span className="text-xl font-medium text-neutral-900">{label}</span>
            <span className="text-sm text-neutral-500">{description}</span>
        </Link>
    );
}