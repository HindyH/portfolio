"use client";

import { useEffect, useRef, useState } from "react";
import type { PinnedMedia } from "@/types/media";

const CYCLE_INTERVAL_MS = 3500;
const FADE_MS = 700;

interface Slot {
    id: string;
    xPct: number;
    yPct: number;
    rotation: number;
    width: number;  // fixed frame size - stays constant no matter what image is inside
    height: number;
}

// 3 fixed slots down each side, moved higher up the page
const SLOTS: Slot[] = [
    { id: "left-top", xPct: 12, yPct: 12, rotation: -8, width: 150, height: 175 },
    { id: "left-mid", xPct: 10, yPct: 36, rotation: 6, width: 165, height: 140 },
    { id: "left-bottom", xPct: 13, yPct: 60, rotation: -5, width: 145, height: 170 },
    { id: "right-top", xPct: 88, yPct: 10, rotation: 7, width: 160, height: 135 },
    { id: "right-mid", xPct: 90, yPct: 34, rotation: -6, width: 145, height: 170 },
    { id: "right-bottom", xPct: 87, yPct: 58, rotation: 5, width: 165, height: 145 },
];

interface SlotState {
    slot: Slot;
    media: PinnedMedia | null;
    imgVisible: boolean;
    key: number; // bump to force remount of the media element on swap
}

function shuffled<T>(arr: T[]): T[] {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

export function Corkboard({ media, className = "" }: { media: PinnedMedia[]; className?: string }) {
    const poolRef = useRef<PinnedMedia[]>([]);
    const poolIndexRef = useRef(0);
    const keyCounterRef = useRef(0);

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

    const [slots, setSlots] = useState<SlotState[]>([]);

    // initial fill - one distinct image per slot (as many slots as we have media for, up to 6)
    useEffect(() => {
        poolRef.current = shuffled(media);
        poolIndexRef.current = 0;

        const activeSlots = SLOTS.slice(0, Math.min(SLOTS.length, media.length));
        const initial = activeSlots.map((slot) => ({
            slot,
            media: nextMedia(),
            imgVisible: false,
            key: keyCounterRef.current++,
        }));
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSlots(initial);

        const t = setTimeout(() => {
            setSlots((prev) => prev.map((s) => ({ ...s, imgVisible: true })));
        }, 50);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [media]);

    // only cycle if there are more images than visible slots - otherwise everything is already on screen.
    // the frame and pin are static markup that never re-renders position; only the image inside crossfades.
    useEffect(() => {
        if (media.length <= SLOTS.length) return;

        const interval = setInterval(() => {
            setSlots((prev) => {
                if (prev.length === 0) return prev;
                const idx = Math.floor(Math.random() * prev.length);
                const next = [...prev];
                next[idx] = { ...next[idx], imgVisible: false };
                return next;
            });

            setTimeout(() => {
                setSlots((prev) => {
                    const idx = prev.findIndex((s) => !s.imgVisible);
                    if (idx === -1) return prev;
                    const item = nextMedia();
                    if (!item) return prev;
                    const next = [...prev];
                    next[idx] = { ...next[idx], media: item, key: keyCounterRef.current++ };
                    return next;
                });
                setTimeout(() => {
                    setSlots((prev) => prev.map((s) => (s.imgVisible ? s : { ...s, imgVisible: true })));
                }, 50);
            }, FADE_MS);
        }, CYCLE_INTERVAL_MS);

        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [media]);

    if (media.length === 0) return null;

    return (
        <div
            className={`pointer-events-none overflow-hidden select-none ${className}`}
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
            {slots.map((s) => (
                <PinnedItem key={s.slot.id} state={s} />
            ))}
        </div>
    );
}

function PinnedItem({ state }: { state: SlotState }) {
    const { slot, media, imgVisible, key } = state;
    if (!media) return null;
    const { xPct, yPct, rotation, width, height } = slot;

    return (
        // outer wrapper - permanently positioned, never fades
        <div
            className="absolute"
            style={{ left: `${xPct}%`, top: `${yPct}%` }}
        >
            {/* photo frame - white border + shadow are static, always fully opaque */}
            <div
                className="absolute bg-white p-2 pb-5 shadow-xl"
                style={{
                    left: -width / 2,
                    top: 0,
                    width
                }}
            >
                {/* fixed-size window - only this crossfades when the media swaps, the frame around it never moves */}
                <div
                    className="relative overflow-hidden bg-neutral-200 transition-opacity ease-in-out"
                    style={{ width: "100%", height, opacity: imgVisible ? 1 : 0, transitionDuration: `${FADE_MS}ms` }}
                >
                    {media.type === "video" ? (
                        <video
                            key={key}
                            src={media.src}
                            className="h-full w-full object-cover"
                            autoPlay
                            muted
                            loop
                            playsInline
                        />
                    ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img key={key} src={media.src} alt={media.title} className="h-full w-full object-cover" />
                    )}
                </div>
            </div>
            {/* pushpin - stays fixed exactly at the anchor point, never rotates, never fades */}
            <div
                className="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-600 shadow-md"
                style={{ left: 0, top: 0 }}
            />
        </div>
    );
}