/**
 * Minimal text splitter.
 *
 * Wraps every word (and optionally every character) in a clip-path mask so it
 * can be revealed with a transform without disturbing layout, and without
 * shifting anything else on the page.
 *
 * The accessible name is preserved on the host element via `aria-label` while
 * the visual fragments are hidden from screen readers.
 */

const sourceMap = new WeakMap<HTMLElement, string>();
const builtMap = new WeakMap<HTMLElement, string>();

export type SplitMode = 'words' | 'chars';

export interface SplitResult {
  /** The animatable inner elements, in document order. */
  items: HTMLElement[];
  revert: () => void;
}

export function splitText(el: HTMLElement, mode: SplitMode = 'words'): SplitResult {
  if (!sourceMap.has(el)) sourceMap.set(el, el.innerHTML);

  // Already split with the requested mode — reuse.
  if (builtMap.get(el) === mode) {
    return { items: Array.from(el.querySelectorAll<HTMLElement>('.line-mask__inner')), revert: () => {} };
  }

  const source = sourceMap.get(el) as string;
  const previous = builtMap.get(el);
  if (previous) {
    el.innerHTML = source;
    sourceMap.set(el, el.innerHTML);
    builtMap.delete(el);
    if (previous === mode) return splitText(el, mode);
  }

  const text = (el.textContent ?? '').replace(/\s+/g, ' ').trim();
  const words = text.split(' ').filter(Boolean);

  el.innerHTML = '';
  el.setAttribute('aria-label', text);
  el.dataset.split = mode;

  const items: HTMLElement[] = [];

  const makeMask = (inline: boolean) => {
    const mask = document.createElement('span');
    mask.className = inline ? 'mask-inline' : 'line-mask';
    const inner = document.createElement('span');
    inner.className = 'line-mask__inner';
    inner.setAttribute('aria-hidden', 'true');
    mask.appendChild(inner);
    return { mask, inner };
  };

  /** A real space between fragments — fragments themselves are inline-block
   *  so plain whitespace in the markup would be swallowed. */
  const makeSpace = () => {
    const gap = document.createElement('span');
    gap.className = 'w-split-space';
    gap.setAttribute('aria-hidden', 'true');
    gap.textContent = ' ';
    return gap;
  };

  words.forEach((word, wIndex) => {
    if (mode === 'words') {
      const { mask, inner } = makeMask(true);
      inner.textContent = word;
      el.appendChild(mask);
      el.appendChild(makeSpace());
      items.push(inner);
      return;
    }

    const wordMask = document.createElement('span');
    wordMask.className = 'line-mask';
    const wordInner = document.createElement('span');
    wordInner.className = 'line-mask__inner';
    wordMask.appendChild(wordInner);
    el.appendChild(wordMask);

    for (const ch of word) {
      const { mask, inner } = makeMask(true);
      inner.textContent = ch;
      wordInner.appendChild(mask);
      items.push(inner);
    }

    if (wIndex < words.length - 1) wordInner.appendChild(makeSpace());
  });

  builtMap.set(el, mode);

  return {
    items,
    revert: () => {
      const original = sourceMap.get(el) ?? source;
      el.innerHTML = original;
      builtMap.delete(el);
    },
  };
}