"use client";

import { useEffect, useRef, useState } from "react";
import type { PinnedMedia } from "@/types/media";

const MAX_PINS = 7;
const CYCLE_INTERVAL_MS = 3500;
const FADE_MS = 700;
const ROTATION_RANGE = 16; // degrees, +/-
const SIZE_MIN = 120; // px, width of a pinned item
const SIZE_MAX = 220;
const MIN_DISTANCE_PCT = 20; // minimum center-to-center distance (in % of container) between pins

interface Pin {
    key: string;
    media: PinnedMedia;
    xPct: number;
    yPct: number;
    rotation: number;
    size: number;
    visible: boolean;
}

export interface ExcludeRect {
    xMinPct: number;
    xMaxPct: number;
    yMinPct: number;
    yMaxPct: number;
}

function randomBetween(min: number, max: number) {
    return Math.random() * (max - min) + min;
}

function insideExclude(xPct: number, yPct: number, exclude: ExcludeRect | null | undefined) {
    if (!exclude) return false;
    return xPct >= exclude.xMinPct && xPct <= exclude.xMaxPct && yPct >= exclude.yMinPct && yPct <= exclude.yMaxPct;
}

function makePin(media: PinnedMedia, xPct: number, yPct: number): Pin {
    return {
        key: `${media.id}-${Math.random().toString(36).slice(2, 8)}`,
        media,
        xPct,
        yPct,
        rotation: randomBetween(-ROTATION_RANGE, ROTATION_RANGE),
        size: randomBetween(SIZE_MIN, SIZE_MAX),
        visible: false,
    };
}

