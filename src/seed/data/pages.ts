import { h, p, ul } from '../lexical'

export type SeedPage = {
  slug: string
  title: string
  template:
    | 'default'
    | 'about'
    | 'contact'
    | 'book-a-call'
    | 'thank-you'
    | 'services-hub'
    | 'industries-hub'
    | 'free-audit'
    | 'cost-estimator'
    | 'portfolio'
    | 'blog'
  excerpt?: string
  hero?: { eyebrow?: string; heading?: string; intro?: string }
  content?: unknown[]
  highlights?: { heading?: string; intro?: string; items: { icon?: string; title: string; description?: string }[] }
  secondary?: { heading?: string; text?: string; buttonLabel?: string; buttonUrl?: string }
  /** Seeded as a draft (not public) until the client approves the copy. */
  draft?: boolean
  reviewNote: string
}

// Copy comes from capture/02 and capture/07 where it exists. Anything written for this build is
// kept neutral (no statistics, guarantees or client claims) and flagged for client review.
export const pages: SeedPage[] = [
  {
    slug: 'services',
    title: 'Services',
    template: 'services-hub',
    excerpt: 'Marketing, design and development services for startups, SMEs and established businesses.',
    hero: {
      eyebrow: 'Our services',
      heading: 'Digital marketing, design and development services',
      intro:
        'Pentox Studio helps startups, SMEs, and established businesses grow online. Choose a service below, or start with a free audit.',
    },
    highlights: {
      heading: 'Why Pentox Studio',
      items: [
        {
          icon: 'MapPin',
          title: 'Based in Lahore, working worldwide',
          description: 'We work with businesses in Pakistan and around the world.',
        },
        {
          icon: 'Layers',
          title: 'Marketing, design and development together',
          description: 'One team covers strategy, creative and the technology behind your growth.',
        },
        {
          icon: 'Target',
          title: 'Tailored, not one-size-fits-all',
          description: 'We start from your business and goals, then build a plan that fits them.',
        },
      ],
    },
    secondary: {
      heading: 'Pricing',
      text: 'See what each package includes, or ask for a custom estimate for your project.',
      buttonLabel: 'View pricing',
      buttonUrl: '/pricing/',
    },
    reviewNote: 'TODO: client review (hub copy and "Why Pentox" points).',
  },
  {
    slug: 'industries',
    title: 'Industries',
    template: 'industries-hub',
    excerpt: 'Marketing, design and development tailored to your industry.',
    hero: {
      eyebrow: 'Industries',
      heading: 'Industries we work with',
      intro: 'Marketing, design and development shaped around the way your industry works.',
    },
    reviewNote: 'TODO: client review (target industries are still to be confirmed).',
  },
  {
    slug: 'about-us',
    title: 'About us',
    template: 'about',
    excerpt:
      'Pentox Studio is a digital marketing, design and development agency in Lahore, Pakistan.',
    hero: {
      eyebrow: 'About us',
      heading: 'About Pentox Studio',
      intro:
        'Pentox Studio is a digital marketing, design and development agency in Lahore, Pakistan, helping startups, SMEs, and established businesses grow online.',
    },
    content: [
      h('h2', 'Our story and mission'),
      p(
        'We are a creative business solutions agency. We combine marketing, design and technology so that the businesses we work with can be found, trusted and chosen online.',
      ),
    ],
    highlights: {
      heading: 'What drives our work',
      items: [
        { icon: 'Palette', title: 'Creative', description: 'Ideas and design that make your brand stand out.' },
        { icon: 'Target', title: 'Strategic', description: 'Every decision is tied to your business goals.' },
        { icon: 'Lightbulb', title: 'Innovative', description: 'We keep learning and use new tools where they help you.' },
      ],
    },
    secondary: {
      heading: 'Our office and reach',
      text: 'Our studio is in Lahore, Pakistan. We also work with clients in other countries.',
    },
    reviewNote: 'TODO: client review. Add the founding story, mission, team photos/roles and office details.',
  },
  {
    slug: 'contact-us',
    title: 'Contact us',
    template: 'contact',
    excerpt: 'Get in touch with Pentox Studio.',
    hero: {
      eyebrow: 'Contact',
      heading: 'Contact Us',
      intro: 'We would love to hear from you. Feel free to reach out using the below details.',
    },
    secondary: {
      heading: 'Prefer to talk? Book a call',
      text: 'Pick a time that suits you and we will talk through your goals.',
    },
    reviewNote: 'TODO: client review.',
  },
  {
    slug: 'book-a-call',
    title: 'Book a call',
    template: 'book-a-call',
    excerpt: 'Book a call with Pentox Studio.',
    hero: {
      eyebrow: 'Book a call',
      heading: 'Book a call with Pentox Studio',
      intro: 'Pick a time that works for you and we will talk through your goals.',
    },
    highlights: {
      heading: 'What we will cover',
      items: [
        { icon: 'Target', title: 'Your goals', description: 'What you want to achieve and by when.' },
        { icon: 'Search', title: 'Where you are today', description: 'Your website, marketing and current results.' },
        { icon: 'ListChecks', title: 'Next steps', description: 'The services that fit, and how we would start.' },
      ],
    },
    reviewNote: 'TODO: client review.',
  },
  {
    slug: 'blog',
    title: 'Blog',
    template: 'blog',
    excerpt: 'Practical guides on digital marketing, SEO, web development and design from Pentox Studio.',
    hero: {
      eyebrow: 'Blog',
      heading: 'Guides and insights',
      intro: 'Practical articles on digital marketing, SEO, web development and design.',
    },
    reviewNote: 'TODO: client review.',
  },
  {
    slug: 'portfolio',
    title: 'Portfolio',
    template: 'portfolio',
    excerpt: 'Selected projects by Pentox Studio.',
    hero: {
      eyebrow: 'Our Projects',
      heading: 'Work we are proud of',
      intro: 'A selection of the projects we have worked on.',
    },
    reviewNote: 'TODO: client review.',
  },
  {
    slug: 'free-audit',
    title: 'Free audit',
    template: 'free-audit',
    excerpt: 'Request a free SEO and website audit from Pentox Studio.',
    hero: {
      eyebrow: 'Free audit',
      heading: 'Free SEO & Website Audit in 48 Hours',
      intro: 'Tell us your website and your main goal. We will review it and send you what we find.',
    },
    highlights: {
      heading: 'What you get',
      items: [
        { icon: 'Search', title: 'A review of your website', description: 'How it looks to visitors and to search engines today.' },
        { icon: 'TrendingUp', title: 'Where the opportunities are', description: 'The changes most likely to help you reach your goal.' },
        { icon: 'ListChecks', title: 'Clear next steps', description: 'What to do first, with no obligation to hire us.' },
      ],
    },
    reviewNote: 'TODO: client review. Confirm the 48-hour promise and what the audit covers.',
  },
  {
    slug: 'cost-estimator',
    title: 'Cost estimator',
    template: 'cost-estimator',
    excerpt: 'Estimate the cost of your project with the Pentox Studio cost estimator.',
    hero: {
      eyebrow: 'Cost estimator',
      heading: 'Estimate your project cost',
      intro: 'Answer a few questions to get a price range for your project.',
    },
    highlights: {
      heading: 'What affects the price',
      items: [
        { icon: 'ListChecks', title: 'Scope', description: 'The more features and pages, the more work the project takes.' },
        { icon: 'CalendarDays', title: 'Timeline', description: 'Tighter deadlines can change the price.' },
        { icon: 'Layers', title: 'Complexity', description: 'Integrations and custom work need more time than standard builds.' },
      ],
    },
    reviewNote: 'TODO: client review. Estimator prices are set in Content → Estimator rules.',
  },
  {
    slug: 'thank-you',
    title: 'Thank you',
    template: 'thank-you',
    hero: {
      eyebrow: 'Thank you',
      heading: 'Thank you, we have your message',
      intro: 'Our team will get back to you soon.',
    },
    highlights: {
      heading: 'While you wait',
      items: [
        { icon: 'MessageCircle', title: 'Chat on WhatsApp', description: 'Prefer a quicker reply? Message us directly.' },
        { icon: 'CalendarDays', title: 'Book a call', description: 'Pick a time that suits you.' },
      ],
    },
    reviewNote: 'TODO: client review. Confirm the response-time wording in Site settings.',
  },
  {
    slug: 'privacy-policy',
    title: 'Privacy Policy',
    template: 'default',
    draft: true,
    hero: { heading: 'Privacy Policy' },
    content: [
      p('This is a working draft for review. It must be checked by the business owner (and legal counsel if needed) before it is published.'),
      h('h2', 'Who we are'),
      p('Pentox Studio is a digital marketing, design and development agency in Lahore, Pakistan. This policy explains how we handle personal data collected through this website.'),
      h('h2', 'What we collect'),
      ul([
        'Details you give us in forms, such as name, email, phone or WhatsApp number, website, project details and budget.',
        'Messages you send through the chat assistant, if enabled.',
        'Your email address if you subscribe to our newsletter.',
        'Technical and usage data (such as pages viewed, device and referrer) collected by analytics, only if you accept analytics cookies.',
        'Where you arrived from (for example campaign tags in a link), stored with an enquiry so we can see which channels work.',
      ]),
      h('h2', 'How we use it'),
      ul([
        'To reply to your enquiry and prepare proposals or audits.',
        'To send the newsletter you asked for, with an unsubscribe link in every email.',
        'To understand and improve how the site performs.',
        'To keep the site secure and prevent spam.',
      ]),
      h('h2', 'Who we share it with'),
      p('We use service providers to run the site, send email and measure usage, such as hosting, email delivery and analytics tools. They process data on our behalf. We do not sell personal data.'),
      h('h2', 'How long we keep it'),
      p('We keep enquiries and business correspondence only as long as needed for the purpose they were collected, or as required by law.'),
      h('h2', 'Your rights'),
      p('You can ask us to access, correct or delete the personal data we hold about you, or to stop sending you email, by contacting us using the details on our contact page.'),
      h('h2', 'Cookies'),
      p('See our Cookie Policy for details about cookies and how to change your choice.'),
      h('h2', 'Changes'),
      p('We may update this policy from time to time. The latest version is always on this page.'),
    ],
    reviewNote: 'TODO: legal review. Draft text, not yet approved for publication.',
  },
  {
    slug: 'terms',
    title: 'Terms of Service',
    template: 'default',
    draft: true,
    hero: { heading: 'Terms of Service' },
    content: [
      p('This is a working draft for review. It must be checked by the business owner (and legal counsel if needed) before it is published.'),
      h('h2', 'About these terms'),
      p('These terms apply to your use of the Pentox Studio website. Work we carry out for clients is covered by a separate written proposal or agreement.'),
      h('h2', 'Use of the website'),
      p('You may use this site for lawful purposes only. Please do not attempt to disrupt it, gain unauthorised access, or submit false or harmful content through our forms.'),
      h('h2', 'Content and intellectual property'),
      p('The text, design, logos and other material on this site belong to Pentox Studio or its licensors. You may not copy or reuse them without permission.'),
      h('h2', 'Information on this site'),
      p('We try to keep the information on this site accurate and up to date, but it is provided for general information. Prices, scope and timelines are confirmed in a written proposal.'),
      h('h2', 'Links to other sites'),
      p('Our site may link to third-party sites. We are not responsible for their content or practices.'),
      h('h2', 'Limitation of liability'),
      p('To the extent permitted by law, Pentox Studio is not liable for losses arising from the use of this website.'),
      h('h2', 'Changes and contact'),
      p('We may update these terms from time to time. Questions about them can be sent to us through our contact page.'),
    ],
    reviewNote: 'TODO: legal review. Draft text, not yet approved for publication.',
  },
  {
    slug: 'cookie-policy',
    title: 'Cookie Policy',
    template: 'default',
    draft: true,
    hero: { heading: 'Cookie Policy' },
    content: [
      p('This is a working draft for review. It must be checked by the business owner before it is published.'),
      h('h2', 'What cookies are'),
      p('Cookies and similar technologies are small pieces of data stored in your browser. They help websites work and show how they are used.'),
      h('h2', 'How we use them'),
      p('We load analytics tools (such as Google Analytics, Google Tag Manager and Microsoft Clarity, where enabled) only if you click Accept on the cookie banner. If you decline, or do nothing, no analytics scripts are loaded.'),
      p('Your choice is remembered in your browser so we do not ask again on every page.'),
      h('h2', 'Source-tracking cookie'),
      p('When you first visit, we store a small first-party cookie (pentox_ft, up to 90 days) with where you came from: campaign tags in the link, the referring site and the first page you saw. It is sent with an enquiry only if you submit a form, so we can tell which channel brought you to us.'),
      h('h2', 'Changing your choice'),
      p('Use the "Cookie settings" link in the footer at any time to accept or decline analytics. Withdrawing consent reloads the page so the tools stop running.'),
      h('h2', 'Third-party embeds'),
      p('Pages that embed a map or a booking calendar load content from the provider (for example Google Maps, Cal.com or Calendly), which may set its own cookies. See their policies for details.'),
      h('h2', 'Contact'),
      p('Questions about this policy can be sent to us through our contact page.'),
    ],
    reviewNote: 'TODO: legal review. Draft text, not yet approved for publication.',
  },
]

