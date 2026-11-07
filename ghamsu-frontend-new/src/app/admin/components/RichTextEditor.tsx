import { useRef, useState, type ReactNode } from 'react'
import { EditorContent, useEditor, type Editor, type JSONContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import {
  Bold, Heading2, Heading3, ImagePlus, Italic, Link2, List, ListOrdered, Loader2, Quote, Redo2, Undo2,
} from 'lucide-react'
import { toast } from 'sonner'
import { mediaUrl } from '../../../lib/media'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '../../components/ui/dialog'
import { uploadImage } from '../lib/images'
import { friendlyError } from '../lib/errors'

// Images keep the storage path in "src" (as the site's renderer expects) and
// only turn it into a URL for display inside the editor.
const SiteImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      src: { default: null, renderHTML: (attrs) => ({ src: mediaUrl(attrs.src) }) },
      caption: { default: null, renderHTML: (attrs) => (attrs.caption ? { 'data-caption': attrs.caption } : {}) },
      focus: { default: null, rendered: false },
    }
  },
})

const SAFE_LINK = /^(https?:\/\/|mailto:|tel:|\/|#)/i

interface Props {
  content: JSONContent | null
  onChange: (content: JSONContent | null) => void
  invalid?: boolean
}

export function RichTextEditor({ content, onChange, invalid }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        link: { openOnClick: false, autolink: true, defaultProtocol: 'https' },
      }),
      SiteImage,
    ],
    content: content ?? undefined,
    shouldRerenderOnTransaction: true,
    editorProps: {
      attributes: {
        class: [
          'min-h-[320px] px-4 py-3 text-base leading-relaxed focus:outline-none',
          '[&_p]:my-3 [&_h2]:mt-6 [&_h2]:mb-3 [&_h2]:text-2xl [&_h2]:font-bold [&_h3]:mt-5 [&_h3]:mb-2 [&_h3]:text-xl [&_h3]:font-bold',
          '[&_h4]:text-lg [&_h4]:font-bold [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li_p]:my-1',
          '[&_blockquote]:my-4 [&_blockquote]:border-l-4 [&_blockquote]:border-accent [&_blockquote]:pl-4 [&_blockquote]:italic',
          '[&_a]:text-primary [&_a]:underline [&_img]:my-4 [&_img]:max-h-80 [&_img]:rounded-lg',
          '[&_img.ProseMirror-selectednode]:ring-2 [&_img.ProseMirror-selectednode]:ring-accent',
        ].join(' '),
      },
    },
    onUpdate: ({ editor: current }) => onChange(current.isEmpty ? null : current.getJSON()),
  })

  return (
    <div className={`overflow-hidden rounded-lg border bg-background ${invalid ? 'border-destructive' : 'border-border'}`}>
      {editor && <Toolbar editor={editor} />}
      <EditorContent editor={editor} />
    </div>
  )
}

function ToolButton({ label, active, disabled, onClick, children }: {
  label: string; active?: boolean; disabled?: boolean; onClick: () => void; children: ReactNode
}) {
  return (
    <Button
      type="button" size="icon" variant={active ? 'secondary' : 'ghost'} className="h-9 w-9"
      aria-label={label} title={label} aria-pressed={active} disabled={disabled}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
    >
      {children}
    </Button>
  )
}

