import type { RefObject } from 'react';
import { gsap } from './motion';
import { splitText, type SplitMode } from './split';
import { useIsoLayoutEffect, usePrefersReducedMotion } from './hooks';

type RevealVariant = 'rise' | 'left' | 'wipe' | 'fade';

interface RevealOptions {
  /** Viewport position that fires the trigger. */
  start?: string;
  /** Base stagger between siblings sharing a data-reveal-group. */
  stagger?: number;
}

export interface ParallaxLayer {
  selector: string;
  y: number;
  rotate?: number;
}

/**
 * Wires every `[data-reveal]` inside a scope to a scroll-triggered entrance.
 *
 * Variants:
 *   rise   (default) translate up + fade
 *   left           clip-path wipe in from the right edge
 *   wipe           container clip wipe (media inside settles back to 1:1)
 *   fade           opacity only
 *
 * `[data-split="words|chars"]` elements are split into mask-wrapped fragments
 * and staggered by word or character inside their own mask.
 */
export function useRevealScope(
  scopeRef: RefObject<HTMLElement | null>,
  { start = 'top 86%', stagger = 0.07 }: RevealOptions = {},
) {
  const reduced = usePrefersReducedMotion();

  useIsoLayoutEffect(() => {
    const scope = scopeRef.current;
    if (!scope) return;

    if (reduced) {
      gsap.set(scope.querySelectorAll<HTMLElement>('[data-reveal]'), { clearProps: 'all' });
      gsap.set(scope.querySelectorAll<HTMLElement>('.line-mask__inner'), {
        clearProps: 'all',
        opacity: 1,
        yPercent: 0,
      });
      return;
    }

    const ctx = gsap.context(() => {
      /* --------------------------- text splits --------------------------- */
      gsap.utils.toArray<HTMLElement>('[data-split]', scope).forEach((el) => {
        const mode = (el.dataset.split as SplitMode) === 'chars' ? 'chars' : 'words';
        const { items } = splitText(el, mode);
        if (!items.length) return;

        gsap.fromTo(
          items,
          { yPercent: 108, opacity: 0 },
          {
            yPercent: 0,
            opacity: 1,
            duration: 1.05,
            ease: 'expo.out',
            stagger: mode === 'chars' ? 0.026 : 0.06,
            scrollTrigger: { trigger: el, start, once: true },
          },
        );
      });

      /* ------------------------- grouped reveals ------------------------- */
      const groups = new Map<string, HTMLElement[]>();
      gsap.utils.toArray<HTMLElement>('[data-reveal]', scope).forEach((el) => {
        const group = el.dataset.revealGroup;
        if (!group) return;
        if (!groups.has(group)) groups.set(group, []);
        groups.get(group)?.push(el);
      });

      gsap.utils.toArray<HTMLElement>('[data-reveal]', scope).forEach((el) => {
        const variant = (el.dataset.reveal || 'rise') as RevealVariant;
        const group = el.dataset.revealGroup;
        const siblings = group ? groups.get(group) ?? [el] : [el];
        const delay = Math.max(0, siblings.indexOf(el)) * stagger;

        const trigger = el.closest<HTMLElement>('[data-reveal-trigger]') ?? el;

        const from: gsap.TweenVars = { opacity: 0 };
        const to: gsap.TweenVars = {
          opacity: 1,
          duration: variant === 'wipe' ? 1.25 : 1,
          ease: 'expo.out',
          delay,
          scrollTrigger: { trigger, start, once: true },
        };

        switch (variant) {
          case 'left':
            from.clipPath = 'inset(0% 100% 0% 0%)';
            to.clipPath = 'inset(0% 0% 0% 0%)';
            break;
          case 'wipe':
            from.clipPath = 'inset(0% 100% 0% 0%)';
            to.clipPath = 'inset(0% 0% 0% 0%)';
            break;
          default:
            from.y = 42;
            to.y = 0;
        }

        gsap.fromTo(el, from, to);
      });
    }, scope);

    return () => ctx.revert();
  }, [scopeRef, start, stagger, reduced]);
}

/**
 * Depth through the stack: layers drift at different rates while their section
 * travels through the viewport. Cheap — transforms only, scrubbed.
 */
export function useParallax(scopeRef: RefObject<HTMLElement | null>, layers: ParallaxLayer[]) {
  const reduced = usePrefersReducedMotion();
  const key = JSON.stringify(layers);

  useIsoLayoutEffect(() => {
    const scope = scopeRef.current;
    if (!scope || reduced) return;

    const ctx = gsap.context(() => {
      (JSON.parse(key) as ParallaxLayer[]).forEach(({ selector, y, rotate = 0 }) => {
        const el = scope.querySelector<HTMLElement>(selector);
        if (!el) return;
        gsap.to(el, {
          y,
          rotate,
          ease: 'none',
          scrollTrigger: {
            trigger: scope,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        });
      });
    }, scope);

    return () => ctx.revert();
  }, [scopeRef, key, reduced]);
}