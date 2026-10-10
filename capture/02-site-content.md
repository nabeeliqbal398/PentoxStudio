# Pentox Studio — Full Site Content (captured 2026-10-09)

Base URL: `https://pentoxstudio.com` — all `/wp-content/...` paths are relative to it.
Format: page → sections in render order → exact copy, images, links. Items marked ⚠ are issues on the live site worth fixing in the rebuild.

---------------------------------------------------------------------
## 0. GLOBAL

### Business info
- Name: Pentox Studio
- Phone / WhatsApp: +92 323 578 8660 (`tel:+923235788660`, `https://wa.me/923235788660`)
- Email: pentoxstudio@gmail.com
- Address: office 64 MB floor, Zainab Tower, Model Town Link Rd, Bhatti Colony, Lahore, 54400, Pakistan
- Facebook: https://www.facebook.com/profile.php (⚠ id param stripped in capture — grab the full profile URL from the client)
- Instagram: https://www.instagram.com/pentoxstudio/
- LinkedIn: https://www.linkedin.com/company/pentoxstudio

### Header
- Top bar: phone, email, social icons (Facebook, Instagram, LinkedIn)
- Logo → `/`
- Nav: Home `/` · Services `/services/` ▾ [Social Media Marketing `/social-media-marketing/`, SEO `/seo/`, Web Development `/web-development/`, Video Editing `/video-editing/`, Graphic Designing `/graphic-designing/`, Digital Marketing `/digital-marketing/`] · Portfolio `/portfolio/` · Blog `/blog/` · Contact Us `/contact-us/`
- Button: **Get Quote** → `/contact-us/`
- ⚠ A secondary mega-menu also links "About Us" `/about-us/` (404) and "Service" `/service/` (redirects to `/services/`).

### Pre-footer contact block (on every page)
- Left image: `/wp-content/uploads/2025/07/pentox-studio-1.webp` ("We Are Creative Business Solutions Agency")
- Form heading: **How can we help you?** — sub: "Let us know how to get back to you."
- Fields:
  - Name * (placeholder "Name")
  - Telephone * (placeholder "+(602) 448 763 22")
  - Select Services * (multi-select — use the 6 services + Local SEO + Printing & Designing)
  - Email Address * (placeholder "Email : user@gmail.com")
  - Your Message (textarea, placeholder "Add text")
- Button: **Send Message**

### Footer (navy)
- Logo: `/wp-content/uploads/2025/07/logo-tracing-F2-01-1024x1024.webp` (alt "pentox studio logo") → `/`
- H2: **Let's Build Your Brand**
- Quick Links: Home, Digital Marketing, Social Media Marketing, Web Development, Graphic Designing, SEO
- Contact Information: phone, address (→ Google Maps), email; social icons Facebook, LinkedIn, Instagram
- Copyright © 2026 Pentox Studio. All Rights Reserved

### Floating WhatsApp chat button → `https://wa.me/923235788660`

### Shared block A — Service cards (Home hero variant, with links)
| Title | Text | Image | Link |
|---|---|---|---|
| Digital Marketing | Grow your business with data-driven digital marketing strategies that increase traffic, leads, and revenue. | `/wp-content/uploads/2025/07/4d2139bc-3f91-4b46-9d08-91f7ffbae1e8.png` | /digital-marketing/ |
| Social Media Marketing | Build your brand and engage your audience through Facebook, Instagram, LinkedIn, and other social media platforms | `/wp-content/uploads/2025/07/545f87c0-a6a9-40e3-935a-688884540640.png` | /social-media-marketing/ |
| Web Design & Development | We build stunning, user-friendly, and responsive websites that not only look great but also drive conversions. | `/wp-content/uploads/2026/07/ChatGPT-Image-Jul-28-2026-05_44_51-PM.png` | /web-development/ |
| SEO & Content Marketing | Improve your Google rankings with technical SEO, on-page optimization, keyword research, and high-quality content marketing. | `/wp-content/uploads/2026/07/ChatGPT-Image-Jul-28-2026-05_49_42-PM.png` | /seo/ |
| Graphic Designing | Bring your brand to life with impactful visuals, memorable logos, and cohesive campaigns. We create designs that capture attention and leave a lasting impression. | `/wp-content/uploads/2026/07/ChatGPT-Image-Jul-28-2026-06_03_06-PM.png` | /graphic-designing/ |
| Video Editing & Production | Create polished, engaging videos with seamless edits, vibrant visuals, and clear storytelling that connect with your audience and elevate your brand. | `/wp-content/uploads/2026/07/ChatGPT-Image-Jul-28-2026-06_06_39-PM.png` | /video-editing/ |

Each card has a "Learn more" link. ⚠ Live Web Design card text has duplicated "Web Design & Development" appended.

