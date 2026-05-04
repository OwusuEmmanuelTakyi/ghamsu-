import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'blog',
  title: 'Blogs / Articles',
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

    // ── Author Information ───────────────────────────────────────────
    defineField({
      name: 'authorName',
      title: 'Author Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
      description: 'Name of the person who wrote this blog post',
    }),
    defineField({
      name: 'authorLocal',
      title: 'Author Local / Position',
      type: 'string',
      description: 'Local chapter, position, or affiliation (e.g., "UG Local", "Chapel Leader", "Student")',
    }),

    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Faith', value: 'faith' },
          { title: 'Leadership', value: 'leadership' },
          { title: 'Campus Life', value: 'campus-life' },
          { title: 'Devotionals', value: 'devotionals' },
        ],
      },
    }),
    defineField({
      name: 'publishedDate',
      title: 'Published Date',
      type: 'datetime',
    }),
    defineField({
      name: 'readTime',
      title: 'Read Time (minutes)',
      type: 'number',
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
      description: 'Automatically updated when readers like the article.',
    }),
    defineField({
      name: 'views',
      title: 'Views',
      type: 'number',
      initialValue: 0,
      readOnly: true,
      description: 'Automatically updated each time the article is opened.',
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
      subtitle: 'category',
      media: 'featuredImage',
    },
  },
})