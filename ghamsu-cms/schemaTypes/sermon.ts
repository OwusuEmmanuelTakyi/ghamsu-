import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'sermon',
  title: 'Sermons',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'preacher',
      title: 'Preacher',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'date',
      title: 'Date',
      type: 'datetime',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'mediaType',
      title: 'Media Type',
      type: 'string',
      options: {
        list: [
          { title: 'Video (YouTube / Vimeo)', value: 'video' },
          { title: 'Audio (SoundCloud / Anchor / direct link)', value: 'audio' },
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'videoUrl',
      title: 'Video URL',
      description: 'Paste a YouTube or Vimeo link (e.g. https://youtu.be/abc123)',
      type: 'url',
      hidden: ({ document }) => document?.mediaType !== 'video',
      validation: (Rule) =>
        Rule.custom((value, context) => {
          if (context.document?.mediaType === 'video' && !value) {
            return 'Video URL is required when Media Type is Video'
          }
          return true
        }),
    }),
    defineField({
      name: 'audioUrl',
      title: 'Audio URL',
      description: 'Paste a SoundCloud, Anchor, Spotify, or direct .mp3 link',
      type: 'url',
      hidden: ({ document }) => document?.mediaType !== 'audio',
      validation: (Rule) =>
        Rule.custom((value, context) => {
          if (context.document?.mediaType === 'audio' && !value) {
            return 'Audio URL is required when Media Type is Audio'
          }
          return true
        }),
    }),
    defineField({
      name: 'thumbnail',
      title: 'Thumbnail Image',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'scriptureReference',
      title: 'Scripture Reference',
      type: 'string',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'series',
      title: 'Series',
      type: 'string',
    }),
    defineField({
      name: 'duration',
      title: 'Duration (e.g. 45:30)',
      type: 'string',
    }),
  ],
  orderings: [
    {
      title: 'Date, Newest First',
      name: 'dateDesc',
      by: [{ field: 'date', direction: 'desc' }],
    },
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'preacher',
      media: 'thumbnail',
      mediaType: 'mediaType',
    },
    prepare({ title, subtitle, media, mediaType }) {
      return {
        title,
        subtitle: `${mediaType === 'video' ? '🎬' : '🎙️'} ${subtitle}`,
        media,
      }
    },
  },
})