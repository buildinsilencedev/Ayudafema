import { useEffect, useState } from 'react'
import { copy } from './content/copy/index.js'
import { useRoute, STEPS } from './lib/router.js'
import { loadState, saveState, clearState, getConsent, CONSENT_STATES } from './lib/persistence.js'
import { Header, Footer } from './components/Layout.jsx'
import { ConsentBanner } from './components/ConsentBanner.jsx'
import { ErrorBoundary } from './components/ErrorBoundary.jsx'
import { Landing } from './screens/Landing.jsx'
import { Upload } from './screens/Upload.jsx'
import { Processing } from './screens/Processing.jsx'
import { Diagnosis } from './screens/Diagnosis.jsx'
import { Evidence } from './screens/Evidence.jsx'
import { Draft } from './screens/Draft.jsx'
import { Submit } from './screens/Submit.jsx'
import { Tracking } from './screens/Tracking.jsx'

function initialWizardState() {
  const persisted = loadState()
  return {
    evidence: persisted?.evidence ?? {},
    appealLang: persisted?.appealLang ?? 'en',
  }
}

export default function App() {
  const [route, navigate] = useRoute()
  const [wizard, setWizard] = useState(initialWizardState)
  const [consentGen, setConsentGen] = useState(0) // bump when user toggles consent

  const t = copy[route.lang] ?? copy.es

  // Keep <html lang> in sync so screen readers switch voice correctly.
  useEffect(() => {
    document.documentElement.lang = route.lang === 'es' ? 'es-PR' : 'en-US'
  }, [route.lang])

  // Persist wizard state when consent is granted.
  useEffect(() => {
    if (getConsent() === CONSENT_STATES.GRANTED) {
      saveState(wizard)
    }
  }, [wizard, consentGen])

  const go = (step) => navigate({ step })

  const onBack = () => {
    const idx = STEPS.indexOf(route.step)
    if (route.step === 'diagnosis') return go('upload')
    if (idx > 0) go(STEPS[idx - 1])
  }

  const onReset = () => {
    setWizard({ evidence: {}, appealLang: 'en' })
    clearState()
    navigate({ step: 'landing' })
  }

  const setEvidence = (evidence) => setWizard((w) => ({ ...w, evidence }))
  const setAppealLang = (appealLang) => setWizard((w) => ({ ...w, appealLang }))

  return (
    <div className="hog-app hog-grain">
      <a href="#main-content" className="hog-skip-link">
        {t.skipToContent}
      </a>

      <Header t={t} route={route} onBack={onBack} />

      <ErrorBoundary labels={t.errorBoundary}>
        <main id="main-content" className="px-6 md:px-10 pb-24 max-w-[640px] mx-auto">
          {route.step === 'landing' && <Landing t={t} onStart={() => go('upload')} />}
          {route.step === 'upload' && <Upload t={t} onContinue={() => go('processing')} />}
          {route.step === 'processing' && <Processing t={t} onDone={() => go('diagnosis')} />}
          {route.step === 'diagnosis' && (
            <Diagnosis t={t} lang={route.lang} onContinue={() => go('evidence')} />
          )}
          {route.step === 'evidence' && (
            <Evidence
              t={t}
              checked={wizard.evidence}
              setChecked={setEvidence}
              onContinue={() => go('draft')}
            />
          )}
          {route.step === 'draft' && (
            <Draft
              t={t}
              appealLang={wizard.appealLang}
              setAppealLang={setAppealLang}
              onContinue={() => go('submit')}
            />
          )}
          {route.step === 'submit' && <Submit t={t} onContinue={() => go('tracking')} />}
          {route.step === 'tracking' && <Tracking t={t} lang={route.lang} onReset={onReset} />}
        </main>
      </ErrorBoundary>

      <Footer t={t} />

      <ConsentBanner t={t.consent} onChange={() => setConsentGen((g) => g + 1)} />
    </div>
  )
}
