# Gallery Schema Update Plan

**Information Gathered:**
- misc.ts: gallery schema = title, images[] (image+alt/caption), eventCategory, date, description
- GallerySection.tsx: static array, ready for dynamic data
- useGallery() hook exists

**Plan:**
1. Add `localUrl` string field to gallery.images[] object (local storage fallback)
2. Add `url` string field (external URL option)
3. Frontend: useGallery() + urlFor(localUrl || image) + category = eventCategory

**Dependent Files:** None

**Followup:** Connect GallerySection to useGallery()

Approve?
