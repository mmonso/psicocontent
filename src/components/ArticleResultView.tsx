import React, { useState, useEffect } from 'react';
import { ArticlePost, DerivedFormats } from '../types';
import { getStoredManifesto } from '../lib/storage';
import { Button, Badge } from './ui';
import {
  Copy,
  Check,
  Download,
  Share2,
  FileText,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  Image as ImageIcon,
  BookOpen,
  Tag,
  Clock,
  Heart,
  Edit3,
  Save,
  MessageSquare,
  Loader2,
  AlertCircle,
  Compass,
  X,
  Printer,
  Film,
  Layers,
  Plus,
  RotateCcw,
  Code,
  FileCode,
  Braces,
  Globe,
  Wand2,
  Feather,
} from 'lucide-react';
import { VISUAL_STYLES } from '../data/presetApproaches';

/* Temas do modo leitura. Cada um é uma superfície real e distinta: papel claro,
   sépia e noturno. Os valores são fixos de propósito — não são tokens da
   interface, são preferências de leitura do texto. */
const READER_THEMES = [
  { id: 'dark' as const, label: 'Noturno' },
  { id: 'sepia' as const, label: 'Sépia' },
  { id: 'light' as const, label: 'Papel' },
];

const READER_SURFACES: Record<'light' | 'sepia' | 'dark', string> = {
  light: 'bg-[#faf9f6] text-[#26231f] border-[#e2ded4]',
  sepia: 'bg-[#f6ecd8] text-[#3a2e22] border-[#e0d2b4]',
  dark: 'bg-[#15161a] text-[#dedbd5] border-line',
};

/* Citação destacada por tema. Dentro do artigo o texto herda a cor da
   superfície e a hierarquia vem de opacidade — usar os tokens da interface
   (claros, feitos para fundo escuro) deixaria o texto invisível em Papel e
   Sépia. */
const READER_QUOTES: Record<'light' | 'sepia' | 'dark', string> = {
  light: 'bg-[#f0eee7] border-[#b9b2a3]',
  sepia: 'bg-[#efe2c6] border-[#c4ac7c]',
  dark: 'bg-white/[0.04] border-accent/50',
};

interface ArticleResultViewProps {
  post: ArticlePost;
  onPostUpdated: (updatedPost: ArticlePost) => void;
  /* Grava sem confirmação visual, para o salvamento automático das edições. */
  onAutoSave?: (updatedPost: ArticlePost) => void;
  onRegenerateImage: (styleId: string) => void;
  onClonePost?: (post: ArticlePost) => void;
  addToast?: (type: 'success' | 'error' | 'info', title: string, description?: string) => void;
  isRegeneratingImage?: boolean;
}

