import React, { useState } from 'react';
import { UserManifesto } from '../types';
import {
  Sparkles,
  Lightbulb,
  Compass,
  ArrowRight,
  Loader2,
  CheckCircle2,
  RefreshCw,
  Search,
  BookOpen,
} from 'lucide-react';

export interface GeneratedTopic {
  title: string;
  angle: string;
  whyItFits: string;
  category: string;
}

interface TopicGeneratorProps {
  manifesto: UserManifesto;
  onSelectTopic: (topic: GeneratedTopic | string) => void;
}

const DEFAULT_CATEGORIES = [
  'Awareness & Fenomenologia da Experiência',
  'Potência de Existir & Afetos (Espinosa)',
  'Existência, Liberdade & Responsabilidade',
  'Vínculos, Afeto & Alteridade',
  'Sofrimento Social & Crítica à Cultura',
  'Luto, Impermanência & Transições',
];

export const TopicGenerator: React.FC<TopicGeneratorProps> = ({ manifesto, onSelectTopic }) => {
  const categoriesToUse = manifesto.themeCategories && manifesto.themeCategories.length > 0
    ? manifesto.themeCategories
    : DEFAULT_CATEGORIES;

  const [keyword, setKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [topics, setTopics] = useState<GeneratedTopic[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedTitle, setSelectedTitle] = useState<string | null>(null);

  const handleGenerate = async (catOverride?: string) => {
    setIsGenerating(true);
    setErrorMsg(null);
    const activeCat = catOverride !== undefined ? catOverride : selectedCategory;

    try {
      const res = await fetch('/api/generate-topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyword: keyword.trim() || undefined,
          category: activeCat || undefined,
          userManifesto: manifesto,
        }),
      });

      const data = await res.json();
      if (data.success && Array.isArray(data.topics)) {
        setTopics(data.topics);
      } else {
        setErrorMsg(data.error || 'Não foi possível gerar novos tópicos. Tente novamente.');
      }
    } catch (err: any) {
      console.error('Erro na chamada do gerador de tópicos:', err);
      setErrorMsg('Falha de conexão. Verifique sua rede e tente novamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleChoose = (topicObj: GeneratedTopic) => {
    setSelectedTitle(topicObj.title);
    onSelectTopic(topicObj);
  };

  return (
    <div className="bg-surface-raised rounded-panel p-6 sm:p-8 border border-accent/80 shadow-sm space-y-6 transition-colors">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-accent/60 pb-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-accent-ink text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-accent-ink animate-pulse" />
            <span>Gerador de Tópicos & Pautas com IA</span>
          </div>
          <h3 className="text-xl font-serif font-bold text-ink">
            Inspiração Alinhada à Sua Visão de Mundo
          </h3>
          <p className="text-xs text-ink-muted max-w-xl leading-relaxed">
            Gere ideias e ângulos de artigos perfeitamente sob medida para o tom de voz e os princípios de <strong>{manifesto.authorName || 'sua assinatura'}</strong>.
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleGenerate()}
          disabled={isGenerating}
          className="px-5 py-3 bg-accent hover:bg-accent-strong text-canvas font-bold text-xs sm:text-sm rounded-panel shadow-md flex items-center space-x-2 shrink-0 transition-all disabled:opacity-50 cursor-pointer"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Gerando Pautas...</span>
            </>
          ) : (
            <>
              <Compass className="w-4 h-4 text-accent-ink" />
              <span>{topics.length > 0 ? 'Gerar Outras Ideias' : 'Gerar Tópicos Inéditos'}</span>
            </>
          )}
        </button>
      </div>

      {/* Inputs & Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-surface/80 p-4 rounded-panel border border-line/80 backdrop-blur-xs">
        
        {/* Keyword Filter */}
        <div className="md:col-span-1 space-y-1">
          <label className="block text-[11px] font-bold text-ink-muted uppercase tracking-wider">
            Assunto ou Palavra-Chave (Opcional)
          </label>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-ink-faint absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Ex: maternidade, perfeccionismo..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleGenerate();
                }
              }}
              className="w-full pl-9 pr-3 py-2 bg-surface-sunken border border-line rounded-control text-xs text-ink focus:ring-2 focus:ring-accent"
            />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="md:col-span-2 space-y-1">
          <label className="block text-[11px] font-bold text-ink-muted uppercase tracking-wider">
            Filtrar por Categoria / Eixo
          </label>
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('');
                handleGenerate('');
              }}
              className={`text-xs px-2.5 py-1 rounded-control border transition-all ${
                selectedCategory === ''
                  ? 'bg-accent text-canvas border-accent/40 font-semibold shadow-2xs'
                  : 'bg-surface-raised hover:bg-surface text-ink-muted border-line'
              }`}
            >
              Todas
            </button>
            {categoriesToUse.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat);
                  handleGenerate(cat);
                }}
                className={`text-xs px-2.5 py-1 rounded-control border transition-all ${
                  selectedCategory === cat
                    ? 'bg-accent text-canvas border-accent/40 font-semibold shadow-2xs'
                    : 'bg-surface-raised hover:bg-surface text-ink-muted border-line'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Error Message */}
      {errorMsg && (
        <div className="bg-danger-soft border border-danger/40 text-danger-ink text-xs p-3 rounded-control font-medium">
          {errorMsg}
        </div>
      )}

      {/* Loading Skeleton */}
      {isGenerating && (
        <div className="space-y-3 py-2">
          <div className="text-center text-xs font-semibold text-accent-ink flex items-center justify-center space-x-2 animate-pulse">
            <Sparkles className="w-4 h-4 text-accent-ink" />
            <span>Consultando a filosofia de "{manifesto.authorName || 'sua assinatura'}" para criar pautas autênticas...</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-surface/60 p-4 rounded-panel border border-line space-y-2 animate-pulse">
                <div className="h-4 bg-surface-raised rounded-md w-3/4"></div>
                <div className="h-3 bg-surface-raised rounded-md w-full"></div>
                <div className="h-3 bg-surface-raised rounded-md w-5/6"></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Generated Topics Cards */}
      {!isGenerating && topics.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-ink-muted uppercase tracking-wider flex items-center space-x-1">
              <BookOpen className="w-3.5 h-3.5 text-accent-ink" />
              <span>{topics.length} Pautas Sugeridas:</span>
            </span>
            <button
              type="button"
              onClick={() => handleGenerate()}
              className="text-xs text-accent-ink hover:text-accent-ink font-bold flex items-center space-x-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Gerar Novas Ideias</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {topics.map((t, idx) => {
              const isPicked = selectedTitle === t.title;
              return (
                <div
                  key={idx}
                  className={`rounded-panel p-4 sm:p-5 border transition-all flex flex-col justify-between space-y-3 ${
                    isPicked
                      ? 'border-accent/40 ring-2 ring-accent/50 shadow-md bg-accent-soft/20'
                      : 'bg-surface border-line/90 hover:border-accent/40 hover:shadow-md'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="bg-accent-soft text-accent-ink text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border border-accent/40">
                        {t.category}
                      </span>
                    </div>

                    <h4 className="font-serif font-bold text-ink text-base leading-snug">
                      "{t.title}"
                    </h4>

                    <div className="space-y-1 text-xs text-ink-muted">
                      <p>
                        <strong className="text-ink">Ângulo:</strong> {t.angle}
                      </p>
                      <p className="text-[11px] text-accent-ink bg-accent-soft/80 p-2 rounded-control border border-accent/40 leading-relaxed italic">
                        <strong>Por que combina:</strong> {t.whyItFits}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-line flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleChoose(t)}
                      className={`px-4 py-2 rounded-control text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
                        isPicked
                          ? 'bg-accent text-canvas shadow-xs'
                          : 'bg-surface hover:bg-accent text-canvas'
                      }`}
                    >
                      {isPicked ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-accent-ink" />
                          <span>Tema Selecionado!</span>
                        </>
                      ) : (
                        <>
                          <span>Usar este Tema</span>
                          <ArrowRight className="w-3.5 h-3.5 text-accent-ink" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};
