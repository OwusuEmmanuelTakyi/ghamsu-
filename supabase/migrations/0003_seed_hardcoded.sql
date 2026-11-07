-- =============================================================================
-- 0003_seed_hardcoded.sql
-- Content currently hardcoded in the React code, with the values as they stand.
--
-- Rules applied
--   * Placeholders and details that disagree with themselves are NULL, and each
--     one is listed under "Seed TODOs" in MIGRATION_PLAN.md.
--   * Text is otherwise copied as written, including typos and generic template
--     copy. Those are also listed there, for the owner to correct.
--   * image_path values such as 'site/3.jpg' are planned paths. Phase 2 uploads
--     these repo images to exactly those paths in the 'media' bucket.
--   * "on conflict do nothing" means re-running never overwrites later edits.
-- =============================================================================

begin;

-- -----------------------------------------------------------------------------
-- Site settings
-- -----------------------------------------------------------------------------

insert into public.site_settings (key, is_public, description, value) values

('yearly_theme', true,
 'Footer theme. TODO: year is an assumption; the code shows the current year next to fixed text.',
 $json${
   "year": 2026,
   "title": "Walking in the Word: Equipped for Every Good Work",
   "scripture": "2 Timothy 3:16–17 - \"All Scripture is God-breathed and is useful for teaching, rebuking, correcting and training in righteousness, so that the servant of God may be thoroughly equipped for every good work.\""
 }$json$::jsonb),

('footer', true,
 'Footer text from components/Footer.tsx.',
 $json${
   "organization_name": "Ghana Methodist Student's Union",
   "logo_heading": "GHANA METHODIST\nSTUDENT'S UNION",
   "scripture": "2 Corinthians 5:20 - \"We are therefore Christ's ambassadors, as though God were making his appeal through us. We implore you on Christ's behalf: Be reconciled to God.\"",
   "join_text": "Become part of our vibrant community of faith and fellowship.",
   "join_label": "Join Now →",
   "join_url": "/contact",
   "social_heading": "GHAMSU OFFICIAL",
   "social_text": "Connect with us on social media for the latest updates, inspiration, and community engagement.",
   "powered_by": "Publications & Communications Board"
 }$json$::jsonb),

('contact_details', true,
 'Contact page details. TODO: both phone values are NULL (see MIGRATION_PLAN.md).',
 $json${
   "address_lines": [
     "c/o The Methodist Church Ghana",
     "P.O Box 403 Wesley House, Liberia Road,",
     "Greater Accra Region, Ghana"
   ],
   "phones": [
     { "label": "CGC", "number": null },
     { "label": "Office", "number": null }
   ],
   "emails": [
     "ghamsunationalsec@gmail.com",
     "ghamsupcb@gmail.com"
   ]
 }$json$::jsonb),

('coordinator', true,
 'Contact page coordinator profile. TODO: email, phone and whatsapp are NULL (see MIGRATION_PLAN.md).',
 $json${
   "name": "REV. YAW ANOKYE KYEI BAFFOUR",
   "title": "Connexional Ghamsu Coordinator",
   "section_heading": "Connexional Coordinator",
   "section_subheading": "The driving force behind GHAMSU's mission and vision",
   "image_path": "site/rev.png",
   "image_alt": "Connexional Coordinator",
   "bio_paragraphs": [
     "With over 15 years of dedicated service to the Methodist Church and student ministry, Rev. Anokye brings visionary leadership and pastoral excellence to GHAMSU. His commitment to spiritual development and youth empowerment has transformed the lives of thousands of students across the Connexion.",
     "Rev. Anokye holds a Master's degree in Theology and has led several transformational initiatives within the Methodist Church. His leadership philosophy centers on developing Ambassadors for Christ who impact their communities with faith, integrity, and service."
   ],
   "email": null,
   "phone": null,
   "whatsapp": null,
   "stats": [
     { "value": "15+", "label": "Years in Service" },
     { "value": "MANY", "label": "Lives Impacted" },
     { "value": "8+", "label": "As Cordinator" }
   ]
 }$json$::jsonb),

