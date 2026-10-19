import { identity, navLinks } from '../../data/content';
import './footer.css';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="shell footer__inner">
        <p className="footer__copy t-mono">
          © {year} {identity.fullName}
        </p>

        <nav className="footer__nav" aria-label="Footer">
          {navLinks.map((link) => (
            <a key={link.id} href={`#${link.id}`} className="footer__link t-mono">
              {link.label}
            </a>
          ))}
        </nav>

        <p className="footer__meta t-mono">
          <span className="footer__dot" aria-hidden="true" />
          Built from scratch
        </p>
      </div>
    </footer>
  );
}