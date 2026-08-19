// Synthetic names for the column-width rule.
//
// All invented — no real people. They are drawn from several naming systems
// on purpose, and not as exotic outliers: a truncation rule that only works
// on short two-part names is not a rule, it is an assumption that happens to
// hold for some of the people in the register and fails silently for the
// rest. The awkward cases are the test.
//
// Structure over string: the rule needs to know which part is the family
// name, because that is the part it must not touch. Where a register cannot
// make that split reliably — see the open questions on the rule — this
// structure is already an assumption.

export const names = [
  { given: ['Anna'], family: 'Berg' },

  // Long German double-barrelled family name — both halves are family name.
  { given: ['Katharina'], family: 'Schmidt-Wollenweber' },

  // Particles stay with the family name and are never initialised.
  { given: ['Jan'], family: 'van der Meulen' },

  // Transliteration with the original script alongside. Common in registers
  // for people who moved from a country using another script — the Latin
  // form is what systems handle, the original is their actual name.
  { given: ['Oleksandr'], family: 'Kovalenko', original: 'Олександр Коваленко' },
  { given: ['Yulia'], family: 'Kravchenko', original: 'Юлія Кравченко' },

  // South Indian names: long, and the given/family split is a European
  // convention imposed on a different system. These are the cases the rule's
  // own open questions are about.
  { given: ['Venkataraman'], family: 'Subramanian' },
  { given: ['Lakshmi', 'Narayanan'], family: 'Iyer' },
  { given: ['Priya'], family: 'Balasubramaniam' },

  // Hyphenated family name from another convention again.
  { given: ['Mohammed'], family: 'Abdul-Rahman' },

  // Two given names and a compound family name with a particle.
  { given: ['María', 'Elena'], family: 'Fernández de la Torre' },

  // Mononym — one recorded name part. Treated as family name, never cut.
  { given: [], family: 'Ravikumar' },
];

// The rest of a waiting-list row, so the column has something to compete with.
export const rows = names.map((name, i) => ({
  ticket: `A-${String(41 + i).padStart(3, '0')}`,
  name,
  waited: `${4 + ((i * 7) % 23)} min`,
  desk: i % 3 === 0 ? '—' : String(2 + (i % 4)),
}));
