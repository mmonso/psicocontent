import React from 'react';
import { Loader2 } from 'lucide-react';

/* ---------------------------------------------------------------------------
   Primitivos de interface.

   Antes cada componente reescrevia à mão a mesma string de classes para botão,
   card e badge, com variações pequenas e não intencionais. Isso concentra o
   desenho num lugar só.
--------------------------------------------------------------------------- */

export const cx = (...parts: Array<string | false | null | undefined>) =>
  parts.filter(Boolean).join(' ');

/* Botão --------------------------------------------------------------------- */

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'bg-accent text-canvas font-semibold hover:bg-accent-strong active:bg-accent-strong',
  secondary:
    'bg-surface-raised text-ink border border-line hover:border-line-strong hover:bg-surface',
  ghost: 'text-ink-muted hover:text-ink hover:bg-surface-raised',
  danger:
    'bg-transparent text-ink-faint border border-line hover:text-danger-ink hover:border-danger/60 hover:bg-danger-soft',
};

const BUTTON_SIZES: Record<ButtonSize, string> = {
  sm: 'text-xs px-2.5 py-1.5 gap-1.5 min-h-[32px]',
  md: 'text-sm px-3.5 py-2 gap-2 min-h-[40px]',
  lg: 'text-sm px-5 py-2.5 gap-2 min-h-[44px]',
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'secondary',
  size = 'md',
  loading = false,
  icon: Icon,
  disabled,
  className,
  children,
  ...rest
}) => (
  <button
    disabled={disabled || loading}
    aria-busy={loading || undefined}
    className={cx(
      'inline-flex items-center justify-center rounded-control transition-colors cursor-pointer',
      'disabled:opacity-45 disabled:cursor-not-allowed',
      BUTTON_VARIANTS[variant],
      BUTTON_SIZES[size],
      className
    )}
    {...rest}
  >
    {loading ? (
      <Loader2 className="w-4 h-4 animate-spin shrink-0" aria-hidden="true" />
    ) : (
      Icon && <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
    )}
    {children}
  </button>
);

/* Card ---------------------------------------------------------------------- */

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: 'div' | 'article' | 'section';
  padded?: boolean;
  interactive?: boolean;
}

export const Card: React.FC<CardProps> = ({
  as: Tag = 'div',
  padded = true,
  interactive = false,
  className,
  children,
  ...rest
}) => (
  <Tag
    className={cx(
      'bg-surface border border-line rounded-panel',
      padded && 'p-5 sm:p-6',
      interactive && 'transition-colors hover:border-line-strong',
      className
    )}
    {...rest}
  >
    {children}
  </Tag>
);

/* Badge --------------------------------------------------------------------- */

type BadgeTone = 'neutral' | 'accent' | 'success' | 'danger';

const BADGE_TONES: Record<BadgeTone, string> = {
  neutral: 'bg-surface-raised text-ink-muted border-line',
  accent: 'bg-accent-soft text-accent-ink border-accent/30',
  success: 'bg-success-soft text-success-ink border-success/30',
  danger: 'bg-danger-soft text-danger-ink border-danger/30',
};

export const Badge: React.FC<{
  tone?: BadgeTone;
  className?: string;
  children: React.ReactNode;
}> = ({ tone = 'neutral', className, children }) => (
  <span
    className={cx(
      'inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full border whitespace-nowrap',
      BADGE_TONES[tone],
      className
    )}
  >
    {children}
  </span>
);

/* Cabeçalho de seção -------------------------------------------------------- */

export const SectionHeader: React.FC<{
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}> = ({ eyebrow, title, description, action, className }) => (
  <div
    className={cx(
      'flex flex-col sm:flex-row sm:items-end justify-between gap-3',
      className
    )}
  >
    <div className="min-w-0 space-y-1">
      {eyebrow && (
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-faint">
          {eyebrow}
        </p>
      )}
      <h2 className="font-serif text-xl sm:text-2xl font-bold text-ink leading-tight">
        {title}
      </h2>
      {description && (
        <p className="text-sm text-ink-muted leading-relaxed max-w-2xl">
          {description}
        </p>
      )}
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </div>
);

/* Campo de formulário -------------------------------------------------------
   Rótulo, dica e contagem de caracteres num lugar só. Antes os formulários
   misturavam rótulos soltos com placeholders fazendo o papel de rótulo. */

interface FieldProps {
  label: string;
  htmlFor: string;
  hint?: string;
  required?: boolean;
  value?: string;
  maxLength?: number;
  children: React.ReactNode;
}

export const Field: React.FC<FieldProps> = ({
  label,
  htmlFor,
  hint,
  required,
  value,
  maxLength,
  children,
}) => (
  <div className="space-y-1.5">
    <div className="flex items-baseline justify-between gap-3">
      <label
        htmlFor={htmlFor}
        className="text-xs font-semibold uppercase tracking-wider text-ink-muted"
      >
        {label}
        {required && (
          <span className="text-accent-ink ml-1" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {maxLength !== undefined && value !== undefined && (
        <span
          className={cx(
            'text-[11px] tabular-nums',
            value.length > maxLength * 0.9 ? 'text-danger-ink' : 'text-ink-faint'
          )}
        >
          {value.length}/{maxLength}
        </span>
      )}
    </div>
    {children}
    {hint && <p className="text-[11px] text-ink-faint leading-relaxed">{hint}</p>}
  </div>
);

/* Classes de controle de formulário, para input/textarea/select nativos */
export const controlClass =
  'w-full bg-surface-sunken border border-line rounded-control px-3.5 py-2.5 ' +
  'text-sm text-ink placeholder:text-ink-faint transition-colors ' +
  'hover:border-line-strong focus:border-accent focus:outline-none';

/* Estado vazio -------------------------------------------------------------- */

export const EmptyState: React.FC<{
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: React.ReactNode;
}> = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center text-center py-16 px-6 gap-3">
    {Icon && (
      <div className="w-12 h-12 rounded-full bg-surface-raised border border-line flex items-center justify-center mb-1">
        <Icon className="w-5 h-5 text-ink-faint" aria-hidden="true" />
      </div>
    )}
    <h3 className="font-serif text-lg font-bold text-ink">{title}</h3>
    {description && (
      <p className="text-sm text-ink-muted max-w-sm leading-relaxed">
        {description}
      </p>
    )}
    {action && <div className="pt-2">{action}</div>}
  </div>
);
