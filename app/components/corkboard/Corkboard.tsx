"use client";

import { useEffect, useRef, useState } from "react";
import type { PinnedMedia } from "@/types/media";

const CYCLE_INTERVAL_MS = 3500;
const FADE_MS = 700;

interface Slot {
    id: string;
    side: "left" | "right"; // which flex column this slot lives in
    orientation: "landscape" | "portrait"; // frame shape - matched against each media item's own aspect ratio
    rotation: number;
    offsetX: number; // px, applied via transform so it staggers items left/right without affecting flex layout/spacing
    width: string;  // CSS clamp() so the frame scales down on smaller windows instead of overflowing
    height: string;
}

const SLOTS: Slot[] = [
    { id: "left-top", side: "left", orientation: "portrait", rotation: -8, offsetX: 26, width: "clamp(150px, 19vw, 260px)", height: "clamp(160px, 25vh, 300px)" },
    { id: "left-mid", side: "left", orientation: "landscape", rotation: 6, offsetX: -32, width: "clamp(170px, 21vw, 280px)", height: "clamp(130px, 19vh, 220px)" },
    { id: "left-bottom", side: "left", orientation: "portrait", rotation: -5, offsetX: 20, width: "clamp(140px, 18vw, 240px)", height: "clamp(150px, 23vh, 280px)" },
    { id: "right-top", side: "right", orientation: "landscape", rotation: 7, offsetX: -26, width: "clamp(160px, 20vw, 270px)", height: "clamp(125px, 17vh, 200px)" },
    { id: "right-mid", side: "right", orientation: "portrait", rotation: -6, offsetX: 32, width: "clamp(140px, 18vw, 240px)", height: "clamp(150px, 23vh, 280px)" },
    { id: "right-bottom", side: "right", orientation: "landscape", rotation: 5, offsetX: -20, width: "clamp(170px, 21vw, 280px)", height: "clamp(130px, 19vh, 220px)" },
];

