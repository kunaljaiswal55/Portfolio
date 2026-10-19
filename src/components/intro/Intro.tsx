import { useCallback, useEffect, useRef, useState } from 'react';
import { gsap } from '../../lib/motion';
import { splitText } from '../../lib/split';
import { useIsoLayoutEffect, usePrefersReducedMotion, useScrollLock } from '../../lib/hooks';
import { identity } from '../../data/content';
import './intro.css';

/**
 * THE TITLE SEQUENCE
 * ---------------------------------------------------------------------------
 * Five beats, built like a film title card rather than a logo reveal:
 *
 *   1  darkness + a single scanline of light
 *   2  light streaks tear across the frame at different speeds (depth)
 *   3  a horizontal window of light opens and the name resolves inside it
 *   4  technical rules drop in, corner labels lock on
 *   5  the system accelerates off the right edge and wipes into the portfolio
 */

/** Fast foreground streaks — the ones that tear across first. */
const FAST_STREAKS = [
  { top: '34%', h: 1, w: '72%', o: 0.5, blur: 0, dur: 1.05, at: 0.55 },
  { top: '41%', h: 2, w: '54%', o: 0.9, blur: 5, dur: 0.9, at: 0.68 },
  { top: '49%', h: 1, w: '86%', o: 0.38, blur: 0, dur: 1.2, at: 0.82 },
  { top: '58%', h: 3, w: '46%', o: 0.7, blur: 12, dur: 0.82, at: 0.95 },
  { top: '66%', h: 1, w: '64%', o: 0.3, blur: 0, dur: 1.3, at: 1.1 },
];

/** Slow background streaks — parallax depth behind the name. */
const SLOW_STREAKS = [
  { top: '30%', h: 1, w: '120%', o: 0.18, dur: 1.9, at: 1.55 },
  { top: '70%', h: 1, w: '110%', o: 0.14, dur: 2.2, at: 1.72 },
  { top: '50%', h: 2, w: '96%', o: 0.1, dur: 2.5, at: 1.9 },
];

interface IntroProps {
  onComplete: () => void;
  /** Fired the instant the curtain starts moving, so the hero can begin its
   *  own entrance while it is still being uncovered. */
  onReveal: () => void;
}

/** Hard failsafe — the site must never be held hostage by an animation. */
const MAX_DURATION_MS = 9500;

