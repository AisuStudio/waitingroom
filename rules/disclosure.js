// Conditional fields — which parts of a form appear, and when.
//
// A different rule type from the threshold: not "how many", but "what has
// been answered so far". These are the rules that make a form feel either
// considerate or arbitrary, and they are almost never written down — they
// live in the implementation, discovered by whoever clicks through it.
//
// The conditions are declared as DATA, not as code. That way the same
// declaration drives the prototype, reads as a table in the Rules tab, and
// exports to markdown — instead of a reader having to parse an if-chain.

export const conditionalDisclosure = {
  id: 'disclosure/conditional-fields',
  title: 'Conditional fields in the change-of-address form',
  type: 'state-dependency',

  // ---------------------------------------------------------------- WHAT
  rule:
    'A field is shown only once the answers it depends on have been given. '
  + 'Answers already entered are kept when a field is withdrawn, and are '
  + 'restored unchanged if it reappears.',

  // ---------------------------------------------------------------- WHY
  rationale:
    'Showing everything at once asks people about circumstances that do not '
  + 'apply to them; showing one thing at a time hides how long the form is. '
  + 'The compromise is to reveal only what follows from an answer already '
  + 'given.\n\n'
  + 'The retention half matters more. Someone who picks "married", enters '
  + 'their partner, then corrects the entry to "single" has made a '
  + 'correction — not a request to delete data. Discarding it silently '
  + 'punishes the correction, and where the form is evidence, an unlogged '
  + 'deletion is worse than a redundant field.',

  // ---------------------------------------------------- THE CONDITIONS
  // Read as: field X is shown when `when` holds. `dependsOn` is what the
  // condition reads, so the dependency graph can be derived rather than
  // maintained by hand.
  conditions: [
    {
      field: 'partnerDetails',
      label: 'Partner — name and whether they are moving too',
      dependsOn: 'maritalStatus',
      when: "maritalStatus is 'married' or 'civil partnership'",
      test: (a) => a.maritalStatus === 'married' || a.maritalStatus === 'civil partnership',
    },
    {
      field: 'formerName',
      label: 'Name before marriage',
      dependsOn: 'maritalStatus',
      when: "maritalStatus is 'divorced' or 'widowed'",
      test: (a) => a.maritalStatus === 'divorced' || a.maritalStatus === 'widowed',
    },
    {
      field: 'residencePermit',
      label: 'Residence permit number',
      dependsOn: 'citizenship',
      when: "citizenship is not 'German' and not an EU member state",
      test: (a) => a.citizenship === 'Other',
    },
    {
      field: 'childCount',
      label: 'Number of children moving with you',
      dependsOn: 'hasChildren',
      when: "hasChildren is 'yes'",
      test: (a) => a.hasChildren === 'yes',
    },
    {
      field: 'childDetails',
      label: 'Per child: name and date of birth, as two fields',
      dependsOn: 'childCount',
      when: 'childCount is 1 or more',
      test: (a) => a.hasChildren === 'yes' && Number(a.childCount) > 0,
    },
    {
      field: 'religionOther',
      label: 'Religious community — free text',
      dependsOn: 'churchTax',
      when: "churchTax is 'other'",
      test: (a) => a.churchTax === 'other',
    },
  ],

  // Fields that are always present. Listed so the form's full extent can be
  // read here rather than inferred from what the conditions leave out.
  baseFields: [
    'gender',
    'maritalStatus',
    'citizenship',
    'hasChildren',
    'churchTax',
  ],

  // ------------------------------------------------------------ EDGE CASES
  edgeCases: [
    {
      case: 'An answer is corrected and a field is withdrawn',
      handling: 'The withdrawn field keeps its content. It is not submitted '
              + 'while hidden, and it is restored unchanged if the field '
              + 'reappears. Nothing is deleted without the person doing it.',
    },
    {
      case: 'A withdrawn field held a mandatory entry',
      handling: 'The requirement is withdrawn with the field. A hidden field '
              + 'must never block submission — the person cannot see what is '
              + 'being asked of them.',
    },
    {
      case: 'Chained dependencies',
      handling: 'Child blocks depend on the number, which depends on whether '
              + 'there are children at all. Withdrawing the top of the chain '
              + 'withdraws everything below it in one step, not one level per '
              + 'interaction.',
    },
    {
      case: 'Reducing the number of children',
      handling: 'Blocks are withdrawn from the end. Reducing from three to two '
              + 'withdraws the third block — never the one most recently '
              + 'edited, and never renumbered so entries appear to shift '
              + 'between children.',
    },
    {
      case: 'A choice offers "other"',
      handling: 'A free-text field follows it. Without one, "other" records '
              + 'that the answer is not on the list and nothing else — which '
              + 'is less than the person was willing to tell us. The text is '
              + 'retained like any other withdrawn answer if the choice '
              + 'changes.',
    },
    {
      case: '"Prefer not to say" is offered alongside "none"',
      handling: 'They are separate values and must stay separate in the '
              + 'record. "None" is an answer; declining is not. Collapsing '
              + 'them turns a refusal into a statement the person did not '
              + 'make.',
    },
    {
      case: "A child's name and date of birth",
      handling: 'Two fields, never one. They are validated differently, they '
              + 'are corrected independently, and a single field invites a '
              + 'format that then has to be parsed back apart.',
    },
    {
      case: 'A field appears after the person has scrolled past it',
      handling: 'New fields appear in place, without scrolling the page. '
              + 'Moving the viewport under someone loses their position and '
              + 'reads as a page reload.',
    },
    {
      case: 'Gender given as diverse or not specified',
      handling: 'No salutation is derived from it. The form addresses everyone '
              + 'by full name throughout, so that an entry outside the two '
              + 'conventional options does not produce a different-looking '
              + 'form for that person.',
    },
  ],

  // ------------------------------------------------------------ PROVENANCE
  provenance: [
    {
      date: '2026-08-19',
      change: 'Rule created — reveal conditions and retention on withdrawal',
      class: 'structure',
      by: 'Example — the deciding person would be named here',
      basis: 'Synthetic example, created to test this format on a nested case',
    },
    {
      date: '2026-08-19',
      change: 'Free text added after "other"; child name and date of birth '
            + 'split into two fields',
      class: 'structure',
      by: 'Found while working the prototype',
      basis: 'Both gaps surfaced by using the form, not by reading the spec — '
           + 'which is the argument for the prototype existing at all',
    },
  ],

  // ------------------------------------------------- WHAT IS NOT SETTLED
  openQuestions: [
    'How long are withdrawn answers kept — for the session only, or across a '
  + 'saved draft? The second needs a retention period and someone to set it.',
    'Above how many children does a list of blocks stop working and become a '
  + 'table? This is the threshold rule again, on a different quantity.',
    'Which EU member states count as "EU" for the residence-permit condition, '
  + 'and who maintains that list when it changes?',
    'Is the church-tax question mandatory, and what is recorded when someone '
  + 'declines to answer — "none" or "not stated"? Those are not the same.',
    'Does a partner who is not moving still have to be named, or only the '
  + 'fact that they exist?',
    'Is the free text mandatory once "other" is chosen? If it is left empty, '
  + 'is that recorded as "other, unspecified" or does it block submission?',
    'What date format is accepted for a child\'s date of birth, and is it '
  + 'checked for plausibility — a date in the future, or one that makes the '
  + 'child older than the parent?',
  ],

  // ------------------------------------------------------------- THE LOGIC
  // Returns the visible fields for a set of answers. Derived from the
  // declarations above — adding a condition there needs no change here.
  // ------------------------------------------------------------- CONTRACT
  // What the engineer actually receives. The snippet below is a decision
  // function, not a component: it says which control applies, never how it is
  // drawn. This block is the part that makes it usable in a stack that has
  // nothing to do with this page.
  contract: {
    input: 'answers: Record<field, value> — everything answered so far',
    returns: 'string[] — the field keys to show, on top of the base fields',
    wiring: [
      ['a key in the list', 'Render that field, directly after the answer it follows from.'],
      ['a key no longer in the list', 'Stop rendering it — but keep what it held. '
        + 'Withdrawing a field is not a request to delete the answer.'],
      ['baseFields', 'Always rendered, in their fixed order, whatever the answers are.'],
    ],
    note: 'Call it after every answer. The order the fields are rendered in belongs '
        + 'to the form, not to this function.',
  },

  apply(answers) {
    return this.conditions.filter((c) => c.test(answers)).map((c) => c.field);
  },
};