### Shared block B — Service cards (Services page / alt variant)
| Title | Text | Image |
|---|---|---|
| Digital Marketing | We craft data-backed, goal-focused strategies that align with your brand's vision. From market research to actionable roadmaps, we ensure every step moves you closer to success. | `/wp-content/uploads/2025/08/dm.webp` |
| Social Media Marketing | From content creation to community engagement, we grow your audience and turn followers into loyal customers. Your brand's voice, amplified on every platform. | `/wp-content/uploads/2025/08/social-media.webp` |
| Web Design & Development | We build stunning, user-friendly, and responsive websites that not only look great but also drive conversions. | `/wp-content/uploads/2025/08/dm.webp` ⚠ reuses DM image |
| SEO & Content Marketing | Boost your visibility with search engine optimization and high-value content. We help you rank higher, attract quality traffic, and position your brand as an authority in your industry. | `/wp-content/uploads/2025/08/search-engine.webp` |
| Graphic Designing | Bring your brand to life with impactful visuals, memorable logos, and cohesive campaigns. We create designs that capture attention and leave a lasting impression. | `/wp-content/uploads/2025/08/web.webp` |
| Video Editing & Production | Create polished, engaging videos with seamless edits, vibrant visuals, and clear storytelling that connect with your audience and elevate your brand. | `/wp-content/uploads/2025/08/video.webp` |

### Shared block C — Testimonials ("Testimonials By Our Clients")
Avatar for all: `/wp-content/uploads/2025/08/images-e1756430256181-150x150.webp` (generic silhouette)
1. **Abdul Rehman** — "These guys seriously took our brand to the next level. Our Insta is blowing up now!"
2. **David R.** — "Straight up — worth every penny. They don't just talk fancy, they actually deliver. My sales jumped after just a month."
3. **Emily P.** — "Their design ideas are so fresh. My brand finally looks alive online. I keep getting compliments about my new website and posts."

### Shared block D — About Our Skills
- Background: `/wp-content/uploads/2025/09/pentox-1.webp`; photo: `/wp-content/uploads/2025/09/pentox-1-1-1024x465.webp`
- Eyebrow: Our skills — H2: **About Our Skills**
- Text: "Through gaining experience in various economic periods team able to identify the best opportunities."
- Progress bars: Web Development 90% · Social Media Marketing 95% · SEO 98% · Graphic Designing 93%
- ⚠ Live bars render "0%" until animated; section is duplicated (desktop/mobile variants).

---------------------------------------------------------------------
## 1. HOME `/`
Meta title: Home - PENTOX STUDIO · OG image: header logo

1. **Hero banner** — `/wp-content/uploads/2026/09/pentox-studio-banner-1.webp` (text baked in image: eyebrow "STRATEGY | CREATIVITY | GROWTH", headline "Let's Get That **Growth** You Have Been Waiting For", icons SEO / Digital Marketing / Social Media / Web Development / Graphic Design / Video Production, footer line "IDEAS | BRANDS | VISIBILITY | REAL RESULTS"; right side "IDEAS BUILD BETTER BUSINESSES")
2. **Service cards** — Shared block A (3×2, staggered)
3. **H2: Our Digital Marketing Services in Pakistan**
   "Pentox Studio is a trusted digital marketing agency in Pakistan helping startups, SMEs, and established businesses grow online. Our expert team provides SEO services, website development, Google Ads management, social media marketing, branding, and high-authority guest posting to increase traffic, generate quality leads, and boost business growth. With" ⚠ sentence is cut off on the live site.
   (A hidden/alternate grid with Shared block B also exists here.)
4. **About Our Skills** — Shared block D
5. **Testimonials** — Shared block C
6. Pre-footer contact block + footer

---------------------------------------------------------------------
## 2. SERVICES `/services/`  (also reached via `/service/`)
OG: `/wp-content/uploads/2025/08/dm.webp`
1. H1: **Service** — H2: **Solutions Designed to Help You Succeed**
2. Paragraph: "We don't just offer services—we create value. Whether you're looking for [main service focus, e.g., digital marketing solutions, solar energy systems, or design services], our expert team is here to deliver results that matter. With a blend of innovation, dedication, and industry expertise, we provide tailored solutions that meet your unique needs and help you achieve long-term growth. We believe in working hand-in-hand with our clients to turn challenges into opportunities and ideas into impact."
   ⚠ Contains template placeholder text "[main service focus, …solar energy systems…]" — rewrite.
3. Service cards — Shared block B, each with "Learn more" → its service page (grid appears twice: desktop/mobile)

---------------------------------------------------------------------
## 3–8. SERVICE PAGES (shared template)
Template: Hero (H1 + text + image) → "Our … Approach" (intro + "Here's how we work:" + 6 numbered image cards) → CTA banner "Let's Grow Together" + Contact us button (`/contact-us/`) → "Why Choose …" (8 icon cards).
Approach card images are listed in order 01→06 (unsplash = external Unsplash URLs).

### 3. DIGITAL MARKETING `/digital-marketing/`
- H1: **Digital Marketing Services**
- Hero text: "In today's competitive online world, digital marketing is the backbone of business growth. Every brand—big or small—needs a strong online presence to reach new customers, increase sales, and stay ahead of the competition. At Pentox Studio, we provide result-driven digital marketing services that help businesses thrive in the digital age."
- Hero image: `/wp-content/uploads/2025/10/Digital-Marketing-removebg-preview.png`
- H2: **Our Digital Marketing Services** — intro: "We offer a complete range of digital marketing solutions to help you grow online:"
  1. **SEO** — SEO helps your website rank higher on Google, making it easier for customers to find you. From keyword research to on-page and technical SEO, we improve visibility and drive organic traffic that converts. — img unsplash photo-1522202176988-66273c2fd55f
  2. **Social Media Marketing (SMM)** — We create and manage campaigns across Facebook, Instagram, LinkedIn, TikTok, and more, helping your brand connect with audiences, build engagement, and generate leads. — unsplash photo-1515378791036-0648a3ef77b2
  3. **Pay-Per-Click (PPC) Advertising** — Our PPC experts run Google Ads and social media ads to bring instant traffic and sales. We focus on ROI-driven campaigns that maximize every dollar you spend. — unsplash photo-1508830524289-0adcbe822b40
  4. **Content Marketing** — Content is the voice of your brand. We create engaging blogs, videos, and graphics that educate, inspire, and convert customers while improving your SEO. — unsplash photo-1557804506-669a67965ba0
  5. **Email Marketing** — We design personalized email campaigns that nurture leads, increase customer loyalty, and drive repeat sales. — `/wp-content/uploads/2025/09/mail-1024x535-1.webp`
  6. **Web Design & Development** — A strong digital presence starts with a well-designed website. Our team builds modern, responsive, and SEO-friendly websites that turn visitors into customers. — unsplash photo-1498050108023-c5249f4df085
