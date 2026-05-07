import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'news',
  title: 'News',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'featuredImage',
      title: 'Featured Image',
      type: 'image',
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      rows: 3,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'content',
      title: 'Content',
      type: 'array',
      of: [
        { type: 'block' },
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            {
              name: 'alt',
              type: 'string',
              title: 'Alt Text',
            },
            {
              name: 'caption',
              type: 'string',
              title: 'Caption',
            },
          ],
        },
      ],
      validation: (Rule) => Rule.required(),
    }),

    // ── Reporter Information (News Specific) ──────────────────────
    defineField({
      name: 'reporter',
      title: 'Reporter Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
      description: 'Name of the reporter who wrote this news story',
    }),
    defineField({
      name: 'reporterPosition',
      title: 'Reporter Position / Local',
      type: 'string',
      description: 'Reporter position or local chapter (e.g., "UG Local", "Communications Officer")',
    }),

    defineField({
      name: 'newsCategory',
      title: 'News Category',
      type: 'string',
      options: {
        list: [
          { title: 'Announcement', value: 'announcement' },
          { title: 'Event Coverage', value: 'event-coverage' },
          { title: 'Campus News', value: 'campus-news' },
          { title: 'Union Update', value: 'union-update' },
        ],
      },
    }),
    defineField({
      name: 'publishedDate',
      title: 'Published Date',
      type: 'datetime',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      initialValue: false,
    }),

    // ── Engagement fields ────────────────────────────────────────────
    defineField({
      name: 'likes',
      title: 'Likes',
      type: 'number',
      initialValue: 0,
      readOnly: true,
      description: 'Automatically updated when readers like the news.',
    }),
    defineField({
      name: 'views',
      title: 'Views',
      type: 'number',
      initialValue: 0,
      readOnly: true,
      description: 'Automatically updated each time the news is opened.',
    }),
  ],
  orderings: [
    {
      title: 'Published Date, Newest First',
      name: 'publishedDateDesc',
      by: [{ field: 'publishedDate', direction: 'desc' }],
    },
    {
      title: 'Most Liked',
      name: 'mostLiked',
      by: [{ field: 'likes', direction: 'desc' }],
    },
    {
      title: 'Most Viewed',
      name: 'mostViewed',
      by: [{ field: 'views', direction: 'desc' }],
    },
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'newsCategory',
      media: 'featuredImage',
    },
  },
  

  
})