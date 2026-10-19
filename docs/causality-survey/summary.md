# Conjoint Variation Combinations

Source: `frontend/src/lib/conjoint.ts` → `CONJOINT_ATTRIBUTES`, `ENVIRONMENTS`,
and `CHOSEN_ACTIONS`.

## 3 × 2 banner conjoint × 2 within-subjects environment

The study runs a **3 × 2 = 6** banner-design conjoint, paired with a
**× 2** within-subjects environment factor that varies the surrounding
website context. Total cells: 3 × 2 × 2 = **12**, of which each participant
sees a 6-round subset (3 per environment block).

## Outcome variable

Each round produces a binary action:

- `chosen_action` ∈ `Accept | Reject`. The participant clicks one of the
  two real buttons on the rendered banner, and the click is the
  randomised-experiment outcome the CRE rubric expects. Banner design
  is the treatment, the click is the behavioural DV.

The action lets us estimate Accept rates by environment (`Clothing` vs.
`Currency Converter`) and the **environment × banner-design moderation**
that is the secondary analysis the rubric calls out.

| Factor | Levels | # | Type |
|---|---|---|---|
| Accept Color | Black, Grey, Outlined | 3 | Within-subjects, varied per round |
| Accept Position | Left, Right | 2 | Within-subjects, varied per round |
| Environment | Clothing, Currency Converter | 2 | Within-subjects, blocked into 3 rounds each |

**Banner combinations: 3 × 2 = 6.**
**Total cells across the design: 6 × 2 environments = 12.** The 12-cell
budget keeps the design powered for the H1' Color linear-trend and H2'
Position main effects at the realised n while leaving the H3'
Color × Environment moderation as an exploratory secondary test.

### Why these factors

- **Accept Color** is the visual-emphasis lever. Three levels (filled
  black, filled grey, outlined) let the analysis fit a linear-trend
  contrast (+1 / 0 / -1) as the primary H1' test and report pairwise
  steps (Black-vs-Grey, Grey-vs-Outlined) as a confirmatory secondary
  decomposition. Visual emphasis is the dark-pattern lever the
  literature centres on.
- **Accept Position** is the spatial-position lever. Two levels (Left
  of Reject vs Right of Reject) test the left-side bias of primary-action
  buttons in Western reading conventions. Independent of `acceptColor`
  by design, which is the methodological upgrade over the previous
  bundled "Accept Treatment" factor.
- **Environment** operationalises the contextual contrast the study
  cares about and delivers the "stated cookie benefit" framing the
  supervisor asked for so participants do not default to *Decline*. The
  banner body copy changes with the environment (see `BannerBody` in
  `cookie-banner/banner.tsx`):
  - `Clothing` is a fashion shop you might revisit. The banner states
    the benefit: "*We use cookies to remember your size, save items in
    your cart, and personalise recommendations across visits.*"
  - `Currency Converter` is a one-shot utility. The banner uses a
    generic "*Our website uses cookies… Privacy Policy.*" line because
    there is no plausible return-visit benefit to claim. Stating a fake
    benefit there would muddy the contrast.

### Within-subjects design

Each participant sees **6 rounds total: 3 in each environment**, blocked
by environment with a 50/50 coin flip on which one comes first. Blocking
(rather than alternating) lets the participant settle into one context
at a time so the contrast across blocks is salient. Order is
counter-balanced across participants to neutralise order effects.

Within each environment block, 3 of the 6 banner profiles are sampled
uniformly without replacement, so each participant sees 6 of the 12
design cells. Cell coverage is balanced across the participant pool by
the uniform sampling.

### Fixed baseline (not varied)

The remaining banner dimensions are pinned to a single level each so
every rendered banner shares the same framing. Only the two tested
banner dimensions move within an environment. Defined in `FIXED_LEVELS`
in `frontend/src/lib/conjoint.ts`:

| Dimension | Pinned level |
|---|---|
| Banner Position | Center Modal |
| Button Wording | Standard (`Accept cookies` / `Decline cookies`) |
| Visual Style | Minimalist |
| Granular Toggles | Hidden |

## Accept Color (visual emphasis)

| Level | Button rendering |
|---|---|
| Black | Filled-black background, white bold label, black border |
| Grey | Filled mid-grey background, white bold label, grey border |
| Outlined | White background, black bold label, black border (matches Reject) |

Reject is always rendered outlined (matching the Outlined Accept tone),
so the Color factor is a single-button manipulation on Accept.

## Accept Position

| Level | Button row layout |
|---|---|
| Left | `[Accept] [Decline cookies]` |
| Right | `[Decline cookies] [Accept]` |

Both buttons are real click targets. Clicking either fires
`onAction(action)` so the parent records the chosen behaviour
(`Accept` or `Reject`) and the time-to-click.

## Button Wording (fixed at Standard)

| Accept | Reject |
|---|---|
| Accept cookies | Decline cookies |

## Environment mocks

The two host-site backdrops live in
`frontend/src/components/cookie-banner/storefront.tsx` and are blurred so
the cookie banner stays the focal point.

| Environment | Mock | Returning-visit value |
|---|---|---|
| Clothing | "Linen & Co." 3-product grid with size pills, price chrome | High — sizes, preferences, cart |
| Currency Converter | "RateCalc" with EUR ↔ USD inputs, swap button, live rate | Low — single-shot utility |

The clothing catalogue (`CLOTHING_PRODUCTS`) and the FX pair
(`CURRENCY_PAIR`) are defined in `frontend/src/lib/constants.ts`.

## Visual design language

The cookie-banner UI is implemented from the team's reference design
language. Every shared visual decision below ties back to those mocks:

| Element | Style |
|---|---|
| Card | White background, rounded-xl, soft shadow, subtle border + ring |
| Heading | Bold dark navy (`#1a1535`), tight tracking |
| Body copy | Lavender-muted (`#6b6884`), small leading-snug |
| Cookie icon | Cookie glyph in a soft-grey rounded square |
| Privacy link | Sky-blue (`#2da4ee`), underlined |
| Black CTA | Solid black background, white bold label, rounded-md |
| Grey CTA | Solid mid-grey background, white bold label, rounded-md |
| Outlined CTA | White background, black border, black bold label, rounded-md |

Components live under `frontend/src/components/cookie-banner/`:

- `banner.tsx` — card chrome, header (icon + title), body copy and
  the positional wrapper.
- `buttons.tsx` — CTA composition: maps `(acceptColor, acceptPosition)`
  to the three-tone button system above.
- `storefront.tsx` — picks the clothing or currency-converter mock based
  on the round's `environment`.
- `index.tsx` — composes the option card, taking `profile` and
  `environment` together so the same banner can be rendered against
  either context.

## Wire format / DB schema

`api/src/index.ts` and `database/create.sql` are aligned: the two varied
banner attributes (`accept_color`, `accept_position`), `environment`,
plus the outcome column (`chosen_action`) are persisted per round. The
fixed baseline is implicit from the study design and does not occupy DB
columns.

`chosen_action` is checked at the DB layer to one of `Accept | Reject`
and is also validated by the Worker before any insert.
