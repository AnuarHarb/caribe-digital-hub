import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6">
            <h3 className="font-semibold text-destructive">Error al cargar</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {this.state.error?.message ?? "Ha ocurrido un error inesperado."}
            </p>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
