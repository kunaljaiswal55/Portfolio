import { useRef } from 'react';
import { gsap } from '../../lib/motion';
import { useRevealScope } from '../../lib/reveal';
import { useIsoLayoutEffect, usePrefersReducedMotion } from '../../lib/hooks';
import { roles } from '../../data/content';
import './experience.css';

export function Experience() {
  const scope = useRef<HTMLElement>(null);
  const lineRef = useRef<HTMLSpanElement>(null);
  const reduced = usePrefersReducedMotion();
  useRevealScope(scope, { stagger: 0.1 });

  /* The timeline spine draws itself as the section passes the viewport. */
  useIsoLayoutEffect(() => {
    const root = scope.current;
    const line = lineRef.current;
    if (!root || !line || reduced) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        line,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: root.querySelector('.timeline'),
            start: 'top 72%',
            end: 'bottom 62%',
            scrub: 0.5,
          },
        },
      );
    }, root);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <section className="section experience" id="experience" ref={scope}>
      <div className="shell">
        <header className="sec-head" data-reveal="fade">
          <span className="sec-head__idx t-mono">04</span>
          <span className="sec-head__rule" />
          <span className="sec-head__label t-mono">Experience</span>
        </header>

        <div className="experience__lead">
          <h2 className="t-h2 experience__heading" data-split="words">
            Where the work has been.
          </h2>
        </div>

        <ol className="timeline">
          <span className="timeline__spine" aria-hidden="true">
            <span className="timeline__spine-fill" ref={lineRef} />
          </span>

          {roles.map((role, i) => (
            <li className="timeline__row" key={`role-${i}`} data-reveal data-reveal-group="timeline">
              <span className="timeline__node" aria-hidden="true" />

              <div className="timeline__period t-mono">
                {role.period}
                {role.current && <span className="timeline__now t-mono">Current</span>}
              </div>

              <div className="timeline__body">
                <h3 className="timeline__role">{role.role}</h3>
                <p className="timeline__company t-mono">{role.company}</p>
                <p className="timeline__detail t-body">{role.detail}</p>
              </div>

              <span className="timeline__seq t-mono" aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}