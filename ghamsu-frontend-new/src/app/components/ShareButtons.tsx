import { useState } from 'react'
import { Check, Facebook, Link2, MessageCircle, Share2 } from 'lucide-react'

/** The X logo (lucide only has the old bird). */
function XLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
    </svg>
  )
}

/** Copies text, falling back to a hidden textarea where the Clipboard API is unavailable. */
export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    const area = document.createElement('textarea')
    area.value = text
    area.setAttribute('readonly', '')
    area.style.position = 'fixed'
    area.style.opacity = '0'
    document.body.appendChild(area)
    area.select()
    const ok = document.execCommand('copy')
    area.remove()
    return ok
  }
}

const buttonClass =
  'inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-3 py-2.5 text-sm font-medium transition-colors hover:border-accent hover:text-accent'

/**
 * Share links for a page. `text` is the full message (title, date and link)
 * for apps that take a message; Facebook only takes the link.
 */
export function ShareButtons({ title, text, url }: { title: string; text: string; url: string }) {
  const [copied, setCopied] = useState(false)
  const canShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function'
  const encoded = encodeURIComponent(url)
  const withoutUrl = text.replace(url, '').trim()

  const copy = async () => {
    if (await copyText(url)) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  const nativeShare = async () => {
    try {
      await navigator.share({ title, text: withoutUrl, url })
    } catch {
      // Closing the share sheet counts as an error; nothing to do.
    }
  }

  return (
    <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
      {canShare && (
        <button type="button" onClick={nativeShare} className={`${buttonClass} col-span-2 border-primary bg-primary text-primary-foreground hover:text-primary-foreground hover:opacity-90`}>
          <Share2 className="h-4 w-4" /> Share
        </button>
      )}
      <a href={`https://wa.me/?text=${encodeURIComponent(text)}`} target="_blank" rel="noopener noreferrer" className={buttonClass}>
        <MessageCircle className="h-4 w-4 text-[#25D366]" /> WhatsApp
      </a>
      <a href={`https://www.facebook.com/sharer/sharer.php?u=${encoded}`} target="_blank" rel="noopener noreferrer" className={buttonClass}>
        <Facebook className="h-4 w-4 text-[#1877F2]" /> Facebook
      </a>
      <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(withoutUrl)}&url=${encoded}`} target="_blank" rel="noopener noreferrer" className={buttonClass}>
        <XLogo className="h-3.5 w-3.5" /> X
      </a>
      <button type="button" onClick={copy} className={buttonClass} aria-live="polite">
        {copied ? <Check className="h-4 w-4 text-green-600" /> : <Link2 className="h-4 w-4" />}
        {copied ? 'Copied' : 'Copy link'}
      </button>
    </div>
  )
}
