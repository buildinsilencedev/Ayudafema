import { useEffect, useState } from 'react'
import { copy } from './content/copy/index.js'
import { useRoute, STEPS } from './lib/router.js'
import { loadState, saveState, clearState, getConsent, CONSENT_STATES } from './lib/persistence.js'
import { useAuth } from './hooks/useAuth.js'
import { useCase } from './hooks/useCase.js'
import { isAttorney } from './lib/roles.js'
import { createCase } from './lib/api.js'
import { Header, Footer } from './components/Layout.jsx'
import { ConsentBanner } from './components/ConsentBanner.jsx'
import { ErrorBoundary } from './components/ErrorBoundary.jsx'
import { Landing } from './screens/Landing.jsx'
import { Login } from './screens/Login.jsx'
import { Upload } from './screens/Upload.jsx'
import { ManualEntry } from './screens/ManualEntry.jsx'
import { Processing } from './screens/Processing.jsx'
import { Diagnosis } from './screens/Diagnosis.jsx'
import { Evidence } from './screens/Evidence.jsx'
import { Draft } from './screens/Draft.jsx'
import { Submit } from './screens/Submit.jsx'
import { Tracking } from './screens/Tracking.jsx'
import { Resources } from './screens/Resources.jsx'
import { Queue } from './screens/admin/Queue.jsx'
import { ReviewCase } from './screens/admin/ReviewCase.jsx'

function initialWizardState(persisted) {
  return {
    evidence:   persisted?.evidence   ?? {},
    appealLang: persisted?.appealLang ?? 'en',
  }
}

