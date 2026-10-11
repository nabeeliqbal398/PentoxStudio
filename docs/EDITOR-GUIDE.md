# Editor guide

For the people who write and update the Pentox Studio website. No technical knowledge needed. Everything is done in the admin area at **https://pentoxstudio.com/admin/** (TODO: confirm the final address; on the test copy it is the same path on the test address).

## 1. Logging in

1. Go to `/admin/` and sign in with your email and password. Use a long, unique password (a phrase of 4+ words is good). Too many wrong attempts lock the login for a while: wait and try again.
2. Your role decides what you see: **Admin** can do everything, **Editor** writes and publishes content, **Author** has the more limited writing role. Ask an admin to add or remove people (Settings → Users).
3. Log out (bottom of the left menu) when using a shared computer.

The left menu has four groups: **Content** (pages, services, blog, portfolio...), **Leads & Audience** (enquiries, subscribers, newsletters, chat conversations), **Media** (images), **Settings** (menus, footer, redirects, chatbot, users).

## 2. Golden rules

- Nothing appears on the website until it is **Published**. **Draft** is private. Use *Save draft* while writing and *Publish* when ready.
- Do not invent facts. No made-up statistics, prices, client names, awards or testimonials. If you do not have it, leave the field empty: **empty sections hide themselves** on the website.
- Do not promise things the studio cannot prove ("24/7 support", "guaranteed #1 ranking").
- Fields marked **TODO** contain placeholder text waiting for real information. Replace them or leave the item as a draft.
- Changes show on the live site within about a minute of publishing.

## 3. Everyday tasks

### Write a blog post
1. Content → **Posts** → *Create new*.
2. Fill in the **title**, the **category**, the **author**, a **featured image** (with *alt text*, see section 5), an **excerpt** (1–2 sentences) and the body. In the body use headings (H2, H3) to structure it, and add a few links to other pages of the site.
3. Open the **SEO** tab (see section 4).
4. Click **Save draft**, use **Live Preview** / the preview button to look at it, then **Publish**.

The imported old WordPress posts are all **drafts**. Review each one before publishing: check facts, remove outdated claims, fix the images. Do not publish the duplicate "Top Digital Marketing Agency in Pakistan" posts (they redirect to the best one).

### Edit a page, service or industry
Content → **Pages**, **Services** or **Industries** → click the item → edit → **Publish**. The **Home page** is under Content → Home page; each block can be switched off or left empty to hide it.

### Add a portfolio item / case study
Content → **Portfolio** → *Create new*. Only enter real, client-approved results (numbers and quotes must come from the client or from reports). Clients' logos go in Content → **Clients** (only with their permission).

### Testimonials and reviews
Content → **Testimonials** (real quotes, with the person's real name and permission) and **Reviews** (links to Google/Clutch). Never use placeholder names.

### Images
Media → upload. Max about 10 MB; use JPG/WebP for photos, PNG/SVG for logos. Resize huge photos first if possible. **Always fill in the alt text**: a short description of what the image shows ("Two designers reviewing a website mockup"), for blind visitors and for Google. Decorative images can have empty alt text.

### Menus and footer
Settings → **Header & menu** and **Footer**. Services are shown in groups (the mega menu): edit the groups under Content → Service groups.

### Text of buttons, forms and labels
Settings → **Page labels**, Leads → **Forms & estimator text**, **Newsletter text**. These are the words visitors see on buttons and in forms.

### Redirects (when you change or delete a page address)
Settings → **Redirects** → *Create new*: *From* the old address (for example `/old-page/`), *To* the new one, type **301 – permanent**. Always do this when an address that was public changes, so visitors and Google arrive at the right place.

## 4. SEO checklist (before you publish)

On pages, services, industries, portfolio items and posts, the **SEO** tab shows a **checklist** with warnings. They do not block publishing but fix them when you can:

| Warning | What to do |
| --- | --- |
| Meta title missing / too short / too long | Aim for **30–60 characters**. Put the main topic first, the brand last. |
| Meta description missing / too short / too long | Aim for **70–160 characters**. One honest sentence that makes people want to click. |
| Focus keyword not in title/description | Use the phrase people would search for, naturally. |
| Images without alt text | Add alt text in Media. |
| No internal links | Link to 2–3 related pages/posts from the body text. |
| Duplicate title or address (slug) | Two pages must not share the same title or address. Change one. |
| "Hidden from search engines" notice | The **noindex** switch is on: Google will not list this page. Switch it off unless that is intended. |

Pages that are drafts, "thank-you", or marked noindex are never listed in `sitemap.xml`.

## 5. Leads and subscribers

- **Leads** (Leads & Audience → Leads): every form submission (contact, free audit, estimator, chatbot). Set the **status** (New → Contacted → Proposal → Won/Lost) and add notes. *Export CSV* downloads the list. Each new lead is also emailed to the notification address.
- **Subscribers**: people who signed up to the newsletter. Only *Active* (confirmed) subscribers receive mail. Never add people who did not ask to be on the list. *Unsubscribed* and *Bounced* must stay excluded.
- **Campaigns**: write a newsletter, choose the audience, **send a test to yourself first**, then send. Sending is slow on purpose (small batches) to stay within the email provider's limits. Check *Campaign deliveries* for failures.
- **Chat sessions**: what visitors asked the AI assistant (stored without their IP address). Use it to find questions that need a proper page or FAQ.

## 6. The AI chatbot

Settings → **AI chatbot**: switch it on/off, edit the welcome text, limits and the instructions. The assistant only answers from the website's own published content. After large content changes, run the re-index action there so it knows the new content. If it says something wrong, fix the page it learned from, then re-index.

## 7. Cookies and analytics

Visitors choose cookies in the banner. Analytics (GA4/GTM/Clarity) only load after they accept. The ids (GA4, GTM, Clarity) are entered in Settings → **Site settings**; do not paste tracking code into pages.

## 8. If something goes wrong

- *My change is not on the site.* Is it **Published** (not Draft)? Wait a minute and hard-refresh (Ctrl+F5).
- *A page shows an error or is missing.* Check it is published and the address (slug) is right; add a redirect if you renamed it.
- *I deleted something by mistake.* Posts/pages keep **version history**: open the item → **Versions** → restore an older one. For anything else, contact the developer: backups run every night.
- *Contact the developer:* TODO (name, email, phone).
