import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export interface ErrorBoundaryProps {
  children: ReactNode;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * کامپوننت مدیریت و مهار خطاهای رندرینگ React (Error Boundary) با رابط کاربری فارسی
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Unhandled React Error:', error, errorInfo);
  }

  private handleReload = (): void => {
    window.location.reload();
  };

  private handleReset = (): void => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F7F3EC] text-[#1F2430] flex items-center justify-center p-4 font-['Vazirmatn',sans-serif] dir-rtl text-right">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 border border-[#E0D8C8] shadow-2xl space-y-5 text-center">
            {/* آیکون هشدار */}
            <div className="w-16 h-16 rounded-2xl bg-[#B4552D]/10 text-[#B4552D] flex items-center justify-center mx-auto shadow-inner">
              <AlertTriangle className="w-9 h-9" />
            </div>

            {/* عنوان و پیام خطا */}
            <div className="space-y-2">
              <h2 className="text-lg sm:text-xl font-black text-[#1F2430]">
                خطایی در اجرای سامانه رخ داده است
              </h2>
              <p className="text-xs sm:text-sm text-[#71717A] leading-relaxed">
                متأسفانه مشکلی غیرمنتظره در بارگذاری اطلاعات پیش آمده است. اطلاعات با حفظ پایداری موقتاً متوقف گردیدند.
              </p>
            </div>

            {/* جزئیات فنی خطا */}
            {this.state.error && (
              <div className="p-3 bg-[#F7F3EC] rounded-2xl border border-[#DDD5C5] text-[11px] text-[#B4552D] font-mono text-left overflow-x-auto max-h-24">
                {this.state.error.message}
              </div>
            )}

            {/* دکمه‌های اقدام */}
            <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
              <button
                onClick={this.handleReload}
                className="w-full flex-1 flex items-center justify-center gap-2 bg-[#0E7C86] hover:bg-[#0a5d65] text-white py-3 px-4 rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all active:scale-[0.98]"
              >
                <RefreshCw className="w-4 h-4" />
                <span>تلاش مجدد</span>
              </button>

              <button
                onClick={this.handleReset}
                className="w-full flex-1 flex items-center justify-center gap-2 bg-[#F7F3EC] hover:bg-[#E4DCB] text-[#1F2430] border border-[#DDD5C5] py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all active:scale-[0.98]"
              >
                <Home className="w-4 h-4 text-[#B4552D]" />
                <span>صفحه اصلی</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
