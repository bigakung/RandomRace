import { Component, type ReactNode } from 'react'

type ErrorBoundaryProps = {
  fallback: ReactNode
  onError?: (error: unknown) => void
  children: ReactNode
}

/** Renders `fallback` instead of crashing the app when a child throws (e.g. a chunk or model fails to load). */
export class ErrorBoundary extends Component<ErrorBoundaryProps, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error: unknown) {
    this.props.onError?.(error)
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}