function shuffled<T>(arr: T[]): T[] {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

function distancePct(a: { xPct: number; yPct: number }, b: { xPct: number; yPct: number }) {
    const dx = a.xPct - b.xPct;
    const dy = a.yPct - b.yPct;
    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Picks a random spot outside `exclude` (hard requirement) that's also at least MIN_DISTANCE_PCT
 * away from every position in `existing` when possible (soft preference, relaxed if space is tight).
 */
function pickSpacedPosition(
    existing: { xPct: number; yPct: number }[],
    exclude: ExcludeRect | null | undefined,
    attempts = 60
) {
    let bestOutsideExclude: { xPct: number; yPct: number } | null = null;

    for (let i = 0; i < attempts; i++) {
        const candidate = { xPct: randomBetween(8, 88), yPct: randomBetween(12, 85) };
        const blocked = insideExclude(candidate.xPct, candidate.yPct, exclude);
        if (blocked) continue;

        const tooClose = existing.some((p) => distancePct(candidate, p) < MIN_DISTANCE_PCT);
        if (!tooClose) return candidate; // satisfies both constraints - best case

        if (!bestOutsideExclude) bestOutsideExclude = candidate; // remember a fallback that at least avoids the content area
    }

    // couldn't satisfy spacing too, but staying outside the content area is the hard requirement
    if (bestOutsideExclude) return bestOutsideExclude;

    // last resort (exclude covers essentially the whole board) - shouldn't happen in practice
    return { xPct: randomBetween(8, 88), yPct: randomBetween(12, 85) };
}

export function Corkboard({
    media,
    exclude = null,
    className = "",
}: {
    media: PinnedMedia[];
    exclude?: ExcludeRect | null;
    className?: string;
}) {
    const containerRef = useRef<HTMLDivElement>(null);
    const poolRef = useRef<PinnedMedia[]>([]);
    const poolIndexRef = useRef(0);

    const nextMedia = () => {
        if (media.length === 0) return null;
        if (poolRef.current.length === 0 || poolIndexRef.current >= poolRef.current.length) {
            poolRef.current = shuffled(media);
            poolIndexRef.current = 0;
        }
        const item = poolRef.current[poolIndexRef.current];
        poolIndexRef.current += 1;
        return item;
    };

    const [pins, setPins] = useState<Pin[]>([]);

    useEffect(() => {
        const pool = shuffled(media);
        const count = Math.min(MAX_PINS, pool.length);
        const placed: Pin[] = [];
        for (let i = 0; i < count; i++) {
            const { xPct, yPct } = pickSpacedPosition(placed, exclude);
            placed.push(makePin(pool[i], xPct, yPct));
        }
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPins(placed);
        const t = setTimeout(() => {
            setPins((prev) => prev.map((p) => ({ ...p, visible: true })));
        }, 50);
        return () => clearTimeout(t);
    }, [media, exclude]);

    useEffect(() => {
        poolRef.current = shuffled(media);
        poolIndexRef.current = 0;
    }, [media]);

    useEffect(() => {
        if (media.length === 0) return;
        const interval = setInterval(() => {
            setPins((prev) => {
                if (prev.length === 0) return prev;
                const idx = Math.floor(Math.random() * prev.length);
                const next = [...prev];
                next[idx] = { ...next[idx], visible: false };
                return next;
            });

            setTimeout(() => {
                setPins((prev) => {
                    const idx = prev.findIndex((p) => !p.visible);
                    if (idx === -1) return prev;
                    const item = nextMedia();
                    if (!item) return prev;
                    const others = prev.filter((_, i) => i !== idx);
                    const { xPct, yPct } = pickSpacedPosition(others, exclude);
                    const replacement = makePin(item, xPct, yPct);
                    const next = [...prev];
                    next[idx] = replacement;
                    return next;
                });
                setTimeout(() => {
                    setPins((prev) => prev.map((p) => (p.visible ? p : { ...p, visible: true })));
                }, 50);
            }, FADE_MS);
        }, CYCLE_INTERVAL_MS);

        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [media, exclude]);

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target !== e.currentTarget) return; // ignore clicks on pinned photos, only the open board counts
        if (!containerRef.current) return;
        const item = nextMedia();
        if (!item) return;
        const rect = containerRef.current.getBoundingClientRect();
        const xPct = ((e.clientX - rect.left) / rect.width) * 100;
        const yPct = ((e.clientY - rect.top) / rect.height) * 100;
        if (insideExclude(xPct, yPct, exclude)) return; // never pin inside the reserved content area
        const newPin = makePin(item, xPct, yPct);

        setPins((prev) => {
            const clear = prev.filter((p) => distancePct(p, newPin) >= MIN_DISTANCE_PCT);
            const next = [...clear, newPin];
            return next.length > MAX_PINS + 1 ? next.slice(1) : next;
        });

        setTimeout(() => {
            setPins((prev) => prev.map((p) => (p.key === newPin.key ? { ...p, visible: true } : p)));
        }, 50);
    };

    if (media.length === 0) return null;

    return (
        <div
            ref={containerRef}
            onClick={handleClick}
            className={`pointer-events-auto cursor-crosshair overflow-hidden select-none ${className}`}
            style={{
                backgroundColor: "#b98a5e", // fallback color while the image loads or if it fails
                backgroundImage:
                    "radial-gradient(circle at 20% 30%, rgba(0,0,0,0.15) 0, transparent 45%), " +
                    "url('/cork-texture.webp')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
            }}
        >
            {pins.map((pin) => (
                <PinnedItem key={pin.key} pin={pin} />
            ))}
        </div>
    );
}

function PinnedItem({ pin }: { pin: Pin }) {
    const { media, xPct, yPct, rotation, size, visible } = pin;
    const aspectRatio = media.width / media.height;

    return (
        <div
            className="absolute transition-all ease-in-out"
            style={{
                left: `${xPct}%`,
                top: `${yPct}%`,
                transform: `scale(${visible ? 1 : 0.85})`,
                transformOrigin: "0 0", // pop in/out from the pin location
                opacity: visible ? 1 : 0,
                transitionDuration: `${FADE_MS}ms`,
            }}
        >
            {/* photo - rotates around its own top-center, which sits right at the pin, so it always hangs straight below it */}
            <div
                className="absolute rounded-sm bg-white p-2 pb-5 shadow-xl"
                style={{
                    left: -size / 2,
                    top: 0,
                    width: size,
                    transform: `rotate(${rotation}deg)`,
                    transformOrigin: "50% 0",
                }}
            >
                <div className="relative w-full overflow-hidden bg-neutral-200" style={{ aspectRatio }}>
                    {media.type === "video" ? (
                        <video
                            src={media.src}
                            className="h-full w-full object-cover"
                            autoPlay
                            muted
                            loop
                            playsInline
                        />
                    ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={media.src} alt={media.title} className="h-full w-full object-cover" />
                    )}
                </div>
            </div>
            {/* pushpin - rendered after the photo so it paints on top, stays fixed exactly at the anchor point, never rotates */}
            <div
                className="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-600 shadow-md"
                style={{ left: 0, top: 0 }}
            />
        </div>
    );
}