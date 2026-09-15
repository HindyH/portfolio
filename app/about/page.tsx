import Link from "next/link";
import { Pushpin } from "@/app/components/corkboard/Corkboard";

export const metadata = {
  title: "About Me | Hindy Hamburger",
  description: "A little about Hindy Hamburger — the throughline between code and art.",
};

const PARAGRAPHS = [
  "Growing up, I was always making something. Drawing, painting, moving from one craft to the next. What I loved wasn't the finished product so much as the process. The thinking that goes into building something that didn't exist before.",
  "In my junior year of high school, I took a computer science course and learned Java. I expected it to feel like a different world from art class. Instead, I recognized the same process immediately. Staring at a blank page, testing an idea, revising it, and slowly shaping something real out of nothing. Debugging a program felt a lot like reworking a painting that wasn't quite right yet.",
  "That's why I majored in Computer Science and minored in Studio Art in college. I wanted both languages for the same underlying instinct. I loved wrestling with a professor's open-ended problem set as much as I loved finding ways to fold visual design into my technical projects.",
  "When people hear \"computer science and studio art,\" I often get a surprised look, as if the two don't belong together. I've never seen it that way. Writing code and making art both start with the same question: what do I want to bring into existence, and how do I get there? For me, that question, and the willingness to sit with it, test ideas, and revise until something works, is at the heart of everything I do.",
];

export default function AboutPage() {
  return (
    <main
      className="relative flex min-h-screen w-full flex-col items-center px-4 py-16 sm:px-6"
      style={{
        backgroundColor: "#b98a5e",
        backgroundImage:
          "radial-gradient(circle at 20% 30%, rgba(0,0,0,0.15) 0, transparent 45%), " +
          "url('/cork-texture.webp')",
        backgroundSize: "cover, 400px 400px",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat, repeat",
      }}
    >
      <Link
        href="/"
        className="font-card-title mb-10 self-start text-lg text-white underline decoration-white/50 underline-offset-4 transition-colors hover:text-white/80"
        style={{ textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}
      >
        ← back home
      </Link>

      <div className="relative w-full max-w-2xl">
        <div
          className="bg-white p-8 sm:p-10"
          style={{ boxShadow: "0 28px 38px -12px rgba(0,0,0,0.55), 0 12px 16px -8px rgba(0,0,0,0.4)" }}
        >
          <h1 className="font-display-name mb-6 text-3xl font-semibold tracking-tight text-black sm:text-4xl">
            About Me
          </h1>
          <div className="space-y-5 text-left text-base leading-relaxed text-neutral-800 sm:text-lg">
            {PARAGRAPHS.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        </div>
        <Pushpin size={20} />
      </div>
    </main>
  );
}