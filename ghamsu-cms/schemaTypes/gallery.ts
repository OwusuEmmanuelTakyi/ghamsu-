import { defineField, defineType } from 'sanity'

// ─── Gallery ───────────────────────────────────────────────────────────────────
export const gallery = defineType({
  name: "gallery",
  title: "Gallery",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "coverImage",
      title: "Cover Image",
      type: "image",
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "photoCount",
      title: "Photo Count",
      type: "number",
      description: "Total number of photos in this album",
      validation: (Rule) => Rule.required().min(1).integer(),
    }),
    defineField({
      name: "date",
      title: "Date",
      type: "datetime",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "link",
      title: "Album Link",
      type: "url",
      description: "Google Drive or Google Photos link to the full album",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      options: {
        list: [
          { title: "Conference", value: "Conference" },
          { title: "Worship", value: "Worship" },
          { title: "Outreach", value: "Outreach" },
          { title: "Music", value: "Music" },
          { title: "Study", value: "Study" },
          { title: "Events", value: "Events" },
          { title: "Training", value: "Training" },
          { title: "Recreation", value: "Recreation" },
        ],
        layout: "dropdown",
      },
      validation: (Rule) => Rule.required(),
    }),
  ],
  orderings: [
    {
      title: "Date, Newest First",
      name: "dateDesc",
      by: [{ field: "date", direction: "desc" }],
    },
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "category",
      media: "coverImage",
      photoCount: "photoCount",
    },
    prepare({ title, subtitle, media, photoCount }) {
      return {
        title,
        subtitle: `📸 ${subtitle} · ${photoCount} photos`,
        media,
      };
    },
  },
})

