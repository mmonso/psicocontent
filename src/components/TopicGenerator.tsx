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
    <div className="bg-gradient-to-br from-amber-50/60 via-stone-50 to-teal-50/40 dark:from-[#18191e] dark:via-[#16171c] dark:to-[#1a1b22] rounded-3xl p-6 sm:p-8 border border-amber-200/80 dark:border-stone-800 shadow-sm space-y-6 transition-colors">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-amber-200/60 dark:border-stone-800 pb-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-amber-800 dark:text-amber-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 animate-pulse" />
            <span>Gerador de Tópicos & Pautas com IA</span>
          </div>
          <h3 className="text-xl font-serif font-bold text-stone-900 dark:text-stone-100">
            Inspiração Alinhada à Sua Visão de Mundo
          </h3>
          <p className="text-xs text-stone-600 dark:text-stone-300 max-w-xl leading-relaxed">
            Gere ideias e ângulos de artigos perfeitamente sob medida para o tom de voz e os princípios de <strong>{manifesto.authorName || 'sua assinatura'}</strong>.
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleGenerate()}
          disabled={isGenerating}
          className="px-5 py-3 bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-stone-950 font-bold text-xs sm:text-sm rounded-2xl shadow-md flex items-center space-x-2 shrink-0 transition-all disabled:opacity-50 cursor-pointer"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Gerando Pautas...</span>
            </>
          ) : (
            <>
              <Compass className="w-4 h-4 text-amber-200 dark:text-stone-900" />
              <span>{topics.length > 0 ? 'Gerar Outras Ideias' : 'Gerar Tópicos Inéditos'}</span>
            </>
          )}
        </button>
      </div>

      {/* Inputs & Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white/80 dark:bg-stone-900/80 p-4 rounded-2xl border border-stone-200/80 dark:border-stone-800 backdrop-blur-xs">
        
        {/* Keyword Filter */}
        <div className="md:col-span-1 space-y-1">
          <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
            Assunto ou Palavra-Chave (Opcional)
          </label>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3" />
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
              className="w-full pl-9 pr-3 py-2 bg-stone-50 dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="md:col-span-2 space-y-1">
          <label className="block text-[11px] font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
            Filtrar por Categoria / Eixo
          </label>
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('');
                handleGenerate('');
              }}
              className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                selectedCategory === ''
                  ? 'bg-amber-700 dark:bg-amber-400 text-white dark:text-stone-950 border-amber-800 dark:border-amber-400 font-semibold shadow-2xs'
                  : 'bg-stone-100 dark:bg-stone-950 hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-800'
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
                className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                  selectedCategory === cat
                    ? 'bg-amber-700 dark:bg-amber-400 text-white dark:text-stone-950 border-amber-800 dark:border-amber-400 font-semibold shadow-2xs'
                    : 'bg-stone-100 dark:bg-stone-950 hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-800'
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
        <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3 rounded-xl font-medium">
          {errorMsg}
        </div>
      )}

      {/* Loading Skeleton */}
      {isGenerating && (
        <div className="space-y-3 py-2">
          <div className="text-center text-xs font-semibold text-amber-900 flex items-center justify-center space-x-2 animate-pulse">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>Consultando a filosofia de "{manifesto.authorName || 'sua assinatura'}" para criar pautas autênticas...</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white/60 p-4 rounded-2xl border border-stone-200 space-y-2 animate-pulse">
                <div className="h-4 bg-stone-200 rounded-md w-3/4"></div>
                <div className="h-3 bg-stone-100 rounded-md w-full"></div>
                <div className="h-3 bg-stone-100 rounded-md w-5/6"></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Generated Topics Cards */}
      {!isGenerating && topics.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider flex items-center space-x-1">
              <BookOpen className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" />
              <span>{topics.length} Pautas Sugeridas:</span>
            </span>
            <button
              type="button"
              onClick={() => handleGenerate()}
              className="text-xs text-amber-800 dark:text-amber-300 hover:text-amber-950 font-bold flex items-center space-x-1 cursor-pointer"
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
                  className={`rounded-2xl p-4 sm:p-5 border transition-all flex flex-col justify-between space-y-3 ${
                    isPicked
                      ? 'border-teal-600 dark:border-amber-400 ring-2 ring-teal-500/50 dark:ring-amber-400/50 shadow-md bg-teal-50/20 dark:bg-stone-900'
                      : 'bg-white dark:bg-stone-900 border-stone-200/90 dark:border-stone-800 hover:border-amber-400 dark:hover:border-amber-400 hover:shadow-md'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border border-amber-200 dark:border-amber-800">
                        {t.category}
                      </span>
                    </div>

                    <h4 className="font-serif font-bold text-stone-900 dark:text-stone-100 text-base leading-snug">
                      "{t.title}"
                    </h4>

                    <div className="space-y-1 text-xs text-stone-600 dark:text-stone-300">
                      <p>
                        <strong className="text-stone-800 dark:text-stone-200">Ângulo:</strong> {t.angle}
                      </p>
                      <p className="text-[11px] text-teal-800 dark:text-teal-300 bg-teal-50/80 dark:bg-stone-950 p-2 rounded-xl border border-teal-100 dark:border-teal-900/60 leading-relaxed italic">
                        <strong>Por que combina:</strong> {t.whyItFits}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleChoose(t)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
                        isPicked
                          ? 'bg-teal-800 dark:bg-amber-400 text-white dark:text-stone-950 shadow-xs'
                          : 'bg-stone-900 dark:bg-stone-800 hover:bg-teal-800 dark:hover:bg-amber-400 text-white dark:hover:text-stone-950'
                      }`}
                    >
                      {isPicked ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300 dark:text-stone-950" />
                          <span>Tema Selecionado!</span>
                        </>
                      ) : (
                        <>
                          <span>Usar este Tema</span>
                          <ArrowRight className="w-3.5 h-3.5 text-amber-300 dark:text-amber-300" />
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
