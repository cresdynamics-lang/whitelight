import { Component, type ErrorInfo, type ReactNode } from "react";
import { Link } from "react-router-dom";

interface Props {
  children: ReactNode;
  /** Optional fallback when an error is caught */
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("App error:", error, errorInfo.componentStack);
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const msg = this.state.error.message || String(this.state.error);
      const isHooksError = /fewer hooks|more hooks/i.test(msg);
      const showFull =
        typeof window !== "undefined" && window.location.search.includes("debug=1");

      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background text-foreground font-sans">
          <h1 className="text-xl font-semibold mb-2">Something went wrong</h1>
          <p className="text-muted-foreground text-center mb-4 max-w-md">
            The page could not load. Try again or go back to the shop. If it keeps
            happening, clear your browser cache and reload.
          </p>
          {isHooksError && (
            <p className="text-sm text-center text-muted-foreground mb-4 max-w-md">
              This was likely a temporary display glitch. Reloading usually fixes it.
            </p>
          )}
          <p className="text-sm text-left max-w-lg mb-4 font-mono break-words text-muted-foreground">
            {showFull ? msg : msg.slice(0, 200)}
            {!showFull && msg.length > 200 && "…"}
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              type="button"
              onClick={this.reset}
              className="px-4 py-2 rounded-md border border-border hover:bg-secondary"
            >
              Try again
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:opacity-90"
            >
              Reload page
            </button>
            <Link
              to="/"
              className="px-4 py-2 rounded-md border border-primary text-primary hover:bg-primary/5"
              onClick={this.reset}
            >
              Back to shop
            </Link>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
