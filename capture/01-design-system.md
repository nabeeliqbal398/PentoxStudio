# Pentox Studio — Design System (captured from pentoxstudio.com)

Source: WordPress + Elementor Pro (+ ElementsKit, Jeg Elementor Kit, Essential Addons, MetForm, Click-to-Chat). Captured 2026-10-09.
All asset paths are relative to `https://pentoxstudio.com`.

## 1. Brand assets

| Asset | Path |
|---|---|
| Logo (header, colour on light) | `/wp-content/uploads/2025/08/pentox-studio-logo-e1756465801717.webp` |
| Logo (footer, white on navy) | `/wp-content/uploads/2025/07/logo-tracing-F2-01-1024x1024.webp` |
| "We Are Creative Business Solutions Agency" artwork (footer form, left) | `/wp-content/uploads/2025/07/pentox-studio-1.webp` |
| Favicon | `/wp-content/uploads/2025/09/pentox-fvi-150x150.png` |
| Global body background pattern (grey blobs + diagonal hatching) | `/wp-content/uploads/2025/08/shapes-scaled.png` (bg `#F5F5F5`, cover, centered) |
| Home hero banner | `/wp-content/uploads/2026/09/pentox-studio-banner-1.webp` |

Logo mark: navy "P" monogram with red accent, wordmark "PENTOX" navy serif caps + "STUDIO" red serif caps.

## 2. Colour tokens

Core (what the site actually uses visually):

| Token | Hex | Use |
|---|---|---|
| `primary` / navy | `#1C244B` | Footer background, dark sections, brand navy |
| `brand-red` | `#DD2C33` | Section headings (red), CTA buttons, accents |
| `nav-active-red` | `#EF1B21` | Active nav link |
| `accent-blue` | `#467FF7` | Elementor accent (rarely visible) |
| `blog-card-navy` | ≈`#1C244B` | Blog cards are navy with white titles + blue "Learn more" pill |
| `text` | `#4A4A4A` | Body text |
| `text-strong` | `#3B3B3B` / `#313131` | Card titles, paragraphs |
| `muted` | `#71747B` | Secondary text |
| `border-grey` | `#A8ACB7` | Outline button border |
| `light-bg` | `#FAFAFA` / `#F5F5F5` / `#F3F5F8` / `#F9FAFD` | Page + section backgrounds |
| `ice` | `#C8D5DC` | Decorative |
| `near-black` | `#0D0D0D` / `#120E1E` / `#000000` | Dark overlays (CTA banners) |
| `form-input-bg` | `#F6F7FA` | MetForm inputs; label colour `#0D1427` |
| white | `#FFFFFF` | Cards |

Gradient used on the "About Our Skills" image frame: navy (`#1C244B`) → red (`#DD2C33`) diagonal block behind a rounded white-bordered photo.

## 3. Typography

Fonts loaded: **Poppins**, **Inter**, **Lato**, **Roboto**, **IBM Plex Sans** (form), Font Awesome 5 (icons).

| Role | Font | Size / weight / line-height |
|---|---|---|
| Elementor "Primary" | Poppins | 65px / 600 / 1.2 |
| Elementor "Secondary" | Poppins | 36px / 600 / 1.1, capitalize |
| Body text (kit) | Poppins | 16px / 300 / 1.5 |
| Accent / buttons | Poppins | 16px / 400 / 1, capitalize |
| H2 large section titles (home) | Inter (renders as Arial-like bold) | 54px / 600 / 1.1, colour `#4A4A4A` |
| H3 card titles | Inter | 23px / 600 / 1.1, colour `#3B3B3B` |
| Service-page H1 / section H2 | Arial-style bold, **red `#DD2C33`** with soft text-shadow | ~36–40px / 700 |
| "About Our Skills" H2 | Lato, red | ~32px / 700 |
| Display (rare) | Poppins | 85px, 100px, 200px / 600–700 |
| Eyebrow | Poppins | 16px / 300, letter-spacing 10px |
| Small | Inter | 12–14px / 400 / 1.5 |
| Form labels | IBM Plex Sans | 16px / 500, `#0D1427`; form heading 26px / 700 |

