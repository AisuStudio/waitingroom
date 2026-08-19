# waitingroom

A holding room for behaviour rules — the step between a specification and a
built component.

## What this is not

**It is not production code.** Nothing here is meant to be shipped, copied
into an application, or held to production standards. If it looks like a
delivery, that is a bug in the presentation.

It is also not a component library. The components in the target environment
come from a component library; this repository does not compete with it.

## What it is for

A component library gives you a radio group and a select. A colour system
tells you what they look like. Neither tells you **when to use which** — that
from five options on, a radio group becomes a select; that a person's surname
is never truncated; that a single option is not a choice at all.

Those decisions are project-specific. They are usually made silently: in a
Figma file, in an implementation, in a chat message. Nowhere are they written
down in a form that can be run, reviewed, or defended.

The waitingroom is where a rule becomes:

| | |
|---|---|
| **executable** | a prototype that actually applies it, with a control panel to drive it past its own thresholds |
| **readable** | stated, justified, with its edge cases — and with what it does *not* answer |
| **traceable** | who decided what, when, and on what basis |

## The one question

Everything here aims at a single question, asked of the engineer who would
build the component:

> **"Could you build this from it, without asking the designer?"**

Every "no, I'd still need…" is a line missing from the rule. That is the
measurement; the prototype is only the means.

## What is in here

Two rules, deliberately of different types — the format has to carry more than
one shape of decision:

| Component | Rule type | The question it settles |
|---|---|---|
| **Purpose selection** | threshold | Which control at which number of options |
| **Change of address** | state dependency | Which fields appear, and what happens to an answer when a field is withdrawn |
| **Waiting list** | space conflict | What gives way when a person's name does not fit the column |

The third is the one with consequences outside the screen: a truncated name can
identify the wrong person, or nobody. Its rule is a ladder of sacrifices —
drop the original-script form, then abbreviate given names, then wrap — with
the family name out of bounds throughout. The sample names come from several
naming systems on purpose: a rule that only works on short two-part names is
not a rule, it is an assumption that fails silently for everyone else.

The second one is the harder test of the format itself. Its conditions are declared as data, so the
same declaration drives the prototype, reads as a table, and exports to
markdown — instead of a reader having to parse an if-chain. And its central
promise is not the reveal but the **retention**: someone who picks "married",
enters a partner, then corrects the entry to "single" has made a correction,
not a request to delete data. Switch back and the entry is still there.

## Structure

```
rules/          the rules. One file per rule — the single source.
components/     prototypes that consume the rules and decide nothing themselves
spec/           example specification (in real use: linked, not copied)
docs/           generated from rules/ — never edited by hand
```

Each rule carries four fields plus its logic:

| Field | Purpose |
|---|---|
| `rule` | what applies, in one sentence |
| `rationale` | why — the part that defends the control in an audit |
| `edgeCases` | the part that saves the engineer a question |
| `provenance` | who decided what, when. A list, not a single entry |

Plus `openQuestions`: what the specification leaves undecided. **These are
asked, never invented.** A plausible-looking answer that nobody actually chose
is worse than an open question, because it looks like a decision.

## One source, four outputs

The prototype, the rule text and the code snippet all come from the same file.
Change `threshold` in `rules/selection.js` and all three change together.
There is no second place to keep in sync — the drift this repository is
designed against is the same drift it must not contain itself.

The code snippet is deliberately framework-neutral: the decision, not the
rendering. It should still hold when a component library moves a major
version.

## Colour

Three tiers — primitive → semantic → component — rebuilt to match the target
environment rather than to propose an alternative. Primitives are Radix
scales. Only the semantic tier repoints between light and dark; no component
variable is touched.

## Running it

Static files, no build. Serve the directory and open `index.html`:

```bash
python3 -m http.server 8099
```

## Data

All sample data is synthetic — an invented citizen registration office. The
domain was chosen because it has the same shape as a clinical waiting list
(person, number, purpose, status, desk) while touching nothing confidential.
No real people, no real cases.
