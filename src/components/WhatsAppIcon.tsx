import whatsappLogo from "@/assets/whatsapp-logo.webp.asset.json";

export function WhatsAppIcon({ className = "size-4", alt = "WhatsApp" }: { className?: string; alt?: string }) {
  return <img src={whatsappLogo.url} alt={alt} className={className} />;
}
