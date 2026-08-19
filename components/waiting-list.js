// Waiting list — the prototype for the name-truncation rule.
//
// The control panel drives the name column's width. Everything else in the
// row stays fixed, so what is being observed is the rule and not a general
// reflow.
//
// Text is measured on a canvas rather than by counting characters: "Iyer" and
// "IIII" have the same length and different widths, and a rule that decides
// on character count will be wrong on exactly the names that matter.

import { nameTruncation as rule } from '../rules/names.js';
import { rows } from './names.data.js';

const el = (tag, cls, text) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
};

// One canvas for the whole page. The font has to match what the column
// actually renders in, or the measurement describes a different column.
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
let measureFont = '14px system-ui';

function measure(text) {
  ctx.font = measureFont;
  return ctx.measureText(text).width;
}

export function renderWaitingList(container, columnWidth) {
  container.replaceChildren();

  const probe = getComputedStyle(container);
  measureFont = `${probe.fontSize} ${probe.fontFamily}`;

  const table = el('div', 'wr-list');
  table.style.setProperty('--name-col', `${columnWidth}px`);

  const head = el('div', 'wr-list-row wr-list-head');
  head.append(
    el('span', 'wr-col-ticket', 'No.'),
    el('span', 'wr-col-name', 'Name'),
    el('span', 'wr-col-waited', 'Waited'),
    el('span', 'wr-col-desk', 'Desk'),
  );
  table.append(head);

  const used = new Map();

  rows.forEach((row) => {
    const result = rule.apply(row.name, columnWidth, measure);
    used.set(result.step, (used.get(result.step) ?? 0) + 1);

    const tr = el('div', 'wr-list-row');
    tr.append(el('span', 'wr-col-ticket', row.ticket));

    const nameCell = el('span', 'wr-col-name');
    nameCell.dataset.step = result.step;

    const line1 = el('span', 'wr-name-line', result.line1);
    nameCell.append(line1);
    if (result.original && row.name.original) {
      nameCell.append(el('span', 'wr-name-original', ` (${row.name.original})`));
    }
    if (result.line2) {
      nameCell.append(el('span', 'wr-name-line wr-name-line2', result.line2));
    }
    // The full name stays reachable whatever the column does with it.
    nameCell.title = [row.name.given.join(' '), row.name.family].filter(Boolean).join(' ')
      + (row.name.original ? ` (${row.name.original})` : '');

    tr.append(
      nameCell,
      el('span', 'wr-col-waited', row.waited),
      el('span', 'wr-col-desk', row.desk),
    );
    table.append(tr);
  });

  container.append(table, trace(used, columnWidth));
}

// Which rung of the ladder each row landed on. This is the whole point of
// the control panel: drag the width down and watch the rows step down the
// ladder one at a time, in the order the rule says they should.
function trace(used, width) {
  const box = el('div', 'wr-trace-block');
  box.append(el('div', 'wr-trace-title', `Column ${width}px — which rung each row landed on`));

  rule.ladder.forEach((rung) => {
    const n = used.get(rung.step) ?? 0;
    const line = el('div', 'wr-trace-line');
    if (n === 0) line.classList.add('wr-trace-line-off');
    line.append(
      el('code', null, rung.step),
      el('span', null, ` — ${n} ${n === 1 ? 'row' : 'rows'}`),
    );
    box.append(line);
  });

  if ((used.get('wrap') ?? 0) > 0) {
    const warn = el('div', 'wr-trace-kept');
    warn.textContent = 'Some family names are wider than the column on their own. '
                     + 'They wrap and the row grows — nothing is cut and nothing '
                     + 'is hidden. At this width the column should be widened.';
    box.append(warn);
  }
  return box;
}
