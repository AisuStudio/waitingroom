# Spec — Waiting list

> Synthetic example. In the real flow this document lives in the team's own
> system and is only *linked* from here, never copied.

**Ticket:** WR-131
**Screen:** Staff view, waiting list per location
**Status:** approved

---

## Requirement

Staff at the desk see who is waiting, in the order they will be called.

Each row shows the ticket number, the person's name, how long they have been
waiting, and the desk they have been assigned to, if any.

Names are shown as recorded in the register. Where a register holds a name in
a non-Latin script alongside its transliteration, both are held.

The list is used while talking to the person being served, so a row must be
readable at a glance and the list must not reflow while it is being read.

## Acceptance criteria

- The person can be identified from the row without opening a detail view.
- Waiting time updates without the list jumping.
- The view works on the desk terminal, which is narrower than a desktop.

## Not in scope

- Calling or reassigning a person (separate action)
- History of people already served

---

## Note on this example

"Names are shown as recorded" and "readable at a glance" are both reasonable
and, together, undecidable — the desk terminal is narrow and some names are
long. Something has to give, and the spec does not say what.

Nor does it say:

- whether the original-script form is shown in the list or only in the detail
  view
- what happens when a name does not fit — abbreviate, wrap, or cut
- which part of a name may be shortened, and which may not
- what happens to a name that has only one recorded part

The last two are not layout questions. A truncated name can identify the wrong
person, or nobody. In a setting where the list is used to call someone up and
hand them a document, that is a safety question wearing a typography costume —
and it is currently answered by whatever the stylesheet happens to do.