- CTA (bg `/wp-content/uploads/2025/09/email_marketing_2400x1350.webp`, navy): **Let's Grow Together** — "Digital marketing is not just about being online—it's about being visible to the right people at the right time. At Pentox Studio, we are committed to helping your business grow through innovative, ROI-focused strategies."
- H2: **Why Choose Pentox Studio for Digital Marketing?**
  - Customized Marketing Strategies (fa-bullseye) — We analyze your audience and goals to create tailored campaigns that maximize impact.
  - Social Media Mastery (fa-bullhorn) — From Facebook to TikTok, we build strong engagement and brand awareness across platforms.
  - ROI-Driven SEO & Ads (fa-search-dollar) — We optimize your SEO and ad spend to ensure maximum visibility and conversions.
  - Creative Content & Design (fa-paint-brush) — Our team delivers eye-catching graphics, videos, and content that inspire action.
  - Proven Growth Results (fa-chart-line) — We use analytics to track, refine, and scale campaigns for measurable success.
  - Transparent Reporting (fa-file-alt) — You'll always know where your budget goes with easy-to-read monthly performance reports.
  - Innovative Digital Ideas (fa-lightbulb) — We stay ahead of marketing trends to give your brand a competitive advantage.
  - 24/7 Expert Support (fa-headset) — Our team is always available to guide and support your business at every stage.

### 4. SOCIAL MEDIA MARKETING `/social-media-marketing/`
- H1: **Social Media Marketing Services**
- Hero text: "In today's fast-paced digital world, social media is no longer just a platform to connect with friends and family—it has become the most powerful tool for businesses to build their brand, engage with customers, and drive sales. At Pentox Studio, we specialize in creating tailored social media marketing strategies that help businesses grow, attract new customers, and achieve measurable results."
- Hero image: `/wp-content/uploads/2025/09/How-to-create-a-social-media-mar-1024x474.webp`
- H2: **Our Social Media Marketing Approach** — intro: "We don't believe in one-size-fits-all strategies. Every business is unique, so our approach starts with understanding your goals, target audience, and brand voice. From there, we craft a customized plan that balances creativity, data-driven insights, and performance tracking."
  1. **Strategy Development** — We analyze your market, competitors & audience to design strategies that increase followers, generate leads, or boost sales. — unsplash photo-1533750349088-cd871a92f312
  2. **Content Creation** — Our creative team designs engaging graphics, videos, reels & stories — optimized for each platform to spark conversations. — `/wp-content/uploads/2025/09/1346113525_808510-3150.webp`
  3. **Paid Advertising Campaigns** — We run highly targeted social ads that maximize ROI — boosting posts & running advanced campaigns with measurable results. — `/wp-content/uploads/2025/09/i-5.webp`
  4. **Community Management** — We actively engage with comments, messages & reviews — keeping your brand approachable, trustworthy & responsive. — `/wp-content/uploads/2025/09/maxresdefault-1.webp`
  5. **Analytics & Reporting** — We provide detailed performance reports so you can track ROI, understand growth & refine strategies for better results. — `/wp-content/uploads/2025/09/shutterstock_1219444957-scaled.webp`
  6. **Trend Monitoring & Optimization** — We stay ahead by tracking the latest trends & platform updates — adjusting campaigns quickly to keep your content fresh and impactful. — unsplash photo-1515378791036-0648a3ef77b2
- CTA (bg `/wp-content/uploads/2025/09/e30006b2-8bcd-40ce-a11c-3507e20e-1.webp`): **Let's Grow Together** — "Social media is the future of marketing, and the right strategy can transform your business. At Pentox Studio, we're committed to helping you build a strong brand, engage with customers, and increase sales through innovative social media marketing."
- H2: **Why Choose Pentox Studio?**
  - Customized Strategies (fa-bullseye) — We create solutions based on your unique goals and industry.
  - Creative Expertise (fa-paint-brush) — Our design and content team ensures your brand stands out.
  - Proven Results (fa-chart-line) — We focus on ROI-driven campaigns that deliver measurable growth.
  - Complete Management (fa-tasks) — From content to ads to engagement, we handle everything.
  - Transparent Reporting (fa-file-alt) — You'll always know where your money goes and what results you're getting.
  - 24/7 Support (fa-headset) — Our team is always available to answer your questions and provide guidance.
  - Innovative Ideas (fa-lightbulb) — We stay ahead of trends to keep your brand relevant and impactful.
  - Trusted & Reliable (fa-user-shield) — Businesses count on us for ethical, consistent, and quality-driven work.

