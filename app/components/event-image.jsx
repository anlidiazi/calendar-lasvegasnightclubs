import { useCallback, useState } from "react";

export default function EventImage({
  src,
  alt,
  category,
  className = "",
  imageClassName = "",
  width,
  height,
  loading,
  fetchPriority,
}) {
  const [failedSource, setFailedSource] = useState(null);
  const showFallback = !src || failedSource === src;
  const detectEarlyFailure = useCallback(
    (image) => {
      if (image?.complete && image.naturalWidth === 0) {
        setFailedSource(src);
      }
    },
    [src],
  );

  return (
    <div
      className={`relative overflow-hidden bg-zinc-900 ${className}`}
      data-image-state={showFallback ? "fallback" : "loaded"}
    >
      {showFallback ? (
        <div
          className="event-image-placeholder absolute inset-0 flex flex-col items-center justify-center px-2 text-center"
          role="img"
          aria-label={alt}
        >
          <img
            className="relative z-[1] h-auto w-[70%] max-w-52 opacity-80"
            src="/images/brand/las-vegas-nightclubs-logo.webp"
            width="272"
            height="90"
            alt=""
            aria-hidden="true"
          />
          <span
            className="relative z-[1] mt-3 text-[0.5rem] font-bold uppercase tracking-[0.14em] text-white/70 md:text-[0.625rem]"
            aria-hidden="true"
          >
            Image unavailable
          </span>
        </div>
      ) : (
        <img
          ref={detectEarlyFailure}
          src={src}
          alt={alt}
          className={imageClassName}
          width={width}
          height={height}
          loading={loading}
          fetchPriority={fetchPriority}
          onError={() => setFailedSource(src)}
        />
      )}

      {category && (
        <span className="absolute left-2 top-2 z-[2] rounded-full border border-white/20 bg-black/75 px-2 py-1 text-[0.55rem] font-bold uppercase tracking-wider text-white backdrop-blur-sm md:left-3 md:top-3 md:px-2.5 md:text-[0.625rem]">
          {category}
        </span>
      )}
    </div>
  );
}
