# Frontend Syntax Error Fixed & Schema Refactored

## Frontend Fix
- [x] Create TODO.md
- [x] Update types.ts: photo → image
- [x] Update queries.ts: EXECUTIVES_QUERY photo → image
- [x] npm run dev - syntax error resolved

## Schema Refactor
- [x] Create schemaTypes/executive.ts (extracted from misc.ts)
- [x] Clean misc.ts (removed executive default export)
- [x] Update schemaTypes/index.ts import executive from './executive'

**Next:** Run `cd ghamsu-cms && sanity dev` to test studio. Frontend at localhost:5174.