('bank_details', true,
 'Partner page bank details. TODO: account_number is a placeholder in the code, so it is NULL. Admin only, because changing it redirects donations.',
 $json${
   "section_heading": "Bank Account Details",
   "section_subheading": "Make your contribution directly to our bank account in Ghana",
   "account_name": "Ghana Methodist Student's Union",
   "bank_name": "GCB Bank Ltd.",
   "branch": "Knust Branch, Kumasi",
   "account_number": null,
   "alternative_bank": "Standard Chartered Bank, Harper Road Kumasi",
   "alternative_account_number": null,
   "international_note": "For Special information and international transfer information, contact us here",
   "receipt_note": "Please contact us for a receipt.",
   "contribution_note": null
 }$json$::jsonb)

on conflict (key) do nothing;

-- -----------------------------------------------------------------------------
-- Social links
-- -----------------------------------------------------------------------------

insert into public.social_links (platform, label, url, icon, sort_order, status) values
  ('facebook',  'Facebook',  'https://www.facebook.com/ghamsuofficial',                                'Facebook',      1, 'published'),
  ('instagram', 'Instagram', 'https://www.instagram.com/ghamsuofficial?igsh=bW9ud254NGZqYXkw',         'Instagram',     2, 'published'),
  ('twitter',   'Twitter',   'https://x.com/ghamsuofficial',                                           'Twitter',       3, 'published'),
  ('youtube',   'YouTube',   'https://www.youtube.com/@ghamsuofficial',                                'Youtube',       4, 'published'),
  ('linkedin',  'LinkedIn',  'https://linkedin.com/company/ghamsu',                                    'Linkedin',      5, 'published'),
  ('whatsapp',  'WhatsApp',  'https://whatsapp.com/channel/0029Vb59wTx3bbV3r68rku2l',                  'MessageCircle', 6, 'published'),
  ('tiktok',    'TikTok',    'https://www.tiktok.com/@ghamsuofficial1?is_from_webapp=1&sender_device=pc', 'Music2',     7, 'published'),
  ('telegram',  'Telegram',  'https://t.me/ghamsuofficial',                                            'MessageCircle', 8, 'published')
on conflict (platform) do nothing;

-- -----------------------------------------------------------------------------
-- Boards. member_count is NULL where Boards.tsx and BoardDetail.tsx disagree.
-- -----------------------------------------------------------------------------

insert into public.boards
  (slug, title, summary, description, detail_description, icon, home_icon, color,
   member_count, vision, responsibilities, activities, sort_order, status)
