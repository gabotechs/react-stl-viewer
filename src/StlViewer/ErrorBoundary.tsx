import React from 'react'

interface IProps {
  children?: React.ReactNode
  onError?: (err: Error) => void
}

interface IState {
  message: string
}

class ErrorBoundary extends React.Component<IProps, IState> {
  state = { message: '' }

  static getDerivedStateFromError (error: Error): IState {
    return { message: error.message }
  }

  componentDidCatch (error: Error): void {
    if (this.props.onError != null) {
      this.props.onError(error)
    }
  }

  render (): React.ReactNode {
    if (this.state.message !== '') return null
    return this.props.children
  }
}

export default ErrorBoundary
