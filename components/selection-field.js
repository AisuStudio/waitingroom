// Selection field — the prototype.
//
// It decides nothing on its own. Every rendering decision comes from
// rules/selection.js; this file only knows what each of the four possible
// outcomes looks like, never when which one applies.
//
// That separation is the whole point: the rule is testable and documented,
// the rendering is replaceable. In the target environment a component
// library would sit here — the rule above it would be unchanged.

import { selectionControl } from '../rules/selection.js';

const el = (tag, cls, text) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
};

export function renderSelectionField(container, options, { label = 'Purpose of visit' } = {}) {
  container.replaceChildren();

  // The one line where the decision is made.
  const form = selectionControl.apply(options.length);

  const field = el('div', 'wr-field');
  field.append(el('div', 'wr-field-label', label));

  // A visible note about which form applies right now. This does not belong
  // in the product — it is here because the waitingroom is meant to show the
  // rule working, not just its result.
  const trace = el('div', 'wr-trace');
  trace.append(
    el('span', 'wr-trace-count', `${options.length} ${options.length === 1 ? 'option' : 'options'}`),
    el('span', 'wr-trace-arrow', '→'),
    el('span', 'wr-trace-form', formLabel(form)),
  );

  if (form === 'none') {
    field.append(el('p', 'wr-empty', 'No service available — field is not rendered.'));
  } else if (form === 'fixed') {
    const fixed = el('div', 'wr-fixed');
    fixed.append(
      el('span', 'wr-fixed-value', options[0]),
      el('span', 'wr-fixed-note', 'only option — not a choice'),
    );
    field.append(fixed);
  } else if (form === 'radio') {
    const group = el('div', 'wr-radios');
    group.setAttribute('role', 'radiogroup');
    group.setAttribute('aria-label', label);
    options.forEach((opt, i) => {
      const row = el('label', 'wr-radio');
      const input = el('input');
      input.type = 'radio';
      input.name = 'service';
      if (i === 0) input.checked = true;
      row.append(input, el('span', null, opt));
      group.append(row);
    });
    field.append(group);
  } else {
    const select = el('select', 'wr-select');
    select.setAttribute('aria-label', label);
    options.forEach((opt) => {
      const o = el('option', null, opt);
      o.value = opt;
      select.append(o);
    });
    field.append(select);
  }

  container.append(field, trace);
  return form;
}

function formLabel(form) {
  return {
    none: 'render nothing',
    fixed: 'set value',
    radio: 'radio group',
    select: 'select',
  }[form];
}
