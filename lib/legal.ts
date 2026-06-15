// Legal & trust pages. Content is intentionally thorough. NOTE for the operator:
// replace "VegasOnTap" with your registered legal entity if different, set up the
// referenced @vegasontap.com mailboxes, and have a Nevada attorney review before
// relying on these — they are a strong starting point, not legal advice.
export type LegalDoc = { slug: string; title: string; desc: string; updated: string; html: string };

const UPDATED = "June 14, 2026";

export const LEGAL: LegalDoc[] = [
  {
    slug: "privacy",
    title: "Privacy Policy",
    desc: "How VegasOnTap collects, uses, shares and protects your information, and the choices and rights you have.",
    updated: UPDATED,
    html: `
<p><em>Last updated: ${UPDATED}</em></p>
<p>This Privacy Policy explains how VegasOnTap ("VegasOnTap," "we," "us," or "our"), the operator of the website at vegasontap.com (the "Site"), collects, uses, discloses, and safeguards your information when you visit or interact with the Site. By using the Site, you agree to the practices described here. If you do not agree, please do not use the Site.</p>

<h2>1. Information we collect</h2>
<p>We collect the following categories of information:</p>
<ul>
<li><strong>Information you provide directly.</strong> Your email address when you subscribe to our newsletter; the contents of any deal, photo, or correction you submit through our contribution tools; and any information you include when you contact us.</li>
<li><strong>User-submitted photos and content.</strong> If you upload a photo of a menu, sign, or special, we process the image to extract deal information. Please do not upload photos containing other people, personal documents, or sensitive personal information.</li>
<li><strong>Automatically collected usage data.</strong> Like most websites, we automatically receive your IP address, browser type and settings, device type, operating system, referring/exit pages, the pages you view, and the dates/times of your visits, collected through cookies and similar technologies.</li>
<li><strong>Approximate location.</strong> If your browser provides it (with your permission) or we infer it from your IP address, we use approximate location to show deals "near you." We do not collect precise GPS location unless you explicitly allow it.</li>
<li><strong>Local storage.</strong> Features such as "saved" deals may be stored locally in your browser and are not transmitted to us unless stated.</li>
</ul>

<h2>2. How we use information</h2>
<ul>
<li>To operate, maintain, and improve the Site and its features;</li>
<li>To send you our newsletter and related communications if you have subscribed (you can unsubscribe at any time);</li>
<li>To process and moderate user-submitted deals, photos, and corrections;</li>
<li>To understand how the Site is used through analytics, and to measure and improve performance;</li>
<li>To serve and measure advertising, including personalized or contextual ads;</li>
<li>To detect, prevent, and address fraud, abuse, security issues, and technical problems;</li>
<li>To comply with legal obligations and enforce our Terms of Service.</li>
</ul>

<h2>3. Cookies and similar technologies</h2>
<p>We and our third-party partners use cookies, web beacons, pixels, and local storage to operate the Site, remember your preferences, measure traffic, and serve advertising. For details and your choices, see our <a href="/legal/cookies">Cookie Policy</a>. Most browsers let you refuse or delete cookies; doing so may affect some features.</p>

<h2>4. Advertising and affiliate relationships</h2>
<p>The Site is supported by advertising and affiliate marketing. We may display ads served by third-party ad networks (such as Google AdSense), which may use cookies and device identifiers to show ads based on your activity over time and across sites. We also include affiliate links; if you click one and make a booking or purchase, we may earn a commission at no extra cost to you. See our <a href="/legal/disclosure">Affiliate &amp; Advertising Disclosure</a>. Our newsletter may contain paid sponsorships, which we identify as such.</p>

<h2>5. How we share information</h2>
<p>We do not sell your personal information for money. We may share information:</p>
<ul>
<li><strong>With service providers</strong> who process data on our behalf — for example, our email/newsletter platform (Beehiiv), hosting and infrastructure providers (such as Railway and Cloudflare), and analytics and advertising partners (such as Google).</li>
<li><strong>For advertising</strong> — ad and analytics partners may receive usage and device data through cookies; under some U.S. state laws this may be considered "sharing" or a "sale," and you can opt out (see Section 8).</li>
<li><strong>For legal reasons</strong> — to comply with law, respond to lawful requests, or protect the rights, safety, and property of VegasOnTap, our users, or others.</li>
<li><strong>In a business transfer</strong> — in connection with a merger, acquisition, financing, or sale of assets.</li>
</ul>

<h2>6. Third-party services and links</h2>
<p>The Site links to and relies on third parties, including Google Maps, Google Places, venue and casino websites, booking partners, and social platforms. Their handling of your data is governed by their own privacy policies, not this one. We are not responsible for the content or privacy practices of third-party sites.</p>

<h2>7. Data retention and security</h2>
<p>We retain personal information only as long as necessary for the purposes described here or as required by law. Newsletter data is retained until you unsubscribe and for a reasonable period afterward. We use commercially reasonable administrative, technical, and physical safeguards to protect information, but no method of transmission or storage is completely secure, and we cannot guarantee absolute security.</p>

<h2>8. Your privacy rights</h2>
<p><strong>California residents (CCPA/CPRA).</strong> You have the right to know what personal information we collect, use, and disclose; to request access to and deletion of your personal information; to correct inaccurate information; and to opt out of the "sale" or "sharing" of personal information and of targeted advertising. We do not knowingly sell personal information for money, but our use of advertising cookies may qualify as "sharing." To exercise these rights, email <a href="mailto:privacy@vegasontap.com">privacy@vegasontap.com</a>. We will not discriminate against you for exercising your rights.</p>
<p><strong>EU/UK residents (GDPR/UK GDPR).</strong> Where applicable, our legal bases for processing are your consent (e.g., newsletter, certain cookies), our legitimate interests (e.g., operating and securing the Site), and compliance with legal obligations. You have rights to access, rectify, erase, restrict, and port your data, and to object to processing and withdraw consent. To exercise these rights, email <a href="mailto:privacy@vegasontap.com">privacy@vegasontap.com</a>.</p>
<p><strong>Opting out of ads.</strong> You can opt out of personalized advertising through the <a href="https://optout.aboutads.info" rel="nofollow noopener" target="_blank">Digital Advertising Alliance</a>, the <a href="https://youradchoices.com" rel="nofollow noopener" target="_blank">YourAdChoices</a> tool, and your device or browser ad settings, including Google's <a href="https://adssettings.google.com" rel="nofollow noopener" target="_blank">Ads Settings</a>.</p>

<h2>9. Children's privacy and age</h2>
<p>The Site is intended for adults. It is not directed to children under 13, and we do not knowingly collect personal information from them; if you believe a child has provided us information, contact us and we will delete it. The Site also contains information about gambling and alcohol, which are restricted to those 21 and older in Nevada. Nothing here is an offer or inducement to gamble or drink.</p>

<h2>10. International users</h2>
<p>The Site is operated in the United States. If you access it from outside the U.S., your information may be transferred to, stored, and processed in the U.S., where data-protection laws may differ from those in your jurisdiction.</p>

<h2>11. Changes to this policy</h2>
<p>We may update this Privacy Policy from time to time. We will revise the "Last updated" date above and, for material changes, provide additional notice where appropriate. Your continued use of the Site after changes take effect constitutes acceptance.</p>

<h2>12. Contact us</h2>
<p>Questions or requests about this Privacy Policy: <a href="mailto:privacy@vegasontap.com">privacy@vegasontap.com</a>.</p>
`,
  },
  {
    slug: "terms",
    title: "Terms of Service",
    desc: "The terms that govern your use of VegasOnTap, including disclaimers about deal accuracy, user submissions, and limits of liability.",
    updated: UPDATED,
    html: `
<p><em>Last updated: ${UPDATED}</em></p>
<p>These Terms of Service ("Terms") govern your access to and use of the website at vegasontap.com and its content and features (the "Site"), operated by VegasOnTap ("we," "us," or "our"). By accessing or using the Site, you agree to be bound by these Terms and our <a href="/legal/privacy">Privacy Policy</a>. If you do not agree, do not use the Site.</p>

<h2>1. Eligibility</h2>
<p>You must be at least 18 years old to use the Site and to subscribe to our communications. Some content concerns gambling and alcohol, which are limited to persons 21 and older under Nevada law. You are responsible for complying with all laws that apply to you.</p>

<h2>2. The Site is informational only — no guarantee of accuracy</h2>
<p>VegasOnTap aggregates happy hours, food and drink specials, menu prices, resort fees, buffet prices, gaming statistics, promotions, and other Las Vegas information from venue websites, public data sources, automated tools, and user submissions. <strong>Prices, deals, hours, availability, and terms change constantly and frequently without notice.</strong> We do not guarantee that any information on the Site is accurate, complete, current, or available, and we are not the provider of any deal, product, or service listed. <strong>Always confirm details directly with the venue before relying on them.</strong> Gaming payback figures and odds are statistical and historical; they do not predict individual outcomes, and gambling carries a real risk of loss.</p>

<h2>3. User submissions</h2>
<p>If you submit a deal, photo, correction, or other content ("Submissions"), you represent that you have the right to do so and that the Submission is accurate, lawful, and does not infringe anyone's rights or contain other people's personal information. You grant VegasOnTap a worldwide, non-exclusive, royalty-free, perpetual, irrevocable, sublicensable license to use, reproduce, modify, adapt, publish, and display the Submission on and in connection with the Site and our communications. We may moderate, edit, or remove Submissions at our discretion and are not obligated to publish or retain any Submission.</p>

<h2>4. Acceptable use</h2>
<p>You agree not to: (a) scrape, crawl, harvest, or bulk-download Site content except as expressly permitted; (b) use the Site for any unlawful purpose or to infringe any rights; (c) interfere with or disrupt the Site, its security, or its infrastructure; (d) submit false, misleading, abusive, or spam content; (e) misrepresent your affiliation; or (f) attempt to access areas or data not intended for you.</p>

<h2>5. Intellectual property</h2>
<p>The Site, including its design, text, original compilations, graphics, and software, is owned by VegasOnTap or its licensors and protected by intellectual-property laws. Factual information (such as prices and public gaming statistics) is not owned by us, but our particular selection, arrangement, and presentation of it is. You may view and share links to the Site for personal, non-commercial use. You may not copy, reproduce, or republish substantial portions of the Site without permission.</p>

<h2>6. Third-party links, advertising, and affiliate relationships</h2>
<p>The Site contains links to third-party websites, advertisements, and affiliate links. We do not control and are not responsible for third-party content, products, services, or practices. We may earn advertising revenue and affiliate commissions; see our <a href="/legal/disclosure">Affiliate &amp; Advertising Disclosure</a>. Your dealings with any third party, including any venue, advertiser, or booking partner, are solely between you and that party.</p>

<h2>7. Disclaimers</h2>
<p>THE SITE AND ALL CONTENT ARE PROVIDED "AS IS" AND "AS AVAILABLE," WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, AND ACCURACY. WE DO NOT WARRANT THAT THE SITE WILL BE UNINTERRUPTED, ERROR-FREE, OR SECURE, OR THAT ANY INFORMATION IS CORRECT OR CURRENT.</p>

<h2>8. Limitation of liability</h2>
<p>TO THE FULLEST EXTENT PERMITTED BY LAW, VEGASONTAP AND ITS OWNERS, OPERATORS, AND CONTRIBUTORS WILL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, DATA, GOODWILL, OR GAMBLING LOSSES, ARISING FROM OR RELATED TO YOUR USE OF (OR INABILITY TO USE) THE SITE OR RELIANCE ON ANY INFORMATION ON IT. OUR TOTAL LIABILITY FOR ANY CLAIM RELATING TO THE SITE WILL NOT EXCEED ONE HUNDRED U.S. DOLLARS ($100). SOME JURISDICTIONS DO NOT ALLOW CERTAIN LIMITATIONS, SO SOME OF THESE MAY NOT APPLY TO YOU.</p>

<h2>9. Indemnification</h2>
<p>You agree to indemnify and hold harmless VegasOnTap and its owners and operators from any claims, losses, liabilities, and expenses (including reasonable attorneys' fees) arising from your use of the Site, your Submissions, or your violation of these Terms or any law or third-party right.</p>

<h2>10. Governing law and dispute resolution</h2>
<p>These Terms are governed by the laws of the State of Nevada, without regard to its conflict-of-laws rules. You agree that any dispute will be resolved exclusively in the state or federal courts located in Clark County, Nevada, and you consent to their jurisdiction, except where applicable law provides otherwise. To the extent permitted by law, you and VegasOnTap waive any right to a jury trial and to participate in a class action.</p>

<h2>11. Changes, suspension, and termination</h2>
<p>We may modify these Terms or the Site at any time. Material changes will be reflected by the "Last updated" date above; your continued use constitutes acceptance. We may suspend or terminate access to the Site at our discretion.</p>

<h2>12. Contact</h2>
<p>Questions about these Terms: <a href="mailto:legal@vegasontap.com">legal@vegasontap.com</a>.</p>
`,
  },
  {
    slug: "cookies",
    title: "Cookie Policy",
    desc: "What cookies and similar technologies VegasOnTap uses, why, and how to control them.",
    updated: UPDATED,
    html: `
<p><em>Last updated: ${UPDATED}</em></p>
<p>This Cookie Policy explains how VegasOnTap uses cookies and similar technologies on vegasontap.com. It supplements our <a href="/legal/privacy">Privacy Policy</a>.</p>

<h2>What cookies are</h2>
<p>Cookies are small text files stored on your device when you visit a website. "Local storage" and similar technologies (pixels, web beacons, device identifiers) serve comparable purposes. They let a site remember your actions and preferences and help measure and improve performance and advertising.</p>

<h2>Types of cookies we use</h2>
<ul>
<li><strong>Strictly necessary.</strong> Required for the Site to function — for example, to load pages, remember locally "saved" deals, and keep the Site secure. These cannot be switched off in our systems.</li>
<li><strong>Preferences.</strong> Remember choices such as your last filter or sort so the Site behaves the way you expect.</li>
<li><strong>Analytics.</strong> Help us understand how visitors use the Site (which pages are popular, where errors occur) so we can improve it. We may use providers such as Google Analytics.</li>
<li><strong>Advertising.</strong> Used by us and third-party ad networks (such as Google AdSense) to deliver and measure ads, and in some cases to personalize them based on your activity over time and across sites.</li>
</ul>

<h2>Third-party cookies</h2>
<p>Some cookies are set by third parties whose services appear on the Site, including analytics providers, advertising networks, embedded maps (Google Maps/Places), and our newsletter platform. We do not control these cookies; review the relevant third party's policy for details.</p>

<h2>How to control cookies</h2>
<ul>
<li><strong>Browser settings.</strong> Most browsers let you block or delete cookies and clear local storage. Refer to your browser's help pages. Blocking some cookies may break parts of the Site.</li>
<li><strong>Advertising choices.</strong> Opt out of personalized advertising via the <a href="https://optout.aboutads.info" rel="nofollow noopener" target="_blank">Digital Advertising Alliance</a>, <a href="https://youradchoices.com" rel="nofollow noopener" target="_blank">YourAdChoices</a>, and Google's <a href="https://adssettings.google.com" rel="nofollow noopener" target="_blank">Ads Settings</a>.</li>
<li><strong>Do Not Track / Global Privacy Control.</strong> Where required by law, we honor recognized opt-out preference signals.</li>
</ul>

<h2>Changes</h2>
<p>We may update this Cookie Policy as our practices or the technologies we use change. Questions: <a href="mailto:privacy@vegasontap.com">privacy@vegasontap.com</a>.</p>
`,
  },
  {
    slug: "disclosure",
    title: "Affiliate & Advertising Disclosure",
    desc: "How VegasOnTap makes money — affiliate links, advertising, and sponsored content — and our commitment to editorial independence.",
    updated: UPDATED,
    html: `
<p><em>Last updated: ${UPDATED}</em></p>
<p>VegasOnTap is a free, reader-supported resource. We are transparent about how we make money, in keeping with the U.S. Federal Trade Commission's guidance on endorsements and disclosures.</p>

<h2>Affiliate links</h2>
<p>Some links on the Site are affiliate links. If you click one and book a hotel, buy tickets, reserve a tour, or make another qualifying purchase, we may receive a commission from the merchant — <strong>at no additional cost to you.</strong> You never pay more for using our links. We only add affiliate links to products and services we consider relevant to our readers.</p>

<h2>Advertising</h2>
<p>We display advertising, including ads served by third-party networks such as Google AdSense. These ads may be contextual or personalized based on your activity, and they help keep the Site free. Ads are labeled or visually distinct from our editorial content. See our <a href="/legal/cookies">Cookie Policy</a> for how advertising cookies work and how to opt out.</p>

<h2>Sponsored content and newsletter sponsorships</h2>
<p>From time to time we may publish sponsored content, or include paid sponsorships in our email newsletter, where a venue or brand pays for placement. <strong>We clearly label any sponsored or paid placement</strong> as such (for example, "Sponsored," "Ad," or "Paid partnership"). Sponsorship does not buy a favorable review.</p>

<h2>Editorial independence</h2>
<p>Our deal listings, prices, rankings, and data pages are determined by our own research, automated data collection, and verification process — not by who pays us. A business cannot pay to change its resort fee, its slot payback zone, or its place in a price comparison. Advertising and affiliate revenue support the Site but do not dictate our editorial conclusions.</p>

<h2>No professional advice</h2>
<p>Content on the Site, including gaming statistics and odds, is for general information and entertainment only. It is not financial, legal, or gambling advice. Please gamble responsibly; if gambling is a problem for you, call 1-800-GAMBLER.</p>

<h2>Questions</h2>
<p>Reach us at <a href="mailto:hello@vegasontap.com">hello@vegasontap.com</a>.</p>
`,
  },
  {
    slug: "about",
    title: "About VegasOnTap",
    desc: "Who we are, what we do, and how we collect and verify Las Vegas deal and price data.",
    updated: UPDATED,
    html: `
<p>VegasOnTap is the freshest, most comprehensive source for real Las Vegas deals and prices — happy hours, food and drink specials, menu prices, resort fees, buffet prices, casino odds and promotions, and more. Most Vegas "deals" sites are blogs that go stale the day after they publish. We built the opposite: a living, constantly-updated database, free to everyone.</p>

<h2>What we do</h2>
<p>We track thousands of specials across hundreds of Las Vegas venues, on and off the Strip, with the actual prices, the fine print, and — crucially — when each was last checked. We turn that data into tools no blog can match: sortable price comparisons for everything from a Coors Light to a ribeye, real-time "open now" happy hours, resort-fee and buffet-price tables, and official gaming-payback data.</p>

<h2>How we collect and verify data</h2>
<ul>
<li><strong>Direct from the source.</strong> We pull deals and menu prices straight from venue websites and menus — including reading prices off menu images and PDFs — so the data reflects what the venue itself publishes.</li>
<li><strong>Public data.</strong> Resort fees, parking, gaming payback (from the Nevada Gaming Control Board), and similar figures come from operator rate sheets and official public sources, with the reporting period dated on the page.</li>
<li><strong>Community confirmations.</strong> Visitors and locals can confirm a deal is still there, flag one that's gone, or submit a new special from a photo. Every listing shows a confidence indicator and a "last verified" date.</li>
<li><strong>Continuous refresh.</strong> Our systems re-check venues on a regular schedule, so listings stay current rather than frozen at publish time.</li>
</ul>

<h2>Our commitment to accuracy</h2>
<p>Las Vegas prices and deals change constantly, and no source is perfect. We date our data, show you when it was last checked, and always encourage you to confirm with the venue before you go. When we get something wrong, we want to fix it fast — if you spot an error, tell us.</p>

<h2>How we stay free</h2>
<p>VegasOnTap is supported by advertising and affiliate partnerships, disclosed openly in our <a href="/legal/disclosure">Affiliate &amp; Advertising Disclosure</a>. That support never decides our rankings or data.</p>

<h2>Get in touch</h2>
<p>Tips, corrections, partnerships, or feedback: see our <a href="/legal/contact">Contact</a> page.</p>
`,
  },
  {
    slug: "contact",
    title: "Contact",
    desc: "How to reach VegasOnTap — corrections, tips, partnerships, press, and privacy requests.",
    updated: UPDATED,
    html: `
<p>We'd love to hear from you. The fastest way to reach us is email — please use the address that matches your reason for writing so it gets to the right place.</p>

<h2>Corrections &amp; deal tips</h2>
<p>Spotted a price that's wrong, a deal that's gone, or a special we're missing? Email <a href="mailto:tips@vegasontap.com">tips@vegasontap.com</a>, or use the "Add a special from a photo" tool on the home page. Please include the venue name and, if you can, a photo or link.</p>

<h2>Partnerships &amp; advertising</h2>
<p>Venues, brands, and agencies interested in advertising, sponsorship, or partnerships: <a href="mailto:hello@vegasontap.com">hello@vegasontap.com</a>.</p>

<h2>Press &amp; media</h2>
<p>Media inquiries: <a href="mailto:hello@vegasontap.com">hello@vegasontap.com</a>.</p>

<h2>Privacy &amp; legal</h2>
<p>Privacy requests (access, deletion, opt-out): <a href="mailto:privacy@vegasontap.com">privacy@vegasontap.com</a>. Legal notices: <a href="mailto:legal@vegasontap.com">legal@vegasontap.com</a>.</p>

<h2>Response time</h2>
<p>We're a small team and read everything. We aim to respond within a few business days. Thanks for helping us keep Las Vegas's best deals accurate and fresh.</p>
`,
  },
];

export function getLegal(slug: string) { return LEGAL.find((d) => d.slug === slug) || null; }
