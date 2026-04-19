import { useRef } from 'react'
import { Camera, Upload as UploadIcon, FileText, Shield } from 'lucide-react'
import { Button, OutlineButton } from '../components/Button.jsx'
import { StepLabel, Headline } from '../components/Layout.jsx'

export function Upload({ t, onContinue }) {
  const fileInputRef = useRef(null)
  const cameraInputRef = useRef(null)

  // Real file inputs so keyboard users and screen readers can upload. We pass
  // through to onContinue for now; real parsing plugs in here when the
  // backend lands.
  const onFilePick = () => onContinue()

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
            onChange={onFilePick}
          />
          <input
            ref={fileInputRef}
            id="upload-file"
            type="file"
            accept="image/*,application/pdf"
            className="sr-only"
            onChange={onFilePick}
          />

          <div className="flex flex-col md:flex-row gap-3 mt-4 w-full md:w-auto">
            <Button
              onClick={() => cameraInputRef.current?.click()}
              className="px-5 py-3 text-sm"
            >
              <Camera size={14} aria-hidden="true" /> {t.upload.camera}
            </Button>
            <OutlineButton onClick={() => fileInputRef.current?.click()}>
              <UploadIcon size={14} aria-hidden="true" /> {t.upload.upload}
            </OutlineButton>
          </div>
        </div>
      </div>

      <div
        className="flex items-center gap-2 text-[13px] mb-8"
        style={{ color: 'var(--ink-softer)' }}
      >
        <Shield size={13} aria-hidden="true" /> {t.upload.reassure}
      </div>

      <button
        type="button"
        onClick={onContinue}
        className="hog-btn-ghost text-sm underline underline-offset-4"
      >
        {t.upload.demo} →
      </button>
    </div>
  )
}
