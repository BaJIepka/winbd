import DOMPurify from 'dompurify'

DOMPurify.addHook('uponSanitizeAttribute', (node, data) => {
  if (data.attrName === 'class') {
    const tag = (node as Element).tagName.toLowerCase()
    if (tag !== 'code' && tag !== 'span') {
      data.keepAttr = false
    }
  }
})

export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p',
      'b',
      'strong',
      'i',
      'em',
      'u',
      's',
      'h1',
      'h2',
      'h3',
      'ul',
      'ol',
      'li',
      'blockquote',
      'pre',
      'code',
      'span',
      'hr',
      'br',
      'img',
      'a',
    ],
    ALLOWED_ATTR: ['src', 'href', 'target', 'rel', 'alt', 'class'],
    ALLOW_DATA_ATTR: false,
    FORCE_BODY: true,
  })
}
