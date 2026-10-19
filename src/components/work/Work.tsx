import { useRef } from 'react';
import { gsap } from '../../lib/motion';
import { useRevealScope } from '../../lib/reveal';
import { useIsoLayoutEffect, usePrefersReducedMotion } from '../../lib/hooks';
import { projects, type Project } from '../../data/content';
import { ProjectVisual } from './ProjectVisual';
import './work.css';

export function Work() {
  const scope = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();
  useRevealScope(scope, { stagger: 0.09 });

  /* -----------------------------------------------------------------------
     CARD MOTION SYSTEM
     Every project shares one card, so all of its behaviour is wired here in
     a single pass: a scroll-scrubbed depth pass, a hairline that draws
     itself, a pointer-tracked light inside the frame, and a hover sequence.
     ----------------------------------------------------------------------- */
  useIsoLayoutEffect(() => {
    const root = scope.current;
    if (!root || reduced) return;

    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('.project', root).forEach((card, i) => {
        /* Alternate the travel direction so consecutive cards feel related
           rather than repetitive. */
        const dir = i % 2 === 0 ? 1 : -1;

        /* 1 — Media settles from a slight over-scale back to 1:1. */
        const svg = card.querySelector<SVGElement>('.pvis__frame svg');
        if (svg) {
          gsap.fromTo(
            svg,
            { scale: 1.18 },
            {
              scale: 1,
              duration: 1.6,
              ease: 'expo.out',
              scrollTrigger: { trigger: card, start: 'top 88%', once: true },
            },
          );
        }

        /* 2 — Depth: the frame drifts against the page as the card travels.
               yPercent rides alongside the entrance y-offset rather than
               fighting it — GSAP keeps the two transform channels apart. */
        const media = card.querySelector<HTMLElement>('.project__media');
        if (media) {
          gsap.to(media, {
            yPercent: -4.5 * dir,
            ease: 'none',
            scrollTrigger: {
              trigger: card,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 0.6,
            },
          });
        }

        /* 3 — The oversized index drifts at its own, slower rate. It is drawn
               by a pseudo-element, so the offset travels through a custom
               property the stylesheet reads. */
        gsap.fromTo(
          card,
          { '--gx': `${-26 * dir}px` },
          {
            '--gx': `${44 * dir}px`,
            ease: 'none',
            scrollTrigger: {
              trigger: card,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 0.9,
            },
          },
        );

        /* 4 — The hairline between cards draws itself left to right. */
        const rule = card.querySelector<HTMLElement>('.project__rule');
        if (rule) {
          gsap.fromTo(
            rule,
            { scaleX: 0 },
            {
              scaleX: 1,
              duration: 1.4,
              ease: 'expo.out',
              transformOrigin: 'left center',
              scrollTrigger: { trigger: card, start: 'top 92%', once: true },
            },
          );
        }

        if (!finePointer || !media) return;

        /* 5 — Pointer-tracked light travelling inside the frame. Scoped to the
               media box so the artwork reacts only while the pointer is over
               the frame itself, not while it crosses the text. */
        const onMove = (e: PointerEvent) => {
          const rect = media.getBoundingClientRect();
          const nx = (e.clientX - rect.left) / rect.width - 0.5;
          const ny = (e.clientY - rect.top) / rect.height - 0.5;
          gsap.to(svg, {
            xPercent: nx * -3.5,
            yPercent: ny * -3.5,
            duration: 0.9,
            ease: 'power3.out',
            overwrite: 'auto',
          });
        };

        const onLeave = () => {
          gsap.to(svg, { xPercent: 0, yPercent: 0, duration: 1.1, ease: 'expo.out', overwrite: 'auto' });
        };

        media.addEventListener('pointermove', onMove, { passive: true });
        media.addEventListener('pointerleave', onLeave);

        /* 6 — Hover: a light bar sweeps the frame, the tags ripple upward. */
        const scan = card.querySelector<HTMLElement>('.pvis__scan');
        const tags = card.querySelectorAll<HTMLElement>('.project__tag');

        const enter = () => {
          if (scan) {
            gsap.fromTo(
              scan,
              { xPercent: -120 },
              { xPercent: 120, duration: 0.95, ease: 'power3.inOut', overwrite: 'auto' },
            );
          }
          if (tags.length) {
            gsap.to(tags, {
              yPercent: -12,
              duration: 0.5,
              ease: 'back.out(2.4)',
              stagger: 0.035,
              overwrite: 'auto',
            });
          }
        };

        const leave = () => {
          if (tags.length) {
            gsap.to(tags, { yPercent: 0, duration: 0.45, ease: 'power3.out', stagger: 0.02 });
          }
        };

        card.addEventListener('mouseenter', enter);
        card.addEventListener('mouseleave', leave);
      });
    }, root);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <section className="section work" id="work" ref={scope}>
      <div className="shell">
        <header className="sec-head" data-reveal="fade">
          <span className="sec-head__idx t-mono">01</span>
          <span className="sec-head__rule" />
          <span className="sec-head__label t-mono">Selected Work</span>
        </header>

        <div className="work__intro" data-reveal>
          <h2 className="t-h2 work__heading" data-split="words">
            Work that earns its place.
          </h2>
        </div>

        <div className="work__list">
          {projects.map((project, i) => (
            <ProjectCard key={project.id} project={project} seed={i + 1} flip={i % 2 === 1} />
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * One card composition for every project: media on one side, text on the
 * other, alternating each row. The `flip` flag only swaps the column order —
 * the structure, rhythm and motion stay identical so the section reads as a
 * single system rather than three separate layouts.
 */
function ProjectCard({ project, seed, flip }: { project: Project; seed: number; flip: boolean }) {
  const hasLive = Boolean(project.url);

  return (
    <article
      className={`project ${flip ? 'project--flip' : ''}`}
      data-reveal-trigger
      data-index={project.index}
    >
      <span className="project__rule" aria-hidden="true" />

      <div className="project__media" data-reveal="wipe">
        <ProjectVisual variant={project.visual} seed={seed} index={project.index} label={project.category} />
      </div>

      <div className="project__body">
        <div className="project__meta t-mono" data-reveal="fade" data-reveal-group={`${project.id}-meta`}>
          <span className="project__idx">{project.index}</span>
          <span className="project__cat">{project.category}</span>
          <span className="project__year">{project.year}</span>
        </div>

        <div className="project__head">
          <h3
            className="project__title t-display"
            data-split="words"
            data-reveal-group={`${project.id}-title`}
          >
            {project.title}
          </h3>

          {project.tagline && (
            <p className="project__tagline" data-reveal>
              {project.tagline}
            </p>
          )}
        </div>

        <p className="project__summary t-body" data-reveal>
          {project.summary}
        </p>

        <div className="project__stack" data-reveal>
          <span className="project__stack-label t-mono">{project.stackLabel}</span>
          <ul className="project__tags">
            {project.tags.map((tag) => (
              <li key={tag} className="project__tag t-mono">
                {tag}
              </li>
            ))}
          </ul>
        </div>

        <div className="project__foot" data-reveal>
          <span className="project__role t-mono">{project.role}</span>

          <span className="project__links">
            {hasLive ? (
              <a className="project__link" href={project.url as string} target="_blank" rel="noreferrer noopener">
                View project <span aria-hidden="true">↗</span>
              </a>
            ) : null}

            {project.repoUrl ? (
              <a className="project__link" href={project.repoUrl} target="_blank" rel="noreferrer noopener">
                {hasLive ? 'Source' : 'Source code'} <span aria-hidden="true">↗</span>
              </a>
            ) : null}
          </span>
        </div>
      </div>
    </article>
  );
}