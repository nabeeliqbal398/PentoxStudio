# Design Merge — Pentox brand × sdcoms layout references

**Rule:** Pentox colours, logo, fonts and copy win every conflict. `reference-sdcoms-design-spec.md` supplies **layouts, components, spacing, motion and extra pages only**. Never reuse SD Communications' name, logo, text, project images or client logos.

## 1. Token mapping (sdcoms token → Pentox value)

| sdcoms token | sdcoms value | **Use in Pentox** | Notes |
|---|---|---|---|
| `--accent` | #D81E3F | **`#DD2C33`** (brand red) | display headlines, active nav, active filter pill, hover states |
| `--ink` | #686E7F | **`#1C244B`** (brand navy) | section titles, nav links, card titles |
| `--muted` | #888EA0 | **`#71747B`** | body copy, quotes, eyebrows |
| `--text` | #333333 | **`#4A4A4A`** | default body |
| `--bg` | #FFFFFF | **`#FAFAFA`** + Pentox blob/hatch pattern | |
| `--panel` | #6D7286 | **`#1C244B`** (navy), optional subtle navy→`#2A3466` gradient | Projects carousel panel |
| `--shadow-soft` | 0 20px 70px rgba(136,142,160,.40) | **`0 20px 70px rgba(28,36,75,.18)`** (navy-tinted) | cards, project tiles |
| `--radius-card` | 10px | **12px** | |
| `--radius-pill` | 9999px | same | |
| `--container` | 1110px | **1200px** (max-w-6xl/7xl) | |
| preloader gradient | #1E2433 → #3B2E4F | **#1C244B → #0D0D0D**, red `#DD2C33` spinner ring | |
| WhatsApp button | green, bottom-left | keep (Pentox already has it) | |

Tailwind:
```ts
colors: {
  brand: { red: '#DD2C33', redHover: '#C0222A', navy: '#1C244B', navy2: '#2A3466' },
  ink: '#1C244B', muted: '#71747B', body: '#4A4A4A',
  surface: { DEFAULT: '#FFFFFF', soft: '#FAFAFA', grey: '#F5F5F5', blob: '#F1F2F5' },
  accentBlue: '#467FF7', // links/secondary only
},
boxShadow: { soft: '0 20px 70px 0 rgba(28,36,75,.18)', card: '0 25px 40px -20px rgba(0,0,0,.35)' },
borderRadius: { card: '12px' },
```

## 2. Typography (Pentox fonts, sdcoms scale)
sdcoms' airy look = big sizes, light weights. Apply that with Pentox fonts:

| Role | Font | Size (desktop → mobile) | Weight | Colour |
|---|---|---|---|---|
| Section title (Services, Projects, Our Clients, Testimonials) | Poppins | 64px → 38px | 500 | navy (white on navy panel) |
| Page hero headline | Poppins | 72px → 40px, 2 lines | 600 | red |
| Page eyebrow (left of hero) | Poppins | 32px → 22px | 400 | muted |
| Service card title | Poppins | 24px | 500 | navy |
| Project card title (overlay) | Poppins | 28px | 300 | white |
| Intro paragraph | Inter | 18px / 1.6 | 400 | muted, centered, max-w 760px |
| Card body | Inter | 15px / 1.6 | 400 | muted |
| Nav | Inter | 17px | 500 | navy; active red |
| Testimonial name / role | Poppins / Inter | 18px | 500 / 400 | navy / muted |

## 3. Global elements
- **Background:** keep Pentox's grey blob + diagonal hatch motif as a fixed decorative SVG layer (opacity 0.4–0.6, `pointer-events:none`, slight parallax). Matches sdcoms exactly.
- **Squiggle divider** (new): 200px zig-zag, 1.5px stroke; colour red at 60% opacity. Under page heroes and between major sections.
- **Header:** Pentox top bar (phone/email/socials) + logo left + centered nav + red "Get Quote" pill. On scroll: top bar collapses, nav links hide, header becomes compact (logo + Get Quote + hamburger) with white/blur background. Hamburger opens full-screen navy menu overlay with large white links (red on hover) + contact details.
- **Back-to-top** (new): 44px circle, 1.5px navy border, chevron; hover fills red. Bottom-right. WhatsApp stays bottom-left.
- **Preloader** (new, first visit per session only, ≤1.2s, skip if `prefers-reduced-motion`): navy→black gradient, particle constellation canvas (white dots + thin lines, a few red dots), Pentox "P" mark inside a red spinning ring.

## 4. Sections & pages to build (Pentox content + sdcoms layout)

