import { useState } from "react";

/**
 * Brand mark. Looks for /logo.png (drop the PropertyGenie logo file there,
 * in the `public/` folder) and falls back to the plain "P" badge if it's
 * missing, so a not-yet-added file never shows a broken image icon.
 */
export function Logo({ className = "size-8" }: { className?: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span
        className={`grid ${className} shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground`}
      >
        P
      </span>
    );
  }

  return (
    <img
      src="/logo.png"
      alt="PropertyGenie"
      className={`${className} shrink-0 rounded-lg object-contain`}
      onError={() => setFailed(true)}
    />
  );
}
