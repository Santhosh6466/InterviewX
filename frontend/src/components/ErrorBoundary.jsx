import React from 'react';
import NotFound from '../pages/NotFound';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary] Uncaught application error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.hash = '#/dashboard';
  };

  render() {
    if (this.state.hasError) {
      return (
        <NotFound
          code="500"
          title="Something Went Wrong"
          description="An unexpected application error occurred. We've logged the error and you can safely return to the home page."
          onRetry={this.handleReset}
          showHome={true}
          withLayout={true}
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