values
(
  'prayer-board',
  'Prayer Board',
  'Coordinating prayer initiatives and intercession ministries.',
  'Coordinating prayer initiatives, intercession ministries, and spiritual warfare strategies for the church.',
  'Coordinating prayer initiatives, intercession ministries, and spiritual warfare strategies for the church.',
  'Heart', 'Heart', 'red',
  8,
  'To create a culture of prayer that permeates every aspect of church life, empowering believers to intercede effectively for the church and community.',
  array[
    'Organize regular prayer meetings and intercession sessions',
    'Coordinate prayer chains for church members in need',
    'Develop prayer strategies for church goals and missions',
    'Lead corporate prayer during major church events',
    'Train members in prayer disciplines and spiritual warfare',
    'Maintain prayer request hotline and communication'
  ],
  array[
    'Weekly Prayer Meetings - Tuesdays 7:00 PM',
    'Monthly Fasting & Prayer Sessions',
    'Annual Prayer Retreat',
    'Prayer Walk for Community'
  ],
  1, 'published'
),
(
  'publications-board',
  'Publications & Communications Board',
  'Managing church communications and media outreach.',
  'Managing all church communications, publications, media outreach, and digital presence.',
  'Managing all church communications, publications, media outreach, and digital presence.',
  'BookOpen', 'FileText', 'blue',
  null,
  'To effectively communicate the Gospel message through multiple channels, ensuring our story reaches both members and the broader community.',
  array[
    'Manage church website and social media platforms',
    'Produce newsletters and church bulletins',
    'Coordinate multimedia content creation',
    'Manage church photography and videography',
    'Handle press releases and media relations',
    'Oversee digital advertising and outreach campaigns'
  ],
  array[
    'Weekly Newsletter Distribution',
    'Social Media Engagement Daily',
    'Monthly Video Content Production',
    'Annual Communications Strategy Review'
  ],
  2, 'published'
),
(
  'audit-board',
  'Audit Board',
  'Ensuring financial accountability and transparency.',
  'Ensuring financial accountability, transparency, and proper stewardship of the union resources across the connexion.',
  'Ensuring financial accountability, transparency, and proper stewardship of church resources.',
  'TrendingUp', 'Shield', 'green',
  6,
  'To maintain the highest standards of financial integrity and stewardship, building trust through transparency and accountability.',
  array[
    'Review and audit financial records quarterly',
    'Ensure compliance with Connexional financial policies',
    'Recommend financial controls and procedures',
    'Present audit reports to congregation',
    'Investigate financial irregularities',
    'Provide financial education to leadership'
  ],
  array[
    'Quarterly Financial Audits',
    'Annual Financial Report',
    'Budget Review Sessions',
    'Financial Stewardship Workshops'
  ],
  3, 'published'
),
(
  'project-board',
  'Project Board',
  'Overseeing church development and infrastructure projects.',
  'Overseeing Union development projects, Ghamsu Souvenirs, and other initiatives to support the growth and sustainability of the church.',
  'Overseeing church development projects, infrastructure improvements, and facility management.',
  'Users', 'Wrench', 'purple',
  9,
  'To maintain and develop church facilities that serve as welcoming spaces for worship, ministry, and community engagement.',
  array[
    'Plan and oversee church facility projects',
    'Manage building maintenance and repairs',
    'Coordinate facility improvement initiatives',
    'Prepare budget proposals for projects',
    'Supervise construction and renovation work',
    'Ensure health and safety compliance'
  ],
  array[
    'Monthly Facility Inspections',
    'Annual Maintenance Planning',
    'Capital Projects Management',
    'Volunteer Work Days'
  ],
  4, 'published'
),
(
  'research-board',
  'Research & Education Board',
  'Advancing theological research and educational programs.',
  'Advancing theological research, educational programs, and training initiatives for ministry development.',
  'Advancing theological research, educational programs, and training initiatives for ministry development.',
  'Globe', 'GraduationCap', 'yellow',
  null,
  'To foster intellectual growth and theological understanding that strengthens faith and equips leaders for effective ministry.',
  array[
    'Develop educational programs for members',
    'Conduct theological research on relevant topics',
    'Coordinate adult education classes',
    'Provide leadership training programs',
    'Partner with educational institutions',
    'Publish research findings and insights'
  ],
  array[
    'Weekly Bible Study Classes',
    'Annual Theology Conference',
    'Leadership Training Programs',
    'Research Publication Series'
  ],
  5, 'published'
),
(
  'medical-board',
  'Medical Board',
  'Providing healthcare ministry and wellness initiatives.',
  'Providing healthcare ministry, wellness initiatives, and medical outreach to the community.',
  'Providing healthcare ministry, wellness initiatives, and medical outreach to the community.',
  'Music', 'Activity', 'pink',
  null,
  'To demonstrate Christ''s love through compassionate medical care and health services that promote wholeness in body, mind, and spirit.',
  array[
    'Coordinate health screening programs',
    'Provide health education and awareness',
    'Organize medical outreach missions',
    'Support sick and elderly members',
    'Partner with healthcare organizations',
    'Develop wellness programs for church'
  ],
  array[
    'Monthly Health Seminars',
    'Quarterly Medical Outreach Clinics',
    'Annual Health Fair',
    'Community Medical Mission Trips'
  ],
  6, 'published'
)
on conflict (slug) do nothing;

-- -----------------------------------------------------------------------------
-- Major activities
-- -----------------------------------------------------------------------------

insert into public.major_activities
  (title, date_text, location, description, image_url, image_alt, sort_order, status)
values
(
  'GHAMSU CONNEXIONAL CONFERENCE', '2026', 'To be communicated',
  'A biennial conference to bring all ambassadors together for fellowship, training, and strategic planning for the union.',
  'https://lh3.googleusercontent.com/pw/AP1GczMe29lNS0rbP0Q-68s37jb-9UU_D-n54XCgHEFyMr0J-0x7HVLPEpdp2HLxD7QslltBu1uf3R912KE6YagesJhgDnN-kmP47oxLylsKLd50Bmx5Q1iiyZLUAGNp4GvURi37DkCuS2jxdk3J59htuu37=w1445-h963-s-no-gm',
  'GHAMSU CONNEXIONAL CONFERENCE', 1, 'published'
),
(
  'CONNEXIONAL PRAYER CONFERENCE', 'To be communicated', 'Various Dioceses',
  'Prayer conference across the connexion to unite in intercession for the church, nation, and global issues.',
  'https://images.unsplash.com/photo-1778104101737-d9f436018791?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  'CONNEXIONAL PRAYER CONFERENCE', 2, 'published'
),
(
  'GHAMSU MISSIONS', 'To be communicated', 'To be communicated',
  'Reaching the unreached with the gospel through evangelism, church planting, and humanitarian outreach in strategic locations across the connexion.',
  'https://lh3.googleusercontent.com/pw/AP1GczMJHUyBQ5iy7R-xD1mpi3uMT12J3Tjmi2s_LgWhiWaemphbtGftPORhvznjeB_rA0kN_ej0W8bv2Wg4_gSYnmfPSTS2RTMHQKfYAhwsOVl3mZPp1-oDInFPWLPdQyPoTn1J_3hfm97TrLWoLKSK59JU=w1445-h963-s-no-gm',
  'GHAMSU MISSIONS', 3, 'published'
)
on conflict (title) do nothing;

