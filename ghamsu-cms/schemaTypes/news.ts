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
            { name: 'alt',     type: 'string', title: 'Alt Text' },
            { name: 'caption', type: 'string', title: 'Caption'  },
          ],
        },
      ],
      validation: (Rule) => Rule.required(),
    }),

    // ── Reporter Information ───────────────────────────────────────────────
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

    // ── Media Attachments ─────────────────────────────────────────────────
    defineField({
      name: 'mediaAttachments',
      title: 'Media Attachments',
      type: 'array',
      description: 'Add video or audio links related to this news story (YouTube, Vimeo, SoundCloud, etc.)',
      of: [
        {
          type: 'object',
          name: 'mediaItem',
          title: 'Media Item',
          fields: [
            defineField({
              name: 'mediaType',
              title: 'Media Type',
              type: 'string',
              options: {
                list: [
                  { title: '🎥 Video',  value: 'video' },
                  { title: '🎵 Audio',  value: 'audio' },
                ],
                layout: 'radio',
              },
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'label',
              title: 'Label',
              type: 'string',
              description: 'Short label shown above the player (e.g. "Watch the Sermon", "Listen to the Report")',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'url',
              title: 'URL',
              type: 'url',
              description: 'Paste a YouTube, Vimeo, SoundCloud, Spotify, or direct media link here',
              validation: (Rule) => Rule.required().uri({ scheme: ['http', 'https'] }),
            }),
            defineField({
              name: 'description',
              title: 'Short Description (optional)',
              type: 'string',
              description: 'Brief context shown below the player',
            }),
          ],
          preview: {
            select: {
              title:    'label',
              subtitle: 'url',
              type:     'mediaType',
            },
            prepare({ title, subtitle, type }) {
              return {
                title:    `${type === 'video' ? '🎥' : '🎵'} ${title}`,
                subtitle: subtitle,
              }
            },
          },
        },
      ],
    }),

    // ── Classification ────────────────────────────────────────────────────
    defineField({
      name: 'newsCategory',
      title: 'News Category',
      type: 'string',
      options: {
        list: [
          { title: 'Announcement',   value: 'announcement'   },
          { title: 'Event Coverage', value: 'event-coverage' },
          { title: 'Campus News',    value: 'campus-news'    },
          { title: 'Union Update',   value: 'union-update'   },
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

    // ── Engagement ────────────────────────────────────────────────────────
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
      title:    'title',
      subtitle: 'newsCategory',
      media:    'featuredImage',
    },
  },
})