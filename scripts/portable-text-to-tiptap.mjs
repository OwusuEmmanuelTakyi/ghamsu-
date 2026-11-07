// Converts Sanity Portable Text into TipTap / ProseMirror JSON.
//
// Pure and dependency-free: no network, no database. Anything it does not
// recognise throws, so content is never lost silently. The migration script
// treats a throw as a failure for that one post.

export class PortableTextConversionError extends Error {
  constructor(message) {
    super(message)
    this.name = 'PortableTextConversionError'
  }
}

const DECORATOR_MARKS = {
  strong: 'bold',
  em: 'italic',
  code: 'code',
  underline: 'underline',
  'strike-through': 'strike',
}

const HEADING_STYLE = /^h([1-6])$/
const SAFE_LINK = /^(https?:|mailto:|tel:|\/|#)/i

function convertMarks(span, markDefs) {
  const defsByKey = new Map((markDefs ?? []).map((def) => [def._key, def]))
  return (span.marks ?? []).map((mark) => {
    if (DECORATOR_MARKS[mark]) return { type: DECORATOR_MARKS[mark] }

    const def = defsByKey.get(mark)
    if (!def) throw new PortableTextConversionError(`Unknown mark "${mark}"`)
    if (def._type !== 'link') {
      throw new PortableTextConversionError(`Unsupported annotation "${def._type}"`)
    }

    const href = String(def.href ?? '').trim()
    if (!SAFE_LINK.test(href)) {
      throw new PortableTextConversionError(`Unsafe or empty link target "${href}"`)
    }
    return { type: 'link', attrs: { href } }
  })
}

function convertChildren(block) {
  const nodes = []
  for (const child of block.children ?? []) {
    if (child._type !== 'span') {
      throw new PortableTextConversionError(`Unsupported inline type "${child._type}"`)
    }
    const marks = convertMarks(child, block.markDefs)

    // ProseMirror rejects empty text nodes, and newlines become hard breaks.
    String(child.text ?? '').split('\n').forEach((part, index) => {
      if (index > 0) nodes.push({ type: 'hardBreak' })
      if (part === '') return
      nodes.push(marks.length ? { type: 'text', text: part, marks } : { type: 'text', text: part })
    })
  }
  return nodes
}

// Text pasted into Sanity often keeps blank lines inside one block. A blank line
// (two or more hard breaks in a row) starts a new paragraph instead.
function splitOnBlankLines(nodes) {
  const groups = [[]]
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].type === 'hardBreak' && nodes[i + 1]?.type === 'hardBreak') {
      while (nodes[i + 1]?.type === 'hardBreak') i++
      groups.push([])
      continue
    }
    groups.at(-1).push(nodes[i])
  }
  const trimmed = groups.map((group) => {
    let start = 0
    let end = group.length
    while (group[start]?.type === 'hardBreak') start++
    while (end > start && group[end - 1].type === 'hardBreak') end--
    return group.slice(start, end)
  })
  const kept = trimmed.filter((group) => group.length)
  return kept.length ? kept : [[]]
}

function textContainer(type, content, attrs) {
  const node = { type }
  if (attrs) node.attrs = attrs
  if (content.length) node.content = content
  return node
}

function convertImage(block, resolveImage) {
  if (!block.asset?._ref) throw new PortableTextConversionError('Image block has no asset')
  if (!resolveImage) throw new PortableTextConversionError('Image found but no resolveImage option given')

  const focus = block.hotspot || block.crop
    ? { hotspot: block.hotspot ?? null, crop: block.crop ?? null }
    : null

  return {
    type: 'image',
    attrs: {
      src: resolveImage(block.asset._ref),
      alt: block.alt ?? null,
      caption: block.caption ?? null,
      focus,
    },
  }
}

/**
 * @param {Array} blocks Portable Text array.
 * @param {{ resolveImage?: (assetRef: string) => string, onWarning?: (message: string) => void }} [options]
 * @returns {{type: 'doc', content: Array}} A TipTap document.
 */
