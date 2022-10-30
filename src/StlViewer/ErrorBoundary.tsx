import React from 'react'

interface IProps extends React.PropsWithChildren {
  onError?: (err: Error) => void
}

interface IState {
  message: string
}

class ErrorBoundary extends React.Component<IProps, IState> {
  state = { message: '' }

  shouldComponentUpdate (nextProps: Readonly<IProps>, nextState: Readonly<IState>, nextContext: any): boolean {
    if ((this.state.message === '') && (nextState.message !== '') && (nextProps.onError != null)) {
      nextProps.onError(new Error(nextState.message))
    }
    return true
  }

  static getDerivedStateFromError (error: Error): IState {
    return { message: error.message }
  }

  componentDidCatch (): void {}

  render (): React.ReactNode {
    if (this.state.message !== '') return null
    return this.props.children
  }
}

export default ErrorBoundary
