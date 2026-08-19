// Selection control — which input control for which number of options.
//
// This file is the ONLY source for this rule. The prototype executes it, the
// RULES tab renders its metadata, the CODE tab shows its logic. Change the
// threshold below and all three follow — there is no second place to update.
//
// Why the rule lives here at all: a component library ships both a radio
// group and a select. It does not tell you when to use which. That is a
// product decision, not a framework feature — and exactly the kind of
// decision that is otherwise written down nowhere.

export const selectionControl = {
  id: 'selection/control-type',
  title: 'Selection control: radio group or select',
  type: 'threshold',

  // The only parameter. Change it and everything follows.
  threshold: 5,

  // ---------------------------------------------------------------- WHAT
  get rule() {
    return `Up to ${this.threshold - 1} options render as a radio group; `
         + `from ${this.threshold} options on, as a select.`;
  },

  // ---------------------------------------------------------------- WHY
  // The part that defends the control in an audit.
  rationale:
    'Below the threshold every option is visible at once: the choice is taken '
  + 'in at a glance and made in one click. Above it, that visibility costs '
  + 'more vertical space than it returns — the list crowds out the context in '
  + 'which the decision is made.\n\n'
  + 'A select trades visibility for compactness. That trade only pays off '
  + 'once visibility has stopped working at a glance anyway.',

  // ------------------------------------------------------------ EDGE CASES
  // The part that saves the engineer a question.
  //
  // A getter, not a fixed array: the first edge case originally spelled the
  // threshold out as a literal — and went wrong the moment the value changed
  // from 5 to 6 during testing. Exactly the drift this file exists to
  // prevent, present in the very first draft. Anything derived from the
  // parameter has to be derived from it.
  get edgeCases() {
    return [
      {
        case: 'Exactly at the threshold',
        handling: `The threshold is inclusive: at exactly ${this.threshold} options `
                + 'the select already applies. Stated as "from N on", never "above N".',
      },
      {
        case: 'A single option',
        handling: 'Neither control — the option is shown as a set value. A choice '
                + 'without an alternative is not a choice and must not look like one.',
      },
      {
        case: 'No options',
        handling: 'The field is not shown at all. An empty select leaves it open '
                + 'whether data is still loading or nothing applies.',
      },
      {
        case: 'Options arrive asynchronously',
        handling: 'The control type is decided only once loading has completed. '
                + 'Switching from radio group to select while the user is '
                + 'interacting is ruled out — they would be clicking an element '
                + 'that is no longer there.',
      },
    ];
  },

  // ------------------------------------------------------------ PROVENANCE
  // A list, not a single entry: the second pass is more common than the
  // first, and retrofitting a change trail is painful.
  provenance: [
    {
      date: '2026-08-19',
      change: 'Rule created, threshold 5',
      by: 'Example — the deciding person would be named here',
      basis: 'Synthetic example, created to test this format',
    },
  ],

  // ------------------------------------------------- WHAT IS NOT SETTLED
  // The most valuable section. Not invented — named. What the specification
  // leaves open is a question for the designer, not an invitation to write
  // down something plausible.
  openQuestions: [
    'Does the threshold hold in every context, or is it lower in a narrow '
  + 'sidebar than in a wide form?',
    'Is one option preselected in the radio group? If so, which — and does '
  + 'the same preselection apply to the select?',
    'In what order are the options sorted: by domain logic, alphabetically, '
  + 'by frequency of use?',
    'Is there an upper bound beyond which a select stops working too and a '
  + 'search field is needed?',
  ],

  // ------------------------------------------------------------- CONTRACT
  // What the engineer actually receives. The snippet below is a decision
  // function, not a component: it says which control applies, never how it is
  // drawn. This block is the part that makes it usable in a stack that has
  // nothing to do with this page.
  contract: {
    input: 'optionCount: number — how many options the field has',
    returns: "'none' | 'fixed' | 'radio' | 'select'",
    wiring: [
      ["'none'", 'Nothing is rendered — the field is not in the form at all.'],
      ["'fixed'", 'The single option as a set value, not as a control.'],
      ["'radio'", 'A radio group, every option visible at once.'],
      ["'select'", 'A select.'],
    ],
    note: 'Call it once, when the option list is final. Never while the user is '
        + 'interacting — see the edge cases.',
  },

  // ------------------------------------------------------------- THE LOGIC
  // The same function the prototype runs and the CODE tab displays.
  // Deliberately framework-neutral: the decision, not the rendering.
  apply(optionCount) {
    if (optionCount === 0) return 'none';
    if (optionCount === 1) return 'fixed';
    return optionCount >= this.threshold ? 'select' : 'radio';
  },
};
