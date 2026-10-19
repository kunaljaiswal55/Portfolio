import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

export const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/** Live media-query hook with SSR-safe initial state. */
export function useMediaQuery(query: string, initial = false): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return initial;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}

export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 767px)');
}

/** Lock/unlock page scroll without the iOS jump-to-top bug. */
export function useScrollLock(locked: boolean) {
  const scrollbarCompensation = useRef(0);

  useEffect(() => {
    const body = document.body;
    const html = document.documentElement;

    if (locked) {
      scrollbarCompensation.current = window.innerWidth - html.clientWidth;
      const prevPadding = body.style.paddingRight;
      body.style.paddingRight = `${scrollbarCompensation.current}px`;
      body.classList.add('is-locked');
      html.classList.add('is-locked');

      return () => {
        body.style.paddingRight = prevPadding;
        body.classList.remove('is-locked');
        html.classList.remove('is-locked');
      };
    }

    body.classList.remove('is-locked');
    html.classList.remove('is-locked');
  }, [locked]);
}

/**
 * Debounced viewport resize. Used to re-run split text and refresh
 * ScrollTrigger without thrashing on mobile URL-bar show/hide.
 */
export function useDebouncedResize(callback: () => void, delay = 220) {
  const cb = useRef(callback);
  cb.current = callback;

  useEffect(() => {
    let timer: number;
    const onResize = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => cb.current(), delay);
    };
    window.addEventListener('resize', onResize);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('resize', onResize);
    };
  }, [delay]);
}

/** Smooth in-page navigation that respects reduced-motion. */
export function useSmoothScroll() {
  const reduced = usePrefersReducedMotion();

  return useCallback(
    (target: string | HTMLElement) => {
      const node = typeof target === 'string' ? document.querySelector<HTMLElement>(target) : target;
      if (!node) return;
      node.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    },
    [reduced],
  );
}