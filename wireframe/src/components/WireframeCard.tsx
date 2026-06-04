import type { ReactNode } from 'react'

type WireframeCardProps = {
  title?: string
  caption?: string
  children?: ReactNode
  className?: string
}

export function WireframeCard({ title, caption, children, className = '' }: WireframeCardProps) {
  return (
    <section className={`card ${className}`}>
      {title && <h3 className="card-title">{title}</h3>}
      {caption && <p className="card-caption">{caption}</p>}
      {children}
    </section>
  )
}
