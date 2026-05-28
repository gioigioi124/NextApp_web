import Image, { type ImageProps } from "next/image";

type OptimizedImageProps = Omit<ImageProps, "src" | "alt"> & {
  src?: string | null;
  alt: string;
};

const OPTIMIZED_REMOTE_HOSTS = new Set(["images.unsplash.com", "localhost", "127.0.0.1"]);

function canUseNextImage(src: string) {
  if (src.startsWith("/")) {
    return true;
  }

  try {
    const url = new URL(src);
    return OPTIMIZED_REMOTE_HOSTS.has(url.hostname);
  } catch {
    return false;
  }
}

export function OptimizedImage({
  src,
  alt,
  className,
  fill,
  height,
  priority,
  quality,
  sizes,
  width,
  ...props
}: OptimizedImageProps) {
  if (!src) {
    return null;
  }

  if (canUseNextImage(src)) {
    return (
      <Image
        src={src}
        alt={alt}
        className={className}
        fill={fill}
        height={height}
        priority={priority}
        quality={quality}
        sizes={sizes}
        width={width}
        {...props}
      />
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
    />
  );
}
