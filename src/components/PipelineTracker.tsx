import React, { useEffect, useState } from 'react';
import { Feather, ShieldCheck, Palette, Check, Loader2, AlertCircle } from 'lucide-react';
import { DraftResult, ReviewResult, ImageResult } from '../types';
import { Card, Badge } from './ui';

type PipelineStatus = 'drafting' | 'reviewing' | 'generating_image' | 'completed' | 'error';

interface PipelineTrackerProps {
  status: PipelineStatus;
  errorMessage?: string;
  draftResult?: DraftResult;
  reviewResult?: ReviewResult;
  imageResult?: ImageResult;
  authorName?: string;
  topic: string;
}

const STEPS = [
  {
    id: 'drafting',
    label: 'Rascunho',
    agent: 'Redator',
    icon: Feather,
    description: 'Estrutura o texto a partir da sua voz e dos seus princípios.',
  },
  {
    id: 'reviewing',
    label: 'Revisão',
    agent: 'Comitê clínico',
    icon: ShieldCheck,
    description: 'Confere ritmo, rigor conceitual e postura ética, e reescreve.',
  },
  {
    id: 'generating_image',
    label: 'Capa',
    agent: 'Designer',
    icon: Palette,
    description: 'Cria a metáfora visual e gera a ilustração de capa.',
  },
] as const;

const ORDER: Record<string, number> = { drafting: 0, reviewing: 1, generating_image: 2 };

/* Cronômetro decorrido. O pipeline são três chamadas encadeadas a um modelo e
   passa facilmente de um minuto — sem nenhuma marcação de tempo, a espera é
   indistinguível de um travamento. */
const useElapsed = (running: boolean) => {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!running) return;
    const started = Date.now();
    const id = setInterval(() => setSeconds(Math.floor((Date.now() - started) / 1000)), 1000);
    return () => clearInterval(id);
  }, [running]);

  return seconds;
};

const formatElapsed = (total: number) => {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return m > 0 ? `${m}min ${String(s).padStart(2, '0')}s` : `${s}s`;
};

export const PipelineTracker: React.FC<PipelineTrackerProps> = ({
  status,
  errorMessage,
  draftResult,
  reviewResult,
  imageResult,
  authorName,
  topic,
}) => {
  const isRunning = status !== 'completed' && status !== 'error';
  const elapsed = useElapsed(isRunning);

  const currentIndex = ORDER[status] ?? -1;
  const completedCount = [draftResult, reviewResult, imageResult].filter(Boolean).length;
  const progress = status === 'completed' ? 100 : (completedCount / STEPS.length) * 100;

  const stepState = (stepId: string): 'done' | 'active' | 'pending' | 'failed' => {
    const index = ORDER[stepId];
    if (status === 'completed') return 'done';
    if (status === 'error') {
      if (index < currentIndex) return 'done';
      return index === currentIndex ? 'failed' : 'pending';
    }
    if (index < currentIndex) return 'done';
    return index === currentIndex ? 'active' : 'pending';
  };

  return (
    <Card className="space-y-6">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-faint">
              {status === 'error' ? 'Produção interrompida' : 'Produzindo artigo'}
            </p>
            <h2 className="font-serif text-lg sm:text-xl font-bold text-ink leading-snug line-clamp-2">
              {topic}
            </h2>
            {authorName && (
              <p className="text-xs text-ink-faint">Sob a visão de {authorName}</p>
            )}
          </div>

          {isRunning && (
            <span className="text-xs tabular-nums text-ink-muted shrink-0 pt-1">
              {formatElapsed(elapsed)}
            </span>
          )}
        </div>

        <div
          className="h-1 w-full bg-surface-sunken rounded-full overflow-hidden"
          role="progressbar"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Progresso da produção"
        >
          <div
            className={`h-full transition-all duration-700 ${
              status === 'error' ? 'bg-danger' : 'bg-accent'
            }`}
            style={{ width: `${Math.max(progress, 4)}%` }}
          />
        </div>
      </div>

      {status === 'error' && (
        <div className="bg-danger-soft border border-danger/30 rounded-control p-4 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-danger shrink-0 mt-0.5" aria-hidden="true" />
          <div className="space-y-1 min-w-0">
            <p className="text-sm font-medium text-ink">A produção falhou nesta etapa</p>
            <p className="text-xs text-danger-ink break-words">
              {errorMessage || 'Falha de comunicação com o servidor.'}
            </p>
          </div>
        </div>
      )}

      <ol className="space-y-2">
        {STEPS.map((step) => {
          const state = stepState(step.id);
          const Icon = step.icon;

          return (
            <li
              key={step.id}
              className={`flex items-start gap-3.5 p-3.5 rounded-control border transition-colors ${
                state === 'active'
                  ? 'border-accent/40 bg-accent-soft/40'
                  : state === 'failed'
                  ? 'border-danger/40 bg-danger-soft/40'
                  : 'border-line bg-surface-sunken/40'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  state === 'done'
                    ? 'bg-success-soft text-success-ink'
                    : state === 'active'
                    ? 'bg-accent text-canvas'
                    : state === 'failed'
                    ? 'bg-danger-soft text-danger-ink'
                    : 'bg-surface-raised text-ink-faint'
                }`}
              >
                {state === 'active' ? (
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                ) : state === 'done' ? (
                  <Check className="w-4 h-4" aria-hidden="true" />
                ) : state === 'failed' ? (
                  <AlertCircle className="w-4 h-4" aria-hidden="true" />
                ) : (
                  <Icon className="w-4 h-4" aria-hidden="true" />
                )}
              </div>

              <div className="min-w-0 flex-1 space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3
                    className={`text-sm font-medium ${
                      state === 'pending' ? 'text-ink-faint' : 'text-ink'
                    }`}
                  >
                    {step.label}
                  </h3>
                  <span className="text-[11px] text-ink-faint">{step.agent}</span>
                  {state === 'active' && <Badge tone="accent">em andamento</Badge>}
                  {state === 'done' && <Badge tone="success">concluído</Badge>}
                </div>
                <p
                  className={`text-xs leading-relaxed ${
                    state === 'pending' ? 'text-ink-faint' : 'text-ink-muted'
                  }`}
                >
                  {step.description}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </Card>
  );
};
