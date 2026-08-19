// Person names in a fixed-width column — what gives way when space runs out.
//
// The third rule type: not "how many" and not "what was answered", but
// "it does not fit". These rules are usually never written down at all; they
// emerge from whatever the CSS happens to do, which is how a column ends up
// showing a name that belongs to nobody.
//
// The strategy is a ladder. Each rung is tried in order and the first one
// that fits wins — so the cheapest sacrifice is always made first, and the
// expensive ones only when there is no alternative.

export const nameTruncation = {
  id: 'names/truncation',
  title: 'Person names in a fixed-width column',
  type: 'space-conflict',

  // ---------------------------------------------------------------- WHAT
  rule:
    'When a name does not fit, the ladder is: drop the original-script form, '
  + 'abbreviate given names to initials, wrap to a second line, then both. '
  + 'Nothing is ever cut off at the end — the row grows taller instead.',

  // ---------------------------------------------------------------- WHY
  rationale:
    'A name is an identifier, not a label. Cutting it off at the end can '
  + 'produce a different name that belongs to someone else — "Subramanian" '
  + 'cut short is "Subrama…", which identifies nobody, and several distinct '
  + 'names can collapse onto the same stub. Truncation at the end is '
  + 'therefore not the last resort; it is not on the ladder at all.\n\n'
  + '"K. Schmidt-Wollenweber" is easier to match against a document than '
  + '"Katharina Schmidt-Wol…", because an initial is understood as an '
  + 'abbreviation while a cut-off name reads as a complete one. That is why '
  + 'initials come before wrapping: they cost one glance, and wrapping costs '
  + 'the row height of the whole list.\n\n'
  + 'The order of sacrifices follows what each one costs the reader. The '
  + 'original-script form is a second rendering of a name already shown — '
  + 'losing it costs least. An initial still identifies. A second line costs '
  + 'no information at all, only space. When even that is not enough, the row '
  + 'grows further rather than anything being hidden: a taller row is a '
  + 'nuisance, a name nobody can match is a defect.',

  // The ladder, declared as data so the Rules tab can show it as a sequence
  // rather than as prose someone has to reconstruct.
  ladder: [
    { step: 'full',         description: 'Given names, family name, original script if present' },
    { step: 'no-original',  description: 'Drop the original-script form — the transliteration carries the same name' },
    { step: 'initials',     description: 'Given names abbreviated to initials, family name intact — "K. Schmidt-Wollenweber"' },
    { step: 'two-line',     description: 'Given names on line one, family name on line two' },
    { step: 'initials-two-line', description: 'Both: initial on line one, family name on line two' },
    { step: 'wrap',         description: 'Family name alone is wider than the column: it wraps at spaces and hyphens and the row grows. Nothing is hidden and nothing is cut.' },
  ],

  // ------------------------------------------------------------ EDGE CASES
  edgeCases: [
    {
      case: 'Two given names',
      handling: 'Both become initials at the same time, never one at a time. '
              + '"A. Katharina Berg" reads as a name someone actually uses; '
              + 'it is not an intermediate state of the rule.',
    },
    {
      case: 'Name particles (van der, de la, bin)',
      handling: 'They belong to the family name and stay with it. They are '
              + 'never initialised — "J. v. d. Meulen" is a different name '
              + 'from "Jan van der Meulen" in a register.',
    },
    {
      case: 'Double family name',
      handling: 'Both parts are family name and both stay. If that means two '
              + 'lines, it means two lines.',
    },
    {
      case: 'Original script in brackets',
      handling: 'It is the first thing dropped, not the last. It is a second '
              + 'rendering of a name already shown, so losing it loses no '
              + 'identification — but it is shown wherever there is room, '
              + 'because for the person it is their actual name.',
    },
    {
      case: 'Only one name part recorded',
      handling: 'It is treated as the family name and never abbreviated. '
              + 'Mononyms are recorded in registers and must survive the '
              + 'column.',
    },
    {
      case: 'The family name alone is wider than the column',
      handling: 'It wraps at spaces and hyphens and the row grows taller. It '
              + 'is never cut off at the end and never hidden behind a scroll '
              + 'or a fade — both of those make an incomplete name look '
              + 'complete, which is the one outcome the rule exists to '
              + 'prevent.',
    },
    {
      case: 'A single name part is wider than the column with nowhere to wrap',
      handling: 'It overflows visibly and the column has to be widened. This '
              + 'is a layout defect to be fixed, not a case to be handled by '
              + 'hiding part of the name.',
    },
  ],

  // ------------------------------------------------------------ PROVENANCE
  provenance: [
    {
      date: '2026-08-19',
      change: 'Rule created — ladder of sacrifices, family name out of bounds',
      by: 'Example — the deciding person would be named here',
      basis: 'Synthetic example, tested against names from several naming systems',
    },
    {
      date: '2026-08-19',
      change: 'Truncation at the end removed from the ladder entirely; '
            + 'initials-plus-wrap added as a rung; the last rung now wraps '
            + 'instead of scrolling behind a fade',
      by: 'Found while working the prototype',
      basis: 'The implementation faded the overflowing cell, which looks '
           + 'exactly like the cut-off name the rule forbids. An initial is '
           + 'read as an abbreviation; a cut-off name is read as complete.',
    },
  ],

  // ------------------------------------------------- WHAT IS NOT SETTLED
  openQuestions: [
    'The rule assumes every name splits into given and family parts. That '
  + 'assumption does not hold everywhere — in several South Indian naming '
  + 'systems the first element is a place or a father\'s name and is itself '
  + 'the part conventionally abbreviated, which inverts the ladder. Who '
  + 'decides how a record is split, and what happens when the register\'s '
  + 'split is wrong?',
    'Is the original-script form shown at all in a list view, or only on the '
  + 'detail screen? Dropping it first assumes it is supplementary — that is a '
  + 'decision, not a fact.',
    'At what column width does the two-line form stop being acceptable and '
  + 'the column has to be widened instead?',
    'Is a shortened name ever printed on a document, or only shown on screen? '
  + 'On paper there is no hover to reveal the full name.',
  ],

  // ------------------------------------------------------------- THE LOGIC
  // `measure` is injected: the rule knows the strategy, not how text is
  // measured. That keeps it usable outside a browser — in a test, in a
  // report generator, anywhere the same decision has to be reproduced.
  apply(name, availableWidth, measure) {
    const given = name.given ?? [];
    const family = name.family;
    const original = name.original;

    const initials = given.map((g) => `${[...g][0]}.`).join(' ');
    const givenFull = given.join(' ');

    const candidates = [
      { step: 'full',        line1: [givenFull, family].filter(Boolean).join(' '), line2: null, original: !!original },
      { step: 'no-original', line1: [givenFull, family].filter(Boolean).join(' '), line2: null, original: false },
      { step: 'initials',    line1: [initials, family].filter(Boolean).join(' '),  line2: null, original: false },
      { step: 'two-line',    line1: givenFull || family, line2: givenFull ? family : null,      original: false },
      { step: 'initials-two-line', line1: initials || family, line2: initials ? family : null,  original: false },
    ];

    for (const c of candidates) {
      const widest = Math.max(
        measure(c.original && original ? `${c.line1} (${original})` : c.line1),
        c.line2 ? measure(c.line2) : 0,
      );
      if (widest <= availableWidth) return c;
    }

    // Even the family name alone is wider than the column. It wraps and the
    // row grows — nothing is cut and nothing is hidden.
    return {
      step: 'wrap',
      line1: initials || null,
      line2: family,
      original: false,
    };
  },
};
