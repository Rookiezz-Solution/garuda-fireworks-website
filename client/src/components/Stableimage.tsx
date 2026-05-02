import React from "react";

interface StableImageProps
  extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src"> {
  src?: string | null;
  fallbackClassName?: string;
}

export function StableImage({
  src,
  alt = "",
  fallbackClassName,
  className,
  ...rest
}: StableImageProps) {
  if (!src) {
    return (
      <div
        className={
          fallbackClassName ??
          className ??
          "w-full h-full bg-muted flex items-center justify-center text-xs text-muted-foreground"
        }
      />
    );
  }

  return (
    <img
      key={src}
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      decoding="async"
      onError={(e) => {
        const target = e.currentTarget;
        target.onerror = null;
        target.style.display = "none";
        const parent = target.parentElement;
        if (parent && !parent.querySelector("[data-img-fallback]")) {
          const div = document.createElement("div");
          div.setAttribute("data-img-fallback", "1");
          div.className =
            "w-full h-full bg-muted flex items-center justify-center text-xs text-muted-foreground";
          parent.appendChild(div);
        }
      }}
      {...rest}
    />
  );
}