### 5. SEO `/seo/`
- H1: **SEO Services – Rank Higher & Grow Your Business**
- Hero text: "In today's digital marketplace, appearing on the first page of Google is no longer optional—it's essential. If your customers can't find you online, they will find your competitors. At Pentox Studio, we provide professional SEO services that help businesses improve their search rankings, increase website traffic, and generate more leads and sales."
- Hero image: `/wp-content/uploads/2025/09/360_F_302420664_JOsmFRUxjAwvGUkg.webp`
- H2: **Our SEO Approach** — intro: "At Pentox Studio, we believe SEO is more than rankings — it's about visibility, credibility, and sustainable growth. Our proven process ensures that your website attracts the right audience and converts them into loyal customers."
  1. **SEO Audit** — We start with a detailed website audit to identify strengths, weaknesses, and opportunities for improvement. — `/wp-content/uploads/2025/09/i-7.webp`
  2. **Keyword Research** — We analyze search trends and competitors to target high-value keywords that drive qualified traffic. — unsplash photo-1556155092-490a1ba16284
  3. **On-Page Optimization** — From meta tags to content structure, we optimize every on-page element to boost rankings. — unsplash photo-1522202176988-66273c2fd55f
  4. **Technical SEO** — We improve site speed, mobile-friendliness, indexing, and overall performance for better visibility. — `/wp-content/uploads/2025/09/seo-stock_1200x628__03a34117.webp`
  5. **Content Strategy** — Our content is crafted to be search-engine-friendly while engaging and converting your target audience. — unsplash photo-1593642532973-d31b6557fa68
  6. **Link Building** — We build quality backlinks and partnerships to strengthen your site's authority and trust signals. — unsplash photo-1533750349088-cd871a92f312
- CTA (bg `/wp-content/uploads/2025/09/28424487459_e3456e86e9_b.webp`, black): **Let's Grow Together** — "At Pentox Studio, we believe SEO is not just about traffic—it's about growth. With our professional SEO services, we help you rank higher, reach your target audience, and achieve long-term success in search engines."
- H2: **Why Choose Pentox Studio for SEO?**
  - Customized SEO Plans (fa-bullseye) — We craft tailored SEO strategies based on your business goals, niche, and competition.
  - On-Page Optimization (fa-search) — From meta tags to content structure, we optimize every page for maximum search visibility.
  - High-Quality Backlinks (fa-link) — We build authoritative backlinks that improve your domain trust and rankings.
  - Proven Ranking Results (fa-chart-line) — Our SEO campaigns consistently drive measurable traffic, leads, and conversions.
  - Transparent SEO Reports (fa-file-alt) — Get detailed performance insights with easy-to-understand ranking and traffic reports.
  - Expert SEO Support (fa-headset) — Our SEO specialists are available to answer queries and provide strategic guidance.
  - Latest SEO Techniques (fa-lightbulb) — We use modern, white-hat SEO methods to keep your brand ahead of search trends.
  - Trusted SEO Partner (fa-user-shield) — Brands rely on us for ethical, consistent, and ROI-focused SEO services.

### 6. WEB DEVELOPMENT `/web-development/`
- H1: **Web Development Services**
- Hero text: "In today's digital-first world, your website is often the first impression customers have of your business. At Pentox Studio, we specialize in creating powerful, responsive, and user-friendly websites that not only look stunning but also deliver measurable results. Whether you need a business website, eCommerce platform, or custom web application, our expert web development team builds solutions tailored to your goals."
- Hero image: `/wp-content/uploads/2025/09/team-developing-a-responsive-web.webp`
- H2: **Our Web Development Approach** — intro: "A great website is more than design — it's about performance, user experience, and growth. Our process ensures your website is functional, scalable, and aligned with your business goals." — "Here's how we build:"
  1. **Requirement Analysis** — We gather and analyze your goals to define a clear roadmap and project scope. — `/wp-content/uploads/2025/09/1LHNu-3U_UjdUtn6tsSlsGw.webp`
  2. **UI/UX Design** — We craft user-friendly wireframes and designs that ensure smooth navigation and engagement. — `/wp-content/uploads/2025/09/1.webp`
  3. **Frontend Development** — We turn designs into responsive, interactive, and pixel-perfect websites using modern frameworks. — `/wp-content/uploads/2025/09/cQlHt8qFvejsdn9X-cVM_MfIaHqypsn-scaled.webp`
  4. **Backend Development** — Robust backend solutions for speed, security, and scalability with APIs and databases. — `/wp-content/uploads/2025/09/Problem-Centralisation-1024x512-1.webp`
  5. **Testing & QA** — We test across devices and browsers to ensure a bug-free, smooth, and secure experience. — `/wp-content/uploads/2025/09/i-10.webp`
  6. **Deployment & Support** — We launch your website and provide ongoing support, updates, and optimizations. — `/wp-content/uploads/2025/09/shutterstock_2304027635.webp`
