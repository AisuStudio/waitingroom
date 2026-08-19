// Figma audit — the same discipline check-rules.mjs runs on the repo, run on
// the design side. The premise it protects: the designer's design system in
// Figma is the source, and an MVP that quietly ignores those dependencies
// has ignored the core of the work.
//
// HOW IT RUNS: not in node. Each PHASE below is a script for the Figma plugin
// context (executed via the Figma MCP `use_figma`, or pasted into a plugin
// console). A run may load at most one page, so the protocol is three passes:
//
//   Phase A  scan the Components page      → canvas discipline + consumed ids
//   Phase B  scan the Tokens page          → same
//   Phase C  variable graph, fed the union of A+B's consumed ids
//
// Green means, verbatim from the last full run (2026-08-20):
//   45 variables, 5 text styles, 0 problems.
//
// WHAT EACH PHASE ENFORCES
//
// A + B — canvas discipline, per page:
//   · every visible SOLID paint is bound to a variable (no raw hexes;
//     instance internals are skipped — they inherit from their mains)
//   · every text node carries a text style, or binds its fontSize to a
//     type/* variable (the Ag specimens — each specimen IS its token)
//   · pure layout containers carry no paint at all. This one found 55
//     default white fills on the audit's own documentation page: invisible
//     in light mode, white boxes in dark.
//
// C — the variable graph:
//   · primitives hold raw values, never aliases (documented exception:
//     blue/11-deep aliases blue/11 in dark, where the scale's own step
//     already clears contrast)
//   · every semantic value is an alias into the primitive tier
//   · every component value is an alias into the semantic tier; reaching
//     into the primitive tier is allowed only for the documented three:
//     trace/text, code/bg, code/text
//   · primitives are hidden from every picker (scopes: []) so nothing
//     above may skip a tier; every other variable is visible somewhere
//   · every text style's fontSize is bound to a type/* variable — a style
//     cannot drift from the scale
//   · stock rule, same as the repo checker: every variable is consumed —
//     on canvas, by an alias, or by a style. Defined-but-unused is a fail.
//
// The three phase scripts follow, verbatim.

export const phaseA = String.raw`
const page = await figma.getNodeByIdAsync('0:1'); // Components
await figma.setCurrentPageAsync(page);
const consumed = new Set(); const problems = [];
const inInstance = (n) => { for (let p = n.parent; p; p = p.parent) if (p.type === 'INSTANCE') return true; return false; };
for (const n of page.findAll(() => true)) {
  for (const key of ['fills','strokes']) {
    const paints = n[key];
    if (!Array.isArray(paints)) continue;
    for (const p of paints) {
      if (p.type !== 'SOLID' || p.visible === false) continue;
      const b = p.boundVariables && p.boundVariables.color;
      if (b) consumed.add(b.id);
      else if (!inInstance(n)) problems.push('raw paint on "' + n.name + '" (' + key + ')');
    }
  }
  if (n.type === 'TEXT') {
    const fs = n.boundVariables && n.boundVariables.fontSize;
    if (fs) (Array.isArray(fs) ? fs : [fs]).forEach(x => consumed.add(x.id));
    if (n.textStyleId === '' && !fs && !inInstance(n)) problems.push('unstyled text "' + n.characters.slice(0,20) + '"');
  }
}
return { page: page.name, consumed: [...consumed], problems };
`;

// Phase B is phase A pointed at the Tokens page ('13:2'), without the
// instance exemption — that page has no instances.

export const phaseC = String.raw`
// CANVAS = union of phase A and B 'consumed' arrays, pasted in as literals.
const REACH_OK = new Set(['trace/text','code/bg','code/text']);
const problems = [];
const cols = await figma.variables.getLocalVariableCollectionsAsync();
const byName = Object.fromEntries(cols.map(c => [c.name, c]));
const prim = byName['1 · primitive'], sem = byName['2 · semantic'], comp = byName['3 · component'];
const allVars = await Promise.all(cols.flatMap(c => c.variableIds).map(id => figma.variables.getVariableByIdAsync(id)));
const varById = new Map(allVars.map(v => [v.id, v]));
const aliased = new Set();
for (const v of allVars) {
  for (const modeId of Object.keys(v.valuesByMode)) {
    const val = v.valuesByMode[modeId];
    const isAlias = val && typeof val === 'object' && val.type === 'VARIABLE_ALIAS';
    if (isAlias) aliased.add(val.id);
    if (v.variableCollectionId === prim.id) {
      if (isAlias && v.name !== 'blue/11-deep') problems.push('primitive ' + v.name + ' is an alias');
    } else if (v.variableCollectionId === sem.id) {
      if (!isAlias) problems.push('semantic ' + v.name + ' holds a raw value');
      else if (varById.get(val.id).variableCollectionId !== prim.id) problems.push('semantic ' + v.name + ' does not alias the primitive tier');
    } else if (v.variableCollectionId === comp.id) {
      if (!isAlias) problems.push('component ' + v.name + ' holds a raw value');
      else {
        const target = varById.get(val.id).variableCollectionId;
        if (target === prim.id && !REACH_OK.has(v.name)) problems.push('component ' + v.name + ' reaches past the semantic tier undocumented');
        else if (target !== prim.id && target !== sem.id) problems.push('component ' + v.name + ' aliases the wrong tier');
      }
    }
  }
  if (v.variableCollectionId === prim.id && v.resolvedType === 'COLOR' && v.scopes.length !== 0) problems.push('primitive ' + v.name + ' is visible in pickers');
  if (v.variableCollectionId !== prim.id && v.scopes.length === 0) problems.push(v.name + ' is hidden from every picker');
}
const styleBound = new Set();
for (const s of await figma.getLocalTextStylesAsync()) {
  const b = s.boundVariables && s.boundVariables.fontSize;
  if (!b) problems.push('text style "' + s.name + '" has an unbound font size');
  else (Array.isArray(b) ? b : [b]).forEach(x => styleBound.add(x.id));
}
for (const v of allVars) {
  if (!CANVAS.has(v.id) && !aliased.has(v.id) && !styleBound.has(v.id)) {
    problems.push(v.name + ' is defined but never consumed — delete it or use it');
  }
}
return { variables: allVars.length, problems };
`;