// Fixed wording for the page templates (section headings, button and field labels).
export const siteText = {
  common: {
    home: 'Home',
    services: 'Services',
    industries: 'Industries',
    learnMore: 'Learn more',
    viewAllServices: 'View all services',
    viewAllProjects: 'All projects',
    whatsapp: 'Chat on WhatsApp',
    call: 'Call us',
    email: 'Email us',
    bookCall: 'Book a call',
    openBooking: 'Open the booking page',
    estimator: 'Estimate your project cost',
    previewBanner: 'Draft preview: only you can see this version.',
  },
  service: {
    included: 'What’s included',
    results: 'Results',
    packages: 'Packages',
    priceFrom: 'Starting from',
    tools: 'Tools and technologies',
    industries: 'Industries we work with',
    relatedProjects: 'Related projects',
    relatedPosts: 'Related articles',
    subServices: 'Related services',
    faq: 'Frequently asked questions',
  },
  industry: {
    challenges: 'Challenges we help with',
    services: 'Recommended services',
    projects: 'Case studies',
    faq: 'Frequently asked questions',
  },
  hubs: {
    howWeWork: 'How we work',
    featuredProjects: 'Featured case studies',
    faq: 'Frequently asked questions',
    noIndustries: 'Industry pages are coming soon.',
  },
  blog: {
    breadcrumb: 'Blog',
    searchLabel: 'Search the blog',
    searchPlaceholder: 'Search articles',
    searchButton: 'Search',
    all: 'All',
    filterLabel: 'Filter articles by category',
    featured: 'Featured',
    latest: 'Latest articles',
    noResults: 'No articles found.',
    clear: 'Clear search and filters',
    previous: 'Previous',
    next: 'Next',
    pageOf: 'Page {page} of {pages}',
    readTime: '{minutes} min read',
    updated: 'Updated',
    by: 'By',
    toc: 'On this page',
    share: 'Share this article',
    shareFacebook: 'Share on Facebook',
    shareLinkedin: 'Share on LinkedIn',
    shareX: 'Share on X',
    shareWhatsapp: 'Share on WhatsApp',
    relatedService: 'Related service',
    relatedPosts: 'Related articles',
    aboutAuthor: 'About the author',
    authorPosts: 'Articles by this author',
    categoryEyebrow: 'Category',
    authorEyebrow: 'Author',
    rss: 'RSS feed',
    midCtaHeading: 'Want help with this?',
    midCtaText: 'Tell us about your website and goals and we will show you where to start.',
    midCtaButton: 'Get your free audit',
    midCtaUrl: '/free-audit/',
  },
  portfolio: {
    breadcrumb: 'Portfolio',
    all: 'All',
    filterLabel: 'Filter projects by category',
    empty: 'No projects in this category yet.',
    workedOn: 'We worked on:',
    challenge: 'The challenge',
    solution: 'Our solution',
    results: 'Results',
    gallery: 'Gallery',
    tools: 'Tools used',
    testimonial: 'What the client says',
    proof: 'What clients say',
    nextProject: 'Next project',
    visitProject: 'Visit the project',
    openImage: 'Open image',
    close: 'Close',
    previous: 'Previous image',
    next: 'Next image',
  },
  contact: {
    details: 'Contact information',
    phone: 'Phone',
    whatsapp: 'WhatsApp',
    email: 'Email',
    address: 'Address',
    hours: 'Hours',
    follow: 'Follow us',
    map: 'Find us',
    booking: 'Book a call',
    reachUs: 'Reach us directly',
    thankYouProjects: 'See our work',
    testimonial: 'What clients say',
    faq: 'Frequently asked questions',
  },
}