- CTA (bg `/wp-content/uploads/2025/09/x4CMJ4u4N7li-uCrTtpalA9JJQEayJyW-scaled-e1758951377526.webp`): **Let's Grow Together** — "At Pentox Studio, we believe your website should be more than just an online presence — it should be a growth engine for your business. Whether you're launching a new site or upgrading your current one, our team is here to transform your vision into reality."
- H2: **Why Choose Pentox Studio?**
  - Custom Development (fa-laptop-code) — We build tailored websites and applications designed to match your unique business goals.
  - Creative UI/UX (fa-pencil-ruler) — Our design-first approach ensures stunning, user-friendly interfaces that engage visitors.
  - Robust Backend (fa-server) — We deliver secure, scalable backend solutions that power your business efficiently.
  - Responsive Design (fa-mobile-alt) — Our websites are fully responsive and optimized for desktops, tablets, and mobiles.
  - SEO Optimized (fa-search-dollar) — Clean code and SEO best practices ensure your website ranks higher in search engines.
  - Full Project Management (fa-project-diagram) — From planning to deployment, we handle the entire web development cycle seamlessly.
  - Secure Solutions (fa-shield-alt) — We implement top security measures to safeguard your website and user data.
  - 24/7 Support (fa-headset) — Our dedicated team is available around the clock to resolve issues and provide assistance.

### 7. VIDEO EDITING `/video-editing/`
- H1: **Video Editing Services – Creative & Professional Video Solutions**
- Hero text: "Video is one of the most powerful ways to capture attention, tell stories, and build stronger connections with your audience. Whether it's for social media, business promotions, or brand storytelling, well-edited videos can make a huge difference in how people perceive your business. At Pentox Studio, we provide professional video editing services that turn raw footage into polished, engaging, and impactful content."
- Hero image: `/wp-content/uploads/2025/09/video-marketing1.webp`
- H2: **Our Video Editing Approach** — intro: "Great videos are not just about cutting clips — they're about storytelling, emotions, and impact. Our process ensures your content is polished, engaging, and aligned with your brand's voice."
  1. **Concept & Storyboarding** — We analyze your goals and create a clear storyboard that sets the flow and direction of your video. — `/wp-content/uploads/2025/09/00bcc2ba5785857a2395f52e25686ce4.webp`
  2. **Footage Selection** — We carefully select the best shots and visuals to ensure quality storytelling and audience retention. — `/wp-content/uploads/2025/09/1.webp`
  3. **Editing & Transitions** — We apply smooth transitions, pacing, and cuts to make your video flow naturally and keep it engaging. — `/wp-content/uploads/2025/09/maxresdefault-2.webp`
  4. **Color Grading** — We enhance the visual appeal with cinematic color grading for a professional and consistent look. — `/wp-content/uploads/2025/09/1O_XJHMYUXmOSAz0b4pO_aA.webp`
  5. **Sound Design & Sync** — From background music to voiceovers, we sync audio perfectly for maximum emotional impact. — `/wp-content/uploads/2025/09/maxresdefault-3.webp`
  6. **Revisions & Final Delivery** — We refine your video based on feedback and deliver high-quality files ready for social media, ads, or campaigns. — `/wp-content/uploads/2025/09/i-9.webp`
- CTA (bg `/wp-content/uploads/2025/09/video-editor-editing-audio-film.webp`): **Let's Grow Together** — "Video is the future of digital marketing, and the right editing can transform how people see your brand. At Pentox Studio, we combine creativity and technical expertise to deliver professional video editing services that help you connect, engage, and grow."
- H2: **Why Choose Pentox Studio?**
  - Professional Editing (fa-video) — High-quality video editing with cinematic cuts, smooth transitions, and storytelling impact.
  - Creative Effects (fa-magic) — Custom effects, motion graphics, and animations to make your videos stand out.
  - Sound & Music (fa-music) — Perfect background scores, audio syncing, and sound design for engaging experiences.
  - Color Grading (fa-sliders-h) — Professional color correction and grading to give your video a cinematic look.
  - Full Production (fa-photo-video) — From raw footage to final delivery, we manage the complete editing workflow.
  - Multiple Formats (fa-file-export) — We deliver videos in all formats optimized for YouTube, Instagram, and ads.
  - Creative Storytelling (fa-lightbulb) — We turn your raw footage into compelling stories that connect with viewers.
  - 24/7 Support (fa-headset) — Dedicated assistance at every stage to ensure smooth and hassle-free editing.

### 8. GRAPHIC DESIGNING `/graphic-designing/`
- H1: **Graphic Designing Services**
- Hero text: "In the digital era, visuals speak louder than words. A strong brand identity starts with powerful graphics that capture attention, communicate your message, and leave a lasting impression. At Pentox Studio, we offer creative and professional graphic design services that help businesses stand out in today's competitive marketplace."
- Hero image: `/wp-content/uploads/2025/09/i-6.webp`
- H2: **Our Graphic Designing Approach** — intro: "We believe that powerful design goes beyond aesthetics — it's about communication, creativity, and consistency. Our process ensures that your brand visuals not only look stunning but also connect with your audience effectively."
  1. **Brand Discovery** — We understand your brand, audience, and goals to create a strong design direction that aligns with your identity. — unsplash photo-1503602642458-232111445657
  2. **Creative Concepting** — Our team brainstorms unique design concepts, ensuring innovation and originality for every project. — unsplash photo-1522202176988-66273c2fd55f
  3. **Design Development** — We transform ideas into visual assets — logos, branding, social posts, packaging, and more — with attention to detail. — `/wp-content/uploads/2025/09/07BHP5VyZJX9IYMv4.webp`
  4. **Revisions & Feedback** — We collaborate with you throughout the process, refining designs until they meet your expectations perfectly. — unsplash photo-1529107386315-e1a2ed48a620
  5. **Final Delivery** — We deliver high-resolution, scalable design files across multiple formats, ready for print and digital use. — unsplash photo-1593642634443-44adaa06623a
  6. **Ongoing Support** — Our team provides continuous support for updates, new campaigns, and evolving brand requirements. — `/wp-content/uploads/2025/09/close-up-person-working-call-cen.webp`
