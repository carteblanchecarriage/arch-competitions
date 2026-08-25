# Cargo.site — Visual Identity Reference

Source: https://cargo.site  
Category: Portfolio / creative studio site builder  
Why it's here: Best-in-class editorial typography and layout discipline for design-audience sites.

---

## What Makes It Work

Cargo is the de-facto standard for how serious designers and studios present work online. The site itself functions as the strongest possible argument for the platform — every typographic and spatial decision is intentional and worth studying.

---

## Typography

### Foundry partnership
Cargo has an exclusive deal with [Dinamo](https://abcdinamo.com) (Berlin-based type foundry). Three families are the backbone of the aesthetic:

| Font | Character | Use |
|---|---|---|
| **ABC Favorit** | Technical, expressive, subtly odd | Display, large headlines, personality moments |
| **ABC Monument Grotesk** | Confident, Helvetica-like, sturdy | UI labels, body text, dependable workhorses |
| **ABC Diatype** | Smooth, warm, elegant | Body copy, captions, anything needing friendliness |

All three have **Mono** and **Semi-Mono** variants — monospace is not an afterthought, it's part of the system.

All three are **variable fonts** — weight, width, slant are axes, not fixed weights.

### How the type hierarchy works

- **Nav labels**: small, tight tracking, often uppercase or mixed-case sans — reads fast, never decorative
- **Hero / display**: large, generous leading, set at a size that owns the viewport
- **Body**: comfortable reading size (~17–19px), generous line-height (1.6–1.7), minimal tracking
- **Metadata / captions**: monospace or semi-mono, small, set apart from editorial text
- **Back arrows and directional marks** (← ↗): used as functional typographic elements, not icons

### Rules to internalize

1. **One type family per register.** Don't mix grotesques in the same block of text. Favor system does one thing; Monument does another.
2. **Size contrast is the hierarchy.** Cargo sites go big/small, not medium/medium-bold.
3. **Tracking on caps only.** Loose letter-spacing is reserved for uppercase labels. Body copy and mixed-case titles track tight.
4. **Mono for data.** Dates, file sizes, codes, metadata — all in the mono variant of whatever family you're using.

---

## Layout

### Grid philosophy
- **Not a 12-column grid.** Cargo layouts often use asymmetric divisions — a wide content zone and a narrow margin, or full-bleed with internal padding.
- **Whitespace is load-bearing.** The empty space around content is deliberate and substantial — it tells the reader where to look.
- **Progressive disclosure.** Categories before items. Overview before detail. Never show everything at once.

### Navigation pattern
- Top nav: horizontal, left-aligned labels (Templates · Community · Information) + right-aligned auth (Start · Login ↗)
- Back-navigation: `←` as text, not an icon component
- External links: `↗` suffix, no underline, no icon component
- Mobile: collapses but keeps the same typographic character

### Content rhythm
- Sections don't stack symmetrically — they alternate scale: large block, small text aside, large image, caption
- The Dinamo visual identity uses a "coin" motif (circular, singular) — a lesson in building an identity around one very specific shape
- Template thumbnails: consistent ratio, generous gap, no borders or drop shadows

---

## Color

Extreme restraint:
- Background: white or near-white
- Text: near-black (not pure #000)
- Accent: one color used sparingly — in the Cargo/Dinamo campaign, **Dinamo green** (#C8FF00 or similar YG) against dark backgrounds
- No gradients. No texture fills. No decorative color.

The single-accent approach means the accent actually works when it appears.

---

## Spacing Rhythm

Cargo's spacing is not 8px-base-grid mechanical. It uses optical spacing — what looks right, not what the grid says:
- Generous top/bottom margin on sections (often 10–15% of viewport height)
- Text blocks have breathing room above and below proportional to the text size
- Image captions sit closer to their image than to the next block

---

## What to Apply to This Project

For arch-competitions specifically:

- **Competition cards**: title large, organizer small/mono, prize in a visually distinct register (bold or accent color)
- **Blog posts**: adopt the big/small hierarchy — large pull-quote or opening line, normal body below
- **Navigation**: current nav is serviceable; tighten tracking on nav labels, make them uppercase small
- **Tags/status badges**: mono font, no pill shape — just the text in a different typeface
- **Whitespace on listing pages**: the CompetitionGrid likely has too-tight gaps; generous whitespace between cards signals quality

---

## Free / Open Alternatives to Dinamo Fonts

Dinamo fonts require licenses, but the aesthetic transfers:

| Dinamo | Free alternative | Source |
|---|---|---|
| ABC Favorit | **Inter** (close workhorse), **Geist** (Vercel's grotesque) | Google Fonts / GitHub |
| ABC Monument Grotesk | **Neue Haas Grotesk** (paid), **Archivo** (free, sturdy) | Google Fonts |
| ABC Diatype | **DM Sans**, **Plus Jakarta Sans** | Google Fonts |
| Mono variants | **JetBrains Mono**, **IBM Plex Mono** | Google Fonts |

If budget allows: license one Dinamo family. Favorit is the most versatile entry point.