// Wording and choices for the lead forms and the estimator. Budget bands are deliberately empty:
// the question stays hidden until the client supplies real ranges (no invented prices).
export const leadForms = {
  form: {
    serviceStep: 'What do you need?',
    serviceHelp: 'Choose one or more services.',
    detailsStep: 'Tell us about the project',
    contactStep: 'How can we reach you?',
    budgetLabel: 'Budget',
    timelineLabel: 'Timeline',
    messageLabel: 'Anything else we should know? (optional)',
    nameLabel: 'Your name',
    emailLabel: 'Email',
    whatsappLabel: 'WhatsApp / phone',
    contactHint: 'Please give an email address or a WhatsApp number.',
    privacyText: 'I agree to the processing of my details as described in the',
    privacyLinkLabel: 'Privacy Policy',
    next: 'Next',
    back: 'Back',
    submit: 'Send',
    sending: 'Sending…',
    stepOf: 'Step {current} of {total}',
    chooseService: 'Please choose at least one service.',
  },
  messages: {
    invalid: 'Some details are missing or not valid. Please check the form and try again.',
    needContact: 'Please add an email address or a WhatsApp number so we can reply.',
    rateLimited: 'Too many requests from your connection. Please try again later.',
    verification: 'We could not verify the spam check. Please try again.',
    failed: 'Something went wrong and your message was not sent. Please try again or contact us directly.',
  },
  audit: {
    websiteLabel: 'Your website',
    goalLabel: 'Your main goal',
    submit: 'Request my free audit',
  },
  estimator: {
    serviceTitle: 'What do you need?',
    scopeTitle: 'What should it include?',
    scopeHelp: 'Select everything that applies.',
    timelineTitle: 'When do you need it?',
    resultTitle: 'Your estimate',
    rangeLabel: 'Estimated range',
    fromLabel: 'Estimated',
    contactUsTitle: 'Contact us for a quote',
    contactUsText: 'This project needs a closer look. Leave your details and we will prepare a quote for you.',
    unlockTitle: 'Unlock your detailed quote',
    unlockText: 'Leave your details to see the full breakdown. We will also email it to you.',
    unlockButton: 'Show my detailed quote',
    requestButton: 'Request a quote',
    breakdownTitle: 'Your detailed quote',
    baseLabel: 'Starting price',
    timelineLine: 'Timeline',
    totalLabel: 'Estimated total',
    disclaimer: 'This is an estimate based on your answers, not a final quote. The final price is confirmed in a written proposal.',
    thanks: 'Thank you. We will be in touch to talk about your project.',
    restart: 'Start again',
    unavailableTitle: 'The cost estimator is not available yet',
    unavailableText: 'Tell us about your project and we will send you a quote.',
  },
  options: {
    budget: [],
    timeline: [
      { label: 'As soon as possible' },
      { label: 'Within 1 month' },
      { label: '1 to 3 months' },
      { label: 'Just exploring' },
    ],
  },
}

