import { useEffect, useState } from "react";
import { blurhashToDataURL } from "@/lib/blurhash";
import { cn } from "@/lib/utils";

/**
 * Property image with a BlurHash placeholder.
 *
 * The decoded hash is painted as the <img>'s own background, so there is no
 * extra wrapper and no layout shift. Listings uploaded before BlurHash existed
 * simply fall back to a muted shimmer until the photo arrives.
 */
export function BlurImage({
  src,
  hash,
  alt,
  className,
  loading = "lazy",
  fetchPriority,
  onClick,
}: {
  src: string;
  hash?: string | null | undefined;
  alt: string;
  className?: string;
  loading?: "lazy" | "eager";
  fetchPriority?: "high" | "low" | "auto";
  onClick?: () => void;
}) {
  const [placeholder, setPlaceholder] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
    setPlaceholder(hash ? blurhashToDataURL(hash) : null);
  }, [hash, src]);

  return (
    <img
      src={src}
      alt={alt}
      loading={loading}
      fetchPriority={fetchPriority}
      onClick={onClick}
      onLoad={() => setLoaded(true)}
      onError={() => setLoaded(true)}
      className={cn(className, !loaded && !placeholder && "animate-pulse bg-muted")}
      style={
        !loaded && placeholder
          ? {
              backgroundImage: `url(${placeholder})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
          : undefined
      }
    />
  );
}
