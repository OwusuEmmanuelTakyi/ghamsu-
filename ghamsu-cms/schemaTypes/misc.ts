import { defineField, defineType } from 'sanity'

// ─── Testimonials ──────────────────────────────────────────────────────────────
export const testimonial = defineType({
  name: 'testimonial',
  title: 'Testimonials',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: 'Name', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({ name: 'photo', title: 'Photo', type: 'image', options: { hotspot: true } }),
    defineField({ name: 'university', title: 'University', type: 'string' }),
    defineField({ name: 'testimony', title: 'Testimony', type: 'text', rows: 5, validation: (Rule) => Rule.required() }),
    defineField({ name: 'date', title: 'Date', type: 'datetime' }),
    defineField({ name: 'featured', title: 'Featured', type: 'boolean', initialValue: false }),
  ],
  preview: { select: { title: 'name', subtitle: 'university', media: 'photo' } },
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

