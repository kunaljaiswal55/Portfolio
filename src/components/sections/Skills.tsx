import { useRef } from 'react';
import { useRevealScope } from '../../lib/reveal';
import { skillGroups } from '../../data/content';
import './skills.css';

export function Skills() {
  const scope = useRef<HTMLElement>(null);
  useRevealScope(scope, { stagger: 0.08 });

  return (
    <section className="section skills" id="skills" ref={scope}>
      <div className="shell">
        <header className="sec-head" data-reveal="fade">
          <span className="sec-head__idx t-mono">03</span>
          <span className="sec-head__rule" />
          <span className="sec-head__label t-mono">Skills &amp; Expertise</span>
        </header>

        <div className="skills__lead">
          <h2 className="t-h2 skills__heading" data-split="words">
            The tools, and the judgement to pick them.
          </h2>
          <p className="t-body skills__note" data-reveal>
            Listed plainly. The interesting part is knowing when not to reach for
            something at all.
          </p>
        </div>

        <div className="skills__grid">
          {skillGroups.map((group, gIndex) => (
            <div className="skills__group" key={group.label} data-reveal data-reveal-group="skill-group">
              <div className="skills__group-head">
                <span className="t-mono skills__group-idx">
                  {String(gIndex + 1).padStart(2, '0')}
                </span>
                <h3 className="skills__group-title t-mono">{group.label}</h3>
              </div>

              <ul className="skills__list">
                {group.items.map((item, i) => (
                  <li className="skills__item" key={item}>
                    <span className="t-mono skills__item-idx">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="skills__item-name">{item}</span>
                    <span className="skills__item-rule" aria-hidden="true" />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}