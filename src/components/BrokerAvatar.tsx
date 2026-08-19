import { mediaUrl } from "@/lib/property";

/** Circular photo with an initial fallback — never a broken image icon. */
export function BrokerAvatar({
  name,
  photoUrl,
  className = "size-14",
}: {
  name: string;
  photoUrl?: string | null;
  className?: string;
}) {
  const initial = (name || "?").trim().charAt(0).toUpperCase() || "?";
  return (
    <div
      className={`grid shrink-0 place-items-center overflow-hidden rounded-full bg-primary/10 font-bold text-primary ${className}`}
    >
      {photoUrl ? (
        <img
          src={mediaUrl(photoUrl)}
          alt={name}
          className="size-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      ) : (
        <span>{initial}</span>
      )}
    </div>
  );
}
