# Spec — Change of address

> Synthetic example. In the real flow this document lives in the team's own
> system and is only *linked* from here, never copied.

**Ticket:** WR-118
**Screen:** Change of address, step 1 of 3 — personal circumstances
**Status:** approved

---

## Requirement

A resident reports a change of address. Before the address itself is entered,
the form records the circumstances that determine which authorities are
notified and which documents have to be presented.

Recorded are:

- gender, as held in the civil register
- marital status
- for married residents and registered civil partnerships: the partner, and
  whether they are moving too
- citizenship; for third-country nationals the residence permit
- children moving with the resident
- religious affiliation, for church tax purposes

The form must not ask about circumstances that do not apply. A single resident
should not be asked about a partner.

## Acceptance criteria

- Every mandatory field for the resident's circumstances is filled before
  step 2 becomes available.
- Data on partners and children is recorded per person, not as free text.
- Residents can correct an entry at any point before submission.
- Gender is recorded as held in the civil register, including entries other
  than female and male.

## Not in scope

- The address itself (step 2)
- Notifying other authorities (happens after submission)
- Uploading documents

---

## Note on this example

The requirement says the form "must not ask about circumstances that do not
apply". That is the whole reveal rule, in one sentence — and it settles
nothing:

- What happens to an answer when a correction withdraws the field that held
  it? The spec says corrections must be possible; it does not say whether a
  correction is also a deletion.
- Does withdrawing a field withdraw its mandatory status? If not, a form can
  be blocked by a field nobody can see.
- What happens to child blocks when the number is reduced?
- Which salutation applies for an entry other than female or male — and does
  that produce a visibly different form for that person?

The last one is not a technical question. It is a decision about how the form
treats people, it has to be made by someone, and in a regulated setting it has
to be defensible afterwards. Today decisions like it are made in the
implementation, by whoever writes the branch.