### 4.1 Home — Services section (replaces the old card grid)
- Title "Services" + intro (use the home-new Services paragraph from 02-site-content.md).
- 3×2 grid (2 tablet, 1 mobile), cards white, radius 12, shadow-soft, `padding: 110px 30px 30px`, row gap 120px.
- **Illustration overhangs the card top** (~200×180, centered, `-mt-[150px]`). Pentox already has matching 3D isometric illustrations: use the six `/wp-content/uploads/2026/07/ChatGPT-Image-Jul-28-2026-*.png` + `/2025/07/4d2139bc…png` + `/2025/07/545f87c0…png` (Shared block A). Keep them in their colour style; give them a soft drop shadow.
- Title + text left-aligned, **circular arrow button** bottom-right (48px, white, shadow; hover → red bg, white arrow) linking to the service page.
- Scroll reveal: fade-up, 100ms stagger.

### 4.2 Home — Projects carousel (new)
- Navy panel (radius 12, ~70px top padding), white "Projects" title.
- Swiper: `slidesPerView: 3.4` desktop / 1.3 mobile, `centeredSlides`, `loop`, gap 48px, autoplay 4s, white dots. Track overflows panel edges.
- **Project card:** portrait 2:3 (~322×486), radius 12, cover image, bottom gradient (transparent → rgba(13,13,13,.55)), title white 28px/300 + small red service tag above it.
- **"All Projects" pill** straddling the panel's bottom edge: white bg, 1.5px navy border; hover red border + text → `/portfolio`.
- Data: featured Portfolio items from the CMS (sortOrder).

### 4.3 Home — Our Clients (new)
- Title + intro paragraph. Two groups with red underlined labels: "International Clients", "Domestic Clients" (labels editable in CMS).
- Logo grid 6 cols (3 mobile), cells ~185×80, `max-h-[60px] object-contain`, grayscale → colour on hover + scale 1.05.
- Data: new **Clients** CMS collection.

### 4.4 Home — Testimonials (restyle)
- Title "Testimonials By Our Clients". Single-slide fade carousel, max-w 1070, quote 18px muted centered, 96px round avatar, name navy + role/company muted, autoplay 5s, dots.

### 4.5 Brand strip before footer (new)
- Two columns: Pentox logo + tagline left; big bold statement right — "We ❤ build brands that grow" style, Poppins 800 uppercase, navy with the heart/one word in red (copy editable in Footer global). Then the footer's wavy red/navy top edge.

### 4.6 `/portfolio` — Projects page (rebuild using sdcoms layout)
- Preloader (shared). Hero two columns: eyebrow "Our Projects" left; red headline "Work we're proud of & current projects" right. Squiggle below.
- **Filter pills** (centered, wrap): All · Web Development · Social Media · SEO · Graphic Design · Branding · Video · Printing & Packaging · 3D. Pill: 2px muted border, radius pill, 12px 32px; active = red border + red text. Filter values come from the CMS (PortfolioCategories), not hard-coded.
- Grid 3/2/1 cols, portrait project cards (as 4.2), title centered, hover image scale 1.05 (400ms) + darker overlay. Framer Motion `layout` + `AnimatePresence` on filter.
- URL keeps filter state (`/portfolio?category=web-development`).

### 4.7 `/portfolio/[slug]` — Single project page
- Intro row: left project name (36px muted→navy); right short description + "We worked for them in different ways:" + deliverables bullet list (from CMS). Optional client logo + project link button.
- Squiggle → full-width hero image (radius 12, shadow) → results metrics row (Pentox addition: big red numbers) → 2-col gallery with lightbox → testimonial (if linked) → "Next project" card + CTA banner "Let's Grow Together".

## 5. CMS changes this requires (add to the Payload build)
- **Portfolio:** add `portraitCover` (Media, 2:3 crop via upload `imageSizes.portrait 644x972`), `heroImage`, `deliverables` (array of text), `client` (rel → Clients), `categories` (rel → PortfolioCategories, hasMany — replaces the single `service` select), `showInHomeCarousel` (checkbox), keep gallery/results/testimonial/sortOrder.
- **PortfolioCategories:** title, slug, sortOrder (seed the 9 pills above).
- **Clients** (new): name, logo (Media, SVG/PNG allowed), group (`international` | `domestic`), website, showOnHome, sortOrder.
- **Testimonials:** ensure `role`/`company` field (rendered under name).
- **Home global:** sections toggles + titles/intros for Services, Projects, Clients, Testimonials; clients group labels.
- **Footer global:** brand-strip statement + highlighted word.
- **Services collection:** add `homeIllustration` (Media) + `homeCardText` for the overhang cards.
