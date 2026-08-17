import { cn } from "@/lib/cn";

export function ExperienceImage({
  src,
  alt,
  className,
}: {
  src?: string | null;
  alt: string;
  className?: string;
}) {
  return (
    <div className={cn("relative overflow-hidden bg-cream-deep", className)}>
      {src ? (
        // External catalog imagery is abstracted so fixtures can later become real photos.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-end bg-[radial-gradient(circle_at_20%_20%,#ede6f5,transparent_45%),linear-gradient(135deg,#3d3832,#1a1814)] p-4 text-sm text-white/70">
          {alt}
        </div>
      )}
    </div>
  );
}
