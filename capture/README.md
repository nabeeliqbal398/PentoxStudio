# Pentox Studio — site capture for React redesign

Captured from https://pentoxstudio.com on 2026-10-09 (WordPress + Elementor Pro).

| File | What's in it |
|---|---|
| `01-design-system.md` | Brand assets, colour + typography tokens, spacing/shadows, 13 component/layout patterns |
| `02-site-content.md` | Full copy for all 15 live pages (+ header, footer, form, shared blocks), every image path, link, icon, and ⚠ issues |
| `03-blog-posts.json` | All 34 blog posts: title, slug, date, featured image, category, excerpt, REST URL for the body |
| `04-CLAUDE-CODE-PROMPT.md` | (Superseded) static React SPA prompt |
| `05-CLAUDE-CODE-PROMPT-CMS.md` | **Use this one:** Next.js + Payload CMS site with blog, portfolio, subscribers, newsletter and leads admin |
| `06-design-merge.md` | Final design spec: Pentox colours + sdcoms layouts (new sections, projects pages, clients) and the CMS fields they need |
| `reference-sdcoms-design-spec.md` | Layout reference you supplied (layout only, no brand reuse) |
| `screenshots/` | 12 reference screenshots (home, service template, blog, contact) |

## Pages captured
Home, Services, Digital Marketing, Social Media Marketing, SEO, Web Development, Video Editing, Graphic Designing, Local SEO, Printing & Designing Services, Portfolio, Blog, Contact Us, Gallery (form only), Home-new (draft).
`/about-us/` is linked in the menu but returns 404.

## Live-site issues found (fix in the rebuild)
1. `/about-us/` 404 linked from the menu.
2. Services page contains template placeholder text ("[main service focus, e.g., … solar energy systems …]").
3. Portfolio items are "Gallery Item Name" + Lorem ipsum; only 4 images.
4. Local SEO page: placeholder image accordion, Lorem countdown widget, and a FAQ answer that doesn't match its question.
5. Home intro paragraph is cut off mid-sentence ("…boost business growth. With").
6. Skill progress bars show 0% until animated; skills section is duplicated.
7. "Pakistann" typo on Contact; Web Design card repeats its title in the body text; Web Design card reuses the Digital Marketing image.
8. Meta descriptions are auto-generated from the first text block; three near-duplicate "Top Digital Marketing Agency in Pakistan" posts.
9. Hero headline is baked into an image (not crawlable/accessible).

## Note on images
Asset paths point at the live server. Before launch, download them into the React `public/` folder (or a CDN) — the prompt sets up an `asset()` helper so this is a one-line switch.
