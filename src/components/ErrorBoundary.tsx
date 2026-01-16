import * as React from "react";

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold">Something went wrong</h1>
              <div className="flex gap-4 justify-center mt-4">
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
                >
                  Reload Page
                </button>
                <button
                  onClick={() => {
                    localStorage.clear();
                    window.location.reload();
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Reset & Clear Cache
                </button>
              </div>
              <p className="mt-4 text-sm text-gray-500 max-w-md mx-auto">
                如果反复出现此错误，请尝试点击 "Reset & Clear Cache" 清除本地缓存数据。
              </p>
            </div>
          </div>
        )
      );
    }
    return this.props.children;
  }
}

