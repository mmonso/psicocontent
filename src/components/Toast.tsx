import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  description?: string;
  /* Ação opcional — usada para "Desfazer" numa exclusão, por exemplo. */
  action?: { label: string; onClick: () => void };
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

const ICONS = {
  success: { Icon: CheckCircle2, className: 'text-success' },
  error: { Icon: AlertCircle, className: 'text-danger' },
  info: { Icon: Info, className: 'text-ink-muted' },
} as const;

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-20 md:bottom-5 right-4 z-[60] flex flex-col gap-2 w-[calc(100%-2rem)] max-w-sm pointer-events-none"
    >
      {toasts.map(({ id, type, title, description, action }) => {
        const { Icon, className } = ICONS[type];
        return (
          <div
            key={id}
            className="pointer-events-auto bg-surface-raised border border-line rounded-panel p-3.5 shadow-lg shadow-black/40 flex items-start gap-3 animate-slide-in-right"
          >
            <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${className}`} aria-hidden="true" />

            <div className="flex-1 min-w-0 space-y-1">
              <p className="text-sm font-medium text-ink leading-snug">{title}</p>
              {description && (
                <p className="text-xs text-ink-muted leading-relaxed line-clamp-3">
                  {description}
                </p>
              )}
              {action && (
                <button
                  onClick={() => {
                    action.onClick();
                    onDismiss(id);
                  }}
                  className="text-xs font-semibold text-accent-ink hover:underline cursor-pointer pt-0.5"
                >
                  {action.label}
                </button>
              )}
            </div>

            <button
              onClick={() => onDismiss(id)}
              aria-label="Dispensar notificação"
              className="text-ink-faint hover:text-ink p-0.5 rounded transition-colors cursor-pointer shrink-0"
            >
              <X className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
