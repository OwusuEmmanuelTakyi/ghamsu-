import { defineField, defineType } from 'sanity'

// ─── Testimonials ──────────────────────────────────────────────────────────────
export const testimonial = defineType({
  name: 'testimonial',
  title: 'Testimonials',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'photo',
      title: 'Photo',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'role',
      title: 'Role / Year & Course',
      description: 'e.g. 4th Year Medical Student, UG',
      type: 'string',
    }),
    defineField({
      name: 'local',
      title: 'Local',
      type: 'string',
    }),
    defineField({
      name: 'testimony',
      title: 'Testimony',
      type: 'text',
      rows: 5,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'rating',
      title: 'Rating (1–5)',
      type: 'number',
      initialValue: 5,
      validation: (Rule) => Rule.required().min(1).max(5).integer(),
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'date',
      title: 'Date',
      type: 'datetime',
    }),
  ],
  orderings: [
    { title: 'Newest First', name: 'dateDesc', by: [{ field: 'date', direction: 'desc' }] },
  ],
  preview: {
    select: { title: 'name', subtitle: 'role', media: 'photo' },
  },
})

// ─── Gallery ───────────────────────────────────────────────────────────────────
export const gallery = defineType({
  name: 'gallery',
  title: 'Gallery',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({
      name: 'images',
      title: 'Images',
      type: 'array',
      of: [
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            { name: 'alt', type: 'string', title: 'Alt Text' },
            { name: 'caption', type: 'string', title: 'Caption' },
          ],
        },
      ],
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({ name: 'eventCategory', title: 'Event / Category', type: 'string' }),
    defineField({ name: 'date', title: 'Date', type: 'datetime' }),
    defineField({ name: 'description', title: 'Description', type: 'text', rows: 3 }),
  ],
  preview: { select: { title: 'title', subtitle: 'eventCategory' } },
})

// ─── Executives / Leadership ───────────────────────────────────────────────────
export const executive = defineType({
  name: 'executive',
  title: 'Executives / Leadership',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: 'Name', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({ name: 'position', title: 'Position / Title', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({ name: 'photo', title: 'Photo', type: 'image', options: { hotspot: true }, validation: (Rule) => Rule.required() }),
    defineField({ name: 'universityChapter', title: 'University / Chapter', type: 'string' }),
    defineField({ name: 'phone', title: 'Phone', type: 'string' }),
    defineField({ name: 'email', title: 'Email', type: 'string' }),
    defineField({ name: 'bio', title: 'Bio', type: 'text', rows: 3 }),
    defineField({ name: 'order', title: 'Order (for sorting)', type: 'number' }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'National', value: 'national' },
          { title: 'Regional', value: 'regional' },
          { title: 'Local', value: 'local' },
        ],
      },
    }),
  ],
  orderings: [{ title: 'Order', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] }],
  preview: { select: { title: 'name', subtitle: 'position', media: 'photo' } },
})

// ─── Departments / Ministries ──────────────────────────────────────────────────
export const department = defineType({
  name: 'department',
  title: 'Departments / Ministries',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: 'Name', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({ name: 'image', title: 'Icon / Image', type: 'image', options: { hotspot: true } }),
    defineField({ name: 'description', title: 'Description', type: 'text', rows: 4, validation: (Rule) => Rule.required() }),
    defineField({
      name: 'leader',
      title: 'Leader',
      type: 'reference',
      to: [{ type: 'executive' }],
    }),
    defineField({
      name: 'activities',
      title: 'Activities',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({ name: 'color', title: 'Color (hex)', type: 'string' }),
  ],
  preview: { select: { title: 'name', media: 'image' } },
})

// ─── Scripture Quotes ──────────────────────────────────────────────────────────
export const scriptureQuote = defineType({
  name: 'scriptureQuote',
  title: 'Scripture Quotes',
  type: 'document',
  fields: [
    defineField({ name: 'quoteText', title: 'Quote Text', type: 'text', rows: 4, validation: (Rule) => Rule.required() }),
    defineField({ name: 'reference', title: 'Reference (e.g. John 3:16)', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({ name: 'active', title: 'Active', type: 'boolean', initialValue: true }),
    defineField({ name: 'displayOrder', title: 'Display Order', type: 'number' }),
  ],
  orderings: [{ title: 'Display Order', name: 'displayOrderAsc', by: [{ field: 'displayOrder', direction: 'asc' }] }],
  preview: { select: { title: 'reference', subtitle: 'quoteText' } },
})

// ─── GHAMSU Today Updates ──────────────────────────────────────────────────────
export const ghamsuToday = defineType({
  name: 'ghamsuToday',
  title: 'GHAMSU Today Updates',
  type: 'document',
  fields: [
    defineField({ name: 'themeTitle', title: 'Theme Title', type: 'string' }),
    defineField({ name: 'themeDescription', title: 'Theme Description', type: 'text', rows: 3 }),
    defineField({ name: 'scriptureReference', title: 'Scripture Reference', type: 'string' }),
    defineField({
      name: 'happeningNow',
      title: 'Happening Now Events',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'title', type: 'string', title: 'Title' },
            { name: 'location', type: 'string', title: 'Location' },
          ],
          preview: { select: { title: 'title', subtitle: 'location' } },
        },
      ],
    }),
    defineField({
      name: 'laterToday',
      title: 'Later Today Events',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'title', type: 'string', title: 'Title' },
            { name: 'time', type: 'string', title: 'Time' },
            { name: 'location', type: 'string', title: 'Location' },
          ],
          preview: { select: { title: 'title', subtitle: 'time' } },
        },
      ],
    }),
    defineField({ name: 'date', title: 'Date', type: 'datetime' }),
    defineField({ name: 'active', title: 'Active', type: 'boolean', initialValue: false }),
  ],
  preview: { select: { title: 'themeTitle', subtitle: 'date' } },
})