-- -----------------------------------------------------------------------------
-- Home hero slides, from pages/Home.tsx. The DEFAULT_SLIDES in HeroSection.tsx
-- are never displayed, because Home always passes its own slides.
-- -----------------------------------------------------------------------------

insert into public.hero_slides (eyebrow, heading, subheading, image_path, sort_order, status) values
(
  'GHAMSU - Since 1965',
  E'Ghana Methodist\nStudents'' Union',
  'We are therefore Christ''s ambassadors, as though God were making his appeal through us. We implore you on Christ''s behalf: Be reconciled to God. — 2 Corinthians 5:20',
  'site/3.jpg', 1, 'published'
),
(
  'Ambassadors for Christ',
  E'Ambassadors\nin Unity & Love',
  'United across locals,Dioceses and Connexional — one family, one mission, one Lord.',
  'site/7.jpg', 2, 'published'
),
(
  'Ambassadors in Unity & Love',
  E'Fellowship,\nWorship & Purpose',
  'Join us for fellowship, worship, and a journey of faith that transforms lives, campuses, and nations.',
  'site/5.jpg', 3, 'published'
)
on conflict (sort_order) do nothing;

-- -----------------------------------------------------------------------------
-- Inner page banners. Images remain external URLs until re-hosted.
-- -----------------------------------------------------------------------------

insert into public.page_heroes (page, title, subtitle, image_url, image_alt, status) values
('about', 'About Us',
 'Discover our rich history, mission, and the values that guide our community',
 'https://images.unsplash.com/photo-1778082388137-0b8718468b87?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
 'About Us', 'published'),
('events', 'Upcoming Events',
 'Join us for worship, fellowship, and community events that strengthen faith and build connections.',
 'https://lh3.googleusercontent.com/pw/AP1GczPgJ-D9S-fzrJR1is1c7g4gkRHtQbwo1ySL0aM2nqGE7-WqzVj_delsYsLvUbtR_0CE3gXq5pvTnn4fWyWjLVFOx5LdA8EEXWwwWupwRiky7nPt1uXB-gi20uuilw6j9IsBQGKZkkgn4j38aVXNz96n=w1445-h963-s-no-gm',
 'Upcoming Events', 'published'),
('blogs', 'News & Articles',
 'Latest updates, insights, and practical wisdom for your spiritual journey.',
 'https://images.unsplash.com/photo-1778088742542-ffe6bab6fe0e?q=80&w=1172&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
 'News & Articles', 'published'),
('sermons', 'Sermons & Teachings',
 'Watch or listen to inspiring messages that will strengthen your faith and transform your life.',
 'https://lh3.googleusercontent.com/pw/AP1GczP8NPdxQrLs1q9ypeq09dKga5Hl2dUNFsdrbcNEUJnpVaGucVkEUB-KvdXNdex2fBID4RUTiHchGvZIZrisEV-CODaaCYOrvgDRHKANYfyQrcs_1GnWmgCeKPUJ_ZlXZcu5D-QLJF89z69yko8urRC9=w1107-h963-s-no-gm',
 'Sermons & Teachings', 'published'),
('boards', 'Our Connexional Boards',
 'Six Boards Across the Connexion and Supporting the Connexional Executives in discharging their duties effectively',
 'https://lh3.googleusercontent.com/pw/AP1GczM-xcSh0NRQjWjjA63q85xh-nEhYVlrXtfhqB0q6x5lmI_AZnzfXUaRlqoO8zwjShsDRx-BBqNCAlQxDxRqL3PR0YjsU66ePSD3kp3wuelWoDIvM4wpPlEmzhguVjSe9BTUIKFGen5RnVQ40oPU_5KU=w1143-h963-s-no-gm',
 'Our Connexional Boards', 'published'),