export const ArticleResultView: React.FC<ArticleResultViewProps> = ({
  post,
  onPostUpdated,
  onAutoSave,
  onRegenerateImage,
  onClonePost,
  addToast,
  isRegeneratingImage = false,
}) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'social' | 'multiformat' | 'markdown' | 'review' | 'reactexport'>('preview');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // React Blog Export format selector state
  const [reactExportFormat, setReactExportFormat] = useState<'tsx' | 'json' | 'mdx' | 'html'>('tsx');

  // Clean Reader Customization state
  const [readerFontSize, setReaderFontSize] = useState<'sm' | 'base' | 'lg'>('base');
  /* Padrão noturno, para o texto não explodir em branco dentro de um estúdio
     escuro. "Papel" continua a um clique de distância. */
  const [readerTheme, setReaderTheme] = useState<'light' | 'sepia' | 'dark'>('dark');

  // Edit mode for markdown / direct keyboard editing
  const [isEditingText, setIsEditingText] = useState(false);
  const [editedTitle, setEditedTitle] = useState(post.review?.revisedTitle || post.draft?.title || '');
  const [editedSubtitle, setEditedSubtitle] = useState(post.review?.revisedSubtitle || post.draft?.subtitle || '');
  const [editedText, setEditedText] = useState(post.review?.revisedText || post.draft?.rawText || '');

  // Version Toggle: 'revised' vs 'draft'
  const [viewingVersion, setViewingVersion] = useState<'revised' | 'draft'>('revised');

  /* Salvamento automático das edições de texto.
     O app anuncia "salvamento automático", mas até aqui só o clique explícito
     em "Salvar" gravava — editar e atualizar a página perdia tudo. */
  const savedTitle = post.review?.revisedTitle || post.draft?.title || '';
  const savedSubtitle = post.review?.revisedSubtitle || post.draft?.subtitle || '';
  const savedText = post.review?.revisedText || post.draft?.rawText || '';

  const hasUnsavedEdits =
    editedTitle !== savedTitle ||
    editedSubtitle !== savedSubtitle ||
    editedText !== savedText;

  useEffect(() => {
    if (!hasUnsavedEdits || !post.review || !onAutoSave) return;

    const timer = setTimeout(() => {
      onAutoSave({
        ...post,
        review: {
          ...post.review!,
          revisedTitle: editedTitle,
          revisedSubtitle: editedSubtitle,
          revisedText: editedText,
        },
        updatedAt: new Date().toISOString(),
      });
    }, 1200);

    return () => clearTimeout(timer);
  }, [editedTitle, editedSubtitle, editedText, hasUnsavedEdits, post, onAutoSave]);

  /* Rede de segurança para o intervalo entre a última tecla e a gravação. */
  useEffect(() => {
    if (!hasUnsavedEdits) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [hasUnsavedEdits]);

  // Article Tags Management
  const [articleTags, setArticleTags] = useState<string[]>(
    post.tags || post.review?.suggestedTags || ['Ansiedade', 'Reflexão Existencial', 'Clínica']
  );
  const [newTagInput, setNewTagInput] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);

  // Multiformat Generator State (Carousel & Reels)
  const [isGeneratingDerived, setIsGeneratingDerived] = useState(false);
  const [derivedFormats, setDerivedFormats] = useState<DerivedFormats | null>(post.derivedFormats || null);
  const [derivedActiveTab, setDerivedActiveTab] = useState<'carousel' | 'reels'>('carousel');
  const [derivedError, setDerivedError] = useState<string | null>(null);

  // Regenerate image style selector
  const [selectedStyleForRegen, setSelectedStyleForRegen] = useState(
    post.image?.styleUsed || 'minimalist_vector'
  );

  // Re-review strict pass state
  const [isReReviewing, setIsReReviewing] = useState(false);
  const [reReviewInstruction, setReReviewInstruction] = useState('');
  const [reReviewError, setReReviewError] = useState<string | null>(null);

  // Selection & Inline Refinement State
  const [selectedSnippet, setSelectedSnippet] = useState<string>('');
  const [customRefineInstruction, setCustomRefineInstruction] = useState<string>('');
  const [isRefiningSelection, setIsRefiningSelection] = useState<boolean>(false);
  const [selectionMessage, setSelectionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Cover Image Fallback State
  const [imageSrc, setImageSrc] = useState<string>(post.image?.imageUrl || '');

  useEffect(() => {
    if (post.image?.imageUrl) {
      setImageSrc(post.image.imageUrl);
    }
  }, [post.image?.imageUrl]);

  const SMART_SUGGESTIONS = [
    'Tornar mais denso e ensaístico',
    'Aprofundar perspectiva da Gestalt / Fenomenologia',
    'Eliminar tom de conselho ou prescritivo',
    'Substituir por pergunta reflexiva aberta',
    'Enfatizar a dimensão relacional do sofrimento',
    'Criticar sutilmente a cobrança de produtividade',
  ];

  // Global Selection Listener
  useEffect(() => {
    const handleSelectionChange = () => {
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          activeEl.getAttribute('contenteditable') === 'true')
      ) {
        return;
      }

      const sel = window.getSelection();
      if (!sel || sel.isCollapsed) return;

      const text = sel.toString().trim();
      if (text.length >= 6) {
        setSelectedSnippet(text);
        setSelectionMessage(null);
      }
    };

    document.addEventListener('mouseup', handleSelectionChange);
    document.addEventListener('keyup', handleSelectionChange);

    return () => {
      document.removeEventListener('mouseup', handleSelectionChange);
      document.removeEventListener('keyup', handleSelectionChange);
    };
  }, []);

  const handleCloseSelectionBox = () => {
    setSelectedSnippet('');
    setSelectionMessage(null);
    window.getSelection()?.removeAllRanges();
  };

  const executeRefineSelection = async (instructionToUse?: string) => {
    const activeInstruction = instructionToUse || customRefineInstruction;
    if (!selectedSnippet || !activeInstruction.trim()) return;

    setIsRefiningSelection(true);
    setSelectionMessage(null);

    try {
      const manifesto = getStoredManifesto();
      const currentFullText = editedText || post.review?.revisedText || post.draft?.rawText || '';

      const res = await fetch('/api/refine-selection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selectedText: selectedSnippet,
          instruction: activeInstruction,
          fullText: currentFullText,
          userManifesto: manifesto,
        }),
      });

      const data = await res.json();
      if (data.success && data.data?.rewrittenText) {
        const rewrittenSnippet = data.data.rewrittenText;
        let newFullText = currentFullText;

        if (currentFullText.includes(selectedSnippet)) {
          newFullText = currentFullText.replace(selectedSnippet, rewrittenSnippet);
        } else if (currentFullText.includes(selectedSnippet.trim())) {
          newFullText = currentFullText.replace(selectedSnippet.trim(), rewrittenSnippet);
        } else {
          newFullText = currentFullText.replace(selectedSnippet, rewrittenSnippet);
        }

        setEditedText(newFullText);

        const updatedPost: ArticlePost = {
          ...post,
          review: post.review
            ? { ...post.review, revisedText: newFullText }
            : undefined,
          draft: { ...post.draft, rawText: newFullText },
        };
        onPostUpdated(updatedPost);

        setSelectionMessage({
          type: 'success',
          text: `Trecho reescrito: "${data.data.explanation || 'Refinamento aplicado com sucesso.'}"`,
        });
        setSelectedSnippet('');
        setCustomRefineInstruction('');
        window.getSelection()?.removeAllRanges();
      } else {
        setSelectionMessage({
          type: 'error',
          text: data.error || 'Não foi possível reescrever o trecho selecionado.',
        });
      }
    } catch (err: any) {
      console.error('Erro na reescrita de seleção:', err);
      setSelectionMessage({
        type: 'error',
        text: 'Falha de conexão ao reescrever a seleção.',
      });
    } finally {
      setIsRefiningSelection(false);
    }
  };

  const handleReReview = async () => {
    setIsReReviewing(true);
    setReReviewError(null);
    try {
      const manifesto = getStoredManifesto();
      const currentText = editedText || post.review?.revisedText || post.draft?.rawText || '';
      const currentTitle = editedTitle || post.review?.revisedTitle || post.draft?.title || '';
      const currentSubtitle = editedSubtitle || post.review?.revisedSubtitle || post.draft?.subtitle || '';

      const res = await fetch('/api/review-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: post.topic,
          draftTitle: currentTitle,
          draftSubtitle: currentSubtitle,
          draftText: currentText,
          customReviewerPrompt:
            reReviewInstruction.trim() ||
            'SEJA EXTREMAMENTE CRÍTICO. Elimine todo e qualquer traço de linguagem de IA, frase feita de autoajuda ou conselho de 5 passos. Reescreva em ensaística profunda e autoral.',
          userManifesto: manifesto,
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        const updatedPost: ArticlePost = {
          ...post,
          review: data.data,
        };
        onPostUpdated(updatedPost);
        setEditedTitle(data.data.revisedTitle);
        setEditedSubtitle(data.data.revisedSubtitle);
        setEditedText(data.data.revisedText);
        setReReviewInstruction('');
      } else {
        setReReviewError(data.error || 'Erro ao reprocessar revisão do Revisor.');
      }
    } catch (err: any) {
      console.error('Erro na re-revisão:', err);
      setReReviewError('Falha de conexão ao reprocessar a revisão.');
    } finally {
      setIsReReviewing(false);
    }
  };

  const handleGenerateDerivedFormats = async () => {
    setIsGeneratingDerived(true);
    setDerivedError(null);
    try {
      const manifesto = getStoredManifesto();
      const title = editedTitle || post.review?.revisedTitle || post.draft?.title || post.topic;
      const text = editedText || post.review?.revisedText || post.draft?.rawText || '';

      const res = await fetch('/api/generate-derived-formats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          text,
          userManifesto: manifesto,
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        setDerivedFormats(data.data);
        const updatedPost: ArticlePost = {
          ...post,
          derivedFormats: data.data,
        };
        onPostUpdated(updatedPost);
      } else {
        setDerivedError(data.error || 'Falha ao converter para redes sociais.');
      }
    } catch (err: any) {
      console.error('Erro ao converter formato:', err);
      setDerivedError('Erro de conexão ao gerar carrossel e roteiro de reels.');
    } finally {
      setIsGeneratingDerived(false);
    }
  };

  const handleDownloadPDF = () => {
    const manifesto = getStoredManifesto();
    const authorName = manifesto.authorName || post.authorName || 'Psicólogo(a)';
    const professionalTitle = manifesto.professionalTitle || 'Psicologia & Autoconhecimento';
    const title = editedTitle || post.review?.revisedTitle || post.draft?.title || post.topic;
    const subtitle = editedSubtitle || post.review?.revisedSubtitle || post.draft?.subtitle || '';
    const text = editedText || post.review?.revisedText || post.draft?.rawText || '';
    const coverUrl = post.image?.imageUrl || '';
    const dateStr = new Date(post.createdAt).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });

    const paragraphsHtml = text
      .split('\n\n')
      .map((p) => {
        const trimmed = p.trim();
        if (!trimmed) return '';
        if (trimmed.startsWith('# '))
          return `<h1 style="font-size:24px; font-family: Georgia, serif; margin-top:24px; color:#1c1917; line-height:1.3;">${trimmed.replace('# ', '')}</h1>`;
        if (trimmed.startsWith('## '))
          return `<h2 style="font-size:20px; font-family: Georgia, serif; margin-top:20px; color:#1c1917; line-height:1.3; border-bottom:1px solid #e7e5e4; padding-bottom:6px;">${trimmed.replace('## ', '')}</h2>`;
        if (trimmed.startsWith('### '))
          return `<h3 style="font-size:17px; font-family: Georgia, serif; margin-top:16px; color:#292524; line-height:1.3;">${trimmed.replace('### ', '')}</h3>`;
        return `<p style="font-size:15px; line-height:1.75; font-family: Georgia, serif; color:#292524; margin-bottom:16px;">${trimmed
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.*?)\*/g, '<em>$1</em>')}</p>`;
      })
      .join('');

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="utf-8">
        <title>${title}</title>
        <style>
          @page { size: A4; margin: 20mm 15mm; }
          body {
            font-family: Georgia, serif;
            color: #1c1917;
            margin: 0;
            padding: 24px;
            background: #fff;
          }
          .header {
            border-bottom: 2px solid #0f766e;
            padding-bottom: 14px;
            margin-bottom: 24px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .author-name { font-size: 18px; font-weight: bold; color: #0f766e; }
          .author-info { font-size: 13px; color: #57534e; }
          .title { font-size: 28px; font-weight: bold; color: #0c0a09; margin-bottom: 8px; line-height: 1.25; }
          .subtitle { font-size: 16px; font-style: italic; color: #57534e; margin-bottom: 24px; line-height: 1.4; }
          .cover-container { text-align: center; margin-bottom: 28px; }
          .cover-img { width: 100%; max-height: 340px; object-fit: cover; border-radius: 12px; }
          .content { font-size: 15px; line-height: 1.75; color: #292524; }
          .footer {
            margin-top: 40px;
            border-top: 1px solid #e7e5e4;
            padding-top: 14px;
            font-size: 11px;
            color: #78716c;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="author-name">${authorName}</div>
            <div class="author-info">${professionalTitle}</div>
          </div>
          <div style="text-align:right; font-size:12px; color:#57534e;">
            PsicoContent Studio<br>${dateStr}
          </div>
        </div>

        <h1 class="title">${title}</h1>
        ${subtitle ? `<div class="subtitle">${subtitle}</div>` : ''}

        ${coverUrl ? `<div class="cover-container"><img src="${coverUrl}" class="cover-img" alt="Capa"></div>` : ''}

        <div class="content">
          ${paragraphsHtml}
        </div>

        <div class="footer">
          Conteúdo com caráter psicoeducativo e ensaístico. Produzido com auxílio do PsicoContent Studio.
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  const showCopied = (field: string) => {
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleCopyText = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    showCopied(fieldName);
  };

  const handleSaveEdits = () => {
    if (!post.review) return;
    const updated: ArticlePost = {
      ...post,
      review: {
        ...post.review,
        revisedTitle: editedTitle,
        revisedSubtitle: editedSubtitle,
        revisedText: editedText,
      },
    };
    onPostUpdated(updated);
    setIsEditingText(false);
  };

  const handleAddTag = () => {
    if (!newTagInput.trim()) return;
    const cleanTag = newTagInput.trim().replace(/^#/, '');
    if (!articleTags.includes(cleanTag)) {
      const updated = [...articleTags, cleanTag];
      setArticleTags(updated);
      onPostUpdated({ ...post, tags: updated });
    }
    setNewTagInput('');
    setShowTagInput(false);
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updated = articleTags.filter((t) => t !== tagToRemove);
    setArticleTags(updated);
    onPostUpdated({ ...post, tags: updated });
  };

  const handleRestoreDraftAsRevised = () => {
    if (!post.draft?.rawText) return;
    const restoredTitle = post.draft.title || editedTitle;
    const restoredSubtitle = post.draft.subtitle || editedSubtitle;
    const restoredText = post.draft.rawText;

    setEditedTitle(restoredTitle);
    setEditedSubtitle(restoredSubtitle);
    setEditedText(restoredText);

    if (post.review) {
      const updated: ArticlePost = {
        ...post,
        review: {
          ...post.review,
          revisedTitle: restoredTitle,
          revisedSubtitle: restoredSubtitle,
          revisedText: restoredText,
        },
      };
      onPostUpdated(updated);
    }
    setViewingVersion('revised');
  };

  const downloadArticle = () => {
    const title = editedTitle || post.review?.revisedTitle || post.draft?.title || 'artigo_psicologia';
    const text = editedText || post.review?.revisedText || post.draft?.rawText || '';
    const content = `# ${title}\n\n${editedSubtitle || post.review?.revisedSubtitle || ''}\n\nTom / Estilo: ${post.tone}\n\n---\n\n${text}\n\n---\n*Nota Ética: Este conteúdo tem caráter exclusivamente psicoeducativo e não substitui o acompanhamento psicológico individual.*`;

    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.md`;
    link.click();
  };

  const manifesto = getStoredManifesto();
  const displayedCoverUrl = post.image?.imageUrl || imageSrc || '';

  const displayedTitle =
    viewingVersion === 'draft'
      ? post.draft?.title || editedTitle
      : editedTitle || post.review?.revisedTitle || post.draft?.title;

  const displayedSubtitle =
    viewingVersion === 'draft'
      ? post.draft?.subtitle || editedSubtitle
      : editedSubtitle || post.review?.revisedSubtitle || post.draft?.subtitle;

  const displayedText =
    viewingVersion === 'draft'
      ? post.draft?.rawText || editedText
      : editedText || post.review?.revisedText || post.draft?.rawText;

  return (
    <div className="max-w-5xl mx-auto space-y-6 py-4 animate-fade-in">
      
      {/* Top Banner Action Bar */}
      {/* Banner do topo.
          O contêiner quebra linha e o bloco de texto tem largura mínima: quando
          título e ações não cabem lado a lado, os botões descem inteiros para a
          linha de baixo. Sem esse piso, o título era espremido até uma palavra
          por linha e os botões passavam por cima; com uma quebra por breakpoint
          fixo, sempre haveria uma faixa de largura em que o encaixe falha. */}
      <div className="bg-surface rounded-panel p-4 sm:p-6 border border-line shadow-sm flex flex-wrap items-center justify-between gap-x-6 gap-y-4">
        <div className="min-w-[15rem] flex-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-accent-ink uppercase tracking-wider">
            <Sparkles className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span className="shrink-0">Artigo concluído</span>
            {post.approachName && (
              <>
                <span className="text-ink-muted shrink-0" aria-hidden="true">
                  •
                </span>
                {/* post.tone é o parágrafo de instrução de voz do manifesto, não
                    um rótulo — ele fica no title, e aqui entra a abordagem. */}
                <span className="text-ink-faint truncate" title={post.tone}>
                  {post.approachName}
                </span>
              </>
            )}
          </div>
          <h2 className="font-serif font-bold text-lg sm:text-2xl text-ink mt-1 leading-tight text-balance">
            {displayedTitle}
          </h2>
        </div>

        {/* Copy / PDF / Multiformat Action Buttons */}
        {/* Usa o primitivo compartilhado: hover, foco e contraste vêm de um
            lugar só. As classes manuais daqui tinham ficado com hover:bg igual
            ao bg normal — visualmente inertes — e ícones em text-accent-ink
            sobre fundo de acento. */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Button
            variant="primary"
            size="sm"
            icon={Printer}
            onClick={handleDownloadPDF}
            title="Exportar documento PDF pronto para impressão ou envio a pacientes"
          >
            Baixar PDF
          </Button>

          <Button
            variant="secondary"
            size="sm"
            icon={Layers}
            onClick={() => setActiveTab('multiformat')}
          >
            Carrossel &amp; Reels
          </Button>

          {onClonePost && (
            <Button
              variant="secondary"
              size="sm"
              icon={Copy}
              onClick={() => onClonePost(post)}
              title="Criar uma cópia para modificações"
            >
              Clonar artigo
            </Button>
          )}

          <Button
            variant="secondary"
            size="sm"
            icon={Edit3}
            onClick={() => setIsEditingText(!isEditingText)}
          >
            {isEditingText ? 'Ocultar editor' : 'Editar no teclado'}
          </Button>

          <Button variant="secondary" size="sm" icon={Download} onClick={downloadArticle}>
            Baixar .MD
          </Button>
        </div>
      </div>

      {/* Main View Tabs */}
      <div className="flex border-b border-line space-x-2 sm:space-x-6 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('preview')}
          className={`pb-3 text-xs sm:text-sm font-semibold flex items-center space-x-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'preview'
              ? 'border-accent/40 text-accent-ink'
              : 'border-transparent text-ink-faint hover:text-ink'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Prévia do Blog</span>
        </button>

        <button
          onClick={() => setActiveTab('multiformat')}
          className={`pb-3 text-xs sm:text-sm font-semibold flex items-center space-x-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'multiformat'
              ? 'border-accent/40 text-accent-ink'
              : 'border-transparent text-ink-faint hover:text-ink'
          }`}
        >
          <Layers className="w-4 h-4 text-accent-ink" />
          <span>Carrossel & Reels</span>
        </button>

        <button
          onClick={() => setActiveTab('social')}
          className={`pb-3 text-xs sm:text-sm font-semibold flex items-center space-x-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'social'
              ? 'border-accent/40 text-accent-ink'
              : 'border-transparent text-ink-faint hover:text-ink'
          }`}
        >
          <Share2 className="w-4 h-4" />
          <span>Legendas & SEO</span>
        </button>

        <button
          onClick={() => setActiveTab('markdown')}
          className={`pb-3 text-xs sm:text-sm font-semibold flex items-center space-x-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'markdown'
              ? 'border-accent/40 text-accent-ink'
              : 'border-transparent text-ink-faint hover:text-ink'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Código Markdown & Editor</span>
        </button>

        <button
          onClick={() => setActiveTab('review')}
          className={`pb-3 text-xs sm:text-sm font-semibold flex items-center space-x-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'review'
              ? 'border-accent/40 text-accent-ink'
              : 'border-transparent text-ink-faint hover:text-ink'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Parecer do Revisor Clínico</span>
        </button>

        <button
          onClick={() => setActiveTab('reactexport')}
          className={`pb-3 text-xs sm:text-sm font-semibold flex items-center space-x-2 border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'reactexport'
              ? 'border-accent/40 text-accent-ink font-bold'
              : 'border-transparent text-ink-faint hover:text-ink'
          }`}
        >
          <Code className="w-4 h-4 text-accent-ink" />
          <span>Exportar para Blog React</span>
          <span className="bg-accent-soft text-accent-ink text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase">JSX/JSON</span>
        </button>
      </div>

      {/* TAB 1: BLOG PREVIEW */}
      {activeTab === 'preview' && (
        <div className="bg-surface rounded-panel p-4 sm:p-10 border border-line shadow-sm space-y-8">
          
          {/* Version Switcher Bar (Versão Revisada vs Rascunho Original) */}
          <div className="bg-surface-sunken border border-line p-2 sm:p-3 rounded-panel flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-ink-muted uppercase tracking-wider text-[11px]">Versão em Exibição:</span>
              <div className="flex bg-surface p-1 rounded-control border border-line shadow-2xs">
                <button
                  onClick={() => setViewingVersion('revised')}
                  className={`px-3 py-1 rounded-control font-semibold transition-all cursor-pointer ${
                    viewingVersion === 'revised'
                      ? 'bg-accent text-canvas shadow-xs'
                      : 'text-ink-muted'
                  }`}
                >
                  ✨ Versão Revisada (Final)
                </button>
                <button
                  onClick={() => setViewingVersion('draft')}
                  className={`px-3 py-1 rounded-control font-semibold transition-all cursor-pointer ${
                    viewingVersion === 'draft'
                      ? 'bg-accent text-canvas shadow-xs'
                      : 'text-ink-muted hover:text-ink'
                  }`}
                >
                  📝 Rascunho Original (Redator)
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
              <button
                onClick={() => setIsEditingText(!isEditingText)}
                className="px-3 py-1.5 bg-surface border border-line hover:bg-surface-raised font-semibold text-ink rounded-control flex items-center space-x-1 transition-all cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-accent-ink" />
                <span>{isEditingText ? 'Concluir Edição' : 'Editar Texto no Teclado'}</span>
              </button>
            </div>
          </div>

          {/* Draft Notice Banner if viewing original draft */}
          {viewingVersion === 'draft' && (
            <div className="bg-accent-soft border border-accent/40 rounded-panel p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-accent-ink">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-accent-ink shrink-0" />
                <span>Você está visualizando o rascunho original produzido pelo Redator Virtual antes da revisão clínica.</span>
              </div>
              <button
                onClick={handleRestoreDraftAsRevised}
                className="px-3.5 py-1.5 bg-accent text-canvas font-bold rounded-control flex items-center space-x-1 transition-all shadow-xs shrink-0 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restaurar Rascunho como Texto Ativo</span>
              </button>
            </div>
          )}

          {/* Direct Keyboard Editor Panel (WYSIWYG / Textarea) */}
          {isEditingText && (
            <div className="bg-accent-soft/60 border border-accent/40 rounded-panel p-4 sm:p-6 space-y-4 animate-fade-in">
              <div className="flex items-center justify-between border-b border-accent/40 pb-3">
                <div className="flex items-center space-x-2 font-bold text-accent-ink text-sm">
                  <Edit3 className="w-4 h-4 text-accent-ink" />
                  <span>Modo de Edição Direta no Teclado</span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleSaveEdits}
                    className="px-4 py-1.5 bg-accent text-canvas font-bold text-xs rounded-control flex items-center space-x-1 transition-all cursor-pointer shadow-xs"
                  >
                    <Save className="w-3.5 h-3.5 text-accent-ink" />
                    <span>Salvar Alterações</span>
                  </button>
                  <button
                    onClick={() => setIsEditingText(false)}
                    className="px-3 py-1.5 bg-surface-raised hover:bg-surface text-ink font-semibold text-xs rounded-control cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-ink mb-1">Título do Artigo</label>
                  <input
                    type="text"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    className="w-full px-3.5 py-2 bg-surface border border-line rounded-control text-sm font-serif font-bold text-ink focus:ring-2 focus:ring-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink mb-1">Subtítulo / Linha fina</label>
                  <input
                    type="text"
                    value={editedSubtitle}
                    onChange={(e) => setEditedSubtitle(e.target.value)}
                    className="w-full px-3.5 py-2 bg-surface border border-line rounded-control text-xs font-serif italic text-ink focus:ring-2 focus:ring-accent"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-ink">Corpo do Ensaio (Markdown)</label>
                    <span className="text-[11px] text-ink-faint font-mono">
                      {editedText.split(/\s+/).filter(Boolean).length} palavras • {editedText.length} caracteres
                    </span>
                  </div>
                  <textarea
                    rows={14}
                    value={editedText}
                    onChange={(e) => setEditedText(e.target.value)}
                    className="w-full p-4 bg-surface border border-line rounded-control text-xs sm:text-sm text-ink font-sans leading-relaxed focus:ring-2 focus:ring-accent"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Article Header Details */}
          <div className="space-y-4 max-w-3xl mx-auto text-center">
            <div className="inline-flex flex-wrap items-center justify-center gap-2 bg-surface-raised px-3.5 py-1.5 rounded-full text-xs font-semibold text-ink-muted">
              <span title={post.tone}>{post.approachName || 'Visão do autor'}</span>
              <span aria-hidden="true">•</span>
              <span className="flex items-center space-x-1">
                <Clock className="w-3 h-3 text-ink-faint" />
                <span>{post.review?.readingTimeMinutes || 4} min de leitura</span>
              </span>
            </div>

            <h1 className="font-serif font-bold text-2xl sm:text-4xl text-ink leading-tight">
              {displayedTitle}
            </h1>

            {displayedSubtitle && (
              <p className="text-ink-muted font-serif italic text-base sm:text-lg">
                {displayedSubtitle}
              </p>
            )}

            {/* Editable Tags Pill Bar */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2">
              {articleTags.map((tag, idx) => (
                <span
                  key={idx}
                  className="bg-surface-raised text-ink text-xs font-semibold px-2.5 py-1 rounded-control flex items-center space-x-1 border border-line"
                >
                  <Tag className="w-3 h-3 text-accent-ink" />
                  <span>#{tag}</span>
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 text-ink-faint hover:text-danger-ink transition-colors"
                    title="Remover tag"
                  >
                    ×
                  </button>
                </span>
              ))}

              {showTagInput ? (
                <div className="flex items-center space-x-1">
                  <input
                    type="text"
                    placeholder="Nova tag..."
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    className="w-24 px-2 py-0.5 bg-surface border border-line rounded-control text-xs text-ink focus:ring-2 focus:ring-accent"
                    autoFocus
                  />
                  <button
                    onClick={handleAddTag}
                    className="px-2 py-0.5 bg-accent text-canvas font-bold text-xs rounded-control cursor-pointer"
                  >
                    OK
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowTagInput(true)}
                  className="bg-accent-soft text-accent-ink text-xs font-semibold px-2.5 py-1 rounded-control border border-accent/40 flex items-center space-x-1 transition-all cursor-pointer"
                >
                  <Plus className="w-3 h-3 text-accent-ink" />
                  <span>Tag</span>
                </button>
              )}
            </div>

          </div>

          {/* Cover Image Box */}
          {post.image?.imageUrl && (
            <div className="space-y-2">
              <div className="relative rounded-panel overflow-hidden shadow-md group border border-line bg-surface-raised min-h-[260px] flex items-center justify-center">
                <img
                  key={imageSrc}
                  src={imageSrc}
                  alt={post.image.altText || 'Capa do artigo'}
                  onError={() => {
                    const fallbackSeed = Math.floor(Math.random() * 8000) + 1000;
                    setImageSrc(`https://picsum.photos/seed/${fallbackSeed}/1200/675`);
                  }}
                  className={`w-full h-auto max-h-[480px] object-cover transition-opacity duration-300 ${
                    isRegeneratingImage ? 'opacity-40 blur-xs' : 'opacity-100'
                  }`}
                  referrerPolicy="no-referrer"
                />

                {isRegeneratingImage && (
                  <div className="absolute inset-0 bg-surface/50 backdrop-blur-xs flex flex-col items-center justify-center text-ink space-y-2">
                    <Loader2 className="w-8 h-8 animate-spin text-accent-ink" />
                    <span className="text-xs font-semibold uppercase tracking-wider">Criando Nova Ilustração Editorial...</span>
                  </div>
                )}

                {!isRegeneratingImage && post.image.conceptExplanation && (
                  <div className="absolute inset-0 bg-surface/40 opacity-0 group-hover:opacity-100 transition-all flex items-end p-4">
                    <span className="text-ink text-xs bg-surface/80 backdrop-blur-md px-3 py-1.5 rounded-control font-sans">
                      💡 Metáfora Visual: {post.image.conceptExplanation}
                    </span>
                  </div>
                )}
              </div>

              {/* Regenerate image controls */}
              <div className="bg-surface-sunken border border-line rounded-panel p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="flex items-center space-x-2">
                  <ImageIcon className="w-4 h-4 text-accent-ink shrink-0" />
                  <span className="text-ink-muted font-medium">Trocar estilo da capa:</span>
                  <select
                    value={selectedStyleForRegen}
                    onChange={(e) => setSelectedStyleForRegen(e.target.value)}
                    className="bg-surface border border-line rounded-control px-2.5 py-1 text-xs text-ink focus:ring-2 focus:ring-accent"
                  >
                    {VISUAL_STYLES.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onRegenerateImage(selectedStyleForRegen)}
                    disabled={isRegeneratingImage}
                    className="px-3.5 py-1.5 bg-accent text-canvas font-semibold rounded-control flex items-center space-x-1.5 transition-all shadow-xs disabled:opacity-50 cursor-pointer min-h-[36px]"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRegeneratingImage ? 'animate-spin' : ''}`} />
                    <span>{isRegeneratingImage ? 'Gerando Imagem...' : 'Regerar Imagem'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Fixed Floating Bottom Interactive Selection Correction Dock */}
          {(selectedSnippet || selectionMessage) && (
            <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-2xl bg-surface-raised text-ink rounded-panel p-4 sm:p-5 shadow-2xl border border-accent/50 space-y-3.5 animate-fade-in backdrop-blur-md">
              <div className="flex items-center justify-between border-b border-line pb-2.5">
                <div className="flex items-center space-x-2 text-accent-ink font-bold text-xs sm:text-sm uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-accent-ink animate-pulse" />
                  <span>Corretor Inteligente de Trecho Selecionado</span>
                </div>
                <button
                  type="button"
                  onClick={handleCloseSelectionBox}
                  className="text-ink-faint hover:text-ink p-1 rounded-control bg-surface-raised hover:bg-surface transition-all cursor-pointer"
                  title="Fechar Corretor"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {selectionMessage && (
                <div
                  className={`p-3 rounded-control text-xs font-medium flex items-center space-x-2 ${
                    selectionMessage.type === 'success'
                      ? 'bg-accent/90 border border-accent/50 text-accent-ink'
                      : 'bg-danger/90 border border-danger/50 text-danger-ink'
                  }`}
                >
                  <Check className="w-4 h-4 text-accent-ink shrink-0" />
                  <span>{selectionMessage.text}</span>
                </div>
              )}

              {selectedSnippet && (
                <div className="space-y-3.5">
                  <div className="bg-surface-raised/90 p-3 rounded-panel border border-line/80">
                    <span className="text-[10px] font-bold text-accent-ink uppercase tracking-widest block mb-1">
                      Trecho Selecionado para Ajuste:
                    </span>
                    <p className="text-xs text-ink italic font-serif leading-relaxed line-clamp-2">
                      "{selectedSnippet}"
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-accent-ink uppercase tracking-wider block">
                      💡 Sugestões Rápidas da IA:
                    </span>
                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                      {SMART_SUGGESTIONS.map((chip, idx) => (
                        <button
                          key={idx}
                          type="button"
                          disabled={isRefiningSelection}
                          onClick={() => executeRefineSelection(chip)}
                          className="text-xs bg-surface-raised hover:bg-accent text-canvas hover:text-ink px-3 py-1.5 rounded-control border border-line hover:border-accent/40 transition-all font-medium cursor-pointer disabled:opacity-50 flex items-center space-x-1 shrink-0"
                        >
                          <Compass className="w-3 h-3 text-accent-ink shrink-0" />
                          <span>{chip}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-1 border-t border-line">
                    <span className="text-[11px] font-bold text-ink-muted uppercase tracking-wider block">
                      Ou digite exatamente a correção desejada:
                    </span>
                    <div className="flex flex-col sm:flex-row items-stretch gap-2">
                      <input
                        type="text"
                        placeholder="Ex: Deixar mais reflexivo e trocar pela visão da Gestalt..."
                        value={customRefineInstruction}
                        onChange={(e) => setCustomRefineInstruction(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            executeRefineSelection();
                          }
                        }}
                        className="flex-1 bg-surface-raised border border-line rounded-control px-3.5 py-2 text-xs text-ink placeholder:text-ink-faint focus:ring-2 focus:ring-accent"
                      />
                      <button
                        type="button"
                        onClick={() => executeRefineSelection()}
                        disabled={isRefiningSelection || !customRefineInstruction.trim()}
                        className="px-4 py-2 bg-accent text-canvas font-bold text-xs rounded-control transition-all shadow-md flex items-center justify-center space-x-1.5 disabled:opacity-50 cursor-pointer shrink-0"
                      >
                        {isRefiningSelection ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Reescrevendo...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5 text-ink" />
                            <span>Reescrever Trecho</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Clean Reader Mode Control Toolbar */}
          <div className="max-w-3xl mx-auto bg-surface-sunken border border-line rounded-panel p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3 text-xs select-none shadow-2xs">
            <div className="flex items-center space-x-2">
              <BookOpen className="w-4 h-4 text-accent-ink shrink-0" />
              <span className="font-bold text-ink">Modo de Leitura:</span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Font Size Selector */}
              <div className="flex items-center space-x-1 bg-surface p-1 rounded-control border border-line">
                <span className="text-[10px] text-ink-faint font-bold px-1.5">TAMANHO:</span>
                <button
                  onClick={() => setReaderFontSize('sm')}
                  className={`px-2 py-0.5 rounded-control font-bold text-xs transition-all cursor-pointer ${
                    readerFontSize === 'sm' ? 'bg-accent text-canvas shadow-xs' : 'text-ink-muted hover:text-ink'
                  }`}
                  title="Fonte Pequena"
                >
                  A-
                </button>
                <button
                  onClick={() => setReaderFontSize('base')}
                  className={`px-2 py-0.5 rounded-control font-bold text-xs transition-all cursor-pointer ${
                    readerFontSize === 'base' ? 'bg-accent text-canvas shadow-xs' : 'text-ink-muted hover:text-ink'
                  }`}
                  title="Fonte Média (Padrão)"
                >
                  A
                </button>
                <button
                  onClick={() => setReaderFontSize('lg')}
                  className={`px-2 py-0.5 rounded-control font-bold text-xs transition-all cursor-pointer ${
                    readerFontSize === 'lg' ? 'bg-accent text-canvas shadow-xs' : 'text-ink-muted hover:text-ink'
                  }`}
                  title="Fonte Grande"
                >
                  A+
                </button>
              </div>

              {/* Theme Selector.
                  Preferência de leitura, independente do tema da interface: ler
                  ensaio longo é diferente de operar o estúdio. Os três precisam
                  ser de fato distintos — o mapeamento automático de cores havia
                  colapsado "claro" e "escuro" em quase a mesma coisa, e o
                  estado ativo de "claro" usava bg-surface dentro de um
                  contêiner bg-surface, ficando invisível. */}
              <div
                role="radiogroup"
                aria-label="Tema de leitura"
                className="flex items-center gap-1 bg-surface-sunken p-1 rounded-control border border-line"
              >
                <span className="text-[10px] text-ink-faint font-semibold px-1.5 uppercase tracking-wider">
                  Tema
                </span>
                {READER_THEMES.map(({ id, label }) => {
                  const active = readerTheme === id;
                  return (
                    <button
                      key={id}
                      role="radio"
                      aria-checked={active}
                      onClick={() => setReaderTheme(id)}
                      className={`px-2.5 py-1 rounded-md font-medium text-xs transition-colors cursor-pointer ${
                        active
                          ? 'bg-accent-soft text-accent-ink'
                          : 'text-ink-muted hover:text-ink hover:bg-surface-raised'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Formatted Article Content */}
          <div
            className={`max-w-3xl mx-auto rounded-panel p-6 sm:p-10 transition-colors border ${READER_SURFACES[readerTheme]} select-text cursor-text space-y-5`}
            title="Selecione qualquer trecho com o mouse para abrir o corretor de texto inteligente por IA"
          >
            <div className="flex items-center justify-between text-xs border-b border-current/15 pb-2 mb-4 select-none opacity-60">
              <span className="flex items-center space-x-1 italic">
                <Edit3 className="w-3.5 h-3.5 shrink-0" />
                <span>Dica: Selecione qualquer frase para reescrever com IA ou use 'Editar no Teclado'.</span>
              </span>
            </div>

            {(displayedText || '')
              .split('\n\n')
              .map((paragraph, idx) => {
                const isHeader2 = paragraph.startsWith('## ');
                const isHeader3 = paragraph.startsWith('### ');
                const isList = paragraph.startsWith('- ') || paragraph.startsWith('* ');
                const isPullQuote = paragraph.startsWith('> ') || paragraph.startsWith('"') && paragraph.endsWith('"');

                if (isHeader2) {
                  return (
                    <h2 key={idx} className={`font-serif font-bold ${
                      readerFontSize === 'sm' ? 'text-lg' : readerFontSize === 'lg' ? 'text-2xl' : 'text-xl sm:text-2xl'
                    } mt-8 mb-4 border-b pb-2 border-current/15`}>
                      {paragraph.replace('## ', '')}
                    </h2>
                  );
                }

                if (isHeader3) {
                  return (
                    <h3 key={idx} className={`font-serif font-bold ${
                      readerFontSize === 'sm' ? 'text-base' : readerFontSize === 'lg' ? 'text-xl' : 'text-lg sm:text-xl'
                    } mt-6 mb-3`}>
                      {paragraph.replace('### ', '')}
                    </h3>
                  );
                }

                if (isList) {
                  const items = paragraph.split('\n');
                  return (
                    <ul key={idx} className="list-disc pl-6 space-y-2 opacity-85">
                      {items.map((item, i) => (
                        <li key={i}>{item.replace(/^[-*]\s+/, '')}</li>
                      ))}
                    </ul>
                  );
                }

                if (isPullQuote) {
                  const cleanQuote = paragraph.replace(/^>\s*/, '').replace(/^"/, '').replace(/"$/, '');
                  return (
                    <blockquote
                      key={idx}
                      className={`my-6 p-5 sm:p-6 rounded-panel border-l-4 font-serif italic relative ${READER_QUOTES[readerTheme]}`}
                    >
                      <span className="text-3xl sm:text-4xl font-serif opacity-30 absolute top-1 left-3 select-none leading-none">
                        “
                      </span>
                      <p className={`relative z-10 pl-4 ${
                        readerFontSize === 'sm' ? 'text-sm' : readerFontSize === 'lg' ? 'text-lg' : 'text-base sm:text-lg'
                      } font-medium leading-relaxed`}>
                        {cleanQuote}
                      </p>
                    </blockquote>
                  );
                }

                return (
                  <p key={idx} className={`leading-relaxed font-sans ${
                    readerFontSize === 'sm'
                      ? 'text-xs sm:text-sm'
                      : readerFontSize === 'lg'
                      ? 'text-base sm:text-lg'
                      : 'text-sm sm:text-base'
                  }`}>
                    {paragraph}
                  </p>
                );
              })}

          </div>

          {/* Ethics Lembrete Footer */}
          <div className="max-w-3xl mx-auto bg-accent-soft border border-accent/40 rounded-panel p-4 sm:p-6 text-xs sm:text-sm text-accent-ink space-y-2">
            <div className="flex items-center space-x-2 font-bold text-accent-ink">
              <Heart className="w-4 h-4 text-accent-ink shrink-0" />
              <span>Nota de Acolhimento & Ética Profissional</span>
            </div>
            <p className="text-accent-ink leading-relaxed">
              Este conteúdo foi produzido com intuito estritamente psicoeducativo. Se você se identifica com os desafios ou emoções descritos neste texto, lembre-se de que a psicoterapia com um profissional registrado é o espaço ideal para escuta e cuidado individualizado.
            </p>
          </div>

        </div>
      )}

      {/* TAB 2: MULTIFORMAT CAROUSEL & REELS GENERATOR */}
      {activeTab === 'multiformat' && (
        <div className="space-y-6">
          <div className="bg-surface rounded-panel p-4 sm:p-8 border border-line shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-line pb-4">
              <div>
                <div className="flex items-center space-x-2 text-accent-ink font-bold text-lg">
                  <Layers className="w-5 h-5 text-accent-ink shrink-0" />
                  <h2>Gerador de Carrossel (5-8 Slides) & Roteiro de Vídeo/Reels</h2>
                </div>
                <p className="text-xs text-ink-muted mt-1">
                  Transforme o ensaio de psicologia em slides dinâmicos para Instagram/LinkedIn e em roteiro de 60s para vídeo.
                </p>
              </div>

              <button
                onClick={handleGenerateDerivedFormats}
                disabled={isGeneratingDerived}
                className="w-full sm:w-auto px-4 py-2.5 bg-accent text-canvas font-bold text-xs sm:text-sm rounded-control shadow-md flex items-center justify-center space-x-2 transition-all cursor-pointer min-h-[40px] disabled:opacity-50"
              >
                {isGeneratingDerived ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-accent-ink" />
                    <span>Adaptando para Redes Sociais...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-accent-ink" />
                    <span>{derivedFormats ? 'Regerar Formatos' : 'Gerar Carrossel & Reels com IA'}</span>
                  </>
                )}
              </button>
            </div>

            {derivedError && (
              <div className="p-4 bg-danger-soft border border-danger/40 rounded-panel text-xs text-danger-ink flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-danger-ink shrink-0" />
                <span>{derivedError}</span>
              </div>
            )}

            {!derivedFormats && !isGeneratingDerived && (
              <div className="bg-surface-sunken rounded-panel p-8 sm:p-12 text-center border border-dashed border-line space-y-4">
                <div className="w-12 h-12 rounded-full bg-accent-soft flex items-center justify-center mx-auto text-accent-ink">
                  <Layers className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-ink text-base">Nenhum carrossel gerado para este artigo</h3>
                  <p className="text-xs text-ink-faint max-w-sm mx-auto">
                    Clique no botão acima para converter a essência reflexiva deste artigo em um deck de 5 a 8 slides e um roteiro gravável de 60 segundos.
                  </p>
                </div>
              </div>
            )}

            {derivedFormats && (
              <div className="space-y-6">
                {/* Subtabs: Carousel vs Reels */}
                <div className="flex border-b border-line space-x-4">
                  <button
                    onClick={() => setDerivedActiveTab('carousel')}
                    className={`pb-3 text-xs sm:text-sm font-bold flex items-center space-x-2 border-b-2 transition-all cursor-pointer ${
                      derivedActiveTab === 'carousel'
                        ? 'border-accent/40 text-accent-ink'
                        : 'border-transparent text-ink-faint hover:text-ink'
                    }`}
                  >
                    <Layers className="w-4 h-4" />
                    <span>Carrossel de Slides ({derivedFormats.carousel?.slides.length || 0} Slides)</span>
                  </button>

                  <button
                    onClick={() => setDerivedActiveTab('reels')}
                    className={`pb-3 text-xs sm:text-sm font-bold flex items-center space-x-2 border-b-2 transition-all cursor-pointer ${
                      derivedActiveTab === 'reels'
                        ? 'border-accent/40 text-accent-ink'
                        : 'border-transparent text-ink-faint hover:text-ink'
                    }`}
                  >
                    <Film className="w-4 h-4 text-danger-ink" />
                    <span>Roteiro para Vídeo Curto / Reels (60s)</span>
                  </button>
                </div>

                {/* Subtab 1: CAROUSEL SLIDES */}
                {derivedActiveTab === 'carousel' && derivedFormats.carousel && (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-surface-sunken p-4 rounded-panel border border-line">
                      <span className="text-xs text-ink-muted font-medium">
                        📱 Copie o conteúdo slide por slide ou copie o carrossel completo de uma vez:
                      </span>
                      <button
                        onClick={() => {
                          const fullText = derivedFormats.carousel!.slides
                            .map((s) => `[SLIDE ${s.slideNumber}: ${s.slideTitle}]\n${s.bodyText}\n(Visual: ${s.visualCue || ''})\n`)
                            .join('\n---\n\n');
                          handleCopyText(fullText, 'full_carousel');
                        }}
                        className="px-3.5 py-1.5 bg-accent text-canvas font-bold text-xs rounded-control flex items-center space-x-1.5 transition-all cursor-pointer shadow-xs min-h-[36px]"
                      >
                        {copiedField === 'full_carousel' ? <Check className="w-3.5 h-3.5 text-accent-ink" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedField === 'full_carousel' ? 'Copiado!' : 'Copiar Carrossel Inteiro'}</span>
                      </button>
                    </div>

                    {/* Slides Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {derivedFormats.carousel.slides.map((slide) => (
                        <div
                          key={slide.slideNumber}
                          className="bg-surface text-ink rounded-panel p-5 border border-line flex flex-col justify-between space-y-4 shadow-md relative overflow-hidden"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs border-b border-line pb-2">
                              <span className="font-bold text-accent-ink uppercase tracking-widest text-[10px]">
                                SLIDE {slide.slideNumber} / {derivedFormats.carousel?.slides.length}
                              </span>
                              <button
                                onClick={() =>
                                  handleCopyText(
                                    `${slide.slideTitle}\n\n${slide.bodyText}`,
                                    `slide_${slide.slideNumber}`
                                  )
                                }
                                className="text-[11px] text-ink-faint hover:text-ink flex items-center space-x-1 bg-surface-raised hover:bg-surface px-2.5 py-1 rounded-control transition-all cursor-pointer"
                              >
                                {copiedField === `slide_${slide.slideNumber}` ? (
                                  <Check className="w-3 h-3 text-accent-ink" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                                <span>{copiedField === `slide_${slide.slideNumber}` ? 'Copiado!' : 'Copiar'}</span>
                              </button>
                            </div>

                            <h4 className="font-serif font-bold text-base text-ink leading-snug">
                              {slide.slideTitle}
                            </h4>

                            <p className="text-xs text-ink-muted leading-relaxed font-sans">
                              {slide.bodyText}
                            </p>
                          </div>

                          {slide.visualCue && (
                            <div className="pt-2 border-t border-line/80 text-[11px] text-ink-faint italic">
                              🎨 Clima visual: {slide.visualCue}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Caption Box */}
                    {derivedFormats.carousel.caption && (
                      <div className="bg-surface-sunken border border-line rounded-panel p-5 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-ink">
                            Legenda Sugerida para a Postagem do Carrossel:
                          </span>
                          <button
                            onClick={() => handleCopyText(derivedFormats.carousel!.caption, 'carousel_caption')}
                            className="px-3 py-1 bg-surface border border-line text-ink text-xs font-semibold rounded-control flex items-center space-x-1 cursor-pointer"
                          >
                            {copiedField === 'carousel_caption' ? <Check className="w-3.5 h-3.5 text-accent-ink" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>Copiar Legenda</span>
                          </button>
                        </div>
                        <p className="text-xs text-ink-muted font-sans leading-relaxed whitespace-pre-wrap">
                          {derivedFormats.carousel.caption}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Subtab 2: REELS VIDEO SCRIPT */}
                {derivedActiveTab === 'reels' && derivedFormats.reelsScript && (
                  <div className="space-y-6">
                    <div className="bg-surface-raised text-ink rounded-panel p-6 border border-line space-y-6 shadow-lg">
                      <div className="flex items-center justify-between border-b border-line pb-3">
                        <div className="flex items-center space-x-2 text-accent-ink font-bold text-sm">
                          <Film className="w-4 h-4 text-accent-ink" />
                          <span>Roteiro de Gravidade para Vídeo Curto (~60 Segundos)</span>
                        </div>
                        <button
                          onClick={() => {
                            const scriptText = `[GANCHO INICIAL (0-3s)]\n"${derivedFormats.reelsScript!.hook}"\n\n[FALA PRINCIPAL]\n${derivedFormats.reelsScript!.coreNarrative}\n\n[ORIENTAÇÕES VISUAIS]\n${derivedFormats.reelsScript!.visualInstructions || ''}\n\n[CHAMADA REFLEXIVA]\n"${derivedFormats.reelsScript!.callToReflection}"`;
                            handleCopyText(scriptText, 'reels_full_script');
                          }}
                          className="px-3.5 py-1.5 bg-accent text-canvas font-bold text-xs rounded-control flex items-center space-x-1.5 transition-all cursor-pointer shadow-sm"
                        >
                          {copiedField === 'reels_full_script' ? <Check className="w-3.5 h-3.5 text-ink" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedField === 'reels_full_script' ? 'Roteiro Copiado!' : 'Copiar Roteiro de Vídeo'}</span>
                        </button>
                      </div>

                      {/* Hook */}
                      <div className="bg-accent/50 border border-accent/40 p-4 rounded-panel space-y-1">
                        <span className="text-[10px] font-bold text-accent-ink uppercase tracking-widest block">
                          🎯 Gancho Inicial (0 a 3 Segundos):
                        </span>
                        <p className="text-sm font-serif font-bold text-ink leading-snug">
                          "{derivedFormats.reelsScript.hook}"
                        </p>
                      </div>

                      {/* Core Narrative */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold text-ink-faint uppercase tracking-widest block">
                          🎙️ Fala Principal do Psicólogo (Prosa Ensaística Contínua):
                        </span>
                        <p className="p-4 bg-surface-raised/80 rounded-panel text-xs sm:text-sm text-ink leading-relaxed font-sans whitespace-pre-wrap border border-line">
                          {derivedFormats.reelsScript.coreNarrative}
                        </p>
                      </div>

                      {/* Visual & Posture Instructions */}
                      {derivedFormats.reelsScript.visualInstructions && (
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-ink-faint uppercase tracking-widest block">
                            🎥 Dicas de Enquadramento, Postura & Iluminação:
                          </span>
                          <p className="text-xs text-ink-muted italic font-sans">
                            {derivedFormats.reelsScript.visualInstructions}
                          </p>
                        </div>
                      )}

                      {/* Call to Reflection */}
                      <div className="bg-surface-raised/60 p-4 rounded-panel border border-line space-y-1">
                        <span className="text-[10px] font-bold text-accent-ink uppercase tracking-widest block">
                          💬 Chamada Reflexiva para Comentários:
                        </span>
                        <p className="text-xs text-ink font-serif italic">
                          "{derivedFormats.reelsScript.callToReflection}"
                        </p>
                      </div>

                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: SOCIAL MEDIA & SEO */}
      {activeTab === 'social' && post.review && (
        <div className="space-y-6">
          <div className="bg-surface rounded-panel p-6 border border-line shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-ink font-bold text-base">
                <MessageSquare className="w-5 h-5 text-accent-ink" />
                <h3>Legenda Pronta para Redes Sociais (Instagram / LinkedIn)</h3>
              </div>

              <button
                onClick={() => handleCopyText(post.review?.socialCaption || '', 'social_caption')}
                className="px-3 py-1.5 bg-accent-soft text-accent-ink text-xs font-semibold rounded-control flex items-center space-x-1 cursor-pointer"
              >
                {copiedField === 'social_caption' ? <Check className="w-3.5 h-3.5 text-accent-ink" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedField === 'social_caption' ? 'Copiado!' : 'Copiar Legenda'}</span>
              </button>
            </div>

            <p className="p-4 bg-surface-sunken border border-line rounded-control text-xs sm:text-sm text-ink whitespace-pre-wrap font-sans leading-relaxed">
              {post.review.socialCaption}
            </p>

            {/* Hashtags */}
            {post.review.hashtags?.length > 0 && (
              <div className="pt-2 flex flex-wrap gap-1.5">
                {post.review.hashtags.map((tag, idx) => (
                  <span key={idx} className="bg-surface-raised text-ink-muted text-xs px-2.5 py-1 rounded-md font-mono">
                    #{tag.replace(/^#/, '')}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Meta Description / SEO */}
          <div className="bg-surface rounded-panel p-6 border border-line shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-ink font-bold text-base">
                <Share2 className="w-5 h-5 text-accent-ink" />
                <h3>Meta Descrição para SEO / Google Blog</h3>
              </div>

              <button
                onClick={() => handleCopyText(post.review?.metaDescription || '', 'meta_desc')}
                className="px-3 py-1.5 bg-surface-raised text-ink text-xs font-semibold rounded-control flex items-center space-x-1 cursor-pointer"
              >
                {copiedField === 'meta_desc' ? <Check className="w-3.5 h-3.5 text-accent-ink" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedField === 'meta_desc' ? 'Copiado!' : 'Copiar Meta'}</span>
              </button>
            </div>

            <p className="p-3 bg-surface-sunken border border-line rounded-control text-xs text-ink-muted font-sans">
              {post.review.metaDescription}
            </p>
          </div>
        </div>
      )}

      {/* TAB 4: MARKDOWN CODE & DIRECT EDITOR */}
      {activeTab === 'markdown' && (
        <div className="bg-surface rounded-panel p-6 border border-line shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-ink font-bold text-base">
              <FileText className="w-5 h-5 text-accent-ink" />
              <h3>Código Markdown Completo do Artigo</h3>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsEditingText(!isEditingText)}
                className="px-3 py-1.5 bg-accent-soft text-accent-ink border border-accent/40 text-xs font-semibold rounded-control flex items-center space-x-1 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-accent-ink" />
                <span>{isEditingText ? 'Visualizar Texto' : 'Modo Edição Directa'}</span>
              </button>

              <button
                onClick={() => handleCopyText(editedText || post.review?.revisedText || post.draft?.rawText || '', 'raw_markdown')}
                className="px-3 py-1.5 bg-surface-raised text-ink text-xs font-semibold rounded-control flex items-center space-x-1 cursor-pointer"
              >
                {copiedField === 'raw_markdown' ? <Check className="w-3.5 h-3.5 text-accent-ink" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedField === 'raw_markdown' ? 'Copiado!' : 'Copiar Markdown'}</span>
              </button>
            </div>
          </div>

          {isEditingText ? (
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-ink-muted">Edição direta de texto via teclado</span>
                <button
                  onClick={handleSaveEdits}
                  className="px-4 py-1.5 bg-accent text-canvas font-bold text-xs rounded-control flex items-center space-x-1 shadow-xs cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5 text-accent-ink" />
                  <span>Salvar Alterações</span>
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-ink-muted mb-1">Título do Artigo</label>
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="w-full p-2.5 border border-line rounded-control text-sm font-bold text-ink focus:ring-2 focus:ring-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-ink-muted mb-1">Corpo do Texto (Markdown)</label>
                <textarea
                  rows={16}
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  className="w-full p-4 border border-line rounded-control font-mono text-xs text-ink focus:ring-2 focus:ring-accent"
                />
              </div>
            </div>
          ) : (
            <pre className="p-4 bg-surface text-ink rounded-control font-mono text-xs overflow-x-auto whitespace-pre-wrap max-h-[500px]">
              {displayedText}
            </pre>
          )}
        </div>
      )}

      {/* TAB 5: CLINICAL & MULTIDISCIPLINARY REVIEW NOTES */}
      {activeTab === 'review' && post.review && (
        <div className="space-y-6">
          <div className="bg-surface rounded-panel p-6 border border-line shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-line pb-4">
              <div className="flex items-center space-x-2 text-ink font-bold text-base">
                <ShieldCheck className="w-5 h-5 text-accent-ink" />
                <h3>Pareceres do comitê e auditoria final</h3>
              </div>
            </div>

            {/* Veredito da auditoria.
                Este bloco exibia "Filtro Ético & Prática Clínica Aprovados" com
                um check verde fixo no código, independentemente do resultado —
                uma aprovação fabricada. Agora reflete a auditoria de verdade, e
                distingue os três estados possíveis, inclusive "não auditado",
                para os artigos gerados antes do comitê. */}
            {(() => {
              const audit = post.review.audit;

              if (!audit) {
                return (
                  <div className="flex items-start gap-3 p-3.5 bg-surface-sunken border border-line rounded-control">
                    <AlertCircle className="w-5 h-5 text-ink-faint shrink-0 mt-0.5" aria-hidden="true" />
                    <div className="text-xs">
                      <p className="font-semibold text-ink">Artigo não auditado</p>
                      <p className="text-ink-muted mt-0.5">
                        Gerado antes da auditoria final existir. Nada verificou o texto publicado.
                      </p>
                    </div>
                  </div>
                );
              }

              const reproved = !audit.approved;
              return (
                <div
                  className={`flex items-start gap-3 p-3.5 rounded-control border ${
                    reproved
                      ? 'bg-danger-soft border-danger/40'
                      : 'bg-success-soft border-success/30'
                  }`}
                >
                  {reproved ? (
                    <X className="w-5 h-5 text-danger shrink-0 mt-0.5" aria-hidden="true" />
                  ) : (
                    <Check className="w-5 h-5 text-success shrink-0 mt-0.5" aria-hidden="true" />
                  )}
                  <div className="text-xs min-w-0 space-y-1.5">
                    <p className={`font-semibold ${reproved ? 'text-danger-ink' : 'text-success-ink'}`}>
                      {reproved
                        ? 'Reprovado na auditoria — fora do Portal Público'
                        : 'Aprovado para publicação'}
                      {audit.severity && audit.severity !== 'ok' && ` · ${audit.severity}`}
                    </p>
                    <p className="text-ink-muted leading-relaxed">{audit.summary}</p>
                    {audit.issues?.length > 0 && (
                      <ul className="list-disc pl-4 space-y-1 text-ink-muted">
                        {audit.issues.map((issue, i) => (
                          <li key={i}>{issue}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Pareceres dos especialistas.
                Cada um é uma chamada independente ao modelo: nenhum vê o
                parecer do outro, então podem de fato divergir. O veredito
                aparece ao lado do nome — antes só havia prosa, sem posição. */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  key: 'humanization' as const,
                  icon: Wand2,
                  label: 'Editor de humanização',
                  notes: post.review.humanizationNotes,
                },
                {
                  key: 'conceptual' as const,
                  icon: BookOpen,
                  label: 'Curador conceitual',
                  notes: post.review.conceptualNotes,
                },
                {
                  key: 'clinical' as const,
                  icon: ShieldCheck,
                  label: 'Revisor clínico e ético',
                  notes: post.review.clinicalNotes,
                },
              ].map(({ key, icon: Icon, label, notes }) => {
                const verdict = post.review?.specialists?.[key];
                const tone =
                  verdict?.approved === false
                    ? 'border-danger/40 bg-danger-soft/40'
                    : verdict?.failed
                      ? 'border-line bg-surface-sunken'
                      : 'border-line bg-surface-sunken';

                return (
                  <div key={key} className={`border rounded-panel p-4 space-y-2 ${tone}`}>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-ink font-semibold text-xs sm:text-sm min-w-0">
                        <Icon className="w-4 h-4 text-ink-muted shrink-0" aria-hidden="true" />
                        <span className="truncate">{label}</span>
                      </div>
                      {verdict && (
                        <Badge
                          tone={
                            verdict.approved === false
                              ? 'danger'
                              : verdict.approved === null
                                ? 'neutral'
                                : 'success'
                          }
                        >
                          {verdict.approved === false
                            ? 'reprovou'
                            : verdict.approved === null
                              ? 'indisponível'
                              : 'aprovou'}
                        </Badge>
                      )}
                    </div>

                    <p className="text-xs text-ink-muted leading-relaxed font-sans">
                      {notes || 'Sem parecer registrado.'}
                    </p>

                    {verdict?.issues?.length > 0 && (
                      <ul className="list-disc pl-4 space-y-1 text-[11px] text-ink-faint">
                        {verdict.issues.map((issue, i) => (
                          <li key={i}>{issue}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}

              {/* Report 4: Redator Principal - Síntese Unificada */}
              <div className="bg-accent-soft/80 border border-accent/40 rounded-panel p-4 space-y-2 md:col-span-2">
                <div className="flex items-center space-x-2 text-accent-ink font-bold text-xs sm:text-sm">
                  <Feather className="w-4 h-4 text-accent-ink shrink-0" />
                  <span>Redator Principal — Síntese Integrada & Reescrita Unificada (Garantia Anti-Colcha de Retalhos)</span>
                </div>
                <p className="text-xs text-ink leading-relaxed font-sans">
                  {post.review.writerSynthesisNotes || 'O Redator Principal absorveu as orientações dos 3 especialistas e reescreveu o texto na íntegra para garantir uma prosa contínua, orgânica e fluida.'}
                </p>
              </div>
            </div>

            {/* Re-Review Form Section */}
            <div className="bg-surface-raised border border-accent/80 rounded-panel p-5 space-y-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2 text-accent-ink font-bold text-sm">
                  <Sparkles className="w-4 h-4 text-accent-ink" />
                  <span>Exigir Nova Revisão com Filtro Anti-Genérico Ainda Mais Severo</span>
                </div>
                <p className="text-xs text-ink-muted">
                  Se achou o texto atual genérico ou clichê, o Revisor fará um pente-fino implacável, expurgando frases prontas, eliminando "você" e aprofundando o caráter ensaístico e autoral.
                </p>
              </div>

              {reReviewError && (
                <div className="bg-danger-soft border border-danger/40 text-danger-ink text-xs p-3 rounded-control flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-danger-ink shrink-0" />
                  <span>{reReviewError}</span>
                </div>
              )}

              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Ex: Torne o tom ainda mais crítico em relação à cobrança de produtividade. Elimine introduções comuns."
                  value={reReviewInstruction}
                  onChange={(e) => setReReviewInstruction(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-surface border border-line rounded-control text-xs text-ink placeholder:text-ink-faint focus:ring-2 focus:ring-accent"
                />

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleReReview}
                    disabled={isReReviewing}
                    className="px-4 py-2.5 bg-accent text-canvas font-bold text-xs rounded-control shadow-xs flex items-center space-x-2 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isReReviewing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Revisando com Exigência Máxima...</span>
                      </>
                    ) : (
                      <>
                        <Compass className="w-4 h-4 text-accent-ink" />
                        <span>Submeter a Nova Revisão Crítica</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB 6: EXPORT TO REACT BLOG */}
      {activeTab === 'reactexport' && (
        <div className="space-y-6">
          <div className="bg-surface rounded-panel p-6 sm:p-8 border border-line shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-line pb-4">
              <div>
                <div className="flex items-center space-x-2 text-accent-ink font-bold text-lg">
                  <Code className="w-5 h-5 text-accent-ink shrink-0" />
                  <h2>Exportação Direta para Blog React</h2>
                </div>
                <p className="text-xs text-ink-muted mt-1">
                  Obtenha o código exato formatado para incorporar este artigo no seu site React, Next.js, Vite ou CMS Headless.
                </p>
              </div>

              <span className="bg-accent-soft border border-accent/40 text-accent-ink text-xs font-semibold px-3 py-1.5 rounded-control flex items-center space-x-1.5">
                <Globe className="w-3.5 h-3.5 text-accent-ink" />
                <span>Compatível com React 18 / Next.js / Tailwind</span>
              </span>
            </div>

            {/* Format Selection Bar */}
            <div className="flex flex-wrap items-center gap-2 bg-surface-raised p-1.5 rounded-panel">
              <button
                onClick={() => setReactExportFormat('tsx')}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-control text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                  reactExportFormat === 'tsx'
                    ? 'bg-surface text-ink shadow-sm'
                    : 'text-ink-muted hover:text-ink hover:bg-surface-raised/60'
                }`}
              >
                <FileCode className="w-4 h-4 text-accent-ink" />
                <span>Componente React (.tsx)</span>
              </button>

              <button
                onClick={() => setReactExportFormat('json')}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-control text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                  reactExportFormat === 'json'
                    ? 'bg-surface text-ink shadow-sm'
                    : 'text-ink-muted hover:text-ink hover:bg-surface-raised/60'
                }`}
              >
                <Braces className="w-4 h-4 text-accent-ink" />
                <span>Payload JSON (CMS / API)</span>
              </button>

              <button
                onClick={() => setReactExportFormat('mdx')}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-control text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                  reactExportFormat === 'mdx'
                    ? 'bg-surface text-ink shadow-sm'
                    : 'text-ink-muted hover:text-ink hover:bg-surface-raised/60'
                }`}
              >
                <FileText className="w-4 h-4 text-accent-ink" />
                <span>MDX com Frontmatter</span>
              </button>

              <button
                onClick={() => setReactExportFormat('html')}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-control text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                  reactExportFormat === 'html'
                    ? 'bg-surface text-ink shadow-sm'
                    : 'text-ink-muted hover:text-ink hover:bg-surface-raised/60'
                }`}
              >
                <Code className="w-4 h-4 text-accent-ink" />
                <span>HTML Semântico</span>
              </button>
            </div>

            {/* Code Display Container */}
            {(() => {
              let codeText = '';
              let formatTitle = '';
              let formatDescription = '';

              if (reactExportFormat === 'tsx') {
                formatTitle = 'Componente React TSX com Tailwind CSS';
                formatDescription = 'Componente funcional pronto para colar no seu diretório /components/ do seu blog React.';
                codeText = `import React from 'react';

export interface ArticleProps {
  title?: string;
  subtitle?: string;
  publishedAt?: string;
  readTimeMinutes?: number;
  authorName?: string;
  coverImageUrl?: string;
  tags?: string[];
}

export const ArticlePostComponent: React.FC<ArticleProps> = ({
  title = ${JSON.stringify(displayedTitle)},
  subtitle = ${JSON.stringify(displayedSubtitle)},
  publishedAt = "${new Date(post.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}",
  readTimeMinutes = ${post.review?.readingTimeMinutes || 4},
  authorName = ${JSON.stringify(manifesto.authorName || 'Psicólogo(a)')},
  coverImageUrl = ${JSON.stringify(displayedCoverUrl)},
  tags = ${JSON.stringify(post.tags || post.review?.suggestedTags || ['Psicologia', 'Ensaio'])},
}) => {
  return (
    <article className="max-w-3xl mx-auto px-4 py-8 font-sans text-ink">
      <header className="space-y-4 mb-8">
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, idx) => (
            <span key={idx} className="bg-surface-raised text-ink-muted text-xs px-2.5 py-1 rounded-full font-medium">
              #{tag}
            </span>
          ))}
        </div>
        <h1 className="font-serif font-bold text-3xl sm:text-4xl text-ink leading-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-lg text-ink-muted font-serif italic leading-relaxed">
            {subtitle}
          </p>
        )}
        <div className="flex items-center space-x-3 text-xs text-ink-faint border-y border-line py-3">
          <span className="font-semibold text-ink">{authorName}</span>
          <span>•</span>
          <span>{publishedAt}</span>
          <span>•</span>
          <span>{readTimeMinutes} min de leitura</span>
        </div>
      </header>

      {coverImageUrl && (
        <figure className="mb-10 rounded-panel overflow-hidden shadow-sm">
          <img
            src={coverImageUrl}
            alt={title}
            className="w-full h-80 object-cover"
            referrerPolicy="no-referrer"
          />
        </figure>
      )}

      <div className="prose prose-stone prose-lg max-w-none space-y-6 leading-relaxed">
${displayedText
  .split('\n\n')
  .map((p) => {
    if (p.startsWith('## ')) return `        <h2 className="font-serif font-bold text-2xl text-ink mt-8 mb-4">${p.replace('## ', '')}</h2>`;
    if (p.startsWith('### ')) return `        <h3 className="font-serif font-bold text-xl text-ink mt-6 mb-3">${p.replace('### ', '')}</h3>`;
    if (p.startsWith('> ')) return `        <blockquote className="my-6 p-4 border-l-4 border-accent/40 bg-accent-soft/60 font-serif italic text-ink">\n          <p>"${p.replace(/^>\s*/, '')}"</p>\n        </blockquote>`;
    return `        <p>${p}</p>`;
  })
  .join('\n\n')}
      </div>

      <footer className="mt-12 pt-8 border-t border-line">
        <div className="bg-surface text-ink rounded-panel p-6 space-y-4">
          <h4 className="font-serif font-bold text-lg text-accent-ink">
            Perguntas para Reflexão Psicoterapêutica
          </h4>
          <ol className="list-decimal pl-5 space-y-2 text-sm text-ink">
            <li>Como este tema se conecta com situações do seu momento atual?</li>
            <li>O que você percebe em seu corpo ao refletir sobre este ensaio?</li>
            <li>O que mudaria em sua rotina se acolhesse esses sentimentos sem pressa?</li>
            <li>Que pergunta você gostaria de levar para a sua próxima sessão?</li>
          </ol>
        </div>
      </footer>
    </article>
  );
};

export default ArticlePostComponent;`;
              } else if (reactExportFormat === 'json') {
                formatTitle = 'Objeto JSON Estruturado';
                formatDescription = 'Payload pronto para ser retornado por uma API REST/GraphQL ou salvo no seu banco de dados/CMS do blog.';
                codeText = JSON.stringify(
                  {
                    id: post.id,
                    slug: displayedTitle
                      .toLowerCase()
                      .normalize('NFD')
                      .replace(/[\u0300-\u036f]/g, '')
                      .replace(/[^a-z0-9]+/g, '-')
                      .replace(/(^-|-$)/g, ''),
                    title: displayedTitle,
                    subtitle: displayedSubtitle,
                    author: manifesto.authorName || 'Psicólogo(a)',
                    publishedAt: new Date(post.createdAt).toISOString(),
                    readingTimeMinutes: post.review?.readingTimeMinutes || 4,
                    coverImageUrl: displayedCoverUrl,
                    tags: post.tags || post.review?.suggestedTags || [],
                    seoMetaDescription: post.review?.metaDescription || '',
                    socialCaption: post.review?.socialCaption || '',
                    bodyMarkdown: displayedText,
                    reflectionQuestions: [
                      'Como este tema se conecta com situações concretas do seu momento atual?',
                      'O que você percebe em seu corpo ao refletir sobre as contradições expostas neste texto?',
                      'Que sentimentos surgem ao acolher essa experiência sem pressa de solucioná-la?',
                      'Que pergunta você gostaria de levar para a sua próxima sessão de terapia sobre este assunto?',
                    ],
                  },
                  null,
                  2
                );
              } else if (reactExportFormat === 'mdx') {
                formatTitle = 'Arquivo MDX com Frontmatter';
                formatDescription = 'Ideal para blogs estáticos com Next.js, Contentlayer, Astro ou Gatsby.';
                codeText = `---
title: ${JSON.stringify(displayedTitle)}
subtitle: ${JSON.stringify(displayedSubtitle)}
author: ${JSON.stringify(manifesto.authorName || 'Psicólogo(a)')}
date: "${new Date(post.createdAt).toISOString().split('T')[0]}"
readingTimeMinutes: ${post.review?.readingTimeMinutes || 4}
coverImageUrl: ${JSON.stringify(displayedCoverUrl)}
tags: ${JSON.stringify(post.tags || post.review?.suggestedTags || [])}
metaDescription: ${JSON.stringify(post.review?.metaDescription || '')}
---

# ${displayedTitle}

${displayedSubtitle ? `*${displayedSubtitle}*\n` : ''}
${displayedText}

## Perguntas para Reflexão Psicoterapêutica

1. Como este tema se conecta com situações concretas do seu momento atual?
2. O que você percebe em seu corpo ao refletir sobre as contradições expostas neste texto?
3. Que sentimentos surgem ao acolher essa experiência sem pressa de solucioná-la?
4. Que pergunta você gostaria de levar para a sua próxima sessão de terapia sobre este assunto?
`;
              } else if (reactExportFormat === 'html') {
                formatTitle = 'HTML Semântico Sanitizado';
                formatDescription = 'Para ser renderizado via dangerouslySetInnerHTML={{ __html: ... }} no seu React.';
                codeText = `<article class="psico-article">
  <h1>${displayedTitle}</h1>
  ${displayedSubtitle ? `<p class="subtitle"><em>${displayedSubtitle}</em></p>` : ''}
  <p class="meta">Por ${manifesto.authorName || 'Psicólogo(a)'} • ${new Date(post.createdAt).toLocaleDateString('pt-BR')} • ${post.review?.readingTimeMinutes || 4} min de leitura</p>
  ${displayedCoverUrl ? `<img src="${displayedCoverUrl}" alt="${displayedTitle}" referrerpolicy="no-referrer" />` : ''}
  <div class="article-body">
    ${displayedText
      .split('\n\n')
      .map((p) => {
        if (p.startsWith('## ')) return `<h2>${p.replace('## ', '')}</h2>`;
        if (p.startsWith('### ')) return `<h3>${p.replace('### ', '')}</h3>`;
        if (p.startsWith('> ')) return `<blockquote>${p.replace(/^>\s*/, '')}</blockquote>`;
        return `<p>${p}</p>`;
      })
      .join('\n    ')}
  </div>
</article>`;
              }

              return (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-surface text-ink p-4 rounded-t-2xl">
                    <div>
                      <h3 className="font-bold text-sm text-accent-ink">{formatTitle}</h3>
                      <p className="text-xs text-ink-faint mt-0.5">{formatDescription}</p>
                    </div>

                    <button
                      onClick={() => {
                        handleCopyText(codeText, `react_export_${reactExportFormat}`);
                        if (addToast) {
                          addToast('success', 'Código do artigo copiado!', `O código no formato ${reactExportFormat.toUpperCase()} está na sua área de transferência.`);
                        }
                      }}
                      className="px-4 py-2 bg-accent hover:bg-accent-strong text-canvas font-bold text-xs rounded-control flex items-center space-x-1.5 transition-all shadow-md cursor-pointer shrink-0"
                    >
                      {copiedField === `react_export_${reactExportFormat}` ? (
                        <Check className="w-4 h-4 text-ink" />
                      ) : (
                        <Copy className="w-4 h-4 text-ink" />
                      )}
                      <span>
                        {copiedField === `react_export_${reactExportFormat}`
                          ? 'Copiado para Área de Transferência!'
                          : `Copiar Código ${reactExportFormat.toUpperCase()}`}
                      </span>
                    </button>
                  </div>

                  <div className="relative">
                    <pre className="p-5 bg-canvas text-ink rounded-b-2xl font-mono text-xs overflow-x-auto whitespace-pre-wrap max-h-[550px] border border-line leading-relaxed selection:bg-accent-soft">
                      {codeText}
                    </pre>
                  </div>
                </div>
              );
            })()}

            {/* Quick React Integration Instructions */}
            <div className="bg-accent/20 border border-accent/30 rounded-panel p-5 text-xs text-ink-muted space-y-3">
              <div className="flex items-center space-x-2 font-bold text-ink text-sm">
                <Sparkles className="w-4 h-4 text-accent-ink" />
                <span>Como usar no seu Blog em React:</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-ink-muted">
                <div className="bg-surface p-3.5 rounded-control border border-line space-y-1">
                  <span className="font-bold text-ink block">1. Imagem de Capa</span>
                  <p>A tag de imagem inclui <code className="bg-surface-raised text-ink px-1 rounded">referrerPolicy="no-referrer"</code> para garantir a exibição perfeita da capa gerada por IA.</p>
                </div>

                <div className="bg-surface p-3.5 rounded-control border border-line space-y-1">
                  <span className="font-bold text-ink block">2. Estilos com Tailwind</span>
                  <p>As classes do Tailwind CSS já estão otimizadas para telas pequenas, médias e desktop, usando a fonte serifada nos títulos.</p>
                </div>

                <div className="bg-surface p-3.5 rounded-control border border-line space-y-1">
                  <span className="font-bold text-ink block">3. SEO & Redes Sociais</span>
                  <p>Copie a meta descrição gerada na aba 'Legendas & SEO' para colocar no <code className="bg-surface-raised text-ink px-1 rounded">&lt;head&gt;</code> do seu blog.</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
