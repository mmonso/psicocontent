import React, { useState } from 'react';
import { PostGenerationInput, UserManifesto } from '../types';
import { VISUAL_STYLES } from '../data/presetApproaches';
import { TopicGenerator } from './TopicGenerator';
import { ChevronDown, Check, Sparkles, ArrowUpRight } from 'lucide-react';
import { Card, Button, Field, SectionHeader, controlClass, cx } from './ui';

interface CreatePostTabProps {
  manifesto: UserManifesto;
  onSubmitInput: (input: PostGenerationInput) => void;
  onOpenManifestoEditor: () => void;
  isLoading: boolean;
  /* Preenche o formulário de volta quando uma produção anterior falhou. */
  initialInput?: PostGenerationInput | null;
}

const QUICK_TOPICS = [
  'O sentido singular do sintoma: quando a mente recusa a cristalização',
  'A potência de existir em Espinosa: encontros que ampliam ou reduzem a vida',
  'O que alguém faz com aquilo que fizeram dele: responsabilidade em contexto',
  'Sofrimento socialmente produzido: a obrigação de felicidade e o esgotamento',
  'Fenomenologia do contato: a busca por ser amado e a capacidade de encontro',
  'O sintoma como adaptação: compreender a experiência antes de enquadrá-la',
];

const DEPTH_LEVELS = [
  { id: 'iniciante', label: 'Iniciante', desc: 'Didático' },
  { id: 'intermediario', label: 'Intermediário', desc: 'Equilibrado' },
  { id: 'aprofundado', label: 'Aprofundado', desc: 'Denso' },
] as const;

const LENGTHS = [
  { id: 'curto', label: 'Curto', desc: '~600 palavras' },
  { id: 'medio', label: 'Médio', desc: '~1000 palavras' },
  { id: 'longo', label: 'Longo', desc: '~1500 palavras' },
] as const;

const TOPIC_MAX = 1200;

/* Grupo de opções segmentado. Nível e tamanho repetiam o mesmo markup, com
   pequenas divergências de classe entre eles. */
function OptionGroup<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
}: {
  options: ReadonlyArray<{ id: T; label: string; desc: string }>;
  value: T;
  onChange: (id: T) => void;
  ariaLabel: string;
}) {
  return (
    <div role="radiogroup" aria-label={ariaLabel} className="grid grid-cols-3 gap-2">
      {options.map((opt) => {
        const active = opt.id === value;
        return (
          <button
            key={opt.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.id)}
            className={cx(
              'px-2 py-2.5 rounded-control border text-center transition-colors cursor-pointer',
              active
                ? 'border-accent bg-accent-soft text-accent-ink'
                : 'border-line bg-surface-sunken text-ink-muted hover:border-line-strong hover:text-ink'
            )}
          >
            <span className="block text-xs font-medium">{opt.label}</span>
            <span className="block text-[10px] text-ink-faint mt-0.5">{opt.desc}</span>
          </button>
        );
      })}
    </div>
  );
}

