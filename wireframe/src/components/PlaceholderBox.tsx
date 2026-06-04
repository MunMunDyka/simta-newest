type PlaceholderBoxProps = {
  width?: number | string
  height?: number | string
  circle?: boolean
  label?: string
}

export function PlaceholderBox({ width = 64, height = 64, circle = false, label = 'Placeholder' }: PlaceholderBoxProps) {
  return (
    <span
      className={`placeholder${circle ? ' circle' : ''}`}
      style={{ width, height }}
      aria-label={label}
    />
  )
}
