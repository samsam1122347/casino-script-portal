import Image from "next/image";
import { LandingGridVideo } from "@/components/blocks/LandingGridVideo";
import { assets } from "@/lib/assets";
import { cn } from "@/lib/cn";

/**
 * Brand mark used inside fixed-size `relative` boxes.
 *
 * Renders a static SVG/PNG by default to keep every page free of unnecessary
 * `<video>` decoders. Pass `video` to opt into the looping animation
 * (kept for the loading splash where motion is the point).
 */
export function AnimatedBrandLogo({
  className,
  priority = false,
  video = false,
}: {
  className?: string;
  priority?: boolean;
  video?: boolean;
}) {
  if (video) {
    return (
      <LandingGridVideo
        src={assets.media.animatedLogo}
        poster={assets.brand.mark}
        priority={priority}
        className={cn(className)}
      />
    );
  }

  return (
    <Image
      src={assets.brand.mark}
      alt=""
      fill
      sizes="64px"
      priority={priority}
      aria-hidden
      className={cn("object-cover", className)}
    />
  );
}
