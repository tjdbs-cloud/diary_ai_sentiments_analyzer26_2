---
name: Luminous Sanctuary
colors:
  surface: '#faf9ff'
  surface-dim: '#dad9df'
  surface-bright: '#faf9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f3f9'
  surface-container: '#eeedf3'
  surface-container-high: '#e8e7ed'
  surface-container-highest: '#e2e2e8'
  on-surface: '#1a1b20'
  on-surface-variant: '#484555'
  inverse-surface: '#2f3035'
  inverse-on-surface: '#f1f0f6'
  outline: '#787586'
  outline-variant: '#c9c4d7'
  surface-tint: '#5c42da'
  primary: '#5a3fd8'
  on-primary: '#ffffff'
  primary-container: '#735bf2'
  on-primary-container: '#fffbff'
  inverse-primary: '#c8bfff'
  secondary: '#9f4122'
  on-secondary: '#ffffff'
  secondary-container: '#fd8863'
  on-secondary-container: '#722104'
  tertiary: '#7f5200'
  on-tertiary: '#ffffff'
  tertiary-container: '#a06900'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e5deff'
  primary-fixed-dim: '#c8bfff'
  on-primary-fixed: '#1a0064'
  on-primary-fixed-variant: '#4421c2'
  secondary-fixed: '#ffdbd0'
  secondary-fixed-dim: '#ffb59e'
  on-secondary-fixed: '#3a0b00'
  on-secondary-fixed-variant: '#7f2a0d'
  tertiary-fixed: '#ffddb4'
  tertiary-fixed-dim: '#ffb954'
  on-tertiary-fixed: '#291800'
  on-tertiary-fixed-variant: '#633f00'
  background: '#faf9ff'
  on-background: '#1a1b20'
  surface-variant: '#e2e2e8'
typography:
  display-lg:
    fontFamily: Manrope
    fontSize: 3.5rem
    fontWeight: '700'
    lineHeight: 4rem
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Manrope
    fontSize: 2.25rem
    fontWeight: '600'
    lineHeight: 2.75rem
    letterSpacing: -0.015em
  headline-lg-mobile:
    fontFamily: Manrope
    fontSize: 1.75rem
    fontWeight: '600'
    lineHeight: 2.25rem
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Manrope
    fontSize: 1.5rem
    fontWeight: '600'
    lineHeight: 2rem
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Manrope
    fontSize: 1.25rem
    fontWeight: '600'
    lineHeight: 1.75rem
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 1.125rem
    fontWeight: '400'
    lineHeight: 1.75rem
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 1rem
    fontWeight: '400'
    lineHeight: 1.5rem
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 0.875rem
    fontWeight: '400'
    lineHeight: 1.25rem
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 0.875rem
    fontWeight: '600'
    lineHeight: 1.25rem
    letterSpacing: 0.01em
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 0.75rem
    fontWeight: '500'
    lineHeight: 1rem
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 0.6875rem
    fontWeight: '500'
    lineHeight: 0.875rem
    letterSpacing: 0.025em
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 3rem
  margin-mobile: 1.25rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system crafts an empathetic, contemplative digital sanctuary for an AI Emotional Diary. It translates inner self-reflection into a serene, tactile ritual inspired by modern tonal Material You philosophies. 

The aesthetic is luminous, comforting, and organic. Rather than clinical health tech or sterile productivity aesthetics, the interface leans into restorative emotional warmth, soft-lit volumetric surfaces, and pill-shaped touchpoints. Visual layering relies on delicate chromatic shifts and gentle contrasts to create an unhurried, reassuring psychological space where vulnerability feels safe and celebrated.

## Colors

The palette balances introspective serenity with radiant warmth:
- **Primary (`#735BF2` - Luminous Periwinkle-Violet):** Represents mindful awareness, intuitive reflection, and clarity. Serves as the principal visual anchor for primary actions, reflective highlights, and focused states.
- **Secondary (`#FF8A65` - Soft Sunset Coral):** Expresses emotional vitality, empathy, and active sentiment triggers. Used for warm interactive highlights and mood milestones.
- **Tertiary (`#FFB74D` - Warm Amber Glow):** Provides soft daylight contrast, emotional uplift, gentle reminders, and positive trend indicators.
- **Neutral (`#F7F6FC` - Soothing Lavender White):** Anchors the tonal background ecosystem, shifting subtly across surface container tiers (`#FFFFFF` for top-level cards, `#F0EEFA` for recessed wells) to create softness without harsh borders.

