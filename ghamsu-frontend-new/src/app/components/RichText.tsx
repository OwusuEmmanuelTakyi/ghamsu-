import { Fragment, type ReactNode } from 'react'
import { mediaUrl, focusStyle } from '../../lib/media'
import type { ImageFocus, RichTextMark, RichTextNode } from '../../types/types'

// Renders TipTap / ProseMirror JSON as React elements. No HTML strings and no
// dangerouslySetInnerHTML, so stored content cannot inject markup or scripts.

const SAFE_HREF = /^(https?:|mailto:|tel:|\/|#)/i

function isExternal(href: string) {
  if (!/^https?:/i.test(href)) return false
  try {
    return new URL(href).origin !== window.location.origin
  } catch {
    return true
  }
}

function applyMark(mark: RichTextMark, children: ReactNode, key: number): ReactNode {
  switch (mark.type) {
    case 'bold':
      return <strong key={key} className="font-semibold">{children}</strong>
    case 'italic':
      return <em key={key} className="italic">{children}</em>
    case 'underline':
      return <u key={key}>{children}</u>
    case 'strike':
      return <s key={key}>{children}</s>
    case 'code':
      return <code key={key} className="bg-secondary/50 px-2 py-1 rounded font-mono text-sm">{children}</code>
    case 'link': {
      const href = String(mark.attrs?.href ?? '')
      if (!SAFE_HREF.test(href)) return children
      const external = isExternal(href)
      return (
        <a
          key={key}
          href={href}
          className="text-primary underline underline-offset-2 hover:text-accent transition-colors"
          {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        >
          {children}
        </a>
      )
    }
    default:
      return children
  }
}

function renderText(node: RichTextNode, key: number): ReactNode {
  const content = (node.marks ?? []).reduce<ReactNode>(
    (children, mark, index) => applyMark(mark, children, index),
    node.text ?? '',
  )
  return <Fragment key={key}>{content}</Fragment>
}

const headingClass: Record<number, string> = {
  1: 'text-3xl sm:text-4xl',
  2: 'text-2xl sm:text-3xl',
  3: 'text-xl sm:text-2xl',
  4: 'text-lg sm:text-xl',
  5: 'text-lg',
  6: 'text-base',
}

function renderNode(node: RichTextNode, key: number): ReactNode {
  const children = () => node.content?.map(renderNode)

  switch (node.type) {
    case 'doc':
      return <Fragment key={key}>{children()}</Fragment>
    case 'paragraph':
      return <p key={key} className="mb-6 leading-relaxed">{children()}</p>
    case 'heading': {
      const level = Math.min(6, Math.max(1, Number(node.attrs?.level) || 2))
      const Tag = `h${level}` as 'h1'
      return (
        <Tag
          key={key}
          className={`${headingClass[level]} font-bold mt-10 mb-4 text-foreground`}
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          {children()}
        </Tag>
      )
    }
    case 'bulletList':
      return <ul key={key} className="list-disc pl-6 mb-6 space-y-2 marker:text-accent">{children()}</ul>
    case 'orderedList':
      return <ol key={key} className="list-decimal pl-6 mb-6 space-y-2 marker:text-accent">{children()}</ol>
    case 'listItem':
      // Paragraphs inside list items should not add the paragraph gap.
      return (
        <li key={key} className="leading-relaxed pl-1 [&>p]:mb-0 [&>ul]:mt-2 [&>ol]:mt-2 [&>ul]:mb-0 [&>ol]:mb-0">
          {children()}
        </li>
      )
    case 'blockquote':
      return (
        <blockquote key={key} className="border-l-4 border-accent pl-4 my-8 italic text-muted-foreground [&>p]:mb-2">
          {children()}
        </blockquote>
      )
    case 'hardBreak':
      return <br key={key} />
    case 'horizontalRule':
      return <hr key={key} className="my-10 border-border" />
    case 'image': {
      const src = mediaUrl(String(node.attrs?.src ?? ''))
      if (!src) return null
      const alt = String(node.attrs?.alt ?? '') || 'Blog image'
      const caption = node.attrs?.caption ? String(node.attrs.caption) : null
      return (
        <figure key={key} className="my-12">
          <img
            src={src}
            alt={alt}
            loading="lazy"
            decoding="async"
            className="w-full rounded-lg"
            style={focusStyle(node.attrs?.focus as ImageFocus | null)}
          />
          {caption && (
            <figcaption className="text-center text-sm text-muted-foreground mt-4 italic">{caption}</figcaption>
          )}
        </figure>
      )
    }
    case 'text':
      return renderText(node, key)
    default:
      // Unknown types still show their text rather than disappearing.
      console.warn('[RichText] Unsupported node type:', node.type)
      return node.content ? <span key={key}>{children()}</span> : null
  }
}

export function RichText({ doc }: { doc: RichTextNode | null | undefined }) {
  if (!doc || doc.type !== 'doc' || !doc.content?.length) {
    return <p className="text-muted-foreground">No content available for this post.</p>
  }
  return <>{doc.content.map(renderNode)}</>
}
