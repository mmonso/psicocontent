import React from 'react';
import {
  PenLine,
  Library,
  Compass,
  Loader2,
  Cloud,
  CloudOff,
  HardDrive,
  RefreshCw,
} from 'lucide-react';

export type SyncState = 'local' | 'syncing' | 'synced' | 'offline';

/* Onde os textos estão guardados neste momento. Sem isso o usuário não tem como
   saber se o conteúdo existe só no navegador ou já foi para o banco. */
const SYNC_LABELS: Record<SyncState, { icon: React.ComponentType<{ className?: string }>; label: string; title: string; className: string }> = {
  local: {
    icon: HardDrive,
    label: 'Só neste navegador',
    title:
      'Supabase não configurado. Os artigos existem apenas neste navegador e serão perdidos se você limpar os dados de navegação.',
    className: 'text-ink-faint',
  },
  syncing: {
    icon: RefreshCw,
    label: 'Sincronizando',
    title: 'Enviando alterações para o Supabase.',
    className: 'text-ink-muted',
  },
  synced: {
    icon: Cloud,
    label: 'Salvo na nuvem',
    title: 'Tudo sincronizado com o Supabase.',
    className: 'text-accent-ink',
  },
  offline: {
    icon: CloudOff,
    label: 'Sem conexão',
    title:
      'Não foi possível falar com o Supabase. As alterações estão salvas neste navegador e sobem quando a conexão voltar.',
    className: 'text-danger-ink',
  },
};

/* Três seções em vez de cinco. "Equipe" era documentação e "Portal Público"
   era uma forma de ver a biblioteca — nenhum dos dois é um destino de
   trabalho, então ambos viraram sub-visões. */
export type SectionId = 'escrever' | 'biblioteca' | 'visao';

interface NavItem {
  id: SectionId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  hint: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'escrever', label: 'Escrever', icon: PenLine, hint: 'Criar um novo artigo' },
  { id: 'biblioteca', label: 'Biblioteca', icon: Library, hint: 'Artigos publicados e rascunhos' },
  { id: 'visao', label: 'Minha visão', icon: Compass, hint: 'Voz, princípios e equipe virtual' },
];

interface NavbarProps {
  section: SectionId;
  onNavigate: (section: SectionId) => void;
  savedCount: number;
  isGenerating: boolean;
  syncState: SyncState;
}

export const Navbar: React.FC<NavbarProps> = ({
  section,
  onNavigate,
  savedCount,
  isGenerating,
  syncState,
}) => (
  <>
    <a
      href="#conteudo"
      className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:bg-surface-raised focus:text-ink focus:px-3 focus:py-2 focus:rounded-control focus:border focus:border-line"
    >
      Pular para o conteúdo
    </a>

    <header className="sticky top-0 z-40 bg-canvas/85 backdrop-blur-md border-b border-line">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          <button
            onClick={() => onNavigate('escrever')}
            className="flex items-baseline gap-2 cursor-pointer text-left shrink-0"
          >
            <span className="font-serif text-lg font-bold tracking-tight text-ink">
              PsicoContent
            </span>
            <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-ink-faint hidden sm:inline">
              Studio
            </span>
          </button>

          <nav aria-label="Seções" className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map(({ id, label, icon: Icon, hint }) => {
              const active = section === id;
              return (
                <button
                  key={id}
                  onClick={() => onNavigate(id)}
                  aria-current={active ? 'page' : undefined}
                  title={hint}
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-control text-sm transition-colors cursor-pointer ${
                    active
                      ? 'bg-surface-raised text-ink font-medium'
                      : 'text-ink-muted hover:text-ink hover:bg-surface'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>{label}</span>
                  {id === 'biblioteca' && savedCount > 0 && (
                    <span className="text-[11px] tabular-nums text-ink-faint">
                      {savedCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* O estado de geração precisa ser visível de qualquer seção: o
              pipeline leva minutos e o usuário costuma navegar enquanto espera. */}
          <div className="flex items-center gap-3 shrink-0" aria-live="polite">
            {isGenerating && (
              <span className="inline-flex items-center gap-2 text-xs text-accent-ink bg-accent-soft border border-accent/30 px-2.5 py-1 rounded-full">
                <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                <span className="hidden sm:inline">Produzindo artigo</span>
              </span>
            )}

            {(() => {
              const { icon: Icon, label, title, className } = SYNC_LABELS[syncState];
              return (
                <span
                  title={title}
                  className={`inline-flex items-center gap-1.5 text-[11px] ${className}`}
                >
                  <Icon
                    className={`w-3.5 h-3.5 ${syncState === 'syncing' ? 'animate-spin' : ''}`}
                    aria-hidden="true"
                  />
                  <span className="hidden lg:inline">{label}</span>
                </span>
              );
            })()}
          </div>
        </div>
      </div>
    </header>

    <nav
      aria-label="Seções"
      className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-canvas/95 backdrop-blur-md border-t border-line flex items-stretch"
    >
      {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
        const active = section === id;
        return (
          <button
            key={id}
            onClick={() => onNavigate(id)}
            aria-current={active ? 'page' : undefined}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-2.5 min-h-[56px] transition-colors cursor-pointer ${
              active ? 'text-accent-ink' : 'text-ink-faint'
            }`}
          >
            <Icon className="w-5 h-5" aria-hidden="true" />
            <span className="text-[10px] font-medium">{label}</span>
          </button>
        );
      })}
    </nav>
  </>
);
