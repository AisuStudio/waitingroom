// Change of address — the prototype for the conditional-fields rule.
//
// Here the form IS the control panel: every answer changes which fields the
// rule reveals. That makes the retention half testable by hand — pick
// "married", type a partner name, switch to "single", switch back. The name
// is still there, because withdrawing a field is not a request to delete
// what it held.
//
// As with the selection field, this file decides nothing. It knows what each
// field looks like; rules/disclosure.js knows which ones apply.

import { conditionalDisclosure as rule } from '../rules/disclosure.js';

const el = (tag, cls, text) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
};

// Answers survive a field being withdrawn — that is the whole point of the
// retention rule, so the store outlives the rendering.
const answers = {
  gender: 'not specified',
  maritalStatus: 'single',
  citizenship: 'German',
  hasChildren: 'no',
  childCount: '1',
  churchTax: 'none',
};
const retained = {};

const FIELDS = {
  gender: {
    label: 'Gender',
    options: ['female', 'male', 'diverse', 'not specified'],
  },
  maritalStatus: {
    label: 'Marital status',
    options: ['single', 'married', 'civil partnership', 'divorced', 'widowed'],
  },
  citizenship: {
    label: 'Citizenship',
    options: ['German', 'EU member state', 'Other'],
  },
  hasChildren: {
    label: 'Children moving with you',
    options: ['no', 'yes'],
  },
  churchTax: {
    label: 'Religious affiliation',
    options: ['none', 'Protestant', 'Catholic', 'other', 'prefer not to say'],
  },
  childCount: {
    label: 'Number of children',
    options: ['1', '2', '3', '4'],
  },
};

export function renderAddressChange(container) {
  container.replaceChildren();

  const visible = rule.apply(answers);
  const form = el('div', 'wr-form');

  // Base fields first, in a fixed order, then whatever the rule reveals —
  // each inserted directly after the answer it follows from, so a new field
  // never appears somewhere the eye is not already looking.
  const order = [
    'gender',
    'maritalStatus',
    'partnerDetails',
    'formerName',
    'citizenship',
    'residencePermit',
    'hasChildren',
    'childCount',
    'childDetails',
    'churchTax',
    'religionOther',
  ];

  for (const key of order) {
    if (FIELDS[key]) {
      form.append(choiceField(key, container));
    } else if (visible.includes(key)) {
      form.append(revealedField(key, container));
    }
  }

  container.append(form, trace(visible));
}

function choiceField(key, root) {
  const spec = FIELDS[key];
  // Only rendered when the rule allows it, or when it is a base field.
  const conditional = rule.conditions.find((c) => c.field === key);
  if (conditional && !conditional.test(answers)) return document.createDocumentFragment();

  const wrap = el('div', 'wr-form-row');
  wrap.append(el('label', 'wr-form-label', spec.label));

  const select = el('select', 'wr-select');
  select.setAttribute('aria-label', spec.label);
  spec.options.forEach((opt) => {
    const o = el('option', null, opt);
    o.value = opt;
    if (answers[key] === opt) o.selected = true;
    select.append(o);
  });
  select.addEventListener('change', () => {
    answers[key] = select.value;
    renderAddressChange(root);
  });
  wrap.append(select);

  if (conditional) wrap.classList.add('wr-form-row-revealed');
  return wrap;
}

// The fields that carry free text. These are the ones where retention is
// observable — type something, withdraw the field, bring it back.
function revealedField(key, root) {
  const wrap = el('div', 'wr-form-row wr-form-row-revealed');

  if (key === 'childDetails') {
    const n = Number(answers.childCount) || 0;
    wrap.append(el('label', 'wr-form-label', `Children (${n})`));
    const stack = el('div', 'wr-child-stack');
    for (let i = 0; i < n; i += 1) {
      const row = el('div', 'wr-child');
      row.append(el('span', 'wr-child-num', String(i + 1)));
      // Two fields, never one: they are validated differently and corrected
      // independently, and a single field invites a format that then has to
      // be parsed back apart.
      const pair = el('div', 'wr-child-pair');
      pair.append(textInput(`child-${i}-name`, 'Name', root));
      pair.append(dateInput(`child-${i}-dob`, root));
      row.append(pair);
      stack.append(row);
    }
    wrap.append(stack);
    return wrap;
  }

  const labels = {
    partnerDetails: ['Partner', "Partner's name — and whether they are moving too"],
    formerName: ['Name before marriage', 'Previous surname'],
    residencePermit: ['Residence permit', 'Permit number'],
    childCount: ['Number of children', null],
    religionOther: ['Religious community', 'Which one'],
  };
  const [label, placeholder] = labels[key] ?? [key, null];

  wrap.append(el('label', 'wr-form-label', label));
  wrap.append(textInput(key, placeholder ?? '', root));
  return wrap;
}

// A date gets a date field, not a text field with a format hint. Which
// format is accepted, and whether the date is checked for plausibility, is
// still open — see the rule's open questions.
function dateInput(key, root) {
  const input = el('input', 'wr-input wr-input-date');
  input.type = 'date';
  input.setAttribute('aria-label', 'Date of birth');
  input.value = retained[key] ?? '';
  input.addEventListener('input', () => { retained[key] = input.value; });
  input.addEventListener('change', () => renderAddressChange(root));
  return input;
}

function textInput(key, placeholder, root) {
  const input = el('input', 'wr-input');
  input.type = 'text';
  input.placeholder = placeholder;
  // Restored unchanged — the rule's central promise, in one line.
  input.value = retained[key] ?? '';
  input.addEventListener('input', () => { retained[key] = input.value; });
  input.addEventListener('blur', () => renderAddressChange(root));
  return input;
}

// Which fields the rule revealed, and what caused each one. Not for
// production — it exists so the rule can be observed, not just its result.
function trace(visible) {
  const box = el('div', 'wr-trace-block');
  box.append(el('div', 'wr-trace-title', `${rule.baseFields.length} base fields · ${visible.length} revealed`));

  if (visible.length === 0) {
    box.append(el('div', 'wr-trace-line', 'No condition met — only the base fields are shown.'));
  }
  visible.forEach((f) => {
    const c = rule.conditions.find((x) => x.field === f);
    const line = el('div', 'wr-trace-line');
    line.append(el('code', null, f), el('span', null, ` — ${c.when}`));
    box.append(line);
  });

  const kept = Object.entries(retained).filter(([, v]) => v);
  if (kept.length) {
    const note = el('div', 'wr-trace-kept');
    note.textContent = `Retained while hidden: ${kept.map(([k]) => k).join(', ')}`;
    box.append(note);
  }
  return box;
}