- CTA (bg `/wp-content/uploads/2025/09/1aysZ0dIhFtN48ftMFk6B6Q.webp`): **Let's Grow Together** — "Good design is more than just visuals—it's about creating meaningful connections with your audience. At Pentox Studio, we are passionate about turning your ideas into stunning designs that inspire, engage, and deliver results."
- H2: **Why Choose Pentox Studio?**
  - Customized Strategies (fa-bullseye) — We create tailored solutions aligned with your unique goals and industry.
  - Creative Expertise (fa-paint-brush) — Our design team ensures your brand visuals stand out with impact.
  - Proven Results (fa-chart-line) — ROI-driven strategies that deliver measurable and scalable growth.
  - Complete Management (fa-tasks) — From branding to campaigns, we handle every creative detail.
  - Transparent Reporting (fa-file-alt) — Clear insights into performance with easy-to-understand reports.
  - 24/7 Support (fa-headset) — Always available to answer your queries and guide your campaigns.
  - Innovative Ideas (fa-lightbulb) — We design fresh and trendy concepts to keep your brand modern.
  - Trusted & Reliable (fa-user-shield) — Brands trust us for consistent, ethical, and creative solutions.

---------------------------------------------------------------------
## 9. LOCAL SEO `/local-seo/`  (not in main nav; different layout)
OG: `/wp-content/uploads/2026/08/11.jpg`
- H1: **Local SEO** — eyebrow: What is local SEO?
- H2: **Reach More Local Customers with Customized Local SEO Services**
- P: "It can be difficult to stand out from all of the noise today, can't it? This is especially the case for small local businesses that are competing with large nationwide and global powerhouses! This is why it makes sense to target local customers so you can increase your chances of boosting your conversion rate."
- P: "For those who may not be familiar with local search engine optimization, it is a strategy that uses various techniques to help businesses improve their visibility in local search results on Google and other major search engines. If your business serves a specific geographical area or operates from a physical location, you can benefit from our professional Local SEO services."
- P: "Local SEO requires a specialized approach. It focuses on understanding the local market and using the right strategies to improve your chances of ranking for important localized search features, including Google Business Profile and the local map pack that appears within Google's search results. These features are influenced by separate ranking factors and algorithms, which is why working with an experienced SEO team that understands how Local SEO works is essential."
- Image accordion ⚠ placeholder items ("Image accordion Title / Read More" ×3, Read More → wa.me/923235788660)
- P: "As a local SEO marketing company, we have helped many businesses to achieve great success with our local SEO ranking service! Contact us today to discuss your requirements."
- Stat: **97%** of Consumers Go Online to Find and Research Local Products and Services
- H2: **How Local SEO Services Help Your Business Grow?**
  "There are many benefits your business can gain by investing in one of our local SEO packages. Local SEO gives you the ability to become the dominant force within a specific geographic location. This service is not restricted to those with physical stores within a certain location; you can also capitalize on local SEO by recognizing opportunistic markets to target with your online efforts. So, let's take a look at some of the key benefits of our local SEO Services:"
  - **Improved Online Visibility Among Local Customers** — You will have a stronger opportunity to reach local customers who are actively interested in the products and services your business provides. — `/wp-content/uploads/2026/08/11.jpg`
  - **More Website Traffic, Leads, and Sales from Local Customers** — Achieving a stronger position in local search results can have a positive impact on your business growth. We focus on delivering measurable results through increased leads, conversions, and sales. — `/wp-content/uploads/2026/08/12.jpg`
  - **Increased Traffic to Your Physical Store** — Local SEO can help drive more visitors to your website while also encouraging more potential customers to visit your physical store, if you have a local location. — `/wp-content/uploads/2026/08/14.jpg`
  - **More Focused Geographic Marketing Campaigns** — Location-focused campaigns are often easier to target and optimize, helping your business establish a stronger presence and become a trusted choice within your target area. — `/wp-content/uploads/2026/08/13.jpg`
- Countdown widget ⚠ "Countdown is finished!" + Lorem Ipsum filler — drop
- CTA H3: **Empower Your Local Business with Expert SEO: Restaurants, Gyms, Salons, Plumbers, Dance Schools & More! Click NOW to Drive Unstoppable Traffic & Conversions!** — button **CONTACT US TODAY!** → wa.me/923235788660
- **FAQ** (accordion)
  - Why Is Local SEO Important for Your Business? — Local SEO is critical because it helps you to stand out from the competition and target users making local searches, such as "cake store in New York" or "accountant in Amsterdam". Reach a relevant consumer base that is ready to convert.
  - How Long Does It Take to See Results From Local SEO? — SEO takes time, and local SEO is no different. It can take between four to six months to experience real results. While this can be frustrating, growing your presence naturally is critical to ensure sustained success. Using black hat techniques for quicker results will only see you being penalized by Google, which could mean being removed from the search results altogether.
  - Do You Require a Minimum Commitment for SEO Services? — No, we do not have a minimum term on your contracts. We do recommend that you have a long-term approach when it comes to SEO, as it requires time, nourishment, and patience. But we do not tie you into long contracts here.
  - Can You Customize a Local SEO Strategy for My Business? — Yes, we believe that SEO should always be a collaborative and bespoke service. We will never operate with a one-size-fits-all approach here, as we know that this does not bring about results. Instead, we will work with you to understand your business so that we can put together an SEO strategy that brings about the very best results for you.
  - Do You Guarantee Specific SEO Results? — "Yes, our SEO works on all major search engines. We know that Google wears the crown when it comes to search engines, but we don't ignore the likes of Yahoo and Bing." ⚠ answer doesn't match question — rewrite.
