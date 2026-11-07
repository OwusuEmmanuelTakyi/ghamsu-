// Run with: node --test scripts/portable-text-to-tiptap.test.mjs
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  portableTextToTiptap as convert,
  PortableTextConversionError,
  tiptapStats,
  verifyConversion,
} from './portable-text-to-tiptap.mjs'

const span = (text, marks = []) => ({ _type: 'span', _key: 'k', text, marks })
const block = (children, extra = {}) => ({
  _type: 'block',
  _key: 'b',
  style: 'normal',
  markDefs: [],
  children: Array.isArray(children) ? children : [span(children)],
  ...extra,
})
const bullet = (text, level = 1) => block(text, { listItem: 'bullet', level })
const numbered = (text, level = 1) => block(text, { listItem: 'number', level })
const text = (value) => ({ type: 'paragraph', content: [{ type: 'text', text: value }] })

test('paragraph becomes a paragraph inside a doc', () => {
  assert.deepEqual(convert([block('Hello')]), { type: 'doc', content: [text('Hello')] })
})

test('headings keep their level', () => {
  for (const level of [1, 2, 3, 4, 5, 6]) {
    const doc = convert([block('Title', { style: `h${level}` })])
    assert.deepEqual(doc.content[0], {
      type: 'heading',
      attrs: { level },
      content: [{ type: 'text', text: 'Title' }],
    })
  }
})

test('consecutive bullets are grouped into one list', () => {
  const doc = convert([bullet('One'), bullet('Two'), bullet('Three')])
  assert.equal(doc.content.length, 1)
  assert.equal(doc.content[0].type, 'bulletList')
  assert.deepEqual(doc.content[0].content, [
    { type: 'listItem', content: [text('One')] },
    { type: 'listItem', content: [text('Two')] },
    { type: 'listItem', content: [text('Three')] },
  ])
})

test('numbered items become an ordered list', () => {
  const doc = convert([numbered('One'), numbered('Two')])
  assert.equal(doc.content.length, 1)
  assert.equal(doc.content[0].type, 'orderedList')
  assert.equal(doc.content[0].content.length, 2)
})

test('a paragraph between bullets makes two separate lists', () => {
  const doc = convert([bullet('One'), block('Middle'), bullet('Two')])
  assert.deepEqual(doc.content.map((node) => node.type), ['bulletList', 'paragraph', 'bulletList'])
})

test('changing list type starts a new list', () => {
  const doc = convert([bullet('One'), numbered('Two')])
  assert.deepEqual(doc.content.map((node) => node.type), ['bulletList', 'orderedList'])
})

test('a deeper level nests inside the previous item, then returns', () => {
  const doc = convert([bullet('Parent'), bullet('Child', 2), bullet('Sibling')])
  assert.equal(doc.content.length, 1)
  const [parent, sibling] = doc.content[0].content
  assert.deepEqual(parent.content, [
    text('Parent'),
    { type: 'bulletList', content: [{ type: 'listItem', content: [text('Child')] }] },
  ])
  assert.deepEqual(sibling.content, [text('Sibling')])
})

test('bold and italic together keep both marks', () => {
  const doc = convert([block([span('Both', ['strong', 'em'])])])
  assert.deepEqual(doc.content[0].content, [
    { type: 'text', text: 'Both', marks: [{ type: 'bold' }, { type: 'italic' }] },
  ])
})

test('all decorators map to TipTap marks', () => {
  const doc = convert([block([span('x', ['code', 'underline', 'strike-through'])])])
  assert.deepEqual(doc.content[0].content[0].marks, [
    { type: 'code' }, { type: 'underline' }, { type: 'strike' },
  ])
})

test('a link annotation becomes a link mark', () => {
  const doc = convert([block([span('Before '), span('site', ['abc'])], {
    markDefs: [{ _key: 'abc', _type: 'link', href: 'https://www.ghamsu.org' }],
  })])
  assert.deepEqual(doc.content[0].content, [
    { type: 'text', text: 'Before ' },
    { type: 'text', text: 'site', marks: [{ type: 'link', attrs: { href: 'https://www.ghamsu.org' } }] },
  ])
})

test('a link can combine with a decorator', () => {
  const doc = convert([block([span('x', ['strong', 'abc'])], {
    markDefs: [{ _key: 'abc', _type: 'link', href: '/about' }],
  })])
  assert.deepEqual(doc.content[0].content[0].marks, [
    { type: 'bold' },
    { type: 'link', attrs: { href: '/about' } },
  ])
})

test('a dangerous link target is refused', () => {
  assert.throws(
    () => convert([block([span('x', ['abc'])], {
      markDefs: [{ _key: 'abc', _type: 'link', href: 'javascript:alert(1)' }],
    })]),
    PortableTextConversionError,
  )
})

test('an image stores the resolved path, alt, caption and focus', () => {
  const hotspot = { x: 0.5, y: 0.4, width: 1, height: 1 }
  const doc = convert(
    [{ _type: 'image', _key: 'i', asset: { _ref: 'image-abc-10x10-jpg' }, alt: 'Alt', caption: 'Cap', hotspot }],
    { resolveImage: (ref) => `sanity/${ref}.webp` },
  )
  assert.deepEqual(doc.content[0], {
    type: 'image',
    attrs: {
      src: 'sanity/image-abc-10x10-jpg.webp',
      alt: 'Alt',
      caption: 'Cap',
      focus: { hotspot, crop: null },
    },
  })
})