export const CreatePostTab: React.FC<CreatePostTabProps> = ({
  manifesto,
  onSubmitInput,
  onOpenManifestoEditor,
  isLoading,
  initialInput,
}) => {
  const [topic, setTopic] = useState(initialInput?.topic ?? '');
  const [targetAudience, setTargetAudience] = useState(
    initialInput?.targetAudience ??
      manifesto.targetAudienceDescription ??
      'Pessoas em busca de autoconhecimento'
  );
  const [depthLevel, setDepthLevel] = useState<'iniciante' | 'intermediario' | 'aprofundado'>(
    (initialInput?.depthLevel as any) ?? 'intermediario'
  );
  const [articleLength, setArticleLength] = useState<'curto' | 'medio' | 'longo'>(
    (initialInput?.articleLength as any) ?? 'medio'
  );
  const [selectedStyleId, setSelectedStyleId] = useState(
    initialInput?.visualStyle ?? VISUAL_STYLES[0]?.id ?? 'minimalist_vector'
  );

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showTopicGenerator, setShowTopicGenerator] = useState(!initialInput);
  const [customWriterPrompt, setCustomWriterPrompt] = useState(
    initialInput?.customWriterPrompt ?? ''
  );
  const [customReviewerPrompt, setCustomReviewerPrompt] = useState(
    initialInput?.customReviewerPrompt ?? ''
  );
  const [customImagePrompt, setCustomImagePrompt] = useState(
    initialInput?.customImagePrompt ?? ''
  );

  const canSubmit = topic.trim().length > 0 && !isLoading;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    onSubmitInput({
      topic: topic.trim(),
      targetAudience,
      tone: manifesto.toneOfVoice,
      depthLevel,
      articleLength,
      visualStyle: selectedStyleId,
      customWriterPrompt: customWriterPrompt.trim() || undefined,
      customReviewerPrompt: customReviewerPrompt.trim() || undefined,
      customImagePrompt: customImagePrompt.trim() || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-6">
      {/* Visão ativa — resumo, não painel. A configuração completa vive na
          seção "Minha visão". */}
      <Card className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="min-w-0 space-y-1.5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-faint">
            Escrevendo como
          </p>
          <div>
            <h2 className="font-serif text-lg font-bold text-ink leading-snug">
              {manifesto.authorName || 'Sua assinatura'}
            </h2>
            {manifesto.professionalTitle && (
              <p className="text-sm text-ink-muted">{manifesto.professionalTitle}</p>
            )}
          </div>
          <p className="text-xs text-ink-faint leading-relaxed line-clamp-2 max-w-xl">
            {manifesto.worldviewDescription}
          </p>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onOpenManifestoEditor}
          className="shrink-0 self-start sm:self-auto"
        >
          Editar visão
          <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
        </Button>
      </Card>

      {showTopicGenerator && (
        <TopicGenerator
          manifesto={manifesto}
          onSelectTopic={(selected) => {
            setTopic(
              typeof selected === 'string'
                ? selected
                : `TÍTULO: "${selected.title}"\nÂNGULO DE ABORDAGEM: ${selected.angle}\nJUSTIFICATIVA: ${selected.whyItFits}${
                    selected.category ? `\nCATEGORIA: ${selected.category}` : ''
                  }`
            );
            const el = document.getElementById('article-topic-input');
            el?.focus();
            el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }}
        />
      )}

      {/* Tema */}
      <Card className="space-y-5">
        <SectionHeader
          eyebrow="Etapa 1"
          title="Sobre o que você quer escrever?"
          action={
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowTopicGenerator((v) => !v)}
            >
              {showTopicGenerator ? 'Ocultar sugestões' : 'Gerar ideias'}
            </Button>
          }
        />

        <Field
          label="Tema ou pergunta"
          htmlFor="article-topic-input"
          required
          value={topic}
          maxLength={TOPIC_MAX}
          hint="Pode ser uma pergunta de leitor, uma inquietação clínica ou uma pauta completa vinda do gerador."
        >
          <textarea
            id="article-topic-input"
            required
            maxLength={TOPIC_MAX}
            rows={topic.includes('\n') ? 6 : 3}
            placeholder="Ex.: o que sustenta a autocobrança quando algo dá errado na rotina…"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className={cx(controlClass, 'leading-relaxed resize-y')}
          />
        </Field>

        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
            Sugestões rápidas
          </p>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_TOPICS.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => setTopic(suggestion)}
                className={cx(
                  'text-[11px] px-2.5 py-1.5 rounded-full border text-left transition-colors cursor-pointer',
                  topic === suggestion
                    ? 'border-accent bg-accent-soft text-accent-ink'
                    : 'border-line bg-surface-sunken text-ink-muted hover:border-line-strong hover:text-ink'
                )}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Formato */}
      <Card className="space-y-5">
        <SectionHeader eyebrow="Etapa 2" title="Formato do texto" />

        <Field label="Público-alvo" htmlFor="target-audience">
          <input
            id="target-audience"
            type="text"
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value)}
            className={controlClass}
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Profundidade" htmlFor="depth-group">
            <div id="depth-group">
              <OptionGroup
                ariaLabel="Nível de profundidade"
                options={DEPTH_LEVELS}
                value={depthLevel}
                onChange={(id) => setDepthLevel(id)}
              />
            </div>
          </Field>

          <Field label="Tamanho" htmlFor="length-group">
            <div id="length-group">
              <OptionGroup
                ariaLabel="Tamanho do artigo"
                options={LENGTHS}
                value={articleLength}
                onChange={(id) => setArticleLength(id)}
              />
            </div>
          </Field>
        </div>
      </Card>

      {/* Capa */}
      <Card className="space-y-5">
        <SectionHeader
          eyebrow="Etapa 3"
          title="Estilo da capa"
          description="O designer usa o resumo do artigo e este estilo para compor a ilustração."
        />

        <div
          role="radiogroup"
          aria-label="Estilo visual da capa"
          className="grid grid-cols-1 sm:grid-cols-2 gap-2"
        >
          {VISUAL_STYLES.map((style) => {
            const active = style.id === selectedStyleId;
            return (
              <button
                key={style.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setSelectedStyleId(style.id)}
                className={cx(
                  'flex items-start gap-3 p-3 rounded-control border text-left transition-colors cursor-pointer',
                  active
                    ? 'border-accent bg-accent-soft'
                    : 'border-line bg-surface-sunken hover:border-line-strong'
                )}
              >
                <span
                  className={cx(
                    'w-8 h-8 rounded-md shrink-0 bg-gradient-to-br border border-line',
                    style.previewColor
                  )}
                  aria-hidden="true"
                />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5">
                    <span
                      className={cx(
                        'text-sm font-medium',
                        active ? 'text-accent-ink' : 'text-ink'
                      )}
                    >
                      {style.name}
                    </span>
                    {active && (
                      <Check className="w-3.5 h-3.5 text-accent-ink shrink-0" aria-hidden="true" />
                    )}
                  </span>
                  <span className="block text-[11px] text-ink-faint leading-relaxed line-clamp-2 mt-0.5">
                    {style.description}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Instruções avançadas */}
      <Card padded={false}>
        <button
          type="button"
          onClick={() => setShowAdvanced((v) => !v)}
          aria-expanded={showAdvanced}
          className="w-full flex items-center justify-between gap-3 p-5 text-left cursor-pointer"
        >
          <span className="min-w-0">
            <span className="block text-sm font-medium text-ink">
              Instruções específicas para este artigo
            </span>
            <span className="block text-xs text-ink-faint mt-0.5">
              Opcional — sobrepõe a configuração geral só desta vez.
            </span>
          </span>
          <ChevronDown
            className={cx(
              'w-4 h-4 text-ink-faint shrink-0 transition-transform',
              showAdvanced && 'rotate-180'
            )}
            aria-hidden="true"
          />
        </button>

        {showAdvanced && (
          <div className="px-5 pb-5 space-y-4 border-t border-line pt-4 animate-fade-in">
            <Field label="Para o redator" htmlFor="custom-writer">
              <textarea
                id="custom-writer"
                rows={3}
                placeholder="Ex.: retomar a metáfora do barco na tempestade no segundo movimento…"
                value={customWriterPrompt}
                onChange={(e) => setCustomWriterPrompt(e.target.value)}
                className={cx(controlClass, 'resize-y')}
              />
            </Field>

            <Field label="Para o revisor" htmlFor="custom-reviewer">
              <textarea
                id="custom-reviewer"
                rows={2}
                placeholder="Ex.: eliminar qualquer frase que soe a autoajuda e reescrever com rigor ensaístico…"
                value={customReviewerPrompt}
                onChange={(e) => setCustomReviewerPrompt(e.target.value)}
                className={cx(controlClass, 'resize-y')}
              />
            </Field>

            <Field label="Para o designer da capa" htmlFor="custom-image">
              <textarea
                id="custom-image"
                rows={2}
                placeholder="Ex.: tons de verde musgo, luz natural da manhã…"
                value={customImagePrompt}
                onChange={(e) => setCustomImagePrompt(e.target.value)}
                className={cx(controlClass, 'resize-y')}
              />
            </Field>
          </div>
        )}
      </Card>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <p className="text-xs text-ink-faint">
          Três etapas encadeadas. Costuma levar de um a três minutos.
        </p>
        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={!canSubmit}
          loading={isLoading}
          icon={Sparkles}
          className="w-full sm:w-auto"
        >
          {isLoading ? 'Produzindo…' : 'Produzir artigo'}
        </Button>
      </div>
    </form>
  );
};
