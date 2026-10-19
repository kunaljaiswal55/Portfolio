import { useRef } from 'react';
import { gsap } from '../../lib/motion';
import { useRevealScope } from '../../lib/reveal';
import { useIsoLayoutEffect, usePrefersReducedMotion } from '../../lib/hooks';
import { processStages } from '../../data/content';
import './process.css';

export function Process() {
  const scope = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  useRevealScope(scope, { stagger: 0.1 });

  /* A moving marker tracks whichever stage the pointer is over. */
  useIsoLayoutEffect(() => {
    const wrap = cardsRef.current;
    if (!wrap || reduced) return;
    if (window.matchMedia('(hover: none)').matches) return;

    const marker = wrap.querySelector<HTMLElement>('[data-process-marker]');
    if (!marker) return;

    const move = (e: PointerEvent) => {
      const rect = wrap.getBoundingClientRect();
      const ratio = (e.clientX - rect.left) / rect.width;
      gsap.to(marker, {
        xPercent: Math.max(0, Math.min(100, ratio * 100)) - 50,
        scaleX: 1.35,
        opacity: 1,
        duration: 0.6,
        ease: 'power3.out',
      });
    };

    const reset = () => {
      gsap.to(marker, { scaleX: 1, opacity: 0, xPercent: -50, duration: 0.7, ease: 'power3.out' });
    };

    wrap.addEventListener('pointermove', move);
    wrap.addEventListener('pointerleave', reset);
    return () => {
      wrap.removeEventListener('pointermove', move);
      wrap.removeEventListener('pointerleave', reset);
    };
  }, [reduced]);

  return (
    <section className="section section--light process" id="process" ref={scope}>
      <div className="shell">
        <header className="sec-head" data-reveal="fade">
          <span className="sec-head__idx t-mono">05</span>
          <span className="sec-head__rule" />
          <span className="sec-head__label t-mono">How I Work</span>
        </header>

        <div className="process__lead">
          <span className="process__badge t-mono">The Process</span>
          <h2 className="t-h2 process__heading">
            <span data-reveal="left" data-reveal-group="process-head">
              Turning intent into
            </span>
            <span className="accent" data-reveal="left" data-reveal-group="process-head">
              shipped software.
            </span>
          </h2>
          <p className="t-body process__note" data-reveal>
            A simple process designed to turn your ideas into impactful motion
            visuals, from concept to final delivery. Small, repeatable stages —
            nothing hidden between them.
          </p>
        </div>

        <div className="process__cards" ref={cardsRef} data-reveal-trigger>
          <span className="process__marker" data-process-marker aria-hidden="true" />

          {processStages.map((stage) => (
            <article className="process__card" key={stage.step} data-reveal data-reveal-group="process">
              <span className="process__step t-display">{stage.step}</span>
              <h3 className="process__title">{stage.title}</h3>
              <p className="process__detail">{stage.detail}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}