export function portableTextToTiptap(blocks, { resolveImage, onWarning } = {}) {
  if (!Array.isArray(blocks)) throw new PortableTextConversionError('Content is not an array')

  const content = []
  // Open lists, outermost first: { level, listType, node }
  let openLists = []

  const addListItem = (block) => {
    const listType = { bullet: 'bulletList', number: 'orderedList' }[block.listItem]
    if (!listType) throw new PortableTextConversionError(`Unsupported list type "${block.listItem}"`)
    if (block.style && block.style !== 'normal') {
      onWarning?.(`List item style "${block.style}" was treated as normal text`)
    }

    const level = block.level ?? 1
    while (openLists.length && openLists.at(-1).level > level) openLists.pop()
    if (openLists.length && openLists.at(-1).level === level && openLists.at(-1).listType !== listType) {
      openLists.pop()
    }

    if (!openLists.length || openLists.at(-1).level < level) {
      const node = { type: listType, content: [] }
      const parent = openLists.at(-1)
      if (parent) parent.node.content.at(-1).content.push(node)
      else content.push(node)
      openLists.push({ level, listType, node })
    }

    openLists.at(-1).node.content.push({
      type: 'listItem',
      content: [textContainer('paragraph', convertChildren(block))],
    })
  }

  for (const block of blocks) {
    if (block._type === 'block' && block.listItem) {
      addListItem(block)
      continue
    }

    openLists = []

    if (block._type === 'image') {
      content.push(convertImage(block, resolveImage))
      continue
    }
    if (block._type !== 'block') {
      throw new PortableTextConversionError(`Unsupported block type "${block._type}"`)
    }

    const style = block.style ?? 'normal'
    const heading = style.match(HEADING_STYLE)
    if (style === 'normal') {
      for (const group of splitOnBlankLines(convertChildren(block))) {
        content.push(textContainer('paragraph', group))
      }
    } else if (heading) {
      content.push(textContainer('heading', convertChildren(block), { level: Number(heading[1]) }))
    } else if (style === 'blockquote') {
      content.push({ type: 'blockquote', content: [textContainer('paragraph', convertChildren(block))] })
    } else {
      throw new PortableTextConversionError(`Unsupported block style "${style}"`)
    }
  }

  // A TipTap document must contain at least one block.
  if (!content.length) content.push({ type: 'paragraph' })
  return { type: 'doc', content }
}

const emptyStats = () => ({ text: '', headings: 0, listItems: 0, images: 0, links: 0, markedChars: {} })
const compact = (text) => text.replace(/\s+/g, '')

function addMarkedChars(stats, markName, text) {
  stats.markedChars[markName] = (stats.markedChars[markName] ?? 0) + compact(text).length
}

/** Counts what a Portable Text array contains. */
export function portableTextStats(blocks) {
  const stats = emptyStats()
  for (const block of blocks) {
    if (block._type === 'image') { stats.images++; continue }
    if (block.listItem) stats.listItems++
    else if (HEADING_STYLE.test(block.style ?? '')) stats.headings++

    const defs = new Map((block.markDefs ?? []).map((def) => [def._key, def]))
    for (const child of block.children ?? []) {
      stats.text += child.text ?? ''
      for (const mark of child.marks ?? []) {
        const name = DECORATOR_MARKS[mark] ?? defs.get(mark)?._type ?? mark
        addMarkedChars(stats, name, child.text ?? '')
      }
      if ((child.marks ?? []).some((mark) => defs.has(mark)) && compact(child.text ?? '')) stats.links++
    }
  }
  return stats
}

/** Counts what a TipTap document contains. */
export function tiptapStats(doc) {
  const stats = emptyStats()
  const walk = (node) => {
    if (node.type === 'heading') stats.headings++
    if (node.type === 'listItem') stats.listItems++
    if (node.type === 'image') stats.images++
    if (node.type === 'text') {
      stats.text += node.text
      for (const mark of node.marks ?? []) {
        addMarkedChars(stats, mark.type, node.text)
        if (mark.type === 'link' && compact(node.text)) stats.links++
      }
    }
    node.content?.forEach(walk)
  }
  walk(doc)
  return stats
}

/**
 * Compares a source with its conversion.
 * @returns {string[]} Differences found. Empty means they match.
 */
export function verifyConversion(blocks, doc) {
  const before = portableTextStats(blocks)
  const after = tiptapStats(doc)
  const problems = []

  if (compact(before.text) !== compact(after.text)) {
    problems.push(`Text differs: ${compact(before.text).length} characters became ${compact(after.text).length}`)
  }
  for (const key of ['headings', 'listItems', 'images']) {
    if (before[key] !== after[key]) problems.push(`${key}: ${before[key]} became ${after[key]}`)
  }
  const markNames = new Set([...Object.keys(before.markedChars), ...Object.keys(after.markedChars)])
  for (const name of markNames) {
    if ((before.markedChars[name] ?? 0) !== (after.markedChars[name] ?? 0)) {
      problems.push(`Mark ${name}: ${before.markedChars[name] ?? 0} characters became ${after.markedChars[name] ?? 0}`)
    }
  }
  return problems
}
