import { useRef } from 'react';
import { gsap } from '../../lib/motion';
import { useRevealScope } from '../../lib/reveal';
import { useIsoLayoutEffect, usePrefersReducedMotion } from '../../lib/hooks';
import { identity, socials } from '../../data/content';
import './contact.css';

/** Streaks that converge into a single beam for the closing beat. */
const CONVERGE = [
  { y: 8, w: 46, o: 0.5 },
  { y: 24, w: 70, o: 0.75 },
  { y: 41, w: 88, o: 0.95 },
  { y: 58, w: 62, o: 0.7 },
  { y: 76, w: 40, o: 0.45 },
];

export function Contact() {
  const scope = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  useRevealScope(scope, { stagger: 0.08 });

  /* Closing beat: scattered streaks converge into one beam, then collapse. */
  useIsoLayoutEffect(() => {
    const root = scope.current;
    const close = closeRef.current;
    if (!root || !close || reduced) return;

    const ctx = gsap.context(() => {
      const lines = close.querySelectorAll<HTMLElement>('[data-converge]');
      const beam = close.querySelector<HTMLElement>('[data-beam]');
      if (!lines.length || !beam) return;

      const tl = gsap.timeline({
        scrollTrigger: { trigger: close, start: 'top 84%', once: true },
      });

      tl.fromTo(
        lines,
        { yPercent: (i) => CONVERGE[i].y - 50, opacity: 0, scaleX: 0.2 },
        {
          yPercent: 0,
          opacity: (i) => CONVERGE[i].o,
          scaleX: 1,
          duration: 1.1,
          stagger: 0.08,
          ease: 'expo.out',
          transformOrigin: '50% 50%',
        },
      )
        .fromTo(beam, { scaleX: 0, opacity: 0 }, { scaleX: 1, opacity: 1, duration: 0.7, ease: 'expo.out' }, 0.9)
        // hold, then collapse the whole system into a line
        .to(lines, { opacity: 0, scaleX: 0.25, duration: 0.5, stagger: 0.02, ease: 'power2.in' }, 3.1)
        .to(beam, { scaleX: 0, opacity: 0, duration: 0.45, ease: 'power2.in' }, 3.2);
    }, root);

    return () => ctx.revert();
  }, [reduced]);

  const backToTop = () => {
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
  };

  return (
    <section className="section contact" id="contact" ref={scope}>
      <div className="shell">
        <header className="sec-head" data-reveal="fade">
          <span className="sec-head__idx t-mono">06</span>
          <span className="sec-head__rule" />
          <span className="sec-head__label t-mono">Contact</span>
        </header>

        <h2 className="contact__statement t-mega">
          <span data-reveal="left" data-reveal-group="contact-head">
            Let&rsquo;s build something
          </span>
          <span className="contact__outline" data-reveal="left" data-reveal-group="contact-head">
            worth shipping.
          </span>
        </h2>

        <div className="contact__grid">
          <div className="contact__lead" data-reveal>
            <p className="t-body">
              Open to freelance, contract, and full-time roles. If you have
              something in mind, the fastest way to start is email.
            </p>
            <a className="contact__email" href={`mailto:${identity.email}`}>
              <span>{identity.email}</span>
              <span aria-hidden="true">↗</span>
            </a>
          </div>

          <ul className="contact__socials" data-reveal>
            {socials.map((social) => (
              <li key={social.label} className="contact__social">
                {social.href ? (
                  <a
                    className="contact__social-link t-mono"
                    href={social.href}
                    target={social.href.startsWith('mailto:') ? undefined : '_blank'}
                    rel="noreferrer noopener"
                  >
                    <span className="contact__social-label">{social.label}</span>
                    <span className="contact__social-handle">{social.handle}</span>
                    <span className="contact__social-arrow" aria-hidden="true">
                      ↗
                    </span>
                  </a>
                ) : (
                  <span className="contact__social-link is-pending t-mono">
                    <span className="contact__social-label">{social.label}</span>
                    <span className="contact__social-handle">{social.handle}</span>
                    <span className="contact__social-arrow" aria-hidden="true">
                      —
                    </span>
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* ------------------------------------------------ closing beat -- */}
        <div className="contact__close" ref={closeRef}>
          <div className="contact__converge" aria-hidden="true">
            {CONVERGE.map((cfg, i) => (
              <span
                key={i}
                className="contact__streak"
                data-converge
                style={{ width: `${cfg.w}%` }}
              />
            ))}
            <span className="contact__beam" data-beam />
          </div>

          <div className="contact__close-copy" data-reveal>
            <p className="t-mono">End of transmission</p>
            <p className="contact__close-name t-display">{identity.fullName}</p>
            <button type="button" className="contact__top t-mono" onClick={backToTop}>
              Back to top <span aria-hidden="true">↑</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}