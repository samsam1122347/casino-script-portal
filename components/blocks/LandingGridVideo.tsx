"use client";

import { useEffect, useRef, useState, startTransition } from "react";
import Image from "next/image";
import { cn } from "@/lib/cn";

type Props = {
  src: string;
  poster: string;
  className?: string;
  priority?: boolean;
};

type NavigatorWithConnection = Navigator & {
  connection?: {
    saveData?: boolean;
    effectiveType?: string;
  };
};

function shouldSkipVideo(): boolean {
  if (typeof window === "undefined") return false;
  const nav = window.navigator as NavigatorWithConnection;
  const conn = nav.connection;
  if (conn?.saveData) return true;
  if (conn?.effectiveType && /^(2g|slow-2g)$/i.test(conn.effectiveType))
    return true;
  return false;
}

/**
 * Ambient loop with aggressive perf safeguards:
 *  - The `<video>` only mounts once it intersects the viewport.
 *  - Pauses when scrolled off-screen or the tab is hidden.
 *  - Honors `prefers-reduced-motion`, `Save-Data`, and 2G connections (poster only).
 *  - `priority` videos still wait for intersection but use `preload="auto"`.
 */
function readReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function noIntersectionObserver(): boolean {
  return (
    typeof window !== "undefined" && typeof IntersectionObserver === "undefined"
  );
}

export function LandingGridVideo({ src, poster, className, priority }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  // If the browser lacks IntersectionObserver, render immediately so the video
  // still plays (e.g. very old WebKit). Otherwise wait for an intersection.
  const [shouldRender, setShouldRender] = useState(noIntersectionObserver);
  const [reducedMotion, setReducedMotion] = useState(readReducedMotion);
  const [skipMedia, setSkipMedia] = useState(shouldSkipVideo);
  /** True once the decoded video can paint — until then poster Image stays visible. */
  const [videoPrimed, setVideoPrimed] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMotionChange = (event: MediaQueryListEvent) =>
      setReducedMotion(event.matches);
    mq.addEventListener("change", onMotionChange);

    const onConnectionChange = () => setSkipMedia(shouldSkipVideo());
    const conn = (window.navigator as NavigatorWithConnection).connection as
      | (EventTarget & { saveData?: boolean })
      | undefined;
    conn?.addEventListener?.("change", onConnectionChange);

    return () => {
      mq.removeEventListener("change", onMotionChange);
      conn?.removeEventListener?.("change", onConnectionChange);
    };
  }, []);

  useEffect(() => {
    if (shouldRender) return;
    const node = containerRef.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShouldRender(true);
            observer.disconnect();
            break;
          }
        }
      },
      {
        rootMargin: priority ? "200px" : "150px",
        threshold: 0.01,
      },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [priority, shouldRender]);

  useEffect(() => {
    if (!shouldRender) return;
    const video = videoRef.current;
    if (!video) return;
    if (skipMedia || reducedMotion) {
      video.pause();
      try {
        video.currentTime = 0;
      } catch {
        /* noop */
      }
      return;
    }

    let isOnScreen = false;
    const tryPlay = () => {
      if (!isOnScreen || document.hidden) return;
      void video.play().catch(() => {});
    };

    const visibility = () => {
      if (document.hidden) {
        video.pause();
      } else {
        tryPlay();
      }
    };
    document.addEventListener("visibilitychange", visibility);

    const node = containerRef.current;
    let viewObserver: IntersectionObserver | null = null;
    if (node && typeof IntersectionObserver !== "undefined") {
      viewObserver = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            isOnScreen = entry.isIntersecting;
            if (isOnScreen) tryPlay();
            else video.pause();
          }
        },
        { threshold: 0.05 },
      );
      viewObserver.observe(node);
    } else {
      isOnScreen = true;
      tryPlay();
    }

    return () => {
      document.removeEventListener("visibilitychange", visibility);
      viewObserver?.disconnect();
      video.pause();
    };
  }, [shouldRender, skipMedia, reducedMotion]);

  const renderVideo = shouldRender && !skipMedia;

  useEffect(() => {
    startTransition(() => setVideoPrimed(false));
  }, [src, renderVideo]);

  function primeVideo() {
    startTransition(() => setVideoPrimed(true));
  }

  return (
    <div ref={containerRef} className={cn("relative h-full w-full", className)}>
      <Image
        src={poster}
        alt=""
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        aria-hidden
        className={cn(
          "object-cover",
          renderVideo &&
            "transition-opacity duration-500 ease-out motion-reduce:transition-none",
          renderVideo && videoPrimed ? "opacity-0" : "opacity-100",
        )}
        priority={priority}
      />
      {renderVideo ? (
        <video
          ref={videoRef}
          src={src}
          muted
          loop
          playsInline
          autoPlay
          preload={priority ? "auto" : "metadata"}
          disablePictureInPicture
          aria-hidden
          tabIndex={-1}
          /** Native `poster` loads separately from next/image — avoid double placeholder & flash. */
          className={cn(
            "absolute inset-0 h-full w-full object-cover motion-safe:transition-opacity motion-safe:duration-500 motion-safe:ease-out",
            videoPrimed ? "opacity-100" : "opacity-0",
          )}
          onLoadedData={() => {
            /** First frame buffered — safe to fade in without black flash. */
            primeVideo();
          }}
          onPlaying={() => primeVideo()}
        />
      ) : null}
    </div>
  );
}
