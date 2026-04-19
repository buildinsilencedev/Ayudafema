// Two button variants, both render a real <button>.
// Primary: ink-on-paper, hover flips to accent.
// Ghost: text-only, underline on hover.
// Focus styles come from the global `:focus-visible` rule in index.css.

export function Button({
  variant = 'primary',
  as: Tag = 'button',
  className = '',
  children,
  ...rest
}) {
  const base =
    variant === 'primary'
      ? 'hog-btn-primary inline-flex items-center justify-center gap-3 px-7 py-4 text-[15px] disabled:opacity-30 disabled:cursor-not-allowed'
      : 'hog-btn-ghost inline-flex items-center gap-2 text-sm'
  const type = Tag === 'button' ? rest.type ?? 'button' : rest.type
  return (
    <Tag className={`${base} ${className}`} {...rest} type={type}>
      {children}
    </Tag>
  )
}

export function OutlineButton({ className = '', children, ...rest }) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-2 px-5 py-3 text-sm border ${className}`}
      style={{ borderColor: 'var(--ink)', color: 'var(--ink)' }}
      {...rest}
    >
      {children}
    </button>
  )
}
