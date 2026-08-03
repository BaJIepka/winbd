import { describe, expect, it } from 'vitest'

import { sanitizeHtml } from './sanitizeHtml'

describe('sanitizeHtml', () => {
  it('removes <script> tags and their content', () => {
    const result = sanitizeHtml('<p>Hello</p><script>alert("xss")</script>')
    expect(result).not.toContain('<script>')
    expect(result).not.toContain('alert')
    expect(result).toContain('Hello')
  })

  it('removes event handler attributes', () => {
    const result = sanitizeHtml('<p onclick="alert(1)">text</p>')
    expect(result).not.toContain('onclick')
    expect(result).toContain('text')
  })

  it('removes javascript: href', () => {
    const result = sanitizeHtml('<a href="javascript:alert(1)">click</a>')
    expect(result).not.toContain('javascript:')
  })

  it('preserves allowed tags', () => {
    const html = '<p><strong>bold</strong> <em>italic</em> <u>under</u></p>'
    const result = sanitizeHtml(html)
    expect(result).toContain('<strong>')
    expect(result).toContain('<em>')
    expect(result).toContain('<u>')
  })

  it('preserves allowed block elements', () => {
    const html = '<h1>Title</h1><blockquote>quote</blockquote><pre><code>code</code></pre>'
    const result = sanitizeHtml(html)
    expect(result).toContain('<h1>')
    expect(result).toContain('<blockquote>')
    expect(result).toContain('<code>')
  })

  it('allows class on <code> (for syntax highlighting)', () => {
    const result = sanitizeHtml('<code class="hljs-keyword">const</code>')
    expect(result).toContain('class="hljs-keyword"')
  })

  it('allows class on <span>', () => {
    const result = sanitizeHtml('<span class="hljs-string">text</span>')
    expect(result).toContain('class="hljs-string"')
  })

  it('removes class from other tags', () => {
    const result = sanitizeHtml('<p class="some-class">text</p>')
    expect(result).not.toContain('class=')
    expect(result).toContain('<p>')
  })

  it('removes data attributes', () => {
    const result = sanitizeHtml('<p data-id="1">text</p>')
    expect(result).not.toContain('data-id')
  })

  it('preserves img src', () => {
    const result = sanitizeHtml('<img src="/uploads/photo.jpg" alt="photo">')
    expect(result).toContain('src="/uploads/photo.jpg"')
  })
})
