import { useState, useEffect, useRef } from "react";

type ScrollDirection = "up" | "down" | "top";

interface UseScrollDirectionOptions {
  threshold?: number; // Minimum scroll distance to trigger direction change
}

/**
 * Custom hook to detect scroll direction
 * Returns "up", "down", or "top" (when at the top of the page)
 */
export function useScrollDirection(options: UseScrollDirectionOptions = {}): ScrollDirection {
  const { threshold = 10 } = options;
  const [scrollDirection, setScrollDirection] = useState<ScrollDirection>("top");
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    const updateScrollDirection = () => {
      const scrollY = window.scrollY;

      // If at the top of the page
      if (scrollY < threshold) {
        setScrollDirection("top");
      }
      // If scrolling down
      else if (scrollY > lastScrollY.current && scrollY > threshold) {
        setScrollDirection("down");
      }
      // If scrolling up
      else if (scrollY < lastScrollY.current) {
        setScrollDirection("up");
      }

      lastScrollY.current = scrollY;
      ticking.current = false;
    };

    const onScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(updateScrollDirection);
        ticking.current = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, [threshold]);

  return scrollDirection;
}
