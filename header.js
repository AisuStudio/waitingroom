// The page header — one source for both pages.
//
// It was copied into index.html and flow.html by hand, and had already begun
// to drift: the two copies were one edit away from disagreeing about their own
// navigation. That is the same failure this repo argues against, at the
// smallest possible scale, so the header is rendered from here and neither
// page is able to hold a different one.

const PAGES = [
  { file: 'index.html', label: 'Components' },
  { file: 'flow.html',  label: 'Flow' },
];

const SUBTITLE = 'A holding room for behaviour rules. Not production code — the '
               + 'place where a rule becomes executable before it gets built.';

const el = (tag, cls, text) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
};

// Derived from the URL rather than passed in: a page cannot then claim to be
// a page it is not.
function currentFile() {
  const last = window.location.pathname.split('/').pop();
  return last === '' ? 'index.html' : last;
}

export function renderHeader(mount) {
  const here = currentFile();
  mount.classList.add('wr-head');
  mount.replaceChildren();

  // The masthead bar. Purely structural — it gives the page a top edge to
  // hang from, which is what makes a flush-left layout read as deliberate
  // rather than as text that happens to start at the margin.
  mount.append(el('div', 'wr-head-bar'));

  const top = el('div', 'wr-head-top');
  const mark = el('a', 'wr-wordmark', 'waitingroom');
  mark.href = 'index.html';
  top.append(mark, modeControl());
  mount.append(top);

  mount.append(el('p', 'wr-subtitle', SUBTITLE));

  const nav = el('nav', 'wr-nav');
  nav.setAttribute('aria-label', 'Pages');
  PAGES.forEach(({ file, label }, i) => {
    const a = el('a', 'wr-nav-link');
    a.href = file;
    if (file === here) a.setAttribute('aria-current', 'page');
    // The index is part of the label, not decoration: it says how many pages
    // there are, which two words alone do not.
    a.append(el('span', 'wr-nav-num', String(i + 1).padStart(2, '0')), el('span', null, label));
    nav.append(a);
  });
  mount.append(nav);
}

// Two named states instead of one button labelled with the other mode. The
// old control read "Dark" and it was not answerable from looking at it whether
// that was the state or the action.
function modeControl() {
  const group = el('div', 'wr-mode');
  group.setAttribute('role', 'group');
  group.setAttribute('aria-label', 'Colour mode');
  ['light', 'dark'].forEach((mode) => {
    const b = el('button', 'wr-mode-btn', mode);
    b.type = 'button';
    b.dataset.mode = mode;
    group.append(b);
  });
  return group;
}