('gallery', 'Our Gallery',
 'Moments of faith, fellowship, and community captured in time.',
 'https://images.unsplash.com/photo-1778082388302-38d8e5e40c7b?q=80&w=1059&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
 'Our Gallery', 'published'),
('contact', 'Contact Us',
 'We''d love to hear from you. Reach out with any questions or prayer requests.',
 'https://lh3.googleusercontent.com/pw/AP1GczPLWM9K4uwBhNvM9giX94dinXuCmGShUkXnryhkifXnJD41vT5X5yEx_FVG97uM1J5ID7JJPE_5gMKJXldF-oW1Ij3-PU6Hjs27juHdXc9R3B-AkiO5WyFD_4auGACsQH41qZpR1BRBgtzcEzRT_8Rv=w1445-h963-s-no-gm',
 'Contact Us', 'published'),
('partner', 'Partner With Us',
 'Your partnership enables us to transform lives, strengthen families, and impact communities for Christ.',
 'https://i.pinimg.com/1200x/74/f4/cb/74f4cbf489738376666d1927ff18a686.jpg',
 'Partner With Us', 'published')
on conflict (page) do nothing;

-- -----------------------------------------------------------------------------
-- Stats. NULL and 'draft' where the code contradicts itself (see plan TODOs).
-- -----------------------------------------------------------------------------

insert into public.stats
  (section, stat_key, label, numeric_value, display_value, icon, sort_order, status)
values
  ('home',       'members',  'Active Members',    null, null,   'Users',    1, 'draft'),
  ('home',       'years',    'Years of Service',  null, null,   'Globe',    2, 'draft'),
  ('home',       'dioceses', 'Dioceses',          24,   null,   'Calendar', 3, 'published'),
  ('home',       'locals',   'Locals',            null, null,   'Award',    4, 'draft'),
  ('home_about', 'years',    'Years of Impact',   null, '60+',  null,       1, 'published'),
  ('home_about', 'locals',   'Locals Nationwide', null, null,   null,       2, 'draft'),
  ('home_about', 'lives',    'Lives Transformed', null, 'Many', null,       3, 'published')
on conflict (section, stat_key) do nothing;

-- -----------------------------------------------------------------------------
-- Page sections
-- -----------------------------------------------------------------------------

insert into public.content_sections
  (page, section_key, eyebrow, heading, subheading, paragraphs, image_path, image_alt,
   badge_primary, badge_secondary, cta_label, cta_url, sort_order, status)
values
('home', 'hero_buttons', null, null, null, '{}', null, null, null, null, null, null, 1, 'published'),

('home', 'vision', 'The Four Pillars', 'GHAMSU VISION', null, '{}',
 'site/13.jpg', 'GHAMSU vision gathering', 'Our Vision', null, null, null, 2, 'published'),

('home', 'history', 'Our Journey', E'A Legacy of Faith\n& Ambassadors for Christ', null,
 array[
   'Ghana Methodist Students'' Union was founded in 1965 under the name Ghana Inter-University Methodist Union (GIUMU) by Prof. S.N. Quartey and two vibrant former seminary students, Rt. Rev. Michael Kumi and Rt. Rev. Blankson. What began as a small fellowship has grown into a vibrant Connexional movement spanning multiple educational institutions.',
   'In 1984, GHAMSU was constituted to include all post-elementary Methodist students. The historic 23rd Annual Conference at UCC unveiled our official emblem, anthem, and the defining slogan "Ambassadors for Christ!" — a turning point in our identity and mission.',
   'Today, over 60 years later, GHAMSU continues to be a beacon of hope for Methodist students — evangelising, discipling, and training spirit-filled leaders who impact church and society through faithful service.'
 ],
 'site/12.jpg', 'GHAMSU History', '1965', 'Founded', 'Read Our Full Story', '/about', 3, 'published'),

('home', 'about', 'Our Story', E'Transforming Lives\nSince 1965', null,
 array[
   'For over 60 years, Ghana Methodist Students'' Union has been a beacon of faith and spiritual guidance across our Connexion — creating a welcoming community where students encounter God''s love, grow in faith, and discover their purpose as Ambassadors for Christ.'
 ],
 'site/3.jpg', 'GHAMSU community gathering', 'Since 1965', null, 'Our Story', '/about', 4, 'published'),

