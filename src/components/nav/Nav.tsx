import { useCallback, useEffect, useRef, useState } from 'react';
import { gsap } from '../../lib/motion';
import { identity, navLinks } from '../../data/content';
import { useIsoLayoutEffect, usePrefersReducedMotion, useScrollLock } from '../../lib/hooks';
import './nav.css';

interface NavProps {
  onReplay: () => void;
}

export function Nav({ onReplay }: NavProps) {
  const barRef = useRef<HTMLElement>(null);
  const linksRef = useRef<HTMLUListElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const [scrolled, setScrolled] = useState(false);
  const [onLight, setOnLight] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>(navLinks[0].id);

  const reduced = usePrefersReducedMotion();
  useScrollLock(open);

  /* --- Condense the bar + track the section under it ----------------------- */
  useEffect(() => {
    let frame = 0;

    const measure = () => {
      frame = 0;
      // The "reading line" sits just below the condensed bar.
      const line = 92;
      const sections = document.querySelectorAll<HTMLElement>('main > section[id]');

      let light = false;
      let current = '';

      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= line && rect.bottom > line) {
          current = section.id;
          light = section.classList.contains('section--light');
        }
      });

      setScrolled(window.scrollY > 40);
      setOnLight(light);
      if (current) setActive(current);
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  /* --- Mobile overlay transition ------------------------------------------ */
  const overlayItems = useRef<HTMLElement[]>([]);

  useIsoLayoutEffect(() => {
    if (!overlayRef.current) return;
    const ctx = gsap.context(() => {
      overlayItems.current = Array.from(
        overlayRef.current?.querySelectorAll<HTMLElement>('[data-menu-item]') ?? [],
      );
    }, overlayRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!overlayRef.current) return;

    if (open) {
      const tl = gsap.timeline();
      const items = overlayItems.current;
      tl.set(overlayRef.current, { pointerEvents: 'auto', visibility: 'visible' })
        .fromTo(overlayRef.current, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: reduced ? 0.01 : 0.62, ease: 'expo.inOut' })
        .fromTo(
          items,
          { yPercent: 110, opacity: 0 },
          { yPercent: 0, opacity: 1, duration: reduced ? 0.01 : 0.75, stagger: reduced ? 0 : 0.055, ease: 'expo.out' },
          reduced ? 0 : 0.18,
        );
      return () => {
        tl.kill();
      };
    }

    const tl = gsap.timeline({ onComplete: () => {
      gsap.set(overlayRef.current, { pointerEvents: 'none', visibility: 'hidden' });
    } });
    tl.to(overlayRef.current, {
      clipPath: 'inset(0% 0% 100% 0%)',
      duration: reduced ? 0.01 : 0.48,
      ease: 'expo.inOut',
    });
    return () => {
      tl.kill();
    };
  }, [open, reduced]);

  /* --- Anchor navigation --------------------------------------------------- */
  const goTo = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    setOpen(false);
    // let the overlay start closing before the scroll begins
    window.setTimeout(
      () => el.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' }),
      open ? 260 : 0,
    );
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? window.scrollY / max : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <>
      <header
        className={`nav ${scrolled ? 'is-scrolled' : ''} ${onLight ? 'is-light' : ''}`}
        ref={barRef}
      >
        <div className="nav__inner">
          <a
            className="nav__mark"
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
            }}
          >
            <span className="nav__beam" aria-hidden="true" />
            <span className="nav__mark-text t-mono">{identity.firstName[0]}{identity.lastName[0]}</span>
          </a>

          <nav className="nav__links" aria-label="Primary">
            <ul ref={linksRef}>
              {navLinks.map((link) => (
                <li key={link.id}>
                  <a
                    href={`#${link.id}`}
                    className={`nav__link t-mono ${active === link.id ? 'is-active' : ''}`}
                    onClick={(e) => {
                      e.preventDefault();
                      goTo(link.id);
                    }}
                  >
                    <span className="nav__idx">{link.index}</span>
                    <span className="nav__label">{link.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="nav__actions">
            <button type="button" className="nav__replay t-mono" onClick={onReplay}>
              <span className="nav__replay-dot" aria-hidden="true" />
              Replay intro
            </button>

            <button
              type="button"
              className={`nav__burger ${open ? 'is-open' : ''}`}
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="nav-overlay"
              aria-label={open ? 'Close menu' : 'Open menu'}
            >
              <span />
              <span />
            </button>
          </div>
        </div>

        <span className="nav__progress" style={{ transform: `scaleX(${progress})` }} aria-hidden="true" />
      </header>

      <div
        className="nav-overlay"
        id="nav-overlay"
        ref={overlayRef}
        style={{ visibility: 'hidden', pointerEvents: 'none' }}
      >
        <ul className="nav-overlay__list">
          {navLinks.map((link) => (
            <li key={link.id} className="nav-overlay__item">
              <span className="nav-overlay__mask">
                <a
                  href={`#${link.id}`}
                  data-menu-item
                  className="nav-overlay__link"
                  onClick={(e) => {
                    e.preventDefault();
                    goTo(link.id);
                  }}
                >
                  <span className="nav-overlay__idx t-mono">{link.index}</span>
                  <span className="nav-overlay__label">{link.label}</span>
                </a>
              </span>
            </li>
          ))}
        </ul>
        <p className="nav-overlay__foot t-mono">
          {identity.availability} — {identity.email}
        </p>
      </div>
    </>
  );
}