import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      const isDev = process.env.NODE_ENV !== 'production' || window.location.hostname === 'localhost';

      return (
        <div
          id="error-boundary-screen"
          className="min-h-screen flex items-center justify-center p-4 bg-[#FAF7F2] dark:bg-slate-950 text-stone-900 dark:text-stone-100 font-['Vazirmatn']"
          dir="rtl"
        >
          <div className="max-w-lg w-full bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-5 ring-8 ring-amber-50/50 dark:ring-amber-950/20">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <h1 className="text-xl md:text-2xl font-bold mb-2 text-stone-900 dark:text-white">
              متأسفانه مشکلی در بارگذاری رخ داد
            </h1>
            <p className="text-sm md:text-base text-stone-600 dark:text-stone-400 mb-6 leading-relaxed">
              ارتباط با سامانه دچار اختلال موقت شده است. لطفاً با زدن دکمه زیر صفحه را مجدداً بارگذاری
              فرمایید.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 w-full mb-4">
              <button
                id="btn-error-retry"
                onClick={this.handleReset}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[#0E7C86] hover:bg-[#0c6b73] text-white font-bold text-sm shadow-md transition-all active:scale-95"
              >
                <RefreshCw className="w-4 h-4" />
                <span>تلاش مجدد</span>
              </button>
              <a
                id="btn-error-home"
                href="/"
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-stone-100 dark:bg-slate-800 hover:bg-stone-200 dark:hover:bg-slate-700 text-stone-800 dark:text-stone-200 font-medium text-sm transition-all"
              >
                <Home className="w-4 h-4" />
                <span>صفحه اصلی</span>
              </a>
            </div>

            {/* جزئیات فنی خطا در محیط Development */}
            {isDev && this.state.error && (
              <div className="mt-6 w-full text-left p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-800 dark:text-red-300 font-mono text-xs overflow-x-auto" dir="ltr">
                <p className="font-bold mb-1">
                  {this.state.error.name}: {this.state.error.message}
                </p>
                {this.state.error.stack && (
                  <pre className="text-[10px] whitespace-pre-wrap opacity-80 mt-2">
                    {this.state.error.stack}
                  </pre>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
