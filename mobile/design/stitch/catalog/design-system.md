# PetCare Stitch Design System

## 1. Source of Truth

Primary visual source:
- `01-design-system/petcare_design_system/`
- `01-design-system/warm_pet_trust/DESIGN.md`
- Cross-check: `05-flows/DESIGN.md`

Supporting visual references:
- `01-design-system/petcare_brand_logo/`
- `01-design-system/petcare_design_system/`
- `02-components/petcare_reusable_component_library/`

Implementation target:
- React Native / Expo
- Design tokens in `src/core/theme/`

Important:
- `screen.png` is a visual reference only.
- `code.html` is a web rendering reference, not React Native source.
- The backend remains the business source of truth.
- Stitch values below should be treated as canonical unless a later approved Stitch design explicitly supersedes them.

---

## 2. Brand & Visual Direction

Name: **PetCare**

Visual personality:
- Warm
- Empathetic
- Credible
- Modern lifestyle
- Human-centric
- Trust-first
- Pet-friendly without looking childish

Core visual principles:
- Generous whitespace
- Softened edges
- Rich earthy primary colors
- Tactile but subtle depth
- Organic pill geometries
- Clean editorial presentation
- Human-centric photography
- Strong safety / verification cues

Avoid:
- Cartoon-heavy visual language
- Cold corporate gray UI
- Excessive gradients
- Excessive shadows
- Inconsistent radii

---

## 3. Color Tokens

### Primary

| Token | Value | Usage |
|---|---|---|
| `primary.default` | `#FF6B4A` | Main CTA, brand accent, primary actions |
| `primary.container` | `#FFEAE4` | Soft primary backgrounds |
| `primary.active` | `#D94827` | Pressed / active primary state |

### Secondary

| Token | Value | Usage |
|---|---|---|
| `secondary.default` | `#2D8A68` | Trust, verified state, positive actions |
| `secondary.container` | `#E6F5EF` | Verification / success containers |
| `secondary.active` | `#1E6148` | Pressed / strong contrast green |

### Accent

| Token | Value | Usage |
|---|---|---|
| `accent.default` | `#F5A623` | Rating, progression, caution / pending |

### Neutral

| Token | Value | Usage |
|---|---|---|
| `background.default` | `#FCFBF9` | App background |
| `surface.default` | `#FCFBF9` | Default surface |
| `surface.subdued` | `#F7F4EF` | Secondary / muted surface |
| `border.subdued` | `#EFECE6` | Low emphasis borders |
| `border.default` | `#E2DDD6` | Standard borders |
| `text.primary` | `#1A1613` | Primary text |
| `text.secondary` | `#3A352F` | Secondary text |
| `text.muted` | `#8C857B` | Hints / metadata |

### Semantic

| Token | Value | Container |
|---|---|---|
| `semantic.success` | `#2D8A68` | `#E6F5EF` |
| `semantic.warning` | `#F5A623` | `#FEF6E7` |
| `semantic.error` | `#E53935` | `#FDEBEB` |
| `semantic.info` | `#2575FC` | `#EBF3FF` |

### Additional values visible in the master flow design

`05-flows/DESIGN.md` also contains a Material-style semantic palette:
- `surface`: `#fff8f5`
- `on-surface`: `#1f1b18`
- `on-surface-variant`: `#59413c`
- `primary`: `#ae3115`
- `primary-container`: `#ff6b4a`
- `secondary`: `#006c4d`
- `secondary-container`: `#9af5cc`
- `tertiary-container`: `#d38b00`
- `error`: `#ba1a1a`

Recommendation:
- Use the explicitly documented `warm_pet_trust` product tokens (`#FF6B4A`, `#2D8A68`, etc.) as the main application palette.
- Keep the Material-style values as semantic/contrast references only unless the visual design clearly uses them.

---

## 4. Typography

Font family:
**Plus Jakarta Sans**

### Scale

| Token | Size | Weight | Line Height | Tracking |
|---|---:|---:|---:|---:|
| `display` | 32px | 700 | 40px | -0.02em |
| `h1` | 28px | 700 | 36px | -0.015em |
| `h2` | 24px | 600 | 32px | -0.01em |
| `h3` | 20px | 600 | 28px | -0.005em |
| `h4` | 18px | 600 | 24px | 0 |
| `bodyLg` | 16px | 400 | 24px | 0 |
| `bodyLgMedium` | 16px | 500 | 24px | 0 |
| `bodyMd` | 14px | 400 | 20px | 0 |
| `bodyMdMedium` | 14px | 500 | 20px | 0 |
| `bodySm` | 13px | 400 | 18px | 0 |
| `button` | 15px | 600 | 20px | 0.01em |
| `input` | 15px | 400 | 20px | 0 |
| `caption` | 12px | 500 | 16px | 0 |
| `label` | 11px | 600 | 14px | 0.04em |

Usage:
- Display / headings: onboarding, dashboard greetings, provider profile hero
- Body: service details, notes, chat, checklists
- Labels: metadata, trust indicators, compact statuses

---

## 5. Spacing

Base system:
- 8pt grid
- 4pt sub-grid for icons, input padding, badge internals

### Recommended tokens

