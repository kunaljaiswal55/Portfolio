import { useRef } from 'react';
import { useRevealScope, useParallax } from '../../lib/reveal';
import { about, identity } from '../../data/content';
import './about.css';

export function About() {
  const scope = useRef<HTMLElement>(null);
  useRevealScope(scope, { stagger: 0.08 });
  useParallax(scope, [{ selector: '.about__mark', y: -34 }]);

  return (
    <section className="section section--light about" id="about" ref={scope}>
      <div className="shell">
        <header className="sec-head" data-reveal="fade">
          <span className="sec-head__idx t-mono">02</span>
          <span className="sec-head__rule" />
          <span className="sec-head__label t-mono">About</span>
        </header>

        <div className="about__grid">
          <h2 className="about__heading t-h2">
            {about.heading.map((line, i) => (
              <span
                key={line}
                className={i === 1 ? 'accent' : undefined}
                data-reveal="left"
                data-reveal-group="about-head"
              >
                {line}
              </span>
            ))}
          </h2>

          <div className="about__aside">
            <div className="about__body" data-reveal>
              {about.body.map((paragraph) => (
                <p key={paragraph} className="t-body">
                  {paragraph}
                </p>
              ))}
            </div>

            <dl className="about__facts" data-reveal>
              {about.facts.map((fact) => (
                <div className="about__fact" key={fact.label}>
                  <dt className="t-mono">{fact.label}</dt>
                  <dd>{fact.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <footer className="about__foot">
          <span className="about__mark" aria-hidden="true">
            {[0, 1, 2, 3].map((i) => (
              <i key={i} style={{ animationDelay: `${i * 0.35}s` }} />
            ))}
          </span>
          <p className="about__sig t-mono">
            {identity.fullName} — {identity.location}
          </p>
        </footer>
      </div>
    </section>
  );
}