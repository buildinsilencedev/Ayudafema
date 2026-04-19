import { useState } from 'react'
import { Mail } from 'lucide-react'
import { Button } from '../components/Button.jsx'
import { StepLabel, Headline } from '../components/Layout.jsx'
import { signInWithEmail } from '../lib/api.js'

export function Login({ t, onSent }) {
  const [email,   setEmail]   = useState('')
  const [sending, setSending] = useState(false)
  const [sent,    setSent]    = useState(false)
  const [error,   setError]   = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim()) return
    setSending(true)
    setError(null)
    try {
      await signInWithEmail(email.trim())
      setSent(true)
      onSent?.()
    } catch (err) {
      setError(err.message)
    } finally {
      setSending(false)
    }
  }

  if (sent) {
    return (
      <div className="hog-fade pt-6 md:pt-12">
        <StepLabel text={t.login.step} />
        <Headline text={t.login.sentHeadline} />
        <p className="text-[17px] mb-10" style={{ color: 'var(--ink-soft)' }}>
          {t.login.sentSub.replace('{email}', email)}
        </p>
        <p className="text-[13px]" style={{ color: 'var(--ink-softer)' }}>
          {t.login.sentNote}
        </p>
      </div>
    )
  }

  return (
    <div className="hog-fade pt-6 md:pt-12">
      <StepLabel text={t.login.step} />
      <Headline text={t.login.headline} />
      <p className="text-[17px] mb-10" style={{ color: 'var(--ink-soft)' }}>
        {t.login.sub}
      </p>

      <form onSubmit={handleSubmit} noValidate>
        <div className="mb-6">
          <label
            htmlFor="login-email"
            className="block text-[12px] uppercase tracking-widest mb-2"
            style={{ color: 'var(--ink-softer)' }}
          >
            {t.login.emailLabel}
          </label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 text-[16px] border bg-transparent"
            style={{
              borderColor: 'var(--rule)',
              color: 'var(--ink)',
              outline: 'none',
            }}
            onFocus={(e) => (e.target.style.borderColor = 'var(--ink)')}
            onBlur={(e)  => (e.target.style.borderColor = 'var(--rule)')}
            placeholder={t.login.emailPlaceholder}
          />
          {error && (
            <p role="alert" className="mt-2 text-[13px]" style={{ color: 'var(--accent)' }}>
              {error}
            </p>
          )}
        </div>

        <Button type="submit" disabled={sending || !email.trim()}>
          <Mail size={16} aria-hidden="true" />
          {sending ? t.login.sending : t.login.cta}
        </Button>
      </form>

      <p className="mt-6 text-[12px]" style={{ color: 'var(--ink-softer)' }}>
        {t.login.privacy}
      </p>
    </div>
  )
}