Recommendation for the React rebuild: **Poppins** for headings, **Inter** for body — closest to the intended system.

## 4. Spacing, shape, elevation

- Content width ≈ 1140–1200px, centered.
- Cards: white, `border-radius: 5px`, `box-shadow: 0 25px 40px -20px rgba(0,0,0,.5)` (home service cards); service-page cards use lighter shadow + 1px border.
- Home service cards are staggered: middle column sits ~40px higher (masonry-like offset).
- Outline button ("Get Quote", "Send Message"): transparent bg, `2px solid #A8ACB7`, `border-radius: 47px`, padding `19px 40px`, Poppins 16px.
- Solid red button ("Contact Us" in CTA banners): bg `#DD2C33`, white text, radius ~4px, small.
- Blog "Learn more" button: blue pill (`#467FF7`-ish), white text.
- Wavy brush-stroke SVG divider on top of the navy footer.

## 5. Layout patterns / components

1. **Top bar + header** (sticky-ish): logo left; right side = phone + email icon list and round dark social icons (FB, IG, LinkedIn); below that a centered nav with `|` separators; outline "Get Quote" pill at right.
   Nav: Home · Services ▾ (Social Media Marketing, SEO, Web Development, Video Editing, Graphic Designing, Digital Marketing) · Portfolio · Blog · Contact Us.
2. **Hero image banner** (home): full-width rounded-corner image (text is baked into image: "Let's Get That Growth You Have Been Waiting For" + service icons). Rebuild should make this real HTML text.
3. **Service card grid** (3 cols × 2 rows): illustration image on top, H3, short text, "Learn more" link.
4. **Intro block**: big centered H2 + paragraph.
5. **About Our Skills**: dark photo background section; left = rounded photo in navy→red gradient frame; right = eyebrow "Our skills", red H2, paragraph, 4 animated progress bars (Web Development 90%, Social Media Marketing 95%, SEO 98%, Graphic Designing 93%) each a different colour (green/orange/teal/blue).
6. **Testimonials slider**: centered quote, round avatar, name; dots/arrows.
7. **Footer contact form block** (on every page): left artwork "We Are Creative Business Solutions Agency"; right MetForm "How can we help you?" / "Let us know how to get back to you." with fields: Name*, Telephone*, Select Services* (multi-select), Email Address*, Your Message; button "Send Message".
8. **Footer** (navy `#1C244B`): centered white logo; left large red H2 "Let's Build Your Brand"; columns "Quick Links" and "Contact Information" (red headings, white text with icons); social icons; copyright "Copyright © 2026 Pentox Studio. All Rights Reserved".
9. **Service page template** (used by SEO, SMM, Web Dev, Video, Graphic, Digital Marketing):
   - Hero: 2 cols — red H1 + paragraph left, illustration in white framed card right.
   - "Our X Approach": centered red H2, intro paragraph, "Here's how we work:", 3×2 grid of **image cards** with dark overlay, navy number badge (01–06) top-left, white title + description bottom.
   - **CTA banner**: full-bleed dark background image, right side red H2 "Let's Grow Together", white paragraph, red "Contact us" button.
   - "Why Choose Pentox Studio?": red H2, 4×2 grid of white cards with red Font Awesome icon, bold title, small text.
10. **Blog grid**: 3 cols of navy cards, featured image top, white bold title, blue "Learn more" pill; staggered offset like home cards.
11. **Contact page**: red H1 "Contact Us" + subtext; white card split — left "CONTACT INFORMATION" (red/navy two-tone heading with red/navy underline bar) and 3 image-box rows (phone, map pin, Gmail icons); right embedded Google Map.
12. **Floating WhatsApp button** bottom-left (wa.me/923235788660).
13. **Page transitions / entrance animations**: Elementor page-transition preloader + fade-in-up entrance on sections.

## 6. Screenshots
See `screenshots/` — numbered in page order (home 01–06, service template 07–10, blog 11, contact 12).
