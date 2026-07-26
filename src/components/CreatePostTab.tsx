import React, { useState } from 'react';
import { PostGenerationInput, UserManifesto } from '../types';
import { VISUAL_STYLES } from '../data/presetApproaches';
import { TopicGenerator } from './TopicGenerator';
import {
  Brain,
  Sparkles,
  Sliders,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Wand2,
  Lightbulb,
  Palette,
  Heart,
  ArrowUpRight,
  Compass,
} from 'lucide-react';

interface CreatePostTabProps {
  manifesto: UserManifesto;
  onSubmitInput: (input: PostGenerationInput) => void;
  onOpenManifestoEditor: () => void;
  isLoading: boolean;
}

const QUICK_TOPICS = [
  'O sentido singular do sintoma: quando a mente recusa a cristalização',
  'A potência de existir em Espinosa: encontros que ampliam ou reduzem a vida',
  'O que alguém faz com aquilo que fizeram dele: responsabilidade em contexto',
  'Sofrimento socialmente produzido: a obrigação de felicidade e o esgotamento',
  'Fenomenologia do contato: a busca por ser amado e a capacidade de encontro',
  'O sintoma como adaptação: compreender a experiência antes de enquadrá-la',
];

export const CreatePostTab: React.FC<CreatePostTabProps> = ({
  manifesto,
  onSubmitInput,
  onOpenManifestoEditor,
  isLoading,
}) => {
  // Main form state
  const [topic, setTopic] = useState('');
  const [targetAudience, setTargetAudience] = useState<string>(
    manifesto.targetAudienceDescription || 'Pessoas em busca de autoconhecimento'
  );
  const [depthLevel, setDepthLevel] = useState<'iniciante' | 'intermediario' | 'aprofundado'>('intermediario');
  const [articleLength, setArticleLength] = useState<'curto' | 'medio' | 'longo'>('medio');
  const [selectedStyleId, setSelectedStyleId] = useState<string>('minimalist_vector');

  // Custom prompt overrides toggle
  const [showAdvancedPrompts, setShowAdvancedPrompts] = useState(false);
  const [showTopicGenerator, setShowTopicGenerator] = useState(true);
  const [customWriterPrompt, setCustomWriterPrompt] = useState('');
  const [customReviewerPrompt, setCustomReviewerPrompt] = useState('');
  const [customImagePrompt, setCustomImagePrompt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || isLoading) return;

    const inputData: PostGenerationInput = {
      topic: topic.trim(),
      targetAudience,
      tone: manifesto.toneOfVoice,
      depthLevel,
      articleLength,
      visualStyle: selectedStyleId,
      customWriterPrompt: customWriterPrompt.trim() || undefined,
      customReviewerPrompt: customReviewerPrompt.trim() || undefined,
      customImagePrompt: customImagePrompt.trim() || undefined,
    };

    onSubmitInput(inputData);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8 py-4">
      
      {/* ACTIVE MANIFESTO CARD */}
      <div className="bg-gradient-to-r from-teal-900 via-stone-900 to-teal-950 text-white rounded-3xl p-6 border border-teal-800/40 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="min-w-0 space-y-2">
          <div className="flex items-center space-x-2 text-teal-300 text-xs font-bold uppercase tracking-wider">
            <Heart className="w-4 h-4 text-rose-400 shrink-0" />
            <span>Sua Visão de Mundo Ativa</span>
          </div>

          <div className="space-y-0.5">
            <h2 className="text-xl font-bold text-white font-serif leading-snug">
              {manifesto.authorName || 'Sua Assinatura'}
            </h2>
            {manifesto.professionalTitle && (
              <p className="text-sm text-teal-200/80 font-sans">
                {manifesto.professionalTitle}
              </p>
            )}
          </div>

          <p className="text-sm text-stone-300 line-clamp-2 max-w-2xl font-sans leading-relaxed">
            {manifesto.worldviewDescription}
          </p>

          <p className="text-xs text-stone-400 line-clamp-2 max-w-2xl font-sans leading-relaxed">
            <span className="font-semibold text-stone-300">Tom de voz: </span>
            {manifesto.toneOfVoice}
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenManifestoEditor}
          className="px-4 py-2.5 bg-teal-800 hover:bg-teal-700 text-teal-100 font-semibold text-xs rounded-xl border border-teal-600/50 flex items-center space-x-1 shrink-0 transition-all cursor-pointer"
        >
          <span>Editar Visão</span>
          <ArrowUpRight className="w-4 h-4 text-amber-300" />
        </button>
      </div>

      {/* TOPIC GENERATOR WITH IA */}
      {showTopicGenerator ? (
        <TopicGenerator
          manifesto={manifesto}
          onSelectTopic={(selectedTopic) => {
            if (typeof selectedTopic === 'string') {
              setTopic(selectedTopic);
            } else {
              const fullFormatted = `TÍTULO: "${selectedTopic.title}"\nÂNGULO DE ABORDAGEM: ${selectedTopic.angle}\nJUSTIFICATIVA / ADERÊNCIA: ${selectedTopic.whyItFits}${selectedTopic.category ? `\nCATEGORIA: ${selectedTopic.category}` : ''}`;
              setTopic(fullFormatted);
            }
            const inputEl = document.getElementById('article-topic-input');
            if (inputEl) {
              inputEl.focus();
              inputEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }}
        />
      ) : (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setShowTopicGenerator(true)}
            className="text-xs bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold px-4 py-2 rounded-xl flex items-center space-x-1.5 transition-all cursor-pointer shadow-xs"
          >
            <Compass className="w-4 h-4 text-amber-700" />
            <span>Abrir Gerador de Tópicos com IA</span>
          </button>
        </div>
      )}

      {/* SECTION 1: TOPIC INPUT */}
      <div className="bg-white dark:bg-[#18191e] rounded-3xl p-4 sm:p-8 border border-stone-200 dark:border-stone-800 shadow-sm space-y-4 transition-colors">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-2 text-stone-900 dark:text-stone-100 font-bold text-base sm:text-lg">
            <Brain className="w-5 h-5 text-teal-700 dark:text-amber-300 shrink-0" />
            <h2>1. Qual ideia ou tema você quer desenvolver hoje?</h2>
          </div>
          <button
            type="button"
            onClick={() => setShowTopicGenerator(!showTopicGenerator)}
            className="text-xs text-amber-800 dark:text-amber-300 hover:text-amber-950 dark:hover:text-amber-200 font-semibold flex items-center space-x-1 bg-amber-50 dark:bg-stone-900 hover:bg-amber-100 dark:hover:bg-stone-800 px-3 py-1.5 rounded-xl border border-amber-200 dark:border-stone-700 transition-all cursor-pointer self-end sm:self-auto"
          >
            <Compass className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>{showTopicGenerator ? 'Ocultar Gerador' : 'Gerar Ideias com IA'}</span>
          </button>
        </div>

        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
              Tema Principal ou Pergunta do Leitor *
            </label>
            {topic.includes('ÂNGULO DE ABORDAGEM:') && (
              <span className="bg-teal-100 dark:bg-teal-950 text-teal-900 dark:text-teal-200 border border-teal-300 dark:border-teal-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center space-x-1 self-start sm:self-auto">
                <CheckCircle2 className="w-3 h-3 text-teal-700 dark:text-teal-400 shrink-0" />
                <span>Pauta Completa Carregada (Título + Ângulo + Justificativa)</span>
              </span>
            )}
          </div>
          <textarea
            id="article-topic-input"
            required
            rows={topic.includes('\n') ? 5 : 3}
            placeholder="Ex: Como parar de se cobrar tanto quando algo dá errado na rotina..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-2xl text-stone-900 dark:text-stone-100 text-sm focus:ring-2 focus:ring-teal-500 focus:bg-white dark:focus:bg-stone-900 transition-all font-medium leading-relaxed resize-y"
          />
        </div>

        {/* Quick Topic Suggestions */}
        <div className="space-y-2 pt-1">
          <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 flex items-center space-x-1">
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
            <span>Sugestões Rápidas de Temas:</span>
          </span>

          <div className="flex flex-wrap gap-2">
            {QUICK_TOPICS.map((suggested, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setTopic(suggested)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all text-left ${
                  topic === suggested
                    ? 'bg-teal-800 dark:bg-amber-400 text-white dark:text-stone-950 border-teal-900 dark:border-amber-400 font-semibold'
                    : 'bg-stone-100 dark:bg-stone-900 hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-800'
                }`}
              >
                {suggested}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 2: ARTICLE OPTIONS */}
      <div className="bg-white dark:bg-[#18191e] rounded-3xl p-4 sm:p-8 border border-stone-200 dark:border-stone-800 shadow-sm space-y-6 transition-colors">
        <div className="flex items-center space-x-2 text-stone-900 dark:text-stone-100 font-bold text-base sm:text-lg border-b border-stone-100 dark:border-stone-800 pb-3">
          <Sliders className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
          <h2>2. Estrutura e Formato do Artigo</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Target Audience */}
          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-2">
              Público-Alvo
            </label>
            <input
              type="text"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              className="w-full p-3 bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl text-xs sm:text-sm text-stone-900 dark:text-stone-100 font-medium focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Depth Level */}
          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-2">
              Nível de Profundidade
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'iniciante', label: 'Iniciante', desc: 'Didático & Leve' },
                { id: 'intermediario', label: 'Intermediário', desc: 'Equilibrado' },
                { id: 'aprofundado', label: 'Aprofundado', desc: 'Profundo' },
              ].map((lvl) => (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => setDepthLevel(lvl.id as any)}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    depthLevel === lvl.id
                      ? 'bg-amber-100/80 dark:bg-amber-400/20 border-amber-500 text-amber-950 dark:text-amber-300 font-bold'
                      : 'bg-stone-50 dark:bg-stone-900 border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                  }`}
                >
                  <div className="text-xs font-bold">{lvl.label}</div>
                  <div className="text-[10px] text-stone-500 dark:text-stone-400">{lvl.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Article Length */}
          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-2">
              Tamanho do Artigo
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'curto', label: 'Curto', desc: '~600 palavras' },
                { id: 'medio', label: 'Médio', desc: '~1000 palavras' },
                { id: 'longo', label: 'Longo', desc: '~1500 palavras' },
              ].map((len) => (
                <button
                  key={len.id}
                  type="button"
                  onClick={() => setArticleLength(len.id as any)}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    articleLength === len.id
                      ? 'bg-amber-100/80 dark:bg-amber-400/20 border-amber-500 text-amber-950 dark:text-amber-300 font-bold'
                      : 'bg-stone-50 dark:bg-stone-900 border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                  }`}
                >
                  <div className="text-xs font-bold">{len.label}</div>
                  <div className="text-[10px] text-stone-500 dark:text-stone-400">{len.desc}</div>
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* SECTION 3: VISUAL STYLE FOR COVER IMAGE */}
      <div className="bg-white dark:bg-[#18191e] rounded-3xl p-4 sm:p-8 border border-stone-200 dark:border-stone-800 shadow-sm space-y-4 transition-colors">
        <div className="flex items-center space-x-2 text-stone-900 dark:text-stone-100 font-bold text-base sm:text-lg">
          <Palette className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h2>3. Estilo Visual da Capa Editorial</h2>
        </div>

        <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400">
          O Agente Designer usará o resumo do artigo e o estilo selecionado para criar a imagem conceitual da capa.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {VISUAL_STYLES.map((style) => {
            const isSelected = style.id === selectedStyleId;
            return (
              <div
                key={style.id}
                onClick={() => setSelectedStyleId(style.id)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-2 bg-gradient-to-br ${style.previewColor} ${
                  isSelected
                    ? 'ring-2 ring-indigo-600 shadow-md font-semibold'
                    : 'opacity-80 hover:opacity-100 hover:shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm">{style.name}</span>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-stone-900 shrink-0" />}
                </div>
                <p className="text-xs opacity-90 line-clamp-2">{style.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ADVANCED OVERRIDE PROMPTS (ACCORDION) */}
      <div className="bg-stone-50 dark:bg-[#18191e] border border-stone-200 dark:border-stone-800 rounded-3xl p-6 space-y-4 transition-colors">
        <button
          type="button"
          onClick={() => setShowAdvancedPrompts(!showAdvancedPrompts)}
          className="w-full flex items-center justify-between text-left text-xs sm:text-sm font-bold text-stone-800 dark:text-stone-200 cursor-pointer"
        >
          <div className="flex items-center space-x-2">
            <Wand2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>Instrução Adicional Específica para este Artigo (Opcional)</span>
          </div>
          {showAdvancedPrompts ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showAdvancedPrompts && (
          <div className="space-y-4 pt-2 border-t border-stone-200 dark:border-stone-800 animate-fade-in">
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                Instrução Extra para o Redator neste texto
              </label>
              <textarea
                rows={3}
                placeholder="Ex: 'Mencionar a metáfora do barco na tempestade no segundo capítulo'..."
                value={customWriterPrompt}
                onChange={(e) => setCustomWriterPrompt(e.target.value)}
                className="w-full p-3 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl text-xs text-stone-800 dark:text-stone-200"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                Instrução Extra para o Revisor Sênior (Crítico & Anti-Clichê)
              </label>
              <textarea
                rows={2}
                placeholder="Ex: 'Exigência máxima: elimine qualquer frase que pareça autoajuda ou ChatGPT e reescreva com rigor ensaístico'..."
                value={customReviewerPrompt}
                onChange={(e) => setCustomReviewerPrompt(e.target.value)}
                className="w-full p-3 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl text-xs text-stone-800 dark:text-stone-200 focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                Instrução Extra para o Designer da Imagem
              </label>
              <textarea
                rows={2}
                placeholder="Ex: 'Usar tons de verde musgo e luz natural da manhã'..."
                value={customImagePrompt}
                onChange={(e) => setCustomImagePrompt(e.target.value)}
                className="w-full p-3 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl text-xs text-stone-800 dark:text-stone-200"
              />
            </div>
          </div>
        )}
      </div>

      {/* SUBMIT BUTTON */}
      <div className="flex justify-center pt-2">
        <button
          type="submit"
          disabled={!topic.trim() || isLoading}
          className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-teal-800 via-emerald-800 to-teal-900 hover:from-teal-900 hover:to-emerald-900 text-white font-bold text-base sm:text-lg rounded-2xl shadow-xl shadow-teal-950/20 hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3 cursor-pointer"
        >
          <Sparkles className="w-5 h-5 text-amber-300 animate-spin" />
          <span>{isLoading ? 'Produzindo Artigo...' : '🚀 Iniciar Produção da Equipe Virtual'}</span>
        </button>
      </div>

    </form>
  );
};