export function Intro({ onComplete, onReveal }: IntroProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const bloomRef = useRef<HTMLDivElement>(null);
  const bandRef = useRef<HTMLDivElement>(null);
  const scanRef = useRef<HTMLSpanElement>(null);
  const nameRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const skipRef = useRef<HTMLButtonElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);
  const wipeRef = useRef<HTMLDivElement>(null);
  const fastRef = useRef<HTMLSpanElement[]>([]);
  const slowRef = useRef<HTMLSpanElement[]>([]);
  const ruleRefs = useRef<HTMLSpanElement[]>([]);
  const creditsRef = useRef<HTMLDivElement>(null);

  const reduced = usePrefersReducedMotion();
  const [canSkip, setCanSkip] = useState(false);

  const timeline = useRef<gsap.core.Timeline | null>(null);
  const finished = useRef(false);

  useScrollLock(true);

  /* --- Split the name into mask-wrapped characters ------------------------ */
  const lines = useRef<HTMLElement[][]>([]);
  useIsoLayoutEffect(() => {
    if (!nameRef.current) return;
    const targets = Array.from(nameRef.current.querySelectorAll<HTMLElement>('.seq__name-line'));
    lines.current = targets.map((t) => splitText(t, 'chars').items);
  }, []);

  const finish = useCallback(() => {
    if (finished.current) return;
    finished.current = true;
    onComplete();
  }, [onComplete]);

  /* --- Build and run the sequence ---------------------------------------- */
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      const chars = lines.current.flat();
      const grain = document.querySelector<HTMLElement>('[data-grain]');
      const status = document.querySelector<HTMLElement>('[data-seq-status]');
      const chrome = root.querySelectorAll<HTMLElement>('.seq__chrome');
      const fast = fastRef.current;
      const slow = slowRef.current;
      const rules = ruleRefs.current;

      /* ------------------------- REDUCED MOTION ------------------------- */
      if (reduced) {
        gsap.set(root, { autoAlpha: 1 });
        gsap.set(bloomRef.current, { opacity: 0.22, scale: 1 });
        gsap.set(scanRef.current, { opacity: 0.25, scaleX: 1 });
        gsap.set(bandRef.current, { scaleY: 1 });
        gsap.set([...fast, ...slow], { opacity: 0.12, xPercent: 0 });
        gsap.set(chars, { opacity: 1, yPercent: 0 });
        gsap.set([descRef.current, ...chrome], { opacity: 1 });
        gsap.set(rules, { scaleY: 1, opacity: 1 });

        const tl = gsap.timeline({ onComplete: finish });
        timeline.current = tl;
        tl.call(onReveal, undefined, 1.1);
        tl.to(root, { autoAlpha: 0, duration: 0.45, delay: 1.15 }, 1.1);
        return;
      }

      /* --------------------- INITIAL (HIDDEN) STATE --------------------- */
      gsap.set(bandRef.current, { scaleY: 0.001 });
      gsap.set(scanRef.current, { scaleX: 0, opacity: 0 });
      gsap.set(chars, { yPercent: 118, opacity: 0 });
      gsap.set(descRef.current, { opacity: 0 });
      gsap.set(chrome, { opacity: 0 });
      gsap.set(rules, { scaleY: 0, opacity: 0 });
      gsap.set(progressRef.current, { scaleX: 0 });

      const tl = gsap.timeline({ onComplete: finish });
      timeline.current = tl;

      /* 1 — darkness, and a single line of light ignites */
      tl.fromTo(scanRef.current, { opacity: 0 }, { opacity: 0.9, duration: 0.4, ease: 'power2.out' }, 0.18)
        .to(scanRef.current, { scaleX: 1, duration: 0.85, ease: 'expo.out' }, 0.2);

      /* 2 — the light source warms the frame */
      tl.fromTo(
        bloomRef.current,
        { opacity: 0, scale: 0.25 },
        { opacity: 0.2, scale: 1, duration: 1.5, ease: 'expo.out', transformOrigin: '50% 50%' },
        0.4,
      ).to(grain, { opacity: 0.085, duration: 0.6, ease: 'power2.out' }, 0.45);

      /* 3 — foreground streaks tear across at different speeds */
      FAST_STREAKS.forEach((cfg, i) => {
        const el = fast[i];
        if (!el) return;
        tl.fromTo(
          el,
          { xPercent: -160, opacity: 0 },
          {
            xPercent: 170,
            opacity: cfg.o,
            duration: cfg.dur,
            ease: 'expo.inOut',
            onStart: () => gsap.set(el, { opacity: cfg.o }),
            onComplete: () => gsap.set(el, { opacity: 0 }),
          },
          cfg.at + i * 0.02,
        );
      });

      /* 4 — the window of light opens */
      tl.set(bandRef.current, { yPercent: -50 }, 0)
        .to(bandRef.current, { scaleY: 1, duration: 0.95, ease: 'expo.out' }, 1.3)
        .fromTo(root.querySelectorAll('.seq__band-edge'), { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'power2.out' }, 1.45);

      /* 5 — background streaks drift behind the type */
      SLOW_STREAKS.forEach((cfg, i) => {
        const el = slow[i];
        if (!el) return;
        tl.fromTo(
          el,
          { xPercent: -120, opacity: 0 },
          { xPercent: 150, opacity: cfg.o, duration: cfg.dur, ease: 'power2.inOut' },
          cfg.at,
        );
      });

      /* 6 — the name resolves: mask rise, letter spacing, opacity */
      tl.fromTo(
        chars,
        { yPercent: 118, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 1, stagger: 0.028, ease: 'expo.out' },
        1.78,
      ).fromTo(
        nameRef.current,
        { letterSpacing: '0.15em' },
        { letterSpacing: '0em', duration: 1.45, ease: 'expo.out' },
        1.78,
      );

      /* 7 — descriptor settles out of focus */
      tl.fromTo(
        descRef.current,
        { opacity: 0, y: 14, filter: 'blur(13px)', letterSpacing: '0.5em' },
        { opacity: 1, y: 0, filter: 'blur(0px)', letterSpacing: '0.28em', duration: 1.15, ease: 'expo.out' },
        2.85,
      );

      /* 8 — technical rules drop in, credits lock on */
      tl.fromTo(
        creditsRef.current?.querySelectorAll('li') ?? [],
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.7, stagger: 0.07, ease: 'expo.out' },
        3.2,
      )
        .fromTo(
          creditsRef.current?.querySelector('.seq__credits-rule') ?? [],
          { scaleX: 0 },
          { scaleX: 1, duration: 0.8, ease: 'expo.out' },
          3.15,
        )
        .fromTo(
        rules,
        { scaleY: 0, opacity: 0 },
        { scaleY: 1, opacity: 1, duration: 0.85, stagger: 0.07, ease: 'expo.out', transformOrigin: '50% 100%' },
        3.05,
      )
        .fromTo(
          chrome,
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.7, stagger: 0.08, ease: 'expo.out' },
          3.25,
        )
        .set(status, { textContent: 'Signal locked' }, 3.9);

      /* 9 — hold, breathing */
      tl.to(bloomRef.current, { opacity: 0.09, scale: 1.14, duration: 1.3, ease: 'sine.inOut' }, 4.05)
        .to(slowRef.current, { xPercent: 175, duration: 1.4, ease: 'sine.inOut' }, 4.05)
        .to(grain, { opacity: 0.05, duration: 1.4, ease: 'sine.inOut' }, 4.05);

      /* 10 — the system accelerates off the right edge */
      tl.to(fast, { xPercent: 260, opacity: 0, duration: 0.7, stagger: 0.04, ease: 'power3.in' }, 4.35)
        .to(slow, { xPercent: 280, opacity: 0, duration: 0.6, ease: 'power3.in' }, 4.35)
        .to(bandRef.current, { scaleY: 0.001, duration: 0.55, ease: 'expo.in' }, 4.5)
        .to(chars, { yPercent: -26, opacity: 0, duration: 0.6, stagger: 0.008, ease: 'power3.in' }, 4.42)
        .to(descRef.current, { opacity: 0, y: -12, duration: 0.4, ease: 'power2.in' }, 4.42)
        .to(rules, { opacity: 0, scaleY: 0, duration: 0.35, ease: 'power2.in' }, 4.4)
        .to([chrome, skipRef.current], { opacity: 0, duration: 0.3, ease: 'power2.in' }, 4.4)
        .to(bloomRef.current, { opacity: 0, scale: 1.8, duration: 0.6, ease: 'power2.in' }, 4.45)
        .to(grain, { opacity: 0.07, duration: 0.5 }, 4.4);

      /* 11 — the curtain: left-to-right wipe into the portfolio */
      tl.call(onReveal, undefined, 4.72)
        .to(root, { clipPath: 'inset(0% 0% 0% 100%)', duration: 1.05, ease: 'expo.inOut' }, 4.72)
        .fromTo(
          wipeRef.current,
          { left: '0%', opacity: 1 },
          { left: '100%', duration: 1.05, ease: 'expo.inOut' },
          4.72,
        );

      /* progress hairline */
      tl.fromTo(progressRef.current, { scaleX: 0 }, { scaleX: 1, duration: 4.72, ease: 'none' }, 0);
    }, root);

    return () => {
      ctx.revert();
      timeline.current = null;
    };
  }, [reduced, finish, onReveal]);

  /* --- Skip / bypass ------------------------------------------------------ */
  const exitNow = useCallback(() => {
    const tl = timeline.current;
    if (!tl || finished.current) return;

    const root = rootRef.current;
    const chars = lines.current.flat();

    timeline.current = null;
    tl.kill();

    const exit = gsap.timeline({ onComplete: finish });
    exit.call(onReveal, undefined, 0);
    exit
      .to([...fastRef.current, ...slowRef.current], { xPercent: 260, opacity: 0, duration: 0.4, ease: 'power2.in' }, 0)
      .to([root, wipeRef.current], { opacity: 0, duration: 0.26, ease: 'power2.in' }, 0)
      .to(chars, { yPercent: -18, opacity: 0, duration: 0.28, stagger: 0.005, ease: 'power2.in' }, 0)
      .to(bloomRef.current, { opacity: 0, duration: 0.3 }, 0)
      .to(bandRef.current, { scaleY: 0.001, duration: 0.4, ease: 'expo.in' }, 0.06)
      .fromTo(
        root,
        { clipPath: 'inset(0% 0% 0% 0%)' },
        { clipPath: 'inset(0% 0% 0% 100%)', duration: 0.55, ease: 'expo.inOut' },
        0.4,
      )
      .fromTo(
        wipeRef.current,
        { left: '0%', opacity: 1 },
        { left: '100%', duration: 0.55, ease: 'expo.inOut' },
        0.4,
      );
  }, [finish, onReveal]);

  /* --- Interactions -------------------------------------------------------- */
  useEffect(() => {
    const timer = window.setTimeout(() => setCanSkip(true), 1500);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') exitNow();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [exitNow]);

  useEffect(() => {
    const failsafe = window.setTimeout(finish, MAX_DURATION_MS);
    return () => window.clearTimeout(failsafe);
  }, [finish]);

  return (
    <div className="seq" ref={rootRef} onClick={() => canSkip && exitNow()} role="presentation">
      <div className="seq__bloom" ref={bloomRef} />
      <span className="seq__scan" ref={scanRef} />

      <div className="seq__stage">
        {FAST_STREAKS.map((cfg, i) => (
          <span
            key={`f${i}`}
            className="seq__streak seq__streak--fast"
            ref={(el) => {
              if (el) fastRef.current[i] = el;
            }}
            style={{
              top: cfg.top,
              height: cfg.h,
              width: cfg.w,
              filter: cfg.blur ? `blur(${cfg.blur}px)` : undefined,
            }}
          />
        ))}

        {SLOW_STREAKS.map((cfg, i) => (
          <span
            key={`s${i}`}
            className="seq__streak seq__streak--slow"
            ref={(el) => {
              if (el) slowRef.current[i] = el;
            }}
            style={{ top: cfg.top, height: cfg.h, width: cfg.w }}
          />
        ))}

        <div className="seq__frame" aria-hidden="true">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <span
              key={i}
              className="seq__rule"
              ref={(el) => {
                if (el) ruleRefs.current[i] = el;
              }}
              style={{ left: `${((i + 1) / 7) * 100}%` }}
            />
          ))}
        </div>

        <div className="seq__band" ref={bandRef}>
          <span className="seq__band-edge seq__band-edge--top" />
          <span className="seq__band-edge seq__band-edge--bottom" />
          <div className="seq__band-inner">
            <h1 className="seq__name" ref={nameRef}>
              <span className="seq__name-line">{identity.firstName}</span>
              <span className="seq__name-line">{identity.lastName}</span>
            </h1>
            <p className="seq__descriptor t-mono" ref={descRef}>
              {identity.descriptor}
            </p>
          </div>
        </div>

        {/* credit block — the information layer of the title card */}
        <div className="seq__credits seq__chrome" ref={creditsRef}>
          <span className="seq__credits-rule" />
          <ul className="seq__credits-list t-mono">
            <li className="seq__credits-role">{identity.role}</li>
            {identity.focus.map((f) => (
              <li key={f.label}>{f.label}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="seq__meta seq__chrome t-mono">
        <span className="seq__meta-item">{identity.fullName}</span>
        <span className="seq__meta-item seq__meta-item--status" data-seq-status>
          Establishing link
        </span>
      </div>

      <div className="seq__foot seq__chrome t-mono" aria-hidden="true">
        <span>{identity.updated}</span>
        <span className="seq__foot-coords">Title sequence &mdash; 01 / 06</span>
      </div>

      <button
        type="button"
        className="seq__skip t-mono"
        ref={skipRef}
        onClick={(e) => {
          e.stopPropagation();
          exitNow();
        }}
        style={{ opacity: canSkip ? undefined : 0 }}
        tabIndex={canSkip ? 0 : -1}
      >
        Skip intro <span aria-hidden="true">ESC</span>
      </button>

      <div className="seq__progress" aria-hidden="true">
        <span ref={progressRef} />
      </div>

      <div className="seq__wipe" ref={wipeRef} aria-hidden="true" />
    </div>
  );
}