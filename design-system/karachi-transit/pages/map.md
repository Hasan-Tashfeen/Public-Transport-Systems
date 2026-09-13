# Page Override: Map (Karachi Transit)

> This page overrides `design-system/karachi-transit/MASTER.md`. When building the map,
> editor, route/stop detail, or search UI, these rules take precedence.

## Why this override

The generated Master targets a marketing page and a neubrutalist display font. This
product is an interactive **wayfinding tool** styled after New York (MTA) transit
signage, so the following are corrected.

## Typography (override)

- **Signage / headings**: Barlow Condensed, weight 600–700, uppercase, tight tracking
  (`letter-spacing: -0.01em`).
- **Body / UI**: Inter, weights 400–600.
- Load via Google Fonts:
  `https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap`
- Base body size 16px, line-height 1.5.

## Style (override)

- **Minimalism & Swiss Style**: strict grid, generous white space, flat surfaces,
  no decorative shadows, high contrast.
- Ignore the Master's "Product Demo + Features" page pattern; it does not apply.
- Motion: subtle, 150–250ms ease; respect `prefers-reduced-motion`.

## Color tokens

Keep the Master palette, and add MTA-derived transit tokens:

| Token | Hex | Use |
|-------|-----|-----|
| `--color-primary` | `#2563EB` | Primary actions, focus ring |
| `--color-background` | `#F8FAFC` | App background |
| `--color-foreground` | `#0F172A` | Primary text |
| `--color-brt` | `#00933C` | BRT mode / route bullets |
| `--color-bus` | `#0039A6` | Bus mode / route bullets |
| `--color-minibus` | `#FF6319` | Minibus mode / route bullets |
| `--color-signage` | `#000000` | Signage text on white |

## Component rules (transit-specific)

- **Route bullets**: circular badges with the route number/letter in white on the
  route color; minimum 24px, 44px hit target when interactive.
- **Mode encoding**: never rely on color alone — pair each mode with its label and a
  distinct bullet shape/icon (FR-018).
- **Stop suggestions (combobox)**: visible label, listbox with `aria-activedescendant`,
  keyboard up/down/enter/escape, selected row ≥44px, area shown as secondary text.
- **Map overlays**: white cards with 1px `--color-border`, no heavy shadows; keep the
  basemap legible under route lines.

## Pre-delivery checklist

Use the Master's checklist plus: 4.5:1 contrast for all text and labels; focus visible
on every control; no horizontal scroll at 375px, 768px, 1024px, 1440px.
