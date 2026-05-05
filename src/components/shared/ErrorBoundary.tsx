import { Component, type ReactNode, type ErrorInfo } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Production: gửi lên logging service (Sentry, etc.)
    console.error("ErrorBoundary caught:", error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 text-center px-4">
          <p className="text-4xl">😵</p>
          <h2 className="text-lg font-semibold">Có lỗi xảy ra</h2>
          <p className="text-sm text-muted-foreground max-w-xs">
            {this.state.error?.message ?? "Lỗi không xác định"}
          </p>
          <Button variant="outline" onClick={this.handleReset}>
            Thử lại
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
