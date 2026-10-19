import { useEffect, useRef } from 'react';
import { gsap } from '../../lib/motion';
import { splitText } from '../../lib/split';
import { useIsoLayoutEffect, usePrefersReducedMotion } from '../../lib/hooks';
import { identity } from '../../data/content';
import './hero.css';

interface HeroProps {
  /** Increments each time the title sequence finishes. */
  revealToken: number;
}

/** Slow-drifting light bars sitting behind the content. */
const BEAMS = [
  { top: '18%', h: 130, dur: 26, delay: -3, o: 0.05 },
  { top: '52%', h: 210, dur: 34, delay: -12, o: 0.07 },
  { top: '78%', h: 90, dur: 22, delay: -18, o: 0.045 },
];

export function Hero({ revealToken }: HeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const nameRef = useRef<HTMLHeadingElement>(null);
  const lineRefs = useRef<HTMLElement[][]>([]);
  const sweepRef = useRef<HTMLSpanElement>(null);
  const metaRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLParagraphElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const footRef = useRef<HTMLDivElement>(null);
  const focusRef = useRef<HTMLUListElement>(null);
  const fieldRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  useIsoLayoutEffect(() => {
    if (!nameRef.current) return;
    const targets = Array.from(nameRef.current.querySelectorAll<HTMLElement>('.hero__name-line'));
    lineRefs.current = targets.map((t) => splitText(t, 'chars').items);
  }, []);

  /* --- Entrance, triggered the moment the curtain clears ------------------ */
  useEffect(() => {
    const section = sectionRef.current;
    if (!section || revealToken === 0) return;

    const chars = lineRefs.current.flat();
    const ctx = gsap.context(() => {
      if (reduced) {
        gsap.set(
          [metaRef.current, copyRef.current, focusRef.current, actionsRef.current, footRef.current],
          { clearProps: 'all' },
        );
        gsap.set(chars, { clearProps: 'all' });
        return;
      }

      const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });

      tl.fromTo(metaRef.current, { opacity: 0, y: -12 }, { opacity: 1, y: 0, duration: 0.8 }, 0)
        .fromTo(fieldRef.current, { opacity: 0 }, { opacity: 1, duration: 1.1, ease: 'power2.out' }, 0)
        .fromTo(
          chars,
          { yPercent: 112, opacity: 0 },
          { yPercent: 0, opacity: 1, duration: 1.05, stagger: 0.022 },
          0.1,
        )
        .fromTo(
          nameRef.current,
          { letterSpacing: '0.1em' },
          { letterSpacing: '0em', duration: 1.4 },
          0.1,
        )
        // orange light travelling across the name
        .fromTo(sweepRef.current, { xPercent: -135, opacity: 0 }, { opacity: 1, duration: 0.35 }, 0.4)
        .to(sweepRef.current, { xPercent: 135, duration: 1.35, ease: 'power3.inOut' }, 0.4)
        .to(sweepRef.current, { opacity: 0, duration: 0.3, ease: 'none' }, 1.45)
        .fromTo(copyRef.current, { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 0.95 }, 0.5)
        .fromTo(
          focusRef.current?.children ?? [],
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.75, stagger: 0.07 },
          0.62,
        )
        .fromTo(
          actionsRef.current?.children ?? [],
          { opacity: 0, y: 18 },
          { opacity: 1, y: 0, duration: 0.85, stagger: 0.08 },
          0.62,
        )
        .fromTo(footRef.current, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.85 }, 0.8);
    }, section);

    return () => ctx.revert();
  }, [revealToken, reduced]);

  /* --- Parallax: the field drifts slower than the page --------------------- */
  useEffect(() => {
    const section = sectionRef.current;
    const field = fieldRef.current;
    if (!section || !field || reduced) return;

    const tween = gsap.to(field, {
      yPercent: 14,
      ease: 'none',
      scrollTrigger: { trigger: section, start: 'top top', end: 'bottom top', scrub: 0.7 },
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [reduced]);

  /* --- Pointer-tracked spotlight (desktop pointers only) ------------------ */
  useEffect(() => {
    const section = sectionRef.current;
    if (!section || reduced) return;
    if (window.matchMedia('(hover: none)').matches) return;

    let frame = 0;
    let x = 0.62;
    let y = 0.4;

    const apply = () => {
      frame = 0;
      section.style.setProperty('--spot-x', `${x * 100}%`);
      section.style.setProperty('--spot-y', `${y * 100}%`);
    };

    const onMove = (e: PointerEvent) => {
      const rect = section.getBoundingClientRect();
      x = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
      y = Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height));
      if (!frame) frame = window.requestAnimationFrame(apply);
    };

    apply();
    section.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      section.removeEventListener('pointermove', onMove);
    };
  }, [reduced]);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
  };

  return (
    <section className="hero" id="top" ref={sectionRef}>
      <div className="hero__field" ref={fieldRef} aria-hidden="true">
        <div className="hero__spot" />
        {BEAMS.map((beam, i) => (
          <span
            key={i}
            className="hero__beam"
            style={{
              top: beam.top,
              height: beam.h,
              opacity: beam.o,
              animationDuration: `${beam.dur}s`,
              animationDelay: `${beam.delay}s`,
            }}
          />
        ))}
        <div className="hero__ruler">
          {Array.from({ length: 7 }, (_, i) => (
            <span key={i} className="hero__tick" style={{ left: `${(i + 1) * 12.5}%` }} />
          ))}
        </div>
      </div>

      <div className="shell hero__inner">
        <div className="hero__meta t-mono" ref={metaRef}>
          <span>{identity.updated}</span>
          <span className="hero__avail">
            <i aria-hidden="true" />
            {identity.availability}
          </span>
        </div>

        <div className="hero__body">
          <div className="hero__headline">
            <span className="hero__eyebrow t-mono">{identity.role}</span>
            <h1 className="hero__name t-mega" ref={nameRef}>
              <span className="hero__name-line">{identity.firstName}</span>
              <span className="hero__name-line hero__name-line--offset">{identity.lastName}</span>
              <span className="hero__sweep" ref={sweepRef} aria-hidden="true" />
            </h1>
          </div>

          <div className="hero__side">
            <p className="hero__copy t-lead" ref={copyRef}>
              {identity.statement}
            </p>

            <ul className="hero__focus" ref={focusRef}>
              {identity.focus.map((item) => (
                <li className="hero__focus-item" key={item.label}>
                  <span className="hero__focus-label">{item.label}</span>
                  <span className="hero__focus-note">{item.note}</span>
                </li>
              ))}
            </ul>

            <div className="hero__actions" ref={actionsRef}>
              <button type="button" className="btn btn--solid" onClick={() => scrollTo('work')}>
                Explore my work
                <span className="btn__arrow" aria-hidden="true">
                  ↓
                </span>
              </button>
              <button type="button" className="btn" onClick={() => scrollTo('contact')}>
                Let&rsquo;s connect
                <span className="btn__arrow" aria-hidden="true">
                  ↗
                </span>
              </button>
            </div>
          </div>
        </div>

        <div className="hero__foot" ref={footRef}>
          <a
            className="hero__scroll t-mono"
            href="#work"
            onClick={(e) => {
              e.preventDefault();
              scrollTo('work');
            }}
          >
            <span className="hero__scroll-line" aria-hidden="true" />
            Scroll to work
          </a>
          <p className="hero__note t-mono">{identity.location}</p>
        </div>
      </div>
    </section>
  );
}