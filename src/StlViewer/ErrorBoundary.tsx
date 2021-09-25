import React, { ErrorInfo } from "react"

interface IProps {
    onError?: (err) => void
}

interface IState {
    message: string
}

class ErrorBoundary extends React.Component<IProps, IState> {
    state = {message: ""}

    shouldComponentUpdate(nextProps: Readonly<IProps>, nextState: Readonly<IState>, nextContext: any): boolean {
        if (!this.state.message && nextState.message && nextProps.onError) nextProps.onError(new Error(nextState.message))
        return true
    }

    static getDerivedStateFromError(error: Error) {
        return { message: error.toString() };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    }

    render() {
        if (this.state.message) return null
        return this.props.children;
    }
}

export default ErrorBoundary