- **Related Posts On Local SEO** — 10 latest blog posts carousel (image + truncated title)

---------------------------------------------------------------------
## 10. PRINTING & DESIGNING SERVICES `/printing-designing-services/`  (not in main nav; long-form article layout)
OG: `/wp-content/uploads/2026/08/ChatGPT-Image-Aug-4-2026-02_15_33-PM.png`
- H1: **Printing & Designing Services**
- H2: **Professional Printing & Designing Services That Build Stronger Brands**
  - "In today's competitive business world, your brand's visual identity is often the first thing customers notice. Whether it's a professionally designed business card, a premium brochure, eye-catching packaging, or large-format signage, high-quality Printing & Designing Services help businesses create credibility, improve customer trust, and increase sales."
  - "At Pentox Studio, we provide complete printing and design solutions that combine creativity, branding strategy, and premium production quality. From startups to large enterprises, our goal is to help businesses create professional marketing materials that leave a lasting impression."
- H2: **Why Printing Still Matters in 2026** — "Many businesses believe digital marketing has replaced print marketing. In reality, the most successful brands combine both." Professional printed materials offer: Stronger brand recognition · Higher customer trust · Better offline marketing · Improved brand consistency · Long-lasting advertising · Professional business presentation. "A premium brochure or business card often creates more impact than a simple digital advertisement."
- H2: **Our Professional Printing & Designing Services**
  - **Logo Design** — Your logo represents your business. Our designers create: Modern logos · Corporate logos · Luxury brand logos · Minimal logos · Icon-based logos · Wordmark logos. Every logo is designed to work across digital and print platforms.
  - **Business Card Design & Printing** — Business cards remain one of the most powerful networking tools. We offer: Premium Matte Cards · Gloss Cards · Spot UV Cards · Gold Foil Cards · Soft Touch Cards · Luxury Business Cards
  - **Flyer Design & Printing** — Flyers are perfect for: Restaurants · Clinics · Salons · Schools · Events · Retail Stores. Our creative team designs flyers that attract attention and generate more customers.
  - **Brochure Design** — Professional brochures help businesses explain their services clearly. Available formats include: Bi-Fold · Tri-Fold · Multi-Page · Product Catalogs · Company Profiles
  - **Banner Design & Printing** — Promote your brand with: Roll-Up Banners · Event Backdrops · Outdoor Banners · Indoor Signage · Promotional Displays · Exhibition Stands
  - **Packaging Design** — Packaging influences buying decisions. We design: Product Boxes · Labels · Shopping Bags · Food Packaging · Cosmetic Packaging · Retail Packaging
  - **Company Profile Design** — A professional company profile helps businesses win clients and investors. We create: Corporate Profiles · Investor Profiles · Agency Profiles · Manufacturing Profiles · Startup Profiles
  - **Poster Design** — Professional posters for: Marketing Campaigns · Events · Educational Institutes · Product Launches · Restaurants · Corporate Promotions
  - **Menu Design** — Restaurants require visually attractive menus. We design: Cafe Menus · Restaurant Menus · Digital Menus · QR Menus · Food Catalogs
  - **Stationery Design** — Maintain a consistent corporate identity with: Letterheads · Envelopes · Notepads · Presentation Folders · Invoice Books · Receipt Books
  - **Social Media Design** — Your branding should stay consistent across every platform. We design: Facebook Posts · Instagram Posts · LinkedIn Graphics · YouTube Thumbnails · Pinterest Graphics · Display Ads
- H2: **Industries We Serve** — Our printing solutions are trusted by: Healthcare · Restaurants · Educational Institutes · Construction Companies · Real Estate Agencies · Fashion Brands · Retail Stores · Law Firms · Marketing Agencies · Startups · SaaS Companies · eCommerce Businesses
- H2: **Why Choose Pentox Studio?** — Businesses choose Pentox Studio because we focus on quality, creativity, and measurable business value. Our advantages include: Experienced Creative Designers · Modern Design Standards · Premium Print Quality · Fast Delivery · Affordable Pricing · Custom Solutions · Business-Focused Branding · Professional Customer Support
- H2: **Our Design Process** — Discovery (We understand your business and branding goals.) → Planning (Our team develops creative concepts.) → Design (Professional designers create visually appealing layouts.) → Review (Clients review and request revisions.) → Printing (Modern printing technology ensures premium quality.) → Delivery (Your project is delivered professionally and on time.)
- H2: **Benefits of Professional Printing** — Professional printing offers numerous advantages: Better Brand Recognition · Higher Customer Confidence · Increased Sales · Premium Brand Image · Professional Marketing Materials · Consistent Branding · Long-Term Advertising Value
- H2: **Common Printing Products** — Businesses frequently request: Business Cards · Flyers · Brochures · Posters · Roll-Up Banners · Packaging Boxes · Labels · Stickers · Company Profiles · Letterheads · Envelopes · Catalogs · Menus · Presentation Folders
- H2: **Frequently Asked Questions**
  - Do you offer custom printing? — Yes. Every project is customized according to your requirements.
  - Can you create my complete branding? — Absolutely. We provide logo design, stationery, packaging, social media graphics, and marketing materials.
  - Do you provide print-ready files? — Yes. We deliver professional print-ready files suitable for commercial printing.
  - Can I request revisions? — Yes. Revisions are included to ensure complete satisfaction.
  - Do you serve international clients? — Yes. Pentox Studio works with businesses around the world.
