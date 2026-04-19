import { Component } from 'react'

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    // Future: forward to telemetry. For now, developer console is enough.
    // eslint-disable-next-line no-console
    console.error('ayudafema:error-boundary', error, info)
  }

  reset = () => this.setState({ error: null })

  render() {
    if (!this.state.error) return this.props.children
    const { labels } = this.props
    return (
      <div
        className="hog-fade px-6 md:px-10 py-20 max-w-[640px] mx-auto"
        role="alert"
        aria-live="assertive"
      >
        <h1
          className="hog-serif text-[40px] md:text-[56px] leading-[1] mb-6"
          style={{ color: 'var(--ink)' }}
        >
          {labels.title}
        </h1>
        <p className="text-[17px] mb-8" style={{ color: 'var(--ink-soft)' }}>
          {labels.body}
        </p>
        <button
          type="button"
          onClick={this.reset}
          className="hog-btn-primary inline-flex items-center gap-3 px-7 py-4 text-[15px]"
        >
          {labels.retry}
        </button>
      </div>
    )
  }
}
