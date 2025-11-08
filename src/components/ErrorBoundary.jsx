import React from 'react';
import './ErrorBoundary.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleClearData = () => {
    if (window.confirm('This will clear all game data and reload. Continue?')) {
      // Clear IndexedDB
      indexedDB.deleteDatabase('AirSimDB');
      // Clear localStorage
      localStorage.clear();
      // Reload
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-content">
            <h1>Something went wrong</h1>
            <p className="error-message">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>

            <div className="error-details">
              <h3>What happened?</h3>
              <p>
                The game encountered an error and couldn't continue. This might be due to:
              </p>
              <ul>
                <li>Corrupted save data</li>
                <li>Browser compatibility issues</li>
                <li>Insufficient memory</li>
                <li>Private browsing mode restrictions</li>
              </ul>
            </div>

            <div className="error-actions">
              <button className="btn-primary" onClick={this.handleReload}>
                Reload Game
              </button>
              <button className="btn-secondary" onClick={this.handleClearData}>
                Clear Data & Reload
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
              <details className="error-stack">
                <summary>Error Details (Development Only)</summary>
                <pre>{this.state.error?.stack}</pre>
                <pre>{this.state.errorInfo.componentStack}</pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