function Toolbar({ editor }: { editor: Editor }) {
  const [linkOpen, setLinkOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [imageOpen, setImageOpen] = useState(false)
  const chain = () => editor.chain().focus()

  const openLink = () => {
    setLinkUrl(editor.getAttributes('link').href ?? '')
    setLinkOpen(true)
  }
  const applyLink = () => {
    const url = linkUrl.trim()
    if (!url) {
      chain().extendMarkRange('link').unsetLink().run()
    } else if (!SAFE_LINK.test(url)) {
      toast.error('Links must start with https://, http://, mailto:, tel: or / for a page on this site.')
      return
    } else if (editor.state.selection.empty && !editor.isActive('link')) {
      // No text selected: insert the address itself as the link text.
      chain().insertContent({ type: 'text', text: url, marks: [{ type: 'link', attrs: { href: url } }] }).run()
    } else {
      chain().extendMarkRange('link').setLink({ href: url }).run()
    }
    setLinkOpen(false)
  }

  return (
    <div className="sticky top-0 z-10 flex flex-wrap gap-0.5 border-b border-border bg-secondary/60 p-1">
      <ToolButton label="Heading 2" active={editor.isActive('heading', { level: 2 })} onClick={() => chain().toggleHeading({ level: 2 }).run()}><Heading2 /></ToolButton>
      <ToolButton label="Heading 3" active={editor.isActive('heading', { level: 3 })} onClick={() => chain().toggleHeading({ level: 3 }).run()}><Heading3 /></ToolButton>
      <ToolButton label="Bold" active={editor.isActive('bold')} onClick={() => chain().toggleBold().run()}><Bold /></ToolButton>
      <ToolButton label="Italic" active={editor.isActive('italic')} onClick={() => chain().toggleItalic().run()}><Italic /></ToolButton>
      <ToolButton label="Bullet list" active={editor.isActive('bulletList')} onClick={() => chain().toggleBulletList().run()}><List /></ToolButton>
      <ToolButton label="Numbered list" active={editor.isActive('orderedList')} onClick={() => chain().toggleOrderedList().run()}><ListOrdered /></ToolButton>
      <ToolButton label="Quote" active={editor.isActive('blockquote')} onClick={() => chain().toggleBlockquote().run()}><Quote /></ToolButton>
      <ToolButton label="Link" active={editor.isActive('link')} onClick={openLink}><Link2 /></ToolButton>
      <ToolButton label="Image" onClick={() => setImageOpen(true)}><ImagePlus /></ToolButton>
      <span className="mx-1 w-px self-stretch bg-border" aria-hidden="true" />
      <ToolButton label="Undo" disabled={!editor.can().undo()} onClick={() => chain().undo().run()}><Undo2 /></ToolButton>
      <ToolButton label="Redo" disabled={!editor.can().redo()} onClick={() => chain().redo().run()}><Redo2 /></ToolButton>

      <Dialog open={linkOpen} onOpenChange={setLinkOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Link</DialogTitle>
            <DialogDescription>Links to other websites open in a new tab. Leave empty to remove the link.</DialogDescription>
          </DialogHeader>
          <form onSubmit={(event) => { event.preventDefault(); applyLink() }} className="space-y-2">
            <Label htmlFor="rte-link">Address</Label>
            <Input id="rte-link" autoFocus value={linkUrl} onChange={(event) => setLinkUrl(event.target.value)} placeholder="https://… or /events" />
            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" onClick={() => setLinkOpen(false)}>Cancel</Button>
              <Button type="submit">Apply</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ImageDialog
        open={imageOpen}
        onOpenChange={setImageOpen}
        onInsert={(attrs) => chain().insertContent({ type: 'image', attrs }).run()}
      />
    </div>
  )
}

function ImageDialog({ open, onOpenChange, onInsert }: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onInsert: (attrs: { src: string; alt: string; caption: string | null }) => void
}) {
  const fileInput = useRef<HTMLInputElement>(null)
  const [path, setPath] = useState<string | null>(null)
  const [alt, setAlt] = useState('')
  const [caption, setCaption] = useState('')
  const [uploading, setUploading] = useState(false)

  const reset = () => { setPath(null); setAlt(''); setCaption('') }

  const pick = async (file?: File) => {
    if (!file) return
    setUploading(true)
    try {
      setPath((await uploadImage(file)).path)
    } catch (error) {
      toast.error(friendlyError(error))
    } finally {
      setUploading(false)
      if (fileInput.current) fileInput.current.value = ''
    }
  }

  const insert = () => {
    if (!path) return
    if (!alt.trim()) return toast.error('Add alt text describing the image.')
    onInsert({ src: path, alt: alt.trim(), caption: caption.trim() || null })
    reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) reset(); onOpenChange(next) }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Insert image</DialogTitle>
          <DialogDescription>The image is resized before upload.</DialogDescription>
        </DialogHeader>
        <input ref={fileInput} type="file" accept="image/*" className="hidden" onChange={(event) => pick(event.target.files?.[0])} />
        {path ? (
          <img src={mediaUrl(path)} alt="" className="max-h-56 w-full rounded-lg object-contain bg-secondary" />
        ) : (
          <Button type="button" variant="outline" className="h-28 w-full flex-col border-dashed" disabled={uploading} onClick={() => fileInput.current?.click()}>
            {uploading ? <Loader2 className="animate-spin" /> : <ImagePlus />}
            {uploading ? 'Resizing and uploading…' : 'Choose an image'}
          </Button>
        )}
        <div className="space-y-1.5">
          <Label htmlFor="rte-alt">Alt text <span className="text-destructive">*</span></Label>
          <Input id="rte-alt" value={alt} onChange={(event) => setAlt(event.target.value)} placeholder="Describe the image" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="rte-caption">Caption (optional)</Label>
          <Input id="rte-caption" value={caption} onChange={(event) => setCaption(event.target.value)} />
        </div>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="button" disabled={!path || uploading} onClick={insert}>Insert</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
