# Spec — Purpose selection

> Synthetic example. In the real flow this document lives in the team's own
> system and is only *linked* from here, never copied. It is reproduced in the
> repository so the whole chain can be walked through end to end.

**Ticket:** WR-104
**Screen:** Check-in terminal, step 2 of 4
**Status:** approved

---

## Requirement

When checking in, a visitor selects the service they are here for. The
selection is mandatory; the visitor cannot continue without one.

The available services depend on the office. Not every location offers every
service, and the list is maintained by administration — it changes without a
release.

The selected service determines which desk the visitor is routed to and how
much time is reserved for them.

## Acceptance criteria

- The visitor can select exactly one service.
- Only services offered by the current location are shown.
- Continuing without a selection is not possible.
- The selection is visible on the confirmation screen in step 4.

## Not in scope

- Searching within the service list
- Multiple services in one visit

---

## Note on this example

This is what a specification usually looks like: it states **what** must be
possible, not **how** it is presented. That is not a flaw — a spec that
prescribed the control would be overreaching into design.

But it means the behaviour is undefined. The spec does not say:

- which control is used, and whether that depends on the number of services
- what happens when a location offers only one service
- what happens when it offers none
- in what order the services appear
- whether one is preselected

Every one of those is a decision someone has to make and, in a regulated
setting, be able to defend. Today they are made silently — in Figma, in the
implementation, or in a chat message. The waitingroom is where they get
written down instead, alongside a prototype that executes them.
