import { h, p, ul } from '../lexical'

export type GroupKey = 'marketing' | 'design-media' | 'development-ai'

export type SeedService = {
  slug: string
  title: string
  group: GroupKey
  parent?: string
  sortOrder: number
  shortDescription: string
  hero: { heading: string; intro: string }
  approach?: { heading: string; intro: string; steps: { title: string; description: string }[] }
  deliverables?: { title: string; description: string }[]
  whyChoose?: { heading: string; items: { icon: string; title: string; description: string }[] }
  cta?: { heading: string; text: string }
  longform?: unknown[]
  /** New service drafted for the client: seeded as a draft flagged "TODO: client review". */
  isNew?: boolean
}

// Copy reused from capture/02-site-content.md. Removed per capture/07 §8 (unverifiable claims):
// every "24/7 support" card, the "guarantee" FAQ and the unsourced "97% of consumers" statistic.
export const services: SeedService[] = [
  {
    slug: 'digital-marketing',
    title: 'Digital Marketing',
    group: 'marketing',
    sortOrder: 10,
    shortDescription:
      'Grow your business with data-driven digital marketing strategies that increase traffic, leads, and revenue.',
    hero: {
      heading: 'Digital Marketing Services',
      intro:
        'In today’s competitive online world, digital marketing is the backbone of business growth. Every brand—big or small—needs a strong online presence to reach new customers, increase sales, and stay ahead of the competition. At Pentox Studio, we provide result-driven digital marketing services that help businesses thrive in the digital age.',
    },
    approach: {
      heading: 'Our Digital Marketing Services',
      intro: 'We offer a complete range of digital marketing solutions to help you grow online:',
      steps: [
        { title: 'SEO', description: 'SEO helps your website rank higher on Google, making it easier for customers to find you. From keyword research to on-page and technical SEO, we improve visibility and drive organic traffic that converts.' },
        { title: 'Social Media Marketing (SMM)', description: 'We create and manage campaigns across Facebook, Instagram, LinkedIn, TikTok, and more, helping your brand connect with audiences, build engagement, and generate leads.' },
        { title: 'Pay-Per-Click (PPC) Advertising', description: 'Our PPC experts run Google Ads and social media ads to bring instant traffic and sales. We focus on ROI-driven campaigns that maximize every dollar you spend.' },
        { title: 'Content Marketing', description: 'Content is the voice of your brand. We create engaging blogs, videos, and graphics that educate, inspire, and convert customers while improving your SEO.' },
        { title: 'Email Marketing', description: 'We design personalized email campaigns that nurture leads, increase customer loyalty, and drive repeat sales.' },
        { title: 'Web Design & Development', description: 'A strong digital presence starts with a well-designed website. Our team builds modern, responsive, and SEO-friendly websites that turn visitors into customers.' },
      ],
    },
    whyChoose: {
      heading: 'Why Choose Pentox Studio for Digital Marketing?',
      items: [
        { icon: 'Target', title: 'Customized Marketing Strategies', description: 'We analyze your audience and goals to create tailored campaigns that maximize impact.' },
        { icon: 'Megaphone', title: 'Social Media Mastery', description: 'From Facebook to TikTok, we build strong engagement and brand awareness across platforms.' },
        { icon: 'Search', title: 'ROI-Driven SEO & Ads', description: 'We optimize your SEO and ad spend to ensure maximum visibility and conversions.' },
        { icon: 'Paintbrush', title: 'Creative Content & Design', description: 'Our team delivers eye-catching graphics, videos, and content that inspire action.' },
        { icon: 'ChartLine', title: 'Growth Tracking', description: 'We use analytics to track, refine, and scale campaigns for measurable success.' },
        { icon: 'FileText', title: 'Transparent Reporting', description: 'You’ll always know where your budget goes with easy-to-read monthly performance reports.' },
        { icon: 'Lightbulb', title: 'Innovative Digital Ideas', description: 'We stay ahead of marketing trends to give your brand a competitive advantage.' },
      ],
    },
    cta: {
      heading: 'Let’s Grow Together',
      text: 'Digital marketing is not just about being online—it’s about being visible to the right people at the right time. At Pentox Studio, we are committed to helping your business grow through innovative, ROI-focused strategies.',
    },
  },
  {
    slug: 'social-media-marketing',
    title: 'Social Media Marketing',
    group: 'marketing',
    sortOrder: 20,
    shortDescription:
      'Build your brand and engage your audience through Facebook, Instagram, LinkedIn, and other social media platforms.',
    hero: {
      heading: 'Social Media Marketing Services',
      intro:
        'In today’s fast-paced digital world, social media is no longer just a platform to connect with friends and family—it has become the most powerful tool for businesses to build their brand, engage with customers, and drive sales. At Pentox Studio, we specialize in creating tailored social media marketing strategies that help businesses grow, attract new customers, and achieve measurable results.',
    },
    approach: {
      heading: 'Our Social Media Marketing Approach',
      intro:
        'We don’t believe in one-size-fits-all strategies. Every business is unique, so our approach starts with understanding your goals, target audience, and brand voice. From there, we craft a customized plan that balances creativity, data-driven insights, and performance tracking.',
      steps: [
        { title: 'Strategy Development', description: 'We analyze your market, competitors & audience to design strategies that increase followers, generate leads, or boost sales.' },
        { title: 'Content Creation', description: 'Our creative team designs engaging graphics, videos, reels & stories — optimized for each platform to spark conversations.' },
        { title: 'Paid Advertising Campaigns', description: 'We run highly targeted social ads that maximize ROI — boosting posts & running advanced campaigns with measurable results.' },
        { title: 'Community Management', description: 'We actively engage with comments, messages & reviews — keeping your brand approachable, trustworthy & responsive.' },
        { title: 'Analytics & Reporting', description: 'We provide detailed performance reports so you can track ROI, understand growth & refine strategies for better results.' },
        { title: 'Trend Monitoring & Optimization', description: 'We stay ahead by tracking the latest trends & platform updates — adjusting campaigns quickly to keep your content fresh and impactful.' },
      ],
    },
    whyChoose: {
      heading: 'Why Choose Pentox Studio?',
      items: [
        { icon: 'Target', title: 'Customized Strategies', description: 'We create solutions based on your unique goals and industry.' },
        { icon: 'Paintbrush', title: 'Creative Expertise', description: 'Our design and content team ensures your brand stands out.' },
        { icon: 'ChartLine', title: 'ROI-Driven Campaigns', description: 'We focus on campaigns with measurable results.' },
        { icon: 'ListChecks', title: 'Complete Management', description: 'From content to ads to engagement, we handle everything.' },
        { icon: 'FileText', title: 'Transparent Reporting', description: 'You’ll always know where your money goes and what results you’re getting.' },
        { icon: 'Lightbulb', title: 'Innovative Ideas', description: 'We stay ahead of trends to keep your brand relevant and impactful.' },
        { icon: 'ShieldCheck', title: 'Reliable Partner', description: 'Businesses count on us for ethical, consistent, and quality-driven work.' },
      ],
    },
    cta: {
      heading: 'Let’s Grow Together',
      text: 'Social media is the future of marketing, and the right strategy can transform your business. At Pentox Studio, we’re committed to helping you build a strong brand, engage with customers, and increase sales through innovative social media marketing.',
    },
  },
  {
    slug: 'seo',
    title: 'SEO',
    group: 'marketing',
    sortOrder: 30,
    shortDescription:
      'Improve your Google rankings with technical SEO, on-page optimization, keyword research, and high-quality content marketing.',
    hero: {
      heading: 'SEO Services – Rank Higher & Grow Your Business',
      intro:
        'In today’s digital marketplace, appearing on the first page of Google is no longer optional—it’s essential. If your customers can’t find you online, they will find your competitors. At Pentox Studio, we provide professional SEO services that help businesses improve their search rankings, increase website traffic, and generate more leads and sales.',
    },
    approach: {
      heading: 'Our SEO Approach',
      intro:
        'At Pentox Studio, we believe SEO is more than rankings — it’s about visibility, credibility, and sustainable growth. Our proven process ensures that your website attracts the right audience and converts them into loyal customers.',
      steps: [
        { title: 'SEO Audit', description: 'We start with a detailed website audit to identify strengths, weaknesses, and opportunities for improvement.' },
        { title: 'Keyword Research', description: 'We analyze search trends and competitors to target high-value keywords that drive qualified traffic.' },
        { title: 'On-Page Optimization', description: 'From meta tags to content structure, we optimize every on-page element to boost rankings.' },
        { title: 'Technical SEO', description: 'We improve site speed, mobile-friendliness, indexing, and overall performance for better visibility.' },
        { title: 'Content Strategy', description: 'Our content is crafted to be search-engine-friendly while engaging and converting your target audience.' },
        { title: 'Link Building', description: 'We build quality backlinks and partnerships to strengthen your site’s authority and trust signals.' },
      ],
    },
    whyChoose: {
      heading: 'Why Choose Pentox Studio for SEO?',
      items: [
        { icon: 'Target', title: 'Customized SEO Plans', description: 'We craft tailored SEO strategies based on your business goals, niche, and competition.' },
        { icon: 'Search', title: 'On-Page Optimization', description: 'From meta tags to content structure, we optimize every page for maximum search visibility.' },
        { icon: 'Link', title: 'High-Quality Backlinks', description: 'We build authoritative backlinks that improve your domain trust and rankings.' },
        { icon: 'ChartLine', title: 'Measurable Results', description: 'Our SEO campaigns are tracked against traffic, leads, and conversions.' },
        { icon: 'FileText', title: 'Transparent SEO Reports', description: 'Get detailed performance insights with easy-to-understand ranking and traffic reports.' },
        { icon: 'Headset', title: 'Expert SEO Support', description: 'Our SEO specialists are available to answer queries and provide strategic guidance.' },
        { icon: 'Lightbulb', title: 'Modern SEO Techniques', description: 'We use white-hat SEO methods to keep your brand ahead of search trends.' },
        { icon: 'ShieldCheck', title: 'Ethical Approach', description: 'Brands rely on us for ethical, consistent, and ROI-focused SEO services.' },
      ],
    },
    cta: {
      heading: 'Let’s Grow Together',
      text: 'At Pentox Studio, we believe SEO is not just about traffic—it’s about growth. With our professional SEO services, we help you rank higher, reach your target audience, and achieve long-term success in search engines.',
    },
  },
  {
    slug: 'local-seo',
    title: 'Local SEO',
    group: 'marketing',
    parent: 'seo',
    sortOrder: 31,
    shortDescription:
      'Improve your visibility in local search results on Google and reach customers in your area.',
    hero: {
      heading: 'Local SEO Services',
      intro:
        'Local SEO is a strategy that helps businesses improve their visibility in local search results on Google and other major search engines. If your business serves a specific geographical area or operates from a physical location, our Local SEO services can help you reach more customers nearby.',
    },
    longform: [
      h2('Reach More Local Customers with Customized Local SEO Services'),
      p('It can be difficult to stand out from all of the noise today, especially for small local businesses competing with large nationwide and global players. This is why it makes sense to target local customers so you can increase your chances of boosting your conversion rate.'),
      p('Local SEO requires a specialized approach. It focuses on understanding the local market and using the right strategies to improve your chances of ranking for important localized search features, including Google Business Profile and the local map pack that appears within Google’s search results. These features are influenced by separate ranking factors and algorithms, which is why working with an experienced SEO team that understands how Local SEO works is essential.'),
      h2('How Local SEO Services Help Your Business Grow'),
      p('Local SEO gives you the ability to become the dominant force within a specific geographic location. It is not restricted to businesses with physical stores: you can also capitalize on it by recognizing opportunistic markets to target with your online efforts. Key benefits:'),
      ul([
        'Improved online visibility among local customers: a stronger opportunity to reach people who are actively interested in the products and services you provide.',
        'More website traffic, leads, and sales from local customers: a stronger position in local search results can have a positive impact on your business growth.',
        'Increased traffic to your physical store: Local SEO can help drive more visitors to your website while also encouraging potential customers to visit your location.',
        'More focused geographic marketing campaigns: location-focused campaigns are often easier to target and optimize.',
      ]),
    ],
  },
  {
    slug: 'graphic-design',
    title: 'Graphic Design',
    group: 'design-media',
    sortOrder: 40,
    shortDescription:
      'Bring your brand to life with impactful visuals, memorable logos, and cohesive campaigns.',
    hero: {
      heading: 'Graphic Designing Services',
      intro:
        'In the digital era, visuals speak louder than words. A strong brand identity starts with powerful graphics that capture attention, communicate your message, and leave a lasting impression. At Pentox Studio, we offer creative and professional graphic design services that help businesses stand out in today’s competitive marketplace.',
    },
    approach: {
      heading: 'Our Graphic Designing Approach',
      intro:
        'We believe that powerful design goes beyond aesthetics — it’s about communication, creativity, and consistency. Our process ensures that your brand visuals not only look stunning but also connect with your audience effectively.',
      steps: [
        { title: 'Brand Discovery', description: 'We understand your brand, audience, and goals to create a strong design direction that aligns with your identity.' },
        { title: 'Creative Concepting', description: 'Our team brainstorms unique design concepts, ensuring innovation and originality for every project.' },
        { title: 'Design Development', description: 'We transform ideas into visual assets — logos, branding, social posts, packaging, and more — with attention to detail.' },
        { title: 'Revisions & Feedback', description: 'We collaborate with you throughout the process, refining designs until they meet your expectations.' },
        { title: 'Final Delivery', description: 'We deliver high-resolution, scalable design files across multiple formats, ready for print and digital use.' },
        { title: 'Ongoing Support', description: 'Our team provides continuous support for updates, new campaigns, and evolving brand requirements.' },
      ],
    },
    whyChoose: {
      heading: 'Why Choose Pentox Studio?',
      items: [
        { icon: 'Target', title: 'Customized Strategies', description: 'We create tailored solutions aligned with your unique goals and industry.' },
        { icon: 'Paintbrush', title: 'Creative Expertise', description: 'Our design team ensures your brand visuals stand out with impact.' },
        { icon: 'ChartLine', title: 'Results-Focused', description: 'ROI-driven strategies that deliver measurable and scalable growth.' },
        { icon: 'ListChecks', title: 'Complete Management', description: 'From branding to campaigns, we handle every creative detail.' },
        { icon: 'FileText', title: 'Transparent Reporting', description: 'Clear insights into performance with easy-to-understand reports.' },
        { icon: 'Lightbulb', title: 'Innovative Ideas', description: 'We design fresh and trendy concepts to keep your brand modern.' },
        { icon: 'ShieldCheck', title: 'Reliable Partner', description: 'Brands trust us for consistent, ethical, and creative solutions.' },
      ],
    },
    cta: {
      heading: 'Let’s Grow Together',
      text: 'Good design is more than just visuals—it’s about creating meaningful connections with your audience. At Pentox Studio, we are passionate about turning your ideas into stunning designs that inspire, engage, and deliver results.',
    },
  },
  {
    slug: 'printing-design',
    title: 'Printing & Design',
    group: 'design-media',
    parent: 'graphic-design',
    sortOrder: 41,
    shortDescription:
      'Complete printing and design solutions, from logos and business cards to brochures, banners and packaging.',
    hero: {
      heading: 'Printing & Designing Services',
      intro:
        'Your brand’s visual identity is often the first thing customers notice. Whether it’s a professionally designed business card, a brochure, packaging, or large-format signage, high-quality printing and design help businesses build credibility and customer trust. At Pentox Studio, we combine creativity, branding strategy, and production quality, from startups to large enterprises.',
    },
    deliverables: [
      { title: 'Logo Design', description: 'Modern, corporate, minimal, icon-based and wordmark logos that work across digital and print.' },
      { title: 'Business Card Design & Printing', description: 'Matte, gloss, spot UV, foil and soft-touch business cards.' },
      { title: 'Flyer Design & Printing', description: 'Flyers for restaurants, clinics, salons, schools, events and retail stores.' },
      { title: 'Brochure Design', description: 'Bi-fold, tri-fold and multi-page brochures, product catalogs and company profiles.' },
      { title: 'Banner Design & Printing', description: 'Roll-up banners, event backdrops, outdoor and indoor signage, and exhibition stands.' },
      { title: 'Packaging Design', description: 'Product boxes, labels, shopping bags, and food, cosmetic and retail packaging.' },
      { title: 'Company Profile Design', description: 'Corporate, investor, agency, manufacturing and startup profiles.' },
      { title: 'Poster Design', description: 'Posters for campaigns, events, educational institutes, product launches and restaurants.' },
      { title: 'Menu Design', description: 'Cafe and restaurant menus, digital and QR menus, and food catalogs.' },
      { title: 'Stationery Design', description: 'Letterheads, envelopes, notepads, presentation folders, invoice and receipt books.' },
      { title: 'Social Media Design', description: 'Facebook, Instagram and LinkedIn graphics, YouTube thumbnails, Pinterest graphics and display ads.' },
    ],
    approach: {
      heading: 'Our Design Process',
      intro: 'From first conversation to finished print:',
      steps: [
        { title: 'Discovery', description: 'We understand your business and branding goals.' },
        { title: 'Planning', description: 'Our team develops creative concepts.' },
        { title: 'Design', description: 'Designers create layouts that fit your brand and your print format.' },
        { title: 'Review', description: 'You review the work and request revisions.' },
        { title: 'Printing', description: 'We produce your materials using modern printing technology.' },
        { title: 'Delivery', description: 'Your project is delivered professionally.' },
      ],
    },
    longform: [
      h2('Why Printing Still Matters'),
      p('Many businesses believe digital marketing has replaced print marketing. In reality, the most successful brands combine both. Professional printed materials support stronger brand recognition, higher customer trust, better offline marketing, improved brand consistency and a professional business presentation.'),
    ],
  },
  {
    slug: 'video-editing',
    title: 'Video Editing',
    group: 'design-media',
    sortOrder: 50,
    shortDescription:
      'Create polished, engaging videos with seamless edits, vibrant visuals, and clear storytelling that connect with your audience.',
    hero: {
      heading: 'Video Editing Services – Creative & Professional Video Solutions',
      intro:
        'Video is one of the most powerful ways to capture attention, tell stories, and build stronger connections with your audience. Whether it’s for social media, business promotions, or brand storytelling, well-edited videos can make a huge difference in how people perceive your business. At Pentox Studio, we provide professional video editing services that turn raw footage into polished, engaging, and impactful content.',
    },
    approach: {
      heading: 'Our Video Editing Approach',
      intro:
        'Great videos are not just about cutting clips — they’re about storytelling, emotions, and impact. Our process ensures your content is polished, engaging, and aligned with your brand’s voice.',
      steps: [
        { title: 'Concept & Storyboarding', description: 'We analyze your goals and create a clear storyboard that sets the flow and direction of your video.' },
        { title: 'Footage Selection', description: 'We carefully select the best shots and visuals to ensure quality storytelling and audience retention.' },
        { title: 'Editing & Transitions', description: 'We apply smooth transitions, pacing, and cuts to make your video flow naturally and keep it engaging.' },
        { title: 'Color Grading', description: 'We enhance the visual appeal with cinematic color grading for a professional and consistent look.' },
        { title: 'Sound Design & Sync', description: 'From background music to voiceovers, we sync audio perfectly for maximum emotional impact.' },
        { title: 'Revisions & Final Delivery', description: 'We refine your video based on feedback and deliver high-quality files ready for social media, ads, or campaigns.' },
      ],
    },
    whyChoose: {
      heading: 'Why Choose Pentox Studio?',
      items: [
        { icon: 'Video', title: 'Professional Editing', description: 'High-quality video editing with cinematic cuts, smooth transitions, and storytelling impact.' },
        { icon: 'WandSparkles', title: 'Creative Effects', description: 'Custom effects, motion graphics, and animations to make your videos stand out.' },
        { icon: 'Music', title: 'Sound & Music', description: 'Background scores, audio syncing, and sound design for engaging experiences.' },
        { icon: 'SlidersHorizontal', title: 'Color Grading', description: 'Professional color correction and grading to give your video a cinematic look.' },
        { icon: 'Film', title: 'Full Production', description: 'From raw footage to final delivery, we manage the complete editing workflow.' },
        { icon: 'FileOutput', title: 'Multiple Formats', description: 'We deliver videos in formats optimized for YouTube, Instagram, and ads.' },
        { icon: 'Lightbulb', title: 'Creative Storytelling', description: 'We turn your raw footage into compelling stories that connect with viewers.' },
      ],
    },
    cta: {
      heading: 'Let’s Grow Together',
      text: 'Video is the future of digital marketing, and the right editing can transform how people see your brand. At Pentox Studio, we combine creativity and technical expertise to deliver professional video editing services that help you connect, engage, and grow.',
    },
  },
  {
    slug: 'web-development',
    title: 'Web Development',
    group: 'development-ai',
    sortOrder: 60,
    shortDescription:
      'We build stunning, user-friendly, and responsive websites that not only look great but also drive conversions.',
    hero: {
      heading: 'Web Development Services',
      intro:
        'In today’s digital-first world, your website is often the first impression customers have of your business. At Pentox Studio, we specialize in creating powerful, responsive, and user-friendly websites that not only look stunning but also deliver measurable results. Whether you need a business website, eCommerce platform, or custom web application, our web development team builds solutions tailored to your goals.',
    },
    approach: {
      heading: 'Our Web Development Approach',
      intro:
        'A great website is more than design — it’s about performance, user experience, and growth. Our process ensures your website is functional, scalable, and aligned with your business goals. Here’s how we build:',
      steps: [
        { title: 'Requirement Analysis', description: 'We gather and analyze your goals to define a clear roadmap and project scope.' },
        { title: 'UI/UX Design', description: 'We craft user-friendly wireframes and designs that ensure smooth navigation and engagement.' },
        { title: 'Frontend Development', description: 'We turn designs into responsive, interactive, and pixel-perfect websites using modern frameworks.' },
        { title: 'Backend Development', description: 'Robust backend solutions for speed, security, and scalability with APIs and databases.' },
        { title: 'Testing & QA', description: 'We test across devices and browsers to ensure a smooth and secure experience.' },
        { title: 'Deployment & Support', description: 'We launch your website and provide ongoing support, updates, and optimizations.' },
      ],
    },
    whyChoose: {
      heading: 'Why Choose Pentox Studio?',
      items: [
        { icon: 'Laptop', title: 'Custom Development', description: 'We build tailored websites and applications designed to match your unique business goals.' },
        { icon: 'PencilRuler', title: 'Creative UI/UX', description: 'Our design-first approach ensures user-friendly interfaces that engage visitors.' },
        { icon: 'Server', title: 'Robust Backend', description: 'We deliver secure, scalable backend solutions that power your business efficiently.' },
        { icon: 'Smartphone', title: 'Responsive Design', description: 'Our websites are fully responsive and optimized for desktops, tablets, and mobiles.' },
        { icon: 'SearchCheck', title: 'SEO Optimized', description: 'Clean code and SEO best practices help your website rank in search engines.' },
        { icon: 'Workflow', title: 'Full Project Management', description: 'From planning to deployment, we handle the entire web development cycle.' },
        { icon: 'Shield', title: 'Secure Solutions', description: 'We implement security measures to safeguard your website and user data.' },
      ],
    },
    cta: {
      heading: 'Let’s Grow Together',
      text: 'At Pentox Studio, we believe your website should be more than just an online presence — it should be a growth engine for your business. Whether you’re launching a new site or upgrading your current one, our team is here to transform your vision into reality.',
    },
  },
  // ---- New services (draft copy, flagged "TODO: client review") ----
  {
    slug: 'ai-chatbots-agents',
    title: 'AI Chatbots & AI Agents',
    group: 'development-ai',
    sortOrder: 70,
    isNew: true,
    shortDescription:
      'Chatbots and AI agents trained on your own content that answer questions, qualify leads and hand over to your team.',
    hero: {
      heading: 'AI Chatbots & AI Agents for Your Business',
      intro:
        'Visitors want quick answers, and your team has better things to do than repeat them. We design and build AI chatbots and agents that answer from your own content, capture qualified leads and pass conversations to a person when needed.',
    },
    approach: {
      heading: 'How We Build Your AI Assistant',
      intro: 'A useful assistant starts with clear goals and good source material. Here’s how we build one:',
      steps: [
        { title: 'Discovery & Use Cases', description: 'We agree what the assistant should do, who it talks to and how success will be measured.' },
        { title: 'Knowledge Preparation', description: 'We gather and structure your services, FAQs and policies so answers come from content you approve.' },
        { title: 'Conversation Design', description: 'We define tone, lead-capture questions and when to hand over to a human or WhatsApp.' },
        { title: 'Build & Integration', description: 'We build the assistant and connect it to your website, forms and the tools your team already uses.' },
        { title: 'Testing & Safety Checks', description: 'We test real questions, edge cases and attempts to push the assistant off-topic before launch.' },
        { title: 'Launch & Improvement', description: 'After launch we review conversations and refine answers as your business changes.' },
      ],
    },
    whyChoose: {
      heading: 'Why Choose Pentox Studio?',
      items: [
        { icon: 'Database', title: 'Answers from your content', description: 'The assistant is limited to the material you provide, so it does not invent offers or prices.' },
        { icon: 'UserCheck', title: 'Lead qualification', description: 'It asks about needs, budget and timeline and saves the details for your team.' },
        { icon: 'MessageCircle', title: 'Human hand-over', description: 'Complex or sensitive questions are passed to your team, including through WhatsApp.' },
        { icon: 'Lock', title: 'Privacy-minded setup', description: 'We keep data collection minimal and explain what is stored.' },
        { icon: 'Plug', title: 'Fits your stack', description: 'We connect to your website, CRM or inbox where that makes sense.' },
        { icon: 'RefreshCw', title: 'Continuous improvement', description: 'We review conversations and update the knowledge base over time.' },
      ],
    },
    cta: {
      heading: 'Let’s Build Your Assistant',
      text: 'Tell us what your customers keep asking and we’ll show you how an AI assistant could handle it.',
    },
  },
  {
    slug: 'custom-cms-crm-development',
    title: 'Custom CMS & CRM Development',
    group: 'development-ai',
    sortOrder: 80,
    isNew: true,
    shortDescription:
      'Custom content management and customer relationship tools built around how your team actually works.',
    hero: {
      heading: 'Custom CMS & CRM Development',
      intro:
        'Off-the-shelf tools often force you to work around them. We build custom content management systems and CRMs that match your workflow, so your team can publish, track and follow up without friction.',
    },
    approach: {
      heading: 'How We Build Your System',
      intro: 'We start with how your team works today, then build only what you need:',
      steps: [
        { title: 'Requirements Workshop', description: 'We map your processes, users and the problems you want to solve.' },
        { title: 'Data Modelling', description: 'We design the content types, records and relationships your system needs.' },
        { title: 'UX Design', description: 'We design simple screens for editors, sales teams and managers.' },
        { title: 'Development', description: 'We build the system in stages so you can review working software early.' },
        { title: 'Migration & Integration', description: 'We move your existing data across and connect the tools you already use.' },
        { title: 'Training & Handover', description: 'We train your team and document how everything works.' },
      ],
    },
    whyChoose: {
      heading: 'Why Choose Pentox Studio?',
      items: [
        { icon: 'Workflow', title: 'Built around your workflow', description: 'The system follows your process, not the other way round.' },
        { icon: 'KeyRound', title: 'Role-based access', description: 'Each person sees and edits only what they should.' },
        { icon: 'Plug', title: 'Integrations', description: 'We connect email, forms, analytics and other tools where it helps.' },
        { icon: 'DatabaseBackup', title: 'Careful data migration', description: 'We plan and check the move of your existing records.' },
        { icon: 'BookOpen', title: 'Documentation & training', description: 'Your team learns the system and has guides to refer back to.' },
        { icon: 'TrendingUp', title: 'Room to grow', description: 'We structure the system so features can be added later.' },
      ],
    },
    cta: {
      heading: 'Let’s Plan Your System',
      text: 'Describe how your team works today and we’ll suggest what a custom CMS or CRM could look like.',
    },
  },
  {
    slug: 'cloud-devops',
    title: 'Cloud Deployment & DevOps',
    group: 'development-ai',
    sortOrder: 90,
    isNew: true,
    shortDescription:
      'Reliable cloud deployment, CI/CD and monitoring so your site or app stays online and easy to update.',
    hero: {
      heading: 'Cloud Deployment & DevOps',
      intro:
        'A great website or app still needs a solid home. We set up and maintain cloud hosting, Docker-based deployments, automated releases, backups and monitoring, so launches are routine and recoveries are quick.',
    },
    approach: {
      heading: 'How We Set Up Your Infrastructure',
      intro: 'We keep setups simple, documented and repeatable:',
      steps: [
        { title: 'Infrastructure Review', description: 'We look at your current hosting, risks and growth plans.' },
        { title: 'Environment Setup', description: 'We prepare servers, containers, domains and SSL for staging and production.' },
        { title: 'CI/CD Pipelines', description: 'We automate testing and releases so deploying is safe and repeatable.' },
        { title: 'Security Hardening', description: 'We apply sensible defaults: updates, firewalls, secrets handling and access control.' },
        { title: 'Monitoring & Backups', description: 'We add uptime monitoring, alerts and regular backups with a tested restore.' },
        { title: 'Documentation & Handover', description: 'We document the setup so your team is never locked out of its own infrastructure.' },
      ],
    },
    whyChoose: {
      heading: 'Why Choose Pentox Studio?',
      items: [
        { icon: 'Rocket', title: 'Repeatable deployments', description: 'Releases follow the same steps every time.' },
        { icon: 'DatabaseBackup', title: 'Backups you can restore', description: 'Regular backups, with restores actually tested.' },
        { icon: 'Shield', title: 'Security basics covered', description: 'Updates, firewalls and secrets are handled from day one.' },
        { icon: 'Activity', title: 'Monitoring & alerts', description: 'You find out about problems before your customers do.' },
        { icon: 'Layers', title: 'Staging environments', description: 'Changes are checked on staging before they go live.' },
        { icon: 'BookOpen', title: 'Clear documentation', description: 'Everything is written down for your team.' },
      ],
    },
    cta: {
      heading: 'Let’s Review Your Setup',
      text: 'Tell us where your site or app runs today and we’ll point out what to improve first.',
    },
  },
  {
    slug: 'mobile-app-development',
    title: 'Mobile App Development',
    group: 'development-ai',
    sortOrder: 100,
    isNew: true,
    shortDescription:
      'Mobile apps for iOS and Android, from idea and design to store release and maintenance.',
    hero: {
      heading: 'Mobile App Development',
      intro:
        'From a first idea to the App Store and Google Play, we design and build mobile apps that are simple to use and easy to maintain, using native or cross-platform technology depending on what suits your project.',
    },
    approach: {
      heading: 'How We Build Your App',
      intro: 'We work in clear stages so you always know what comes next:',
      steps: [
        { title: 'Discovery & Scoping', description: 'We define users, core features and what the first release should include.' },
        { title: 'UX/UI Design', description: 'We design flows and screens, and test them with clickable prototypes.' },
        { title: 'Development', description: 'We build the app and its backend or API in short, reviewable iterations.' },
        { title: 'Testing & QA', description: 'We test on real devices and different OS versions before release.' },
        { title: 'Store Release', description: 'We prepare listings and submit to the App Store and Google Play.' },
        { title: 'Support & Updates', description: 'We keep the app working as devices and operating systems change.' },
      ],
    },
    whyChoose: {
      heading: 'Why Choose Pentox Studio?',
      items: [
        { icon: 'Wrench', title: 'The right technology', description: 'Native or cross-platform, chosen for your goals and budget.' },
        { icon: 'Smartphone', title: 'User-first design', description: 'Simple flows that people understand without a manual.' },
        { icon: 'Server', title: 'Backend & API integration', description: 'We build or connect the services your app depends on.' },
        { icon: 'TestTube', title: 'Tested on real devices', description: 'We check behaviour beyond the simulator.' },
        { icon: 'Store', title: 'Store submission handled', description: 'We take care of listings, screenshots and review requirements.' },
        { icon: 'RefreshCw', title: 'Ongoing updates', description: 'Maintenance and improvements after launch.' },
      ],
    },
    cta: {
      heading: 'Let’s Scope Your App',
      text: 'Share your idea and we’ll help you define a first version worth building.',
    },
  },
]

function h2(value: string) {
  return h('h2', value)
}
