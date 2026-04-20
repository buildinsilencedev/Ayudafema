import { Phone, ExternalLink } from 'lucide-react'
import { Button } from '../components/Button.jsx'
import { StepLabel, Headline, Rule } from '../components/Layout.jsx'

function telHref(phone) {
  // Letter shortcodes like 1-800-RED-CROSS come pre-converted in copy.
  const digits = phone.replace(/[^\d+]/g, '')
  return `tel:${digits}`
}

function Item({ item, callLabel, visitLabel }) {
  return (
    <li className="py-4 border-t" style={{ borderColor: 'var(--rule)' }}>
      <div className="text-[16px] mb-2" style={{ color: 'var(--ink)' }}>
        {item.label}
      </div>
      {item.note && (
        <div
          className="text-[13px] mb-3 leading-relaxed"
          style={{ color: 'var(--ink-softer)' }}
        >
          {item.note}
        </div>
      )}
      <div className="flex flex-wrap gap-x-5 gap-y-2">
        {item.phone && (
          <a
            href={telHref(item.phone)}
            aria-label={`${callLabel} ${item.label}: ${item.phone}`}
            className="inline-flex items-center gap-2 text-[15px] underline underline-offset-4"
            style={{ color: 'var(--ink)' }}
          >
            <Phone size={14} aria-hidden="true" />
            {item.phone}
          </a>
        )}
        {item.url && (
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-[14px] underline underline-offset-4"
            style={{ color: 'var(--ink-soft)' }}
          >
            <ExternalLink size={12} aria-hidden="true" />
            {visitLabel}
          </a>
        )}
      </div>
    </li>
  )
}

export function Resources({ t, onBack }) {
  const r = t.resources
  return (
    <div className="hog-fade pt-6 md:pt-12">
      <StepLabel text={r.step} />
      <Headline text={r.headline} />

      <p className="text-[17px] leading-relaxed mb-4" style={{ color: 'var(--ink-soft)' }}>
        {r.sub}
      </p>
      <p className="text-[13px] mb-10" style={{ color: 'var(--ink-softer)' }}>
        {r.disclaimer}
      </p>

      {r.sections.map((section) => (
        <section
          key={section.id}
          aria-labelledby={`resources-${section.id}`}
          className="mb-10"
        >
          <Rule className="mb-6" />
          <h2
            id={`resources-${section.id}`}
            className="hog-serif text-[28px] mb-3"
            style={{ color: 'var(--ink)' }}
          >
            {section.title}
          </h2>
          {section.body && (
            <p
              className="text-[15px] leading-relaxed mb-2"
              style={{ color: 'var(--ink-soft)' }}
            >
              {section.body}
            </p>
          )}
          <ul className="list-none p-0 m-0">
            {section.items.map((item, i) => (
              <Item
                key={i}
                item={item}
                callLabel={r.callLabel}
                visitLabel={r.visitLabel}
              />
            ))}
          </ul>
        </section>
      ))}

      <Button variant="ghost" onClick={onBack}>
        {r.back}
      </Button>
    </div>
  )
}