test('an image with no alt, caption or hotspot stores nulls', () => {
  const doc = convert([{ _type: 'image', asset: { _ref: 'r' } }], { resolveImage: () => 'p' })
  assert.deepEqual(doc.content[0].attrs, { src: 'p', alt: null, caption: null, focus: null })
})

test('an image ends an open list', () => {
  const doc = convert(
    [bullet('One'), { _type: 'image', asset: { _ref: 'r' } }, bullet('Two')],
    { resolveImage: () => 'p' },
  )
  assert.deepEqual(doc.content.map((node) => node.type), ['bulletList', 'image', 'bulletList'])
})

test('blockquote wraps a paragraph', () => {
  const doc = convert([block('Quote', { style: 'blockquote' })])
  assert.deepEqual(doc.content[0], { type: 'blockquote', content: [text('Quote')] })
})

test('empty spans are dropped, leaving an empty paragraph', () => {
  assert.deepEqual(convert([block('')]).content[0], { type: 'paragraph' })
})

test('newlines become hard breaks and keep marks on the text', () => {
  const doc = convert([block([span('a\nb', ['em'])])])
  assert.deepEqual(doc.content[0].content, [
    { type: 'text', text: 'a', marks: [{ type: 'italic' }] },
    { type: 'hardBreak' },
    { type: 'text', text: 'b', marks: [{ type: 'italic' }] },
  ])
})

test('blank lines inside one block become separate paragraphs', () => {
  const doc = convert([block([span('First\n\nSecond'), span(' bold\n\n\nThird', ['strong'])])])
  assert.deepEqual(doc.content, [
    text('First'),
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'Second' },
        { type: 'text', text: ' bold', marks: [{ type: 'bold' }] },
      ],
    },
    { type: 'paragraph', content: [{ type: 'text', text: 'Third', marks: [{ type: 'bold' }] }] },
  ])
})

test('leading and trailing blank lines do not create empty paragraphs', () => {
  assert.deepEqual(convert([block('\n\nOnly\n\n')]).content, [text('Only')])
})

test('blank lines in a heading stay as breaks, not new headings', () => {
  const doc = convert([block('A\n\nB', { style: 'h2' })])
  assert.equal(doc.content.length, 1)
  assert.deepEqual(doc.content[0].content.map((n) => n.type), ['text', 'hardBreak', 'hardBreak', 'text'])
})

test('an empty array gives a valid document', () => {
  assert.deepEqual(convert([]), { type: 'doc', content: [{ type: 'paragraph' }] })
})

test('Sanity _key values are not carried over', () => {
  assert.ok(!JSON.stringify(convert([block('x'), bullet('y')])).includes('_key'))
})

test('anything unrecognised throws instead of losing content', () => {
  const cases = [
    [{ _type: 'youtubeEmbed', url: 'x' }],
    [block('x', { style: 'pullquote' })],
    [block('x', { listItem: 'checklist' })],
    [block([span('x', ['highlight'])])],
    [block([span('x', ['abc'])], { markDefs: [{ _key: 'abc', _type: 'internalLink' }] })],
    [block([{ _type: 'inlineImage' }])],
    [{ _type: 'image', asset: {} }],
    'not an array',
  ]
  for (const input of cases) {
    assert.throws(() => convert(input, { resolveImage: () => 'p' }), PortableTextConversionError)
  }
})

test('an image with no resolver throws', () => {
  assert.throws(() => convert([{ _type: 'image', asset: { _ref: 'r' } }]), PortableTextConversionError)
})

test('list item with a heading style warns', () => {
  const warnings = []
  convert([block('x', { listItem: 'bullet', style: 'h3' })], { onWarning: (w) => warnings.push(w) })
  assert.equal(warnings.length, 1)
})

test('verifyConversion passes for a faithful conversion of mixed content', () => {
  const blocks = [
    block('Heading', { style: 'h3' }),
    block([span('plain '), span('bold', ['strong']), span('both', ['strong', 'em'])]),
    bullet('Item'),
    bullet('Nested', 2),
    block([span('link', ['abc'])], { markDefs: [{ _key: 'abc', _type: 'link', href: 'https://a.b' }] }),
    block([span('line one\nline two', ['em'])]),
    { _type: 'image', asset: { _ref: 'r' } },
  ]
  const doc = convert(blocks, { resolveImage: () => 'p' })
  assert.deepEqual(verifyConversion(blocks, doc), [])
  const stats = tiptapStats(doc)
  assert.equal(stats.headings, 1)
  assert.equal(stats.listItems, 2)
  assert.equal(stats.images, 1)
  assert.equal(stats.links, 1)
})

test('verifyConversion detects lost text, structure and marks', () => {
  const blocks = [block([span('Important', ['strong'])], { style: 'h2' }), bullet('Item')]
  assert.equal(verifyConversion(blocks, convert(blocks)).length, 0)

  const damaged = { type: 'doc', content: [text('Import')] }
  const problems = verifyConversion(blocks, damaged).join(' | ')
  assert.match(problems, /Text differs/)
  assert.match(problems, /headings/)
  assert.match(problems, /listItems/)
  assert.match(problems, /Mark bold/)
})
