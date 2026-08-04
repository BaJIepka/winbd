import type { ReactNode } from 'react'

import { cn } from '@/shared/lib/cn'

import styles from './tiptapContent.module.scss'

interface Props {
  className?: string
  children?: ReactNode
  /** Pre-sanitized HTML to render via `dangerouslySetInnerHTML` instead of `children`. */
  html?: string
}

export function TiptapContent({ className, children, html }: Props) {
  const rootClassName = cn(styles.tiptapContent, className)

  if (html !== undefined) {
    return <div className={rootClassName} dangerouslySetInnerHTML={{ __html: html }} />
  }
  return <div className={rootClassName}>{children}</div>
}
