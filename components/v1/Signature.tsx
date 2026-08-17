import * as React from "react";

export default function Signature({ className = "" }: { className?: string }) {
  return (
    <div
      aria-label="Signature"
      className={`bg-white ${className}`}
      style={{
        maskImage: 'url(/signature-cropped.svg)',
        WebkitMaskImage: 'url(/signature-cropped.svg)',
        maskRepeat: 'no-repeat',
        WebkitMaskRepeat: 'no-repeat',
        maskSize: 'contain',
        WebkitMaskSize: 'contain',
        maskPosition: 'center',
        WebkitMaskPosition: 'center',
      }}
    />
  );
}