## Typography

Typography establishes an intimate, conversational cadence. 

- **Headlines (`Manrope`):** Geometric yet gentle, Manrope delivers an approachable, modern editorial presence. It grounds introspective reflection titles and emotional prompt headlines with calm dignity.
- **Body & Labels (`Plus Jakarta Sans`):** Soft, open, and organically curved letterforms ensure effortless readability across extended reflective journaling entries, AI synthesis narratives, and interface chips.
- Letter spacing is tightened slightly on large display levels to create cohesive header locks, while micro-labels retain slight tracking for clarity within pill shapes.

## Layout & Spacing

The layout employs a comfortable, centered fluid grid designed to prevent eye fatigue during vulnerable writing states:
- **Desktop (1024px+):** Centered max-width containers (up to 1200px) structured on a 12-column layout with 24px (`1.5rem`) gutters and generous 48px (`3rem`) page margins.
- **Tablet (600px - 1023px):** 8-column layout with 24px (`1.5rem`) gutters and 32px (`2rem`) margins.
- **Mobile (Below 600px):** 4-column layout with 16px (`1rem`) gutters and 20px (`1.25rem`) safe outer margins.
- **Spacing Rhythm:** Internal spacing adheres to an 8px base rhythmic scale, reserving generous vertical breathing room (`space-xl`) between journal entry sections to keep the visual field uncluttered and soothing.

## Elevation & Depth

Spatial depth relies on Material 3 tonal surface stacking complemented by ultra-soft, violet-tinted ambient glows:
- **Surface Layering:** The primary canvas rests on neutral `#F7F6FC`. Layered containers rise upward through `#FFFFFF` (Surface High) and `#EDE8FC` (Surface Variant). Higher structural importance is communicated via luminance rather than heavy drop shadows.
- **Ambient Shadow Character:** When elevation is required for floating navigation, emotional modals, or active journal cards, shadows cast an expansive, low-opacity hue: `0 8px 32px -4px rgba(115, 91, 242, 0.08)` and `0 2px 8px -2px rgba(115, 91, 242, 0.04)`.
- **Soft Tonal Outlines:** To maintain clean differentiation without visual harshness, surfaces use hairline boundaries tinted with 8% primary opacity (`rgba(115, 91, 242, 0.08)`).

## Shapes

The visual language embraces fluid, continuous curvature to foster emotional ease and accessibility:
- **Pill Geometry (`9999px`):** Applied uniformly to interactive chips, primary buttons, input pill wrappers, and status indicators.
- **Surface Radii:** Journal prompts, entry cards, and modal sheets utilize generous `rounded-lg` (32px / 2rem) and `rounded-xl` (48px / 3rem) corner transitions, echoing pebble-smooth, tactile forms found in calming natural landscapes.

## Components

- **Buttons:** 
  - *Filled:* Full-bleed `#735BF2` background with `#FFFFFF` text, fully pill-shaped (`rounded-full`), transitioning to a warm tinted halo on press.
  - *Tonal:* Soothing `#E8E2FD` background with `#4D38B8` text for low-pressure secondary actions (e.g., "Save Draft", "Skip Prompt").
- **Interactive Chips & Emotion Tags:** Pill-shaped capsules with light lavender and soft amber tonal fills (`#FFF0EB` for warmth, `#ECE8FD` for calm). Selected states display a subtle 1.5px primary border with a gentle scale transition.
- **Journal Cards:** Generously rounded (`rounded-2xl` to `rounded-3xl`) white containers set against the lavender-tinted canvas, separated by 1px ghost borders (`rgba(115, 91, 242, 0.08)`).
- **Input Fields & Writing Area:** Seamless, borderless-feel writing zones enclosed within soft rounded surfaces, featuring pill-shaped search bars and voice-dictation pills.
- **Checkboxes & Radios:** Rounded circular selectors featuring smooth ease-in transitions filled with primary violet when checked.
- **AI Sentiment Synthesis Pill:** Dedicated ambient component featuring a gentle periwinkle-to-amber gradient glow, surfacing empathetic reflections and mood trajectories.