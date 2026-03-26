import { useEffect, useMemo, useState } from "react";
import "./ImageSlider.css";

// Supports both:
// 1) `images` + `fallbackImages` (legacy/simple)
// 2) `slides=[{ sources: [...] , alt?: string }]` (preferred: per-slide fallback)
export default function ImageSlider({
  slides,
  images,
  fallbackImages = [],
  intervalMs = 3500,
  altPrefix = "Slide",
}) {
  const [broken, setBroken] = useState(() => ({}));

  const primary = useMemo(() => images?.filter(Boolean) || [], [images]);
  const fallback = useMemo(() => fallbackImages?.filter(Boolean) || [], [fallbackImages]);

  const slideItems = useMemo(() => {
    const normalizedSlides = Array.isArray(slides) ? slides.filter(Boolean) : [];
    if (normalizedSlides.length) {
      const items = normalizedSlides
        .map((s, idx) => {
          const sources = (s?.sources || s?.srcs || []).filter(Boolean);
          const chosen = sources.find((src) => !broken[src]);
          if (!chosen) return null;
          return { src: chosen, alt: s?.alt || `${altPrefix} ${idx + 1}` };
        })
        .filter(Boolean);
      if (items.length) return items;
      // If all slide sources are broken, fall back to the `fallbackImages` (typically local SVGs).
      return fallback.filter((src) => !broken[src]).map((src, idx) => ({ src, alt: `${altPrefix} ${idx + 1}` }));
    }

    // Legacy/simple mode: pick from `images`, else from `fallbackImages`.
    const filtered = primary.filter((src) => !broken[src]);
    const list = filtered.length ? filtered : fallback.filter((src) => !broken[src]);
    return list.map((src, idx) => ({ src, alt: `${altPrefix} ${idx + 1}` }));
  }, [slides, primary, fallback, broken, altPrefix]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slideItems.length <= 1) return undefined;
    const t = setInterval(() => setIndex((i) => (i + 1) % slideItems.length), intervalMs);
    return () => clearInterval(t);
  }, [slideItems.length, intervalMs]);

  function goTo(i) {
    const next = ((i % slideItems.length) + slideItems.length) % slideItems.length;
    setIndex(next);
  }

  if (!slideItems.length) return null;

  return (
    <div className="slider gov-card" role="region" aria-label="Image slider">
      <div className="slider__viewport">
        {slideItems.map((item, i) => (
          <img
            key={`${item.src}_${i}`}
            className={`slider__img ${i === index ? "is-active" : ""}`}
            src={item.src}
            alt={item.alt}
            loading={i === index ? "eager" : "lazy"}
            onError={() => setBroken((prev) => ({ ...prev, [item.src]: true }))}
          />
        ))}
      </div>

      {slideItems.length > 1 ? (
        <>
          <div className="slider__controls">
            <button type="button" className="slider__arrow" onClick={() => goTo(index - 1)} aria-label="Previous slide">
              {"<"}
            </button>
            <button type="button" className="slider__arrow" onClick={() => goTo(index + 1)} aria-label="Next slide">
              {">"}
            </button>
          </div>
          <div className="slider__dots" aria-label="Slide navigation">
            {slideItems.map((item, i) => (
              <button
                key={item.src + i}
                type="button"
                className={`slider__dot ${i === index ? "is-active" : ""}`}
                onClick={() => goTo(i)}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
