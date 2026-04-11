# Gallery Schema Update - Steps

- [x] Create TODO from approved plan
- [x] Edit ghamsu-cms/schemaTypes/misc.ts: Add localUrl, url fields to gallery.images[] object
- [x] Update queries.ts GALLERY_QUERY to include new fields
- [x] Update types.ts GalleryItem interface
- [x] Connect GallerySection.tsx to useGallery() hook
- [x] Test: Create gallery doc in CMS with local/remote images
