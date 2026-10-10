# Design Reference Spec — sdcoms.com (Services, Projects, Project Page, Clients, Testimonials)

> Paste this into Claude Code as a design brief. It captures the **design language** (layout, type scale, color, spacing, motion) of the reference site — use your own brand name, logo, copy, images and client logos. Do not reuse SD Communications' logo, text or client marks.

**Stack assumption:** React + Vite + Tailwind CSS (+ Swiper for carousels, Framer Motion for reveals). Adjust if your project differs.

---

## 1. Global design tokens

```css
:root {
  /* Colors (measured from the live site) */
  --accent: #D81E3F;          /* crimson red — big display headlines, active nav, active filter pill */
  --ink: #686E7F;             /* slate grey — section titles (H2), nav links, card titles */
  --muted: #888EA0;           /* light slate — body copy, quotes, sub-labels */
  --text: #333333;            /* default body fallback */
  --bg: #FFFFFF;
  --panel: #6D7286;           /* slate panel behind the Projects carousel on Home */
  --shadow-soft: 0 20px 70px 0 rgba(136, 142, 160, 0.40);

  /* Radius */
  --radius-card: 10px;
  --radius-pill: 9999px;

  /* Layout */
  --container: 1110px;        /* content width ~1110px, centered */
}
```

**Typography**
- Font: a geometric sans (reference uses *Volte*). Good free substitutes: **Outfit**, **Urbanist** or **Manrope** (Google Fonts). Fallback: Arial/Helvetica.
- Headings are **light/regular weight, large size** — the look is airy, not bold.

| Role | Size | Weight | Color |
|---|---|---|---|
| Section title (Services, Projects, Our Clients, Testimonials) | 72px (mobile 40px) | 500 | `--ink` (white on Projects panel) |
| Page hero headline ("References & current projects") | 76px, 2 lines | 500 | `--accent` |
| Page eyebrow ("Our Projects") left of hero | 36px | 500 | `--muted` |
| Service card title | 28px | 300 | `--ink` |
| Project card title (overlay) | 30px | 200 | `#fff` |
| Body / intro paragraph | 18px / 1.6 | 400 | `--muted`, centered |
| Card body | 15px / 1.5 | 400 | `--muted` |
| Nav links | 18px | 400 | `--ink`, active = `--accent` |
| Testimonial name | 18px | 500 | `--ink` |

