import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'executive',
  title: 'Executives',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Full Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'position',
      title: 'Position / Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'image',
      title: 'Profile Photo',
      type: 'image',
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'phone',
      title: 'Phone Number',
      description: 'Display format e.g. +233 24 123 4567',
      type: 'string',
    }),
    defineField({
      name: 'email',
      title: 'Email Address',
      type: 'string',
      validation: (Rule) =>
        Rule.custom((value) => {
          if (!value) return true
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
            ? true
            : 'Must be a valid email address'
        }),
    }),
    defineField({
      name: 'whatsapp',
      title: 'WhatsApp Number',
      description: 'Digits only, with country code — no spaces, dashes, or + sign. e.g. 233241234567',
      type: 'string',
      validation: (Rule) =>
        Rule.custom((value) => {
          if (!value) return true
          return /^\d+$/.test(value)
            ? true
            : 'WhatsApp number must contain digits only (no spaces, dashes, or + sign)'
        }),
    }),
    defineField({
      name: 'order',
      title: 'Display Order',
      description: 'Lower numbers appear first. e.g. President = 1, Vice President = 2',
      type: 'number',
      validation: (Rule) => Rule.required().integer().positive(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Connexional Executive', value: 'connexional' },
          { title: 'Connexional Boards',    value: 'Connexional Boards' },
          { title: 'Diocese',               value: 'Diocese' },
          { title: 'Local',                 value: 'local' },
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'bio',
      title: 'Short Bio',
      type: 'text',
      rows: 3,
    }),
  ],
  orderings: [
    {
      title: 'Display Order (ascending)',
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }],
    },
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'position',
      media: 'image',
      order: 'order',
      category: 'category',
    },
    prepare({ title, subtitle, media, order, category }) {
      const categoryLabel: Record<string, string> = {
        connexional: 'Connexional Executive',
        'Connexional Boards': 'Connexional Boards',
        Diocese: 'Diocese',
        local: 'Local',
      }
      return {
        title: `${order ? `#${order} · ` : ''}${title}`,
        subtitle: `${subtitle} — ${categoryLabel[category] ?? category}`,
        media,
      }
    },
  },
})