export default function App() {
  const [route, navigate]   = useRoute()
  const { user, profile, loading: authLoading } = useAuth()
  const { caseData }        = useCase(route.caseId)
  const [wizard, setWizard] = useState(() => initialWizardState(loadState()))
  const [consentGen, setConsentGen] = useState(0)

  const t = copy[route.lang] ?? copy.es

  // Keep <html lang> in sync so screen readers announce the right language.
  useEffect(() => {
    document.documentElement.lang = route.lang === 'es' ? 'es-PR' : 'en-US'
  }, [route.lang])

  // Persist wizard state whenever it changes and consent is granted.
  useEffect(() => {
    if (getConsent() === CONSENT_STATES.GRANTED) {
      saveState(wizard)
    }
  }, [wizard, consentGen])

  // Redirect non-attorneys away from admin routes
  useEffect(() => {
    if (authLoading) return
    const isAdminRoute = route.step === 'admin-queue' || route.step === 'admin-review'
    if (isAdminRoute && !isAttorney(profile)) {
      navigate({ step: 'landing' })
    }
  }, [route.step, profile, authLoading])

  // ─── Navigation helpers ────────────────────────────────────────────────────

  const go = (step, extras = {}) =>
    navigate({ step, caseId: route.caseId, ...extras })

  const onBack = () => {
    const idx = STEPS.indexOf(route.step)
    if (route.step === 'diagnosis')    return go('upload')
    if (route.step === 'manual-entry') return go('upload')
    if (route.step === 'admin-review') return navigate({ step: 'admin-queue' })
    if (route.step === 'resources')    return goBackFromResources()
    if (idx > 0) go(STEPS[idx - 1])
  }

  // Resources can be reached from landing, manual-entry (unsupported code),
  // diagnosis (overdue), or cold via a shared link. Prefer browser history
  // so people return to exactly where they came from; fall back to landing.
  const goBackFromResources = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back()
    } else {
      navigate({ step: 'landing' })
    }
  }

  const onResources = () => navigate({ step: 'resources' })

  const onReset = () => {
    setWizard({ evidence: {}, appealLang: 'en' })
    clearState()
    navigate({ step: 'landing', caseId: null })
  }

  // Create a new case (or reuse an existing caseId) then advance to upload.
  const onStart = async () => {
    if (!user) {
      // Prompt login before creating a case — keeps data tied to a user.
      go('login')
      return
    }
    if (route.caseId) {
      go('upload')
      return
    }
    try {
      const newCase = await createCase()
      navigate({ step: 'upload', caseId: newCase.id })
    } catch (e) {
      console.error('[App] createCase failed', e)
      // Fall through to upload anyway — caseId will be null; Upload handles it.
      go('upload')
    }
  }

  const setEvidence   = (evidence)   => setWizard((w) => ({ ...w, evidence }))
  const setAppealLang = (appealLang) => setWizard((w) => ({ ...w, appealLang }))

  // ─── Processing callback (handle manual-entry route from OCR) ─────────────
  const onProcessingDone = (result) => {
    if (result === 'manual') {
      go('manual-entry')
    } else {
      go('diagnosis')
    }
  }

  // Don't flash screens while the session is resolving.
  if (authLoading) return null

  // ─── Admin layout (wider, no wizard chrome) ────────────────────────────────
  const isAdminRoute = route.step === 'admin-queue' || route.step === 'admin-review'
  if (isAdminRoute) {
    return (
      <div className="hog-app hog-grain">
        <a href="#main-content" className="hog-skip-link">
          {t.skipToContent}
        </a>
        <Header t={t} route={route} onBack={onBack} />
        <ErrorBoundary labels={t.errorBoundary}>
          <main
            id="main-content"
            className="px-6 md:px-10 pb-24 mx-auto"
            style={{ maxWidth: 1080 }}
          >
            {route.step === 'admin-queue' && (
              <Queue
                t={t}
                lang={route.lang}
                onReview={(cid) => navigate({ step: 'admin-review', caseId: cid })}
              />
            )}
            {route.step === 'admin-review' && (
              <ReviewCase
                t={t}
                caseId={route.caseId}
                onBack={() => navigate({ step: 'admin-queue' })}
                onApproved={() => navigate({ step: 'admin-queue' })}
              />
            )}
          </main>
        </ErrorBoundary>
        <Footer t={t} />
      </div>
    )
  }

  // ─── Applicant wizard layout ───────────────────────────────────────────────
  return (
    <div className="hog-app hog-grain">
      <a href="#main-content" className="hog-skip-link">
        {t.skipToContent}
      </a>

      <Header t={t} route={route} onBack={onBack} />

      <ErrorBoundary labels={t.errorBoundary}>
        <main id="main-content" className="px-6 md:px-10 pb-24 max-w-[640px] mx-auto">

          {route.step === 'landing' && (
            <Landing t={t} onStart={onStart} onResources={onResources} />
          )}

          {route.step === 'login' && (
            <Login
              t={t}
              onSent={() => {
                // After sending the link, stay on login — user will return via
                // email callback URL which carries the auth token.
              }}
            />
          )}

          {route.step === 'upload' && (
            <Upload
              t={t}
              caseId={route.caseId}
              onContinue={() => go('processing')}
              onManual={() => go('manual-entry')}
            />
          )}

          {route.step === 'manual-entry' && (
            <ManualEntry
              t={t}
              caseId={route.caseId}
              prefill={caseData ? {
                denialCode:       caseData.denial_code,
                denialLetterDate: caseData.denial_letter_date,
                applicantName:    caseData.applicant_name,
              } : {}}
              onContinue={() => go('diagnosis')}
              onResources={onResources}
            />
          )}

          {route.step === 'processing' && (
            <Processing
              t={t}
              caseId={route.caseId}
              onDone={onProcessingDone}
            />
          )}

          {route.step === 'diagnosis' && (
            <Diagnosis
              t={t}
              lang={route.lang}
              caseData={caseData}
              onContinue={() => go('evidence')}
              onResources={onResources}
            />
          )}

          {route.step === 'evidence' && (
            <Evidence
              t={t}
              caseId={route.caseId}
              checked={wizard.evidence}
              setChecked={setEvidence}
              onContinue={() => go('draft')}
            />
          )}

          {route.step === 'draft' && (
            <Draft
              t={t}
              caseData={caseData}
              appealLang={wizard.appealLang}
              setAppealLang={setAppealLang}
              onContinue={() => go('submit')}
            />
          )}

          {route.step === 'submit' && (
            <Submit
              t={t}
              caseId={route.caseId}
              onContinue={() => go('tracking')}
            />
          )}

          {route.step === 'tracking' && (
            <Tracking
              t={t}
              lang={route.lang}
              caseData={caseData}
              onReset={onReset}
            />
          )}

          {route.step === 'resources' && (
            <Resources t={t} onBack={goBackFromResources} />
          )}

        </main>
      </ErrorBoundary>

      <Footer t={t} />

      <ConsentBanner t={t.consent} onChange={() => setConsentGen((g) => g + 1)} />
    </div>
  )
}
