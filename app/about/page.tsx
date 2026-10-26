import Link from "next/link";
import { Pushpin } from "@/app/components/corkboard/Corkboard";

export const metadata = {
  title: "About Me | Hindy Hamburger",
  description: "A little about Hindy Hamburger: artist, designer, and aspiring art therapist.",
};

const PARAGRAPHS = [
  "Growing up, I was always making something. Drawing, painting, moving from one craft to the next. What I loved wasn't the finished product so much as the process. The thinking that goes into building something that didn't exist before.",
  "I saw that same idea from the other side as an art counselor at a small summer camp. I planned projects for campers of different ages, and what stayed with me wasn't how the finished pieces looked. It was watching kids settle into the process and make something that felt like their own. Either through our planned activities or just using the supplies as another medium to channel their energy and express themselves ",
  "In college, I majored in Computer Science and minored in Studio Art. People are often surprised by that pairing, but both start the same way: a blank page, an idea worth testing, and a lot of revising before something real takes shape.",
  "Now I'm working toward a career in art therapy, where the process is the whole point. Making art can be a way to slow down, work through something hard, or express what's difficult to put into words. I'm preparing for graduate study, starting with psychology coursework, and I keep making work in as many mediums as I can: drawing, painting, sculpture, digital illustration, crochet, and photography.",
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