('home', 'boards', 'Leadership', 'Our Connexional Boards',
 'Six Boards Across the Connexion and Supporting the Connexional Executives in discharging their duties effectively',
 '{}', null, null, null, null, null, null, 5, 'published'),

('home', 'engage', 'Connect', 'Ways to Engage',
 'Discover opportunities to connect, grow, and serve',
 '{}', null, null, null, null, null, null, 6, 'published'),

('about', 'history', null, 'Our History', null,
 array[
   'The Union was formed in 1965 under the name Ghana Inter-University Methodist Union (GIUMU). GHAMSU is 61yrs old. The birth of our union is credited to Prof. S.N. Quartey. He was a member of the Methodist Youth Fellowship (MYF) branch at Shama in the Western region. There was nothing like a Christian denominational fellowship on the university campus; Students Christian Movement (SCM) and Scripture Union (SU) were the Christian organizations who held meetings on Saturdays.',
   'Two vibrant former students of Trinity Theological Seminary, Rt. Rev. Michael Kumi and Rt. Rev. Blankson enrolled at University of Ghana during the next academic year of 1966. They were elected as the President and Secretary, respectively, of the Group which saw the linking up with the University of Science and Technology and University of Cape Coast into forming the Ghana Inter-University Methodist Union (GIUMU). Eventually, the Union was extended to include other tertiary institutions and second cycle institutions.',
   'On 8th June, 1984 at Annual Conference, it was decided that henceforth, GHAMSU be constituted by all post-elementary school Methodist students.',
   'The 23rd Annual Conference held at UCC from 14th-17th April, 1988 was very historical. The new GHAMSU emblem was officially unveiled whilst delegates adopted the GHAMSU anthem which was composed by our own Bro. Ben Otchere with the tune-name "BENREEN". Conference again adopted the slogan "AMBASSADORS - FOR CHRIST!" as common greeting to be used by all members. The Conference also agreed that the Union should provide a common certificate with the GHAMSU emblem on it for all member branches.'
 ],
 null, null, null, null, null, null, 1, 'published'),

('about', 'mission', null, 'Our Mission', null,
 array['To evangelize and disciple others to a personal faith in Christ, train and bring up spirit-filled leaders who will affect the church and society at large.'],
 null, null, null, null, null, null, 2, 'published'),

('about', 'vision', null, 'Our Vision', null,
 array['To develop Ambassadors in unity and love for Christ, witness Him to the nations, build on the strong foundation of the Methodist Church, and produce responsible contributors to society.'],
 null, null, null, null, null, null, 3, 'published'),

('about', 'values', 'Our Foundation', 'Core Values',
 'The Methodist Faith: All need to be saved, All can be saved, All can know themselves to be saved, All can be saved to the uttermost',
 '{}', null, null, null, null, null, null, 4, 'published'),

('about', 'motto', null, 'Our Motto', '"Ambassadors in Unity and Love"',
 array['This motto encapsulates our commitment to unity, love, and representing Christ in all we do.'],
 null, null, null, null, null, null, 5, 'published'),

('about', 'slogan', null, 'Our Slogan', '"Ambassadors for Christ!"',
 array['Members use this slogan for easy interaction and identification, anchored in 2 Corinthians 5:20.'],
 null, null, null, null, null, null, 6, 'published'),

('about', 'aims', 'Purpose', 'Our Aims', null, '{}', null, null, null, null, null, null, 7, 'published'),

('about', 'structure', 'Organization', 'Our Structure',
 'An organized framework structured around Connexional, Diocese, and Local levels',
 '{}', null, null, null, null, null, null, 8, 'published'),

('partner', 'ways', null, 'Ways to Partner', null, '{}', null, null, null, null, null, null, 1, 'published')

on conflict (page, section_key) do nothing;

-- -----------------------------------------------------------------------------
-- Page section items
-- -----------------------------------------------------------------------------

insert into public.content_items
  (section_id, sort_order, title, description, label, value, icon, link_url)
