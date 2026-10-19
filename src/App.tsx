import { useCallback, useEffect, useState } from 'react';
import { ScrollTrigger } from './lib/motion';
import { Intro } from './components/intro/Intro';
import { Nav } from './components/nav/Nav';
import { Hero } from './components/hero/Hero';
import { Work } from './components/work/Work';
import { About } from './components/sections/About';
import { Skills } from './components/sections/Skills';
import { Experience } from './components/sections/Experience';
import { Process } from './components/sections/Process';
import { Contact } from './components/sections/Contact';
import { Footer } from './components/sections/Footer';

export default function App() {
  const [introMounted, setIntroMounted] = useState(true);
  const [revealToken, setRevealToken] = useState(0);

  const completeIntro = useCallback(() => {
    setIntroMounted(false);
  }, []);

  /* Fires when the curtain starts moving, so the hero animates in while it is
     still being uncovered rather than after. */
  const revealSite = useCallback(() => {
    setRevealToken((n) => n + 1);
  }, []);

  const replayIntro = useCallback(() => {
    setIntroMounted(true);
    setRevealToken((n) => n + 1);
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  /* Layout settles once the font has swapped in and the intro has finished. */
  useEffect(() => {
    let cancelled = false;

    const refresh = () => {
      if (!cancelled) ScrollTrigger.refresh();
    };

    if (document.fonts?.ready) {
      document.fonts.ready.then(refresh).catch(() => {});
    }

    window.addEventListener('load', refresh);
    const t = window.setTimeout(refresh, 1200);

    return () => {
      cancelled = true;
      window.removeEventListener('load', refresh);
      window.clearTimeout(t);
    };
  }, [revealToken]);

  return (
    <>
      <a className="skip-link" href="#work">
        Skip to content
      </a>

      <div className="grain" data-grain aria-hidden="true" />
      <div className="vignette" aria-hidden="true" />

      <Nav onReplay={replayIntro} />

      <main id="main">
        <Hero revealToken={revealToken} />
        <Work />
        <About />
        <Skills />
        <Experience />
        <Process />
        <Contact />
      </main>

      <Footer />

      {introMounted && <Intro onComplete={completeIntro} onReveal={revealSite} />}
    </>
  );
}