**Background (whole site)**
- White base with **soft, blurred grey "blob" shapes** (very light, ~#F1F2F5 → transparent radial gradients) drifting behind content.
- A few **diagonal hatched-line blobs** (thin grey stripes clipped to an organic shape) on the right/left edges.
- Implement as `position: fixed` decorative SVGs at low opacity (0.4–0.6), `pointer-events: none`, optional slow parallax on scroll.

**Recurring ornament:** a thin **zig-zag / squiggle divider** (~200px wide, 1.5px grey stroke) centered under page heroes and between sections.

**Floating UI:** circular WhatsApp button bottom-left (48px, green); outlined circle "back to top" chevron button bottom-right (40px, 1.5px `--ink` border).

**Header:** logo left (red circle mark + small red wordmark), centered text nav (18px, gap ~44px), hamburger (3 lines, right). On scroll the nav links hide and only logo + hamburger stay (sticky, transparent background).

---

## 2. Services section (Home)

- Centered H2 "Services" (72px), then a centered intro paragraph, max-width ~1110px, 18px `--muted`.
- **Grid:** 3 columns × 2 rows, cards 360px wide, gap 30px (desktop) → 2 cols tablet → 1 col mobile. Row gap ~120px because illustrations overhang the card top.
- **Card:**
  - white bg, `border-radius: 10px`, `box-shadow: var(--shadow-soft)`
  - `padding: 100px 30px 30px` — the top padding leaves room for an **isometric grey 3D illustration** (~200×180px) that sits **half outside the card top** (`margin-top: -150px` / absolute, centered).
  - Title 28px light `--ink`, left aligned; body 15px `--muted`, ~4 lines.
  - Bottom-right: **circular arrow button** (48px, white, soft shadow, thin → arrow icon `--ink`). Hover: bg `--accent`, arrow white.
- Illustrations are monochrome light-grey isometric renders (desktop, phone/social, TV/ad, printer, film/3D, laptop/code). Keep all six in the same grey style.
- **Motion:** cards fade-up + fade-in on scroll (stagger 100ms). Before reveal they're at ~30% opacity (visible in the reference while scrolling).

## 3. Projects section (Home)

- Full-width-ish **slate panel** (`--panel`, ~1110px wide, radius 10px, padding ~70px top) containing:
  - H2 "Projects" centered, **white**, 72px.
  - **Carousel** (Swiper): 3 cards visible + partial cards peeking at both edges (`slidesPerView: 3.4`, `centeredSlides`, `loop`, gap ~58px). The track overflows the panel horizontally.
  - **Project card:** 322×486px (portrait ~2:3), radius 10px, full-bleed cover image, **bottom gradient overlay** (transparent → rgba(0,0,0,.35)) with client name in white 30px weight 200, left-padded 40px, ~50px from bottom.
  - Pagination dots below (8px, white 50% / active white 100%), autoplay ~4s.
- **"All Projects" pill button** straddling the panel's bottom edge (half in/half out): white bg, 1.5px `--ink` border, radius pill, padding 14px 40px, 16px `--ink` text. Hover: border + text `--accent`.

## 4. Projects page (`/projects`)

- **Intro preloader:** dark gradient (navy #1E2433 → purple #3B2E4F) with animated **particle constellation** (dots + thin connecting lines) and the logo mark inside a thin red circular spinner, ~1.5s, then fades out.
- **Hero:** two-column. Left: eyebrow "Our Projects" (36px `--muted`). Right: headline "References & current projects" — 76px `--accent`, 2 lines. Squiggle divider centered below.
- **Filter pills** row (centered, wraps): All · 3D · Corporate Design · Graphic Design · Print · Packing · Video · Web Design.
  - Pill: transparent bg, 2px `--muted` border, radius pill, padding 12px 32px, 15px semibold `--muted`.
  - Active: border + text `--accent`.
  - Clicking filters the grid with a fade/scale layout animation (Framer Motion `layout` + `AnimatePresence`, or Isotope-style).
- **Grid:** 3 columns, card 322×486 portrait (same project card as Home), column gap ~64px, row gap ~68px, soft shadow under each. 2 cols tablet, 1 col mobile.
- Card title is **centered** here (white 30px, weight 200) on bottom gradient overlay. Hover: image scale 1.05 (400ms ease), overlay darkens slightly.
- Each card links to `/projects/:slug`.

## 5. Single project page (`/projects/:slug`)

- Same header + blob background.
- **Intro row (two columns):** left = project name (36px `--muted`); right = short description (15px `--muted`), a line like "We worked for them in different ways:", then a small bullet list of deliverables (e.g., Website Development, Packaging Design, Social Media).
- Squiggle divider centered.
- **Hero image:** full container width (~1100px), no radius or 4px, soft bottom shadow.
- **Gallery below:** 2-column grid of large images (gap ~136px horizontally at desktop, consistent vertical rhythm), each with soft shadow. Optional lightbox on click.

## 6. Our Clients section (Home)

- H2 "Our Clients" centered, then centered intro paragraph (18px `--muted`).
- Two groups, each with a small left-aligned **underlined red label** (15px, `--accent`, `text-decoration: underline`): "International Clients", "Domestic Clients".
- **Logo grid:** 6 columns, each cell ~185×80px, logos centered and contained (`max-height: 60px; object-fit: contain`), full color, no borders/cards. Row gap ~22px. 3 cols on mobile.
- Hover: slight scale 1.05. (Optional: grayscale → color on hover for a cleaner look.)

## 7. Testimonials section (Home)

- H2 "Testimonials By Our Clients" centered (72px `--ink`).
- **Single-slide carousel**, centered, max-width ~1070px:
  - Quote text in straight double quotes, 18px / 1.6, `--muted`, centered, 2 lines max ideally.
  - Round avatar 96px below (margin-top ~45px).
  - Name 18px weight 500 `--ink`; role/company 18px `--muted` below.
  - Auto-advance ~5s, fade transition, small dots or swipe on mobile.
- Below the section (before footer): a two-column brand strip — big logo + tagline left, bold condensed "We ❤ create brands that inspire people"-style statement right, then a full-width red bar starting the footer.

---

## Claude Code prompt (paste-ready)

```
Build these sections/pages for my React (Vite + Tailwind) agency site following the design spec in sdcoms-design-spec.md:

1. Add the design tokens from §1 to tailwind.config.js (colors accent/ink/muted/panel, shadow-soft, radius-card) and load the "Outfit" Google font.
2. Create a <BlobBackground/> fixed decorative layer (soft grey radial blobs + 2 hatched-stripe blobs, pointer-events none) and a <Squiggle/> SVG divider.
3. Components:
   - <ServicesSection/> — 3x2 grid of <ServiceCard/> with overhanging isometric illustration, title, text, circular arrow button (§2).
   - <ProjectsCarousel/> — slate panel, Swiper with 3.4 slides centered + loop + dots, <ProjectCard/> portrait with gradient overlay title, "All Projects" pill straddling the bottom edge (§3).
   - pages/Projects.jsx — preloader with particle constellation, hero, filter pills, animated filterable grid (§4). Use Framer Motion layout animations.
   - pages/ProjectDetail.jsx — route /projects/:slug, intro row + bullets, squiggle, hero image, 2-col gallery (§5).
   - <ClientsSection/> — two labeled 6-column logo grids (§6).
   - <TestimonialsSection/> — centered single-slide fading carousel with avatar, name, role (§7).
4. Put all content in src/data/{services,projects,clients,testimonials}.js so I can swap in my own copy, images and logos. Use placeholder images for now.
5. Scroll-reveal (fade-up, 100ms stagger) on cards and logos. Fully responsive: 3→2→1 cols; section titles 72px→40px on mobile.
Run the dev server and fix any errors when done.
```