select s.id, v.sort_order, v.title, v.description, v.label, v.value, v.icon, v.link_url
from (values
  ('home', 'hero_buttons', 1, null, null, 'Join Us', null, null, '/contact'),
  ('home', 'hero_buttons', 2, null, null, 'Learn More', null, null, '/about'),

  ('home', 'vision', 1, 'To develop Ambassadors in unity and love for Christ', null, null, '01', 'Heart', null),
  ('home', 'vision', 2, 'To witness Him to the nations', null, null, '02', 'Globe', null),
  ('home', 'vision', 3, 'To build on the strong foundation of the church', null, null, '03', 'Church', null),
  ('home', 'vision', 4, 'To responsible contributors to society', null, null, '04', 'Users', null),

  ('home', 'about', 1, 'Rooted in Scripture & Methodist tradition', null, null, null, null, null),
  ('home', 'about', 2, 'Spirit-filled praise & worship culture', null, null, null, null, null),
  ('home', 'about', 3, 'Active campus evangelism through SICE', null, null, null, null, null),
  ('home', 'about', 4, 'Missions outreach beyond campus gates', null, null, null, null, null),

  ('home', 'engage', 1, 'Worship Services', 'Experience powerful worship and inspiring messages every Sunday at 9 AM and 11 AM.', null, null, 'Music', null),
  ('home', 'engage', 2, 'Prayer Meetings', 'Join us for weekly prayer gatherings every Wednesday at 7 PM.', null, null, 'Heart', null),
  ('home', 'engage', 3, 'Counseling', 'Professional pastoral counseling available by appointment.', null, null, 'MessageCircle', null),
  ('home', 'engage', 4, 'Outreach', 'Participate in our community service initiatives and mission trips.', null, null, 'HandHeart', null),

  ('about', 'values', 1, 'Love & Compassion', 'We believe in showing God''s love through compassionate service to our community, living out the Methodist faith through action.', null, null, 'Heart', null),
  ('about', 'values', 2, 'Purpose-Driven', 'Helping individuals discover and fulfill their God-given purpose in life as Ambassadors for Christ.', null, null, 'Target', null),
  ('about', 'values', 3, 'Community', 'Building authentic relationships in unity and love, supporting one another in faith and leadership development.', null, null, 'Users', null),
  ('about', 'values', 4, 'Excellence', 'Pursuing excellence in all we do to honor God, serve the church, and contribute responsibly to society.', null, null, 'Award', null),

  ('about', 'aims', 1, 'Witness & Faith', 'To witness the Lord Jesus Christ as the Lord and Savior and lead others to a personal faith in Jesus Christ.', null, null, null, null),
  ('about', 'aims', 2, 'Church Foundation', 'To build on the strong foundation of the Methodist Church and encourage responsible church membership in all educational institutions.', null, null, null, null),
  ('about', 'aims', 3, 'Community Support', 'To encourage one another to live the Christian life and support personal spiritual development among members.', null, null, null, null),
  ('about', 'aims', 4, 'Societal Impact', 'To prepare individuals to be responsible contributors to society through service and Christian witness.', null, null, null, null),

  ('about', 'structure', 1, 'Connexional Executive', 'The highest decision-making body consisting of Connexional leadership, Diocesan officers, and Board Chairpersons providing overall guidance.', 'Executive', null, null, null),
  ('about', 'structure', 2, 'Connexional Boards', 'Six established boards managing key areas: Prayer, Publications, Audit, Medical, Research & Education, and Projects.', 'Governance', null, null, null),
  ('about', 'structure', 3, 'Diocesan Council', 'Diocesan leadership overseeing circuits and locals, implementing Connexional directives at the diocesan level.', 'Management', null, null, null),
  ('about', 'structure', 4, 'Local Executives', 'Local chapter leadership managing day-to-day operations, organizing SICE events, and coordinating member activities.', 'Operations', null, null, null),
  ('about', 'structure', 5, 'Members & Wings', 'Dedicated members and specialized departments serving in various capacities, executing the Union''s mission at grassroots level.', 'Service', null, null, null),

  ('partner', 'ways', 1, 'Monthly Giving', 'Become a regular partner with recurring monthly contributions that sustain ongoing ministry.', null, null, 'Heart', null),
  ('partner', 'ways', 2, 'One-Time Gift', 'Make a single donation to support specific projects or general ghamsu operations.', null, null, 'TrendingUp', null),
  ('partner', 'ways', 3, 'Legacy Giving', 'Contribute the GHAMSU Connexional Legacy projects', null, null, 'Users', null),
  ('partner', 'ways', 4, 'Mission Support', 'Partner with our missions initiatives and outreach programs like SICE and Ghamsu Missions.', null, null, 'Globe', null)
) as v(page, section_key, sort_order, title, description, label, value, icon, link_url)
join public.content_sections s
  on s.page = v.page and s.section_key = v.section_key
on conflict (section_id, sort_order) do nothing;

commit;
