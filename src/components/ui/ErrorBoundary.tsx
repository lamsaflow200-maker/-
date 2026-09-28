/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { getSafeErrorMessage } from '../../utils/security';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  sectionName?: string;
  silent?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

/**
 * Universal Production Error Boundary for Mnasbati Platform.
 * Implements Requirements 44, 45, 61 of Prompt 19:
 * - Prevents entire page crashes when isolated components (e.g. Gallery, Video, Music) encounter errors
 * - Sanitizes error messages without exposing SQL, stack traces, or internal paths
 * - Supports silent degradation for non-critical features
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Production-safe logging (no secrets, no sensitive tokens)
    console.warn(
      `[ErrorBoundary] Caught error in ${this.props.sectionName || 'Component'}:`,
      error.message
    );
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: undefined });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.silent) {
        return null;
      }

      if (this.props.fallback) {
        return this.props.fallback;
      }

      const safeMessage = getSafeErrorMessage(
        this.state.error,
        'تعذر تحميل هذا القسم بشكل سليم. يمكنك المحاولة مرة أخرى.'
      );

      return (
        <div
          dir="rtl"
          className="my-4 p-4 rounded-xl bg-[#FAF7F2] border border-[#E8DED8] text-center space-y-3"
        >
          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-[#5A1020]">
            <AlertCircle className="w-4 h-4 text-[#C9A45C]" />
            <span>
              {this.props.sectionName
                ? `تنبيه في ${this.props.sectionName}`
                : 'حدث خطأ غير متوقع في العرض'}
            </span>
          </div>
          <p className="text-[11px] text-[#6F6668] max-w-sm mx-auto font-serif">
            {safeMessage}
          </p>
          <button
            type="button"
            onClick={this.handleReset}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-white border border-[#E8DED8] text-[#171316] hover:bg-[#F2ECE8] transition cursor-pointer shadow-2xs"
          >
            <RefreshCw className="w-3 h-3 text-[#C9A45C]" />
            <span>إعادة المحاولة</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
