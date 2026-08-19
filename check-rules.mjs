// Checks the rules against the format they claim to follow.
//
//   node check-rules.mjs
//
// It exists because consistency that has to be read is not consistency. Three
// rules can be held in the head; forty cannot, and by then the drift has
// already happened. Every check below corresponds to something that actually
// went wrong here, not to a rule invented for the checker.
//
// Exits non-zero on failure, so it can sit in front of a commit.

import { readFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { selectionControl } from './rules/selection.js';
import { conditionalDisclosure } from './rules/disclosure.js';
import { nameTruncation } from './rules/names.js';
import { angularWiring } from './wiring/angular.js';

const here = dirname(fileURLToPath(import.meta.url));
const RULES = [selectionControl, conditionalDisclosure, nameTruncation];

const CHANGE_CLASSES = ['token', 'rule', 'structure', 'record'];
const TYPES = ['threshold', 'state-dependency', 'space-conflict', 'data-absence'];

const problems = [];
const fail = (where, what) => problems.push({ where, what });

// ---------------------------------------------------------------- per rule
for (const rule of RULES) {
  const at = rule.id ?? '(rule without an id)';

  for (const field of ['id', 'title', 'type', 'rule', 'rationale']) {
    if (!rule[field] || !String(rule[field]).trim()) fail(at, `${field} is missing or empty`);
  }
  if (typeof rule.apply !== 'function') fail(at, 'apply() is missing — a rule that cannot be run is a document');
  if (rule.type && !TYPES.includes(rule.type)) {
    fail(at, `type "${rule.type}" is not one of: ${TYPES.join(', ')}`);
  }

  // The two lists that are always tempting to leave empty, and are the whole
  // point when they are not.
  if (!rule.openQuestions?.length) {
    fail(at, 'openQuestions is empty — a rule with nothing open has either been '
           + 'thought through completely or has stopped asking');
  }
  if (!rule.provenance?.length) fail(at, 'provenance is empty');

  rule.provenance?.forEach((p, i) => {
    const e = `provenance[${i}]`;
    for (const field of ['date', 'change', 'by', 'basis', 'class']) {
      if (!p[field]) fail(at, `${e}.${field} is missing`);
    }
    if (p.date && !/^\d{4}-\d{2}-\d{2}$/.test(p.date)) fail(at, `${e}.date is not ISO: ${p.date}`);
    if (p.class && !CHANGE_CLASSES.includes(p.class)) {
      fail(at, `${e}.class "${p.class}" is not one of: ${CHANGE_CLASSES.join(', ')}`);
    }
  });

  rule.edgeCases?.forEach((e, i) => {
    if (!e.case || !e.handling) fail(at, `edgeCases[${i}] is missing case or handling`);
  });
  if (!rule.edgeCases?.length) fail(at, 'edgeCases is empty');

  // The contract is what the engineer actually receives. Without it the
  // snippet is a function nobody can place.
  const c = rule.contract;
  if (!c) fail(at, 'contract is missing — the snippet says what the logic is, '
                 + 'never what goes in, what comes out, or what to render');
  else {
    for (const field of ['input', 'returns', 'wiring']) {
      if (!c[field]) fail(at, `contract.${field} is missing`);
    }
    if (c.wiring && !c.wiring.length) fail(at, 'contract.wiring lists no return values');
  }

  if (!angularWiring[rule.id]) {
    fail(at, 'no entry in wiring/angular.js — nothing to start from in their stack');
  }
}

// ------------------------------------------------------------------ drift
// The check this whole file exists for. A parameter written out as a literal
// in prose goes stale the moment the parameter changes — which happened here
// in the first draft, where an edge case spelled out "5" and stayed wrong
// after the threshold moved to 6.
//
// Rather than grep for digits, change the parameter and see whether the prose
// follows. Text that mentioned the old value and still mentions it after the
// change was never derived from it.
for (const rule of RULES) {
  const params = Object.keys(rule).filter((k) => typeof rule[k] === 'number');

  for (const key of params) {
    const before = rule[key];
    const probe = before + 7;                       // far enough not to collide
    const texts = () => [
      ['rule', rule.rule],
      ...(rule.edgeCases ?? []).map((e, i) => [`edgeCases[${i}].handling`, e.handling]),
      ['rationale', rule.rationale],
    ];

    const was = texts();
    rule[key] = probe;
    const now = texts();
    rule[key] = before;

    was.forEach(([where, text], i) => {
      const mentions = (t, n) => new RegExp(`(^|\\D)${n}(\\D|$)`).test(t);
      if (mentions(text, before) && mentions(now[i][1], before)) {
        fail(rule.id, `${where} spells out ${key} = ${before} as a literal — `
                    + 'it did not change when the parameter did. Derive it with a getter.');
      }
    });
  }
}

// --------------------------------------------------------- generated docs
// docs/ is output. If it has drifted from the rules, the archived form of a
// rule and the rule itself disagree, which is the one thing generated files
// exist to prevent.
{
  const { render } = await import('./export-docs.mjs');
  for (const rule of RULES) {
    const file = join(here, 'docs', `${rule.id.replace('/', '-')}.md`);
    const onDisk = await readFile(file, 'utf8').catch(() => null);
    if (onDisk === null) fail(rule.id, `docs/${rule.id.replace('/', '-')}.md is missing — run node export-docs.mjs`);
    else if (onDisk.trim() !== render(rule).trim()) {
      fail(rule.id, `docs/${rule.id.replace('/', '-')}.md is out of date — run node export-docs.mjs`);
    }
  }
}

// ------------------------------------------------------------ hard-coded values
// A component that reaches for a raw colour has stepped around the token
// layer, and a stylesheet with a literal font size has stepped around the
// scale. Both are invisible until someone repoints the thing being bypassed.
{
  const dir = join(here, 'components');
  for (const name of await readdir(dir)) {
    if (!name.endsWith('.js')) continue;
    const src = await readFile(join(dir, name), 'utf8');
    const hexes = src.match(/#[0-9a-fA-F]{3,8}\b/g);
    if (hexes) fail(`components/${name}`, `raw colour value(s): ${[...new Set(hexes)].join(', ')}`);
  }

  const css = await readFile(join(here, 'waitingroom.css'), 'utf8');
  const scaleBlock = css.slice(css.indexOf('--t-micro'), css.indexOf('--t-head') + 60);
  const literals = css.replace(scaleBlock, '').match(/font-size: [0-9.]+px/g);
  if (literals) {
    fail('waitingroom.css', `font-size outside the scale: ${[...new Set(literals)].join(', ')}`);
  }
}

// ----------------------------------------------------------------- report
const n = RULES.length;
if (!problems.length) {
  console.log(`\n  ${n} rules, nothing to report.\n`);
  process.exit(0);
}

console.log(`\n  ${problems.length} problem${problems.length === 1 ? '' : 's'} in ${n} rules:\n`);
let last = null;
for (const p of problems) {
  if (p.where !== last) { console.log(`  ${p.where}`); last = p.where; }
  console.log(`    · ${p.what}`);
}
console.log('');
process.exit(1);
