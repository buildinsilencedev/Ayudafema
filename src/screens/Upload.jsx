import { useRef, useState } from 'react'
import { Camera, Upload as UploadIcon, FileText, Shield } from 'lucide-react'
import { Button, OutlineButton } from '../components/Button.jsx'
import { StepLabel, Headline } from '../components/Layout.jsx'
import { uploadFile, invokeParse } from '../lib/api.js'

export function Upload({ t, caseId, onContinue, onManual }) {
  const fileInputRef   = useRef(null)
  const cameraInputRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [error,     setError]     = useState(null)

  const handleFile = async (file) => {
    if (!file) return
    // If there's no caseId the backend isn't set up yet — fall through to
    // demo mode so the prototype still works without a Supabase project.
    if (!caseId) {
      onContinue()
      return
    }
    setUploading(true)
    setError(null)
    try {
      const doc = await uploadFile(caseId, 'denial_letter', file)
      await invokeParse(caseId, doc.id)
      onContinue()
    } catch (err) {
      console.error('[Upload] failed', err)
      setError(err.message)
      setUploading(false)
    }
  }

  const onFilePick = (e) => handleFile(e.target.files?.[0])

  return (
    <div className="hog-fade pt-6 md:pt-12">
      <StepLabel text={t.upload.step} />
      <Headline text={t.upload.headline} />
      <p className="text-[18px] mb-10" style={{ color: 'var(--ink-soft)' }}>
        {t.upload.sub}
      </p>

      <div
        className="border border-dashed p-10 md:p-14 text-center mb-6"
        style={{ borderColor: 'var(--rule)' }}
      >
        <div className="flex flex-col items-center gap-4">
          <FileText
            size={28}
            strokeWidth={1.25}
            style={{ color: 'var(--ink-softer)' }}
            aria-hidden="true"
          />
          <div className="hog-serif text-[24px] italic" style={{ color: 'var(--ink)' }}>
            {t.upload.dropTitle}
          </div>
          <div className="text-[13px]" style={{ color: 'var(--ink-softer)' }}>
            {t.upload.dropSub}
          </div>

          {/* Hidden real inputs — triggered by buttons below */}
          <label htmlFor="upload-file" className="sr-only">
            {t.upload.fileInputLabel}
          </label>
          <input
            ref={cameraInputRef}
            id="upload-camera"
            type="file"
            accept="image/*"
            capture="environment"
            className="sr-only"
            aria-label={t.upload.camera}
            onChange={onFilePick}
            disabled={uploading}
          />
          <input
            ref={fileInputRef}
            id="upload-file"
            type="file"
            accept="image/*,application/pdf"
            className="sr-only"
            onChange={onFilePick}
            disabled={uploading}
          />

          <div className="flex flex-col md:flex-row gap-3 mt-4 w-full md:w-auto">
            <Button
              onClick={() => cameraInputRef.current?.click()}
              disabled={uploading}
              className="px-5 py-3 text-sm"
            >
              <Camera size={14} aria-hidden="true" />
              {uploading ? '…' : t.upload.camera}
            </Button>
            <OutlineButton
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              <UploadIcon size={14} aria-hidden="true" /> {t.upload.upload}
            </OutlineButton>
          </div>

          {error && (
            <p role="alert" className="mt-2 text-[13px]" style={{ color: 'var(--accent)' }}>
              {error}
            </p>
          )}
        </div>
      </div>

      <div
        className="flex items-center gap-2 text-[13px] mb-6"
        style={{ color: 'var(--ink-softer)' }}
      >
        <Shield size={13} aria-hidden="true" /> {t.upload.reassure}
      </div>

      {/* Manual entry fallback — always visible */}
      <button
        type="button"
        onClick={onManual ?? onContinue}
        className="hog-btn-ghost text-sm underline underline-offset-4 block mb-2"
      >
        {t.upload.manualEntry ?? t.upload.demo} →
      </button>
    </div>
  )
}
