import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

gsap.config({ nullTargetWarn: false });
ScrollTrigger.config({ ignoreMobileResize: true });

/** Named easing curves — reused everywhere so motion feels like one system. */
export const EASE = {
  /** expo-out — the default for entrances and reveals */
  cine: 'expo.out',
  /** expo-in-out — for anything that travels and settles */
  cineInOut: 'expo.inOut',
  /** power4 — quick, weighty arrivals */
  heavy: 'power4.out',
  /** slow sine — ambient, breathing loops */
  soft: 'sine.inOut',
  /** back-ish settle for scale pops */
  pop: 'back.out(2)',
} as const;

export const DURATION = {
  micro: 0.32,
  short: 0.6,
  base: 0.95,
  long: 1.5,
} as const;

export { gsap, ScrollTrigger };