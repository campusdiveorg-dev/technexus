---
name: Lumina Tech
colors:
  surface: '#f9f9ff'
  surface-dim: '#d8d9e5'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f1f3fe'
  surface-container: '#ecedf9'
  surface-container-high: '#e6e8f3'
  surface-container-highest: '#e0e2ed'
  on-surface: '#181c23'
  on-surface-variant: '#414755'
  inverse-surface: '#2d3039'
  inverse-on-surface: '#eef0fc'
  outline: '#717786'
  outline-variant: '#c1c6d7'
  surface-tint: '#005bc1'
  primary: '#0058bc'
  on-primary: '#ffffff'
  primary-container: '#0070eb'
  on-primary-container: '#fefcff'
  inverse-primary: '#adc6ff'
  secondary: '#8c5000'
  on-secondary: '#ffffff'
  secondary-container: '#fda548'
  on-secondary-container: '#6e3d00'
  tertiary: '#9e3d00'
  on-tertiary: '#ffffff'
  tertiary-container: '#c64f00'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#adc6ff'
  on-primary-fixed: '#001a41'
  on-primary-fixed-variant: '#004493'
  secondary-fixed: '#ffdcbf'
  secondary-fixed-dim: '#ffb873'
  on-secondary-fixed: '#2d1600'
  on-secondary-fixed-variant: '#6a3b00'
  tertiary-fixed: '#ffdbcc'
  tertiary-fixed-dim: '#ffb595'
  on-tertiary-fixed: '#351000'
  on-tertiary-fixed-variant: '#7c2e00'
  background: '#f9f9ff'
  on-background: '#181c23'
  surface-variant: '#e0e2ed'
  electric-blue: '#00D1FF'
  midnight-navy: '#0A192F'
  surface-frost: '#F8FAFC'
  glass-highlight: rgba(255, 255, 255, 0.7)
typography:
  display-hero:
    fontFamily: Plus Jakarta Sans
    fontSize: 64px
    fontWeight: '800'
    lineHeight: 72px
    letterSpacing: -0.02em
  display-hero-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '800'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-caps:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.08em
  spec-mono:
    fontFamily: Hanken Grotesk
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 18px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  section-gap: 80px
  grid-gutter: 24px
  container-padding: 32px
  card-inset: 20px
---

## Brand & Style

The design system evolves the "Midnight & Electric" identity from a rigid, industrial aesthetic into a warm, approachable marketplace. It targets tech-savvy consumers who value both high-performance specs and high-quality user experiences.

The visual style is **Soft-Tech Minimalism** with a focus on **Glassmorphism**. It combines clean, expansive white spaces with vibrant electric accents to maintain a sense of innovation without the aggressive coldness typical of pro-grade hardware sites. The UI should feel like a high-end physical space: airy, illuminated, and tactile. High-quality hardware photography is the centerpiece, treated with soft-focus backgrounds and natural lighting to emphasize premium build quality and "human-centric" engineering.

## Colors

The palette transitions from dark-mode dominant to a light-forward experience. **Midnight Navy** is reserved for high-contrast elements like the footer, top-level navigation headers, or deep-shadow text to provide professional gravity. 

**Electric Blue** serves as the primary driver for interaction and highlights, while a warm **Amber/Gold** is introduced for secondary actions and "warmth" signals (ratings, sales, and special offers). Backgrounds should primarily use **Surface Frost**, a near-white gray that reduces eye strain while maintaining a crisp, modern look. Glassmorphic layers use semi-transparent white with high-saturation blurs to create depth.

## Typography

This design system uses **Plus Jakarta Sans** for headlines and body text to leverage its friendly, rounded terminals and modern geometric proportions. It provides the "welcoming" character requested while maintaining the efficiency of a high-performance typeface.

**Hanken Grotesk** is utilized for technical labels and product specifications. Its slightly more technical and condensed structure allows for clear data presentation (like "144Hz 4K") without feeling out of place. Headlines should utilize tight letter-spacing and heavy weights to command attention, while body copy remains generous in line-height to ensure a clutter-free, breathable reading experience.

## Layout & Spacing

The layout follows a **12-column fluid grid** for desktop, collapsing to a **4-column grid** for mobile. The philosophy emphasizes "Breathing Room" — avoiding the typical density of e-commerce sites in favor of a curated, gallery-like feel.

- **Desktop Breakpoint:** 1440px+ (Center-aligned container with 1200px max-width).
- **Tablet Breakpoint:** 768px - 1024px (Fluid margins, 24px).
- **Mobile Breakpoint:** Under 768px (16px margins).

Vertical spacing between sections is intentionally large (80px+) to distinguish "Curated Collections" from "Trending Now," preventing the user from feeling overwhelmed by choice.

## Elevation & Depth

Hierarchy is established through **Soft Depth (Claymorphism)** and **Tonal Layering**. 

1.  **Level 0 (Background):** Solid `surface-frost`.
2.  **Level 1 (Cards/Containers):** Pure white background with a very soft, large-radius shadow (`rgba(0,0,0,0.04)` with 40px blur).
3.  **Level 2 (Active/Floating):** Glassmorphic surfaces with a 20px backdrop blur and a 1px inner border (`glass-highlight`) to simulate the edge of a lens.

Shadows should never be harsh or black; instead, use a slight tint of the brand's navy or blue to keep the shadows "cool" and integrated with the palette.

## Shapes

The design system utilizes **Rounded (Level 2)** shapes to achieve the "friendly and welcoming" goal. 

- **Cards and Hero Containers:** Use `rounded-xl` (24px) to create a soft, inviting frame for hardware images.
- **Buttons and Inputs:** Use `rounded-lg` (16px) for a modern, approachable feel that isn't as aggressive as a full pill shape.
- **Badges/Tags:** Use `rounded-sm` (4px) or full pill-shaped for technical specs to distinguish them from interactive buttons.

## Components

### Buttons
- **Primary:** Electric blue background, white text, `rounded-lg`. Uses a subtle inner glow to feel "powered on."
- **Secondary:** Transparent background with a `Midnight Navy` or `Electric Blue` thin border.
- **Warm Action:** Use the amber accent color for "Limited Edition" or "Add to Cart" triggers to create a high-visibility, welcoming prompt.

### Product Cards
Cards feature a high-quality product image at the top with a subtle 5% scale hover effect. Technical specs (e.g., "ANC", "Titanium") are placed as small, semi-transparent glass badges in the top-left corner of the image.

### Search & Navigation
The search bar should be centered and prominent, featuring a glassmorphic background. Navigation links use `label-caps` typography with an electric blue underline indicator for the active state.

### Input Fields
Fields use a solid white background with a soft 1px border. On focus, the border transitions to `Electric Blue` with a 4px soft outer glow.