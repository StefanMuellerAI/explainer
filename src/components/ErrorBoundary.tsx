import React from 'react';

interface State {
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Render error:', error, info);
  }

  reset = () => this.setState({ error: null });

  hardReset = () => {
    try {
      localStorage.removeItem('explainer-storage');
    } catch {
      // ignore
    }
    location.reload();
  };

  render() {
    if (this.state.error) {
      return (
        <div className="w-full h-full flex items-center justify-center p-6 bg-gray-50">
          <div className="max-w-md bg-white border border-gray-200 rounded-xl shadow p-6 text-sm">
            <div className="font-semibold text-gray-800 mb-2">
              Etwas ist schiefgelaufen.
            </div>
            <p className="text-gray-600 mb-3">
              Die App hat beim Rendern einen Fehler geworfen — kein
              Datenverlust. Du kannst die App weiterverwenden oder den
              gespeicherten Zustand zurücksetzen.
            </p>
            <pre className="text-[11px] text-red-700 bg-red-50 rounded p-2 overflow-auto max-h-40 mb-3">
              {String(this.state.error?.message ?? this.state.error)}
            </pre>
            <div className="flex gap-2">
              <button
                onClick={this.reset}
                className="flex-1 text-sm bg-blue-600 text-white rounded px-3 py-2 hover:bg-blue-700"
              >
                Weiter
              </button>
              <button
                onClick={this.hardReset}
                className="flex-1 text-sm bg-gray-100 text-gray-700 rounded px-3 py-2 hover:bg-gray-200"
              >
                Alles zurücksetzen
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
