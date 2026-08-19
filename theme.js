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

export function wireThemeToggle(button) {
  if (!button) return;
  const label = () =>
    (document.documentElement.getAttribute('data-theme') === 'dark' ? 'Light' : 'Dark');
  button.textContent = label();
  button.addEventListener('click', () => {
    const dark = document.documentElement.getAttribute('data-theme') === 'dark';
    const next = dark ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem(KEY, next);
    button.textContent = label();
  });
}
