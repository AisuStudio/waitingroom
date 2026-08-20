// The page header — one source for both pages.
//
// It was copied into index.html and flow.html by hand, and the two copies had
// already begun to disagree. That is the drift this repo argues against, at
// the smallest scale available, so the header is rendered from here and
// neither page is able to hold a different one.
//
// The layout follows the "Waiting Room Header" frame in the overgabe Figma
// file: wordmark and mode pills on one line, a rule beneath them, the claim
// set in two lines, then the navigation over a second rule.

const PAGES = [
  { file: 'index.html',     label: 'Components' },
  { file: 'flow.html',      label: 'Workflow' },
  { file: 'changelog.html', label: 'Changes' },
];

// What it is, in one line — the definition a reader needs before the claim
// below it means anything.
const DEFINITION =
  'A handover concept with tangible artefacts, slotted into an existing '
  + 'workflow to make agentic building more efficient.';

// Two lines, because the break is part of the design: one line states what
// the room is, the other what it is for.
const CLAIM = [
  'A Holding Room For Behaviour Rules, Not Production Code.',
  'The Place Where A Rule Becomes Executable Before It Gets Built.',
];

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

  const top = el('div', 'wr-head-top');
  const mark = el('a', 'wr-wordmark', 'Waiting Room');
  mark.href = 'index.html';
  // The anchor exists only to carry the baseline; see .wr-mode-anchor.
  const anchor = el('span', 'wr-mode-anchor');
  anchor.append(modeControl());
  top.append(mark, anchor);
  mount.append(top, el('div', 'wr-rule wr-rule-heavy'));

  const claim = el('p', 'wr-subtitle');
  claim.append(el('span', 'wr-definition', DEFINITION));
  CLAIM.forEach((line) => claim.append(el('span', null, line)));
  mount.append(claim);

  const nav = el('nav', 'wr-nav');
  nav.setAttribute('aria-label', 'Pages');
  PAGES.forEach(({ file, label }) => {
    const a = el('a', 'wr-nav-link', label);
    a.href = file;
    if (file === here) a.setAttribute('aria-current', 'page');
    nav.append(a);
  });
  mount.append(nav, el('div', 'wr-rule'));
}

// Two named states instead of one button labelled with the other mode. The
// old control read "Dark" and it was not answerable, from looking at it,
// whether that was the state or the action.
function modeControl() {
  const group = el('div', 'wr-mode');
  group.setAttribute('role', 'group');
  group.setAttribute('aria-label', 'Colour mode');
  ['light', 'dark'].forEach((mode) => {
    const b = el('button', 'wr-mode-btn', `${mode} mode`);
    b.type = 'button';
    b.dataset.mode = mode;
    group.append(b);
  });
  return group;
}