| Token | Value |
|---|---:|
| `space.1` | 4px |
| `space.2` | 8px |
| `space.3` | 12px |
| `space.4` | 16px |
| `space.5` | 20px |
| `space.6` | 24px |
| `space.8` | 32px |
| `space.10` | 40px |
| `space.12` | 48px |

Mobile:
- Outer margin / gutter: 16px
- Standard section gap: 16px
- Compact card padding: 16px
- Featured card padding: 20px
- Critical bottom action area: target 48–56px safe-area-aware height

---

## 6. Radius / Shapes

| Token | Value | Usage |
|---|---:|---|
| `radius.sm` | 8px | Inputs/chips/thumb containers |
| `radius.md` | 12–16px | Inputs / standard cards |
| `radius.lg` | 24px | Bottom sheets / featured containers |
| `radius.full` | 9999px | Pills, buttons, segmented controls |

General rule:
- Inputs: 12px
- Cards: 16px
- Bottom sheet top corners: 24px
- Pill controls: full radius

---

## 7. Elevation / Shadows

### Level 0
No cast shadow; use warm surface + 1px border.

### Level 1
`0 1px 3px rgba(26,22,19,0.06), 0 1px 2px rgba(26,22,19,0.04)`

Use:
- list cards
- standard chips
- focused / elevated inputs

### Level 2
`0 4px 12px rgba(26,22,19,0.08), 0 2px 4px rgba(26,22,19,0.04)`

Use:
- active booking cards
- provider profile summaries
- floating date pickers

### Level 3
`0 10px 24px rgba(26,22,19,0.12), 0 4px 8px rgba(26,22,19,0.06)`

Use:
- bottom sheets
- dialogs
- floating bars / FABs
- high-priority overlays

---

## 8. Buttons

### Primary
- Background: `primary.default`
- Text: white
- Pressed: `primary.active`
- Radius: full pill or 16px depending on placement
- Elevation: level 1

### Secondary
- Background: `secondary.default`
- Text: white
- Pressed: `secondary.active`

### Outline
- Transparent background
- 1.5px border: `border.default`
- Text: `text.primary`
- Pressed background: `surface.subdued`

### Ghost
- Transparent
- Text: primary or text primary
- Use for secondary actions, Skip, inline controls

### FAB
- 56 × 56px
- Circular
- Primary coral
- Level 3 elevation

---

## 9. Form Controls

Standard input:
- Height: 48px
- Background: `surface.default`
- Border: 1px `border.default`
- Radius: 12px

Focused:
- Border: 2px `primary.default`
- Focus ring: `primary.container`

Error:
- Border: 1.5px `semantic.error`
- Error surface based on `semantic.error` container
- Helper text in error color

OTP:
- 48 × 56px boxes
- Radius: 12px
- Centered value

---

## 10. Status Badges

Base:
- Height: 24px
- Horizontal padding: 8px
- Radius: full
- Leading icon: about 12px
- Label: about 11px semibold

### Trust

Verified Provider:
- Container `#E6F5EF`
- Text `#1E6148`
- Shield/check icon

Identity / Background Checked:
- Container `#F7F4EF`
- Text `#3A352F`
- ID/lock icon

Top Rated:
- Container `#FEF6E7`
- Text `#C78210`
- Star icon

### Booking

Requested:
- Background `#FEF6E7`
- Text `#C78210`

Confirmed / In Progress:
- Background `#E6F5EF`
- Text `#1E6148`

Completed:
- Background `#EFECE6`
- Text `#3A352F`

Canceled:
- Background `#FDEBEB`
- Text `#E53935`

---

## 11. Cards & Media

Base card:
- White or warm white
- 1px `border.default`
- 16px radius
- Level 1 elevation

Media:
- Pet avatar: 1:1
- Pet showcase card: 4:3
- Provider portfolio: 16:9
- KYC / certification preview: 3:4

---

## 12. Map System

Provider pin:
- 40 × 40px
- Coral ring
- White core
- Provider avatar or category glyph
- Level 2 elevation

Service radius:
- Coral 12% opacity
- Dashed 1.5px coral border

Tracking route:
- Sage `#2D8A68`
- 4px stroke

Travel duration pill:
- Dark charcoal background
- White text
- Level 3 elevation

---

## 13. Iconography

Use a single coherent icon family/weight.

Important semantic icons:
- Home
- Explore/Search
- Calendar
- Clock
- Location
- Navigation
- Paw/Pet
- User
- Provider
- Star
- Bell
- Chat
- Camera
- Gallery
- Video
- Upload
- Wallet
- Payment
- Bank
- Shield
- Verification
- Check
- Warning
- Error
- Success
- Filter
- Settings
- Support

---

## 14. Accessibility / Interaction

The master flow design explicitly calls for:
- 48pt minimum interactive targets across 375–430pt viewports
- Strong contrast
- Clear semantic states
- Safe-area-aware bottom actions

Do not rely on color alone to communicate status.

---

## 15. Canonical React Native Mapping

Recommended code mapping:

- `colors.*` → `src/core/theme/colors.ts`
- typography tokens → `src/core/theme/typography.ts`
- spacing → `src/core/theme/spacing.ts`
- radius → `src/core/theme/radius.ts`
- shadows → `src/core/theme/shadows.ts`
- dimensions → `src/core/theme/dimensions.ts`

Do not hard-code repeated token values inside screens.