- H2: **Why Invest in Professional Printing & Designing Services?** — Professional branding helps businesses: Build trust · Increase visibility · Improve customer engagement · Create memorable marketing materials · Strengthen brand identity · Generate more business opportunities. "Whether you're launching a startup or expanding an established company, premium printing and design can significantly improve how customers perceive your business."
- H2: **Get Started with Pentox Studio** — "At Pentox Studio, we believe every business deserves professional branding and high-quality printed materials that inspire confidence." / "From business cards and brochures to banners, packaging, catalogs, company profiles, and complete brand identity solutions, we deliver creative work designed to help your business grow." / "If you're ready to elevate your brand with professional Printing & Designing Services, our team is here to help."
- H3: **Contact Us Today** — "Let's create powerful designs and premium printed materials that make your business stand out."

---------------------------------------------------------------------
## 11. PORTFOLIO `/portfolio/`
- Eyebrow H3: Portfolio — H2: **Our Projects**
- Filterable gallery — filters: **All · Web Development**
  Items (⚠ titles "Gallery Item Name" + Lorem ipsum captions — need real project names):
  - `/wp-content/uploads/2026/09/WhatsApp-Image-2026-09-22-at-7.43.18-PM-1.jpeg` (lightbox)
  - `/wp-content/uploads/2026/09/WhatsApp-Image-2026-09-22-at-8.49.21-PM.jpeg` (links to a YouTube video)
  - `/wp-content/uploads/2026/09/WhatsApp-Image-2026-09-22-at-8.49.32-PM.jpeg` (lightbox)
  - `/wp-content/uploads/2026/09/WhatsApp-Image-2026-09-22-at-7.43.18-PM.jpeg` (lightbox)
  - Hover icons: zoom (fa-search-plus), link (fa-link)
- Testimonials — Shared block C

---------------------------------------------------------------------
## 12. BLOG `/blog/`
- 3-column grid of navy post cards (featured image, title, "Learn more"), newest first. Full post list in `03-blog-posts.json` (34 posts).
- Post URL pattern: `/YYYY/MM/<slug>/`. Categories: Uncategorized, Digital Marketing, Blog.
- Post bodies are long-form; pull them at build time from the WP REST API (`/wp-json/wp/v2/posts?slug=<slug>`) or export once (see README).

---------------------------------------------------------------------
## 13. CONTACT US `/contact-us/`
- H1: **Contact Us** — "We would love to hear from you. Feel free to reach out using the below details."
- White card, 2 columns:
  - Left — H2 **Contact Information** (styled "CONTACT" red + "INFORMATION" navy, with red/navy underline bar)
    - Whatsapp: +92 323 578 8660 (icon `/wp-content/uploads/2025/09/phone-ringing.webp`) → tel:+923235788660
    - Address: office 64 MB floor, Zainab Tower, Model Town Link Rd, Bhatti Colony, Lahore, 54400, Pakistan (icon `/wp-content/uploads/2025/09/place-marker.webp`) ⚠ live says "Pakistann"
    - Email: pentoxstudio@gmail.com (icon `/wp-content/uploads/2025/09/gmail-logo.webp`)
    - Social icons: Facebook, Instagram, LinkedIn
  - Right — Google Maps embed of the office ("office 64 MB floor, Model Town Link Rd, Phase 3")
- Pre-footer contact form + footer

---------------------------------------------------------------------
## 14. OTHER PAGES
- `/gallery/` — only a "Talk to an Expert!" heading + the MetForm contact form (same fields as above). Effectively an orphan form page.
- `/home-new/` — draft alternate homepage: H2 "Let's Build —Your Brand" + slider with 3 slides (each with "View Our Portfolio" button):
  - **Creative** — We transform imagination into influence, blending artistry and strategy to create experiences that inspire, engage, and leave a lasting mark on your audience.
  - **Strategic** — Every action is guided by insight and intention, weaving together data, creativity, and precision to drive growth that is both measurable and meaningful.
  - **Innovative** — We push beyond the expected, crafting bold, forward-thinking solutions that position your brand as a leader in a constantly evolving digital world.
  then H2 "Services" + "At Pentox Studio, we offer a full suite of digital marketing solutions designed to help your brand grow, connect, and succeed. From creative design and targeted campaigns to data-driven strategies and innovative technologies, we tailor every service to meet your unique goals. Whether you're looking to boost visibility, engage your audience, or drive conversions, we've got the tools, expertise, and passion to make it happen." + Shared blocks B, D, C. (Useful copy for a real hero.)
- `/about-us/` — **404** (linked from the mega-menu). Recommend creating a real About page in the rebuild.

---------------------------------------------------------------------
## 15. SEO META (meta descriptions are auto-generated from first text; write proper ones)
Titles follow "<Page> - PENTOX STUDIO". OG images listed per page above.