function mediaOrientation(item: PinnedMedia): "landscape" | "portrait" {
    return item.width >= item.height ? "landscape" : "portrait";
}

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
    // separate draw pools per orientation so a slot only ever pulls a same-shaped image from its pool -
    // falls back to the other pool if one orientation runs out, so slots still fill even with a lopsided media mix
    const poolsRef = useRef<Record<"landscape" | "portrait", PinnedMedia[]>>({ landscape: [], portrait: [] });
    const poolIndexRef = useRef<Record<"landscape" | "portrait", number>>({ landscape: 0, portrait: 0 });
    const keyCounterRef = useRef(0);

    const refillPools = (source: PinnedMedia[]) => {
        poolsRef.current = {
            landscape: shuffled(source.filter((m) => mediaOrientation(m) === "landscape")),
            portrait: shuffled(source.filter((m) => mediaOrientation(m) === "portrait")),
        };
        poolIndexRef.current = { landscape: 0, portrait: 0 };
    };

    const drawFrom = (orientation: "landscape" | "portrait"): PinnedMedia | null => {
        const pool = poolsRef.current[orientation];
        const idx = poolIndexRef.current[orientation];
        if (idx >= pool.length) {
            // that orientation's pool is exhausted for this pass - reshuffle just that pool from the full media list
            poolsRef.current[orientation] = shuffled(media.filter((m) => mediaOrientation(m) === orientation));
            poolIndexRef.current[orientation] = 0;
        }
        const refreshed = poolsRef.current[orientation];
        if (refreshed.length === 0) return null; // truly no media of this orientation exists
        const item = refreshed[poolIndexRef.current[orientation]];
        poolIndexRef.current[orientation] += 1;
        return item;
    };

    const nextMediaForSlot = (orientation: "landscape" | "portrait"): PinnedMedia | null => {
        if (media.length === 0) return null;
        return drawFrom(orientation) ?? drawFrom(orientation === "landscape" ? "portrait" : "landscape");
    };

    const [slots, setSlots] = useState<SlotState[]>([]);

    // initial fill - one distinct, orientation-matched image per slot (as many slots as we have media for, up to 6)
    useEffect(() => {
        refillPools(media);

        const activeSlots = SLOTS.slice(0, Math.min(SLOTS.length, media.length));
        const initial = activeSlots.map((slot) => ({
            slot,
            media: nextMediaForSlot(slot.orientation),
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
                    const item = nextMediaForSlot(prev[idx].slot.orientation);
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

    const leftItems = slots.filter((s) => s.slot.side === "left");
    const rightItems = slots.filter((s) => s.slot.side === "right");

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
            {/* pinned photos - desktop only. hidden below lg so mobile keeps just the cork texture behind the profile photo,
                without the photo columns cluttering a narrow screen. */}
            <div
                className="hidden lg:flex absolute left-0 top-0 h-full flex-col items-start justify-center gap-10 pl-[8%] pt-16 pb-6">
                {leftItems.map((s) => (
                    <PinnedItem key={s.slot.id} state={s}/>
                ))}
            </div>
            <div
                className="hidden lg:flex absolute right-0 top-0 h-full flex-col items-end justify-center gap-10 pr-[8%] pt-16 pb-6">
                {rightItems.map((s) => (
                    <PinnedItem key={s.slot.id} state={s}/>
                ))}
            </div>
        </div>
    );
}

export function Pushpin({size = 18, className = ""}: { size?: number; className?: string }) {
    const shadowSize = size * (16 / 18);
    const highlightWidth = size * (5 / 18);
    const highlightHeight = size * (4 / 18);
    return (
        <div
            className={`absolute -translate-x-1/2 -translate-y-1/2 ${className}`}
            style={{ left: "50%", top: 0, width: size, height: size }}
        >
            {/* ground shadow - offset down-right, blurred, so the pin reads as sitting proud of the surface */}
            <div
                className="absolute rounded-full"
                style={{
                    width: shadowSize,
                    height: shadowSize,
                    left: size * (3 / 18),
                    top: size * (4 / 18),
                    background: "rgba(0,0,0,0.4)",
                    filter: "blur(2px)",
                }}
            />
            {/* domed head - light source top-left: bright center fading to a dark rim, plus inset shading */}
            <div
                className="absolute rounded-full"
                style={{
                    width: size,
                    height: size,
                    background: "radial-gradient(circle at 35% 30%, #6b6b6b 0%, #2b2b2b 42%, #141414 82%, #000000 100%)",
                    boxShadow:
                        "0 2px 3px rgba(0,0,0,0.45), " +
                        "inset -2px -2px 3px rgba(0,0,0,0.35), " +
                        "inset 1px 1px 2px rgba(255,255,255,0.55)",
                }}
            />
            {/* specular highlight - small bright spot for the glossy-plastic shine */}
            <div
                className="absolute rounded-full"
                style={{
                    width: highlightWidth,
                    height: highlightHeight,
                    left: size * (4 / 18),
                    top: size * (3 / 18),
                    background: "rgba(255,255,255,0.85)",
                    filter: "blur(0.4px)",
                }}
            />
        </div>
    );
}

function PinnedItem({ state }: { state: SlotState }) {
    const { slot, media, imgVisible, key } = state;
    if (!media) return null;
    const { rotation, offsetX, width, height } = slot;

    return (
        <div className="relative" style={{ width, transform: `rotate(${rotation}deg)  translateX(${offsetX}px)`  }}>
            <div
                className="bg-white p-2 pb-5"
                style={{
                    width,
                    boxShadow: "0 28px 38px -12px rgba(0,0,0,0.55), 0 12px 16px -8px rgba(0,0,0,0.4)"
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
            {/* pushpin - centered on top edge of the frame, stays put, never fades */}
            <Pushpin size={20} />.
        </div>
    );
}