// Portfolio filter pills (capture/06 §4.6). Only categories that have a published project are shown.
export const portfolioCategories = [
  'Web Development',
  'Social Media',
  'SEO',
  'Graphic Design',
  'Branding',
  'Video',
  'Printing & Packaging',
  '3D',
]

// Wording for the newsletter signup, the confirm / unsubscribe pages and the confirmation email.
export const newsletterText = {
  signup: {
    heading: 'Subscribe to our newsletter',
    text: 'Practical marketing and web tips. Unsubscribe anytime.',
    emailLabel: 'Email address',
    emailPlaceholder: 'Your email address',
    button: 'Subscribe',
    sending: 'Sending…',
    consentText: 'I agree to receive emails from Pentox Studio. See the',
    privacyLinkLabel: 'Privacy Policy',
    success: 'Almost done! Please check your inbox and click the link in our email to confirm your subscription.',
    errorInvalid: 'Please enter a valid email address and tick the box to agree.',
    errorRate: 'Too many attempts from your connection. Please try again later.',
    errorVerification: 'We could not verify the spam check. Please try again.',
    errorFailed: 'We could not send the confirmation email. Please try again later.',
  },
  confirmPage: {
    title: 'Confirm your subscription',
    intro: 'Press the button to confirm that you want to receive our newsletter.',
    button: 'Confirm subscription',
    doneTitle: 'You are subscribed',
    doneText: 'Thank you. You will now receive our newsletter. You can unsubscribe at any time from any email.',
    invalidTitle: 'This link is not valid',
    invalidText: 'The confirmation link is invalid, has expired or was already used. Please sign up again to get a new one.',
    homeLink: 'Back to the website',
  },
  unsubscribePage: {
    title: 'Unsubscribe',
    intro: 'Press the button to stop receiving our newsletter.',
    button: 'Unsubscribe',
    doneTitle: 'You are unsubscribed',
    doneText: 'You will not receive any more newsletters from us. We are sorry to see you go.',
    invalidTitle: 'This link is not valid',
    invalidText: 'The unsubscribe link is not valid. Please use the link in the latest email you received.',
    homeLink: 'Back to the website',
  },
  emails: {
    confirmSubject: 'Please confirm your subscription',
    confirmIntro: 'Thanks for signing up for the Pentox Studio newsletter. Please confirm your email address to start receiving it.',
    confirmButton: 'Confirm subscription',
    confirmIgnore: 'If you did not sign up, you can ignore this email and you will not be subscribed.',
    reason: 'You are receiving this email because you subscribed to the Pentox Studio newsletter.',
    unsubscribeLink: 'Unsubscribe',
    viewOnSite: 'View on the website',
  },
}

// Chat widget wording and the reply to blocked (prompt-injection) messages. The chatbot itself stays switched OFF
// until an admin enables it in the AI chatbot settings.
export const chatbotText = {
  injectionReply: 'I can only help with questions about Pentox Studio and its services. How can I help you with those?',
  widget: {
    title: 'Chat with us',
    launcherLabel: 'Open chat assistant',
    placeholder: 'Type your question…',
    send: 'Send message',
    close: 'Close chat',
    thinking: 'Thinking…',
    privacyNote:
      'This assistant is powered by AI and may make mistakes. Your messages are processed by our AI provider and stored so our team can follow up. Please do not share sensitive information.',
    errorText: 'Sorry, I cannot answer right now.',
    whatsappButton: 'Chat on WhatsApp',
    leadSaved: 'Thanks! Your details have been passed to our team.',
    newChat: 'Start a new chat',
    suggestions: [
      { text: 'What services do you offer?' },
      { text: 'How does the free audit work?' },
      { text: 'How can I contact you?' },
    ],
  },
}
