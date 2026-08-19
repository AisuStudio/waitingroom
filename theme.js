// Light/dark switch, shared by both pages.
//
// The choice is remembered, because it is otherwise lost on every navigation
// — and a reader who switched to dark did so for a reason that does not stop
// applying when they open the next page.
//
// Applied before first paint via the inline call at the top of each page, so
// there is no flash of the wrong palette.

const KEY = 'wr-theme';

export function applyStoredTheme() {
  const stored = localStorage.getItem(KEY);
  if (stored) document.documentElement.setAttribute('data-theme', stored);
}

const current = () =>
  document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';

// A two-state control, not a toggle: each mode is named and one of them is
// marked as the one in force. A single button labelled with the other mode
// cannot say which of the two it is describing.
export function wireModeControl(group) {
  if (!group) return;
  const buttons = [...group.querySelectorAll('[data-mode]')];

  const reflect = () => {
    const now = current();
    buttons.forEach((b) => {
      const active = b.dataset.mode === now;
      b.setAttribute('aria-pressed', String(active));
      // Announced as the state it sets, so it is not read as "light light".
      b.setAttribute('aria-label', active ? `${b.dataset.mode} mode, in use` : `switch to ${b.dataset.mode} mode`);
    });
  };

  buttons.forEach((b) => b.addEventListener('click', () => {
    document.documentElement.setAttribute('data-theme', b.dataset.mode);
    localStorage.setItem(KEY, b.dataset.mode);
    reflect();
  }));

  reflect();
}
