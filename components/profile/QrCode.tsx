"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

export function QrCode({
  value,
  size = 220,
}: {
  value: string;
  size?: number;
}) {
  const [src, setSrc] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(value, {
      margin: 1,
      width: size,
      color: { dark: "#000000", light: "#ffffff" },
    })
      .then((dataUrl) => {
        if (!cancelled) setSrc(dataUrl);
      })
      .catch(() => {
        if (!cancelled) setSrc("");
      });
    return () => {
      cancelled = true;
    };
  }, [value, size]);

  return (
    <div
      className="grid place-items-center rounded-2xl bg-white p-3"
      style={{ width: size + 24, height: size + 24 }}
    >
      {src ? (
        // Using a plain <img> here because the QR is a runtime-generated
        // data URL and next/image can't optimize it.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          width={size}
          height={size}
          alt={`QR code for ${value}`}
        />
      ) : (
        <div className="shimmer h-full w-full rounded-md" aria-hidden />
      )}
    </div>
  );
}
