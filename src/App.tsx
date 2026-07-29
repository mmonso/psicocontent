import React, { useState, useEffect, useCallback } from 'react';
import { Navbar, SectionId } from './components/Navbar';
import { CreatePostTab } from './components/CreatePostTab';
import { PipelineTracker } from './components/PipelineTracker';
import { ArticleResultView } from './components/ArticleResultView';
import { ManifestoEditor } from './components/ManifestoEditor';
import { ArticleHistoryTab } from './components/ArticleHistoryTab';
import { VirtualTeamInfo } from './components/VirtualTeamInfo';
import { PublicBlogPortal } from './components/PublicBlogPortal';
import { ToastContainer, ToastMessage } from './components/Toast';
import { Button } from './components/ui';

import { PostGenerationInput, ArticlePost, UserManifesto } from './types';
import {
  getStoredPosts,
  getStoredManifesto,
  savePostToStorage,
  deletePostFromStorage,
  getOpenPostId,
  setOpenPostId,
  StorageWriteError,
} from './lib/storage';
import {
  loadPosts,
  pushPost,
  removePost,
  loadManifesto,
  saveManifesto,
  migrateLocalDataIfNeeded,
} from './lib/repository';
import { isSupabaseConfigured } from './lib/supabase';
import { VISUAL_STYLES } from './data/presetApproaches';

/* Sub-visões dentro das seções principais. O Portal Público e a Equipe eram
   abas de topo, mas nenhum dos dois é um destino de trabalho: o Portal é uma
   forma de ver a biblioteca, e a Equipe é documentação da configuração. */
type LibraryView = 'estudio' | 'portal';
type VisionView = 'manifesto' | 'equipe';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80';

export default function App() {
  const [section, setSection] = useState<SectionId>('escrever');
  const [libraryView, setLibraryView] = useState<LibraryView>('estudio');
  const [visionView, setVisionView] = useState<VisionView>('manifesto');

  const [posts, setPosts] = useState<ArticlePost[]>([]);
  const [manifesto, setManifesto] = useState<UserManifesto>(getStoredManifesto());
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const [currentPost, setCurrentPost] = useState<ArticlePost | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRegeneratingImage, setIsRegeneratingImage] = useState(false);

  /* O que o usuário submeteu por último. Antes, uma falha no pipeline
     descartava o formulário inteiro e o texto digitado se perdia. */
  const [lastInput, setLastInput] = useState<PostGenerationInput | null>(null);

  /* Estado da sincronia com o Supabase, exibido no cabeçalho. */
  const [syncState, setSyncState] = useState<'local' | 'syncing' | 'synced' | 'offline'>(
    isSupabaseConfigured ? 'syncing' : 'local'
  );

  useEffect(() => {
    /* Pinta a tela imediatamente com o espelho local, depois reconcilia com o
       servidor. Evita um app em branco enquanto a rede responde. */
    const cached = getStoredPosts();
    setPosts(cached);
    setManifesto(getStoredManifesto());

    const openId = getOpenPostId();
    if (openId) {
      const reopened = cached.find((p) => p.id === openId);
      if (reopened?.status === 'completed') setCurrentPost(reopened);
    }

    if (!isSupabaseConfigured) return;

    let cancelled = false;

    (async () => {
      const migration = await migrateLocalDataIfNeeded();
      if (cancelled) return;

      if (migration.error) {
        setSyncState('offline');
        addToast('error', 'Falha ao conectar no Supabase', migration.error);
        return;
      }
      if (migration.ran && migration.articlesSent > 0) {
        addToast(
          'success',
          'Biblioteca enviada para o Supabase',
          `${migration.articlesSent} artigo(s) que existiam só neste navegador agora estão no banco.`
        );
      }

      const [postsResult, manifestoResult] = await Promise.all([loadPosts(), loadManifesto()]);
      if (cancelled) return;

      setPosts(postsResult.data);
      setManifesto(manifestoResult.data);

      const failure = postsResult.remoteError || manifestoResult.remoteError;
      if (failure) {
        setSyncState('offline');
        addToast('error', 'Sem conexão com o Supabase', `${failure} — usando a cópia local.`);
      } else {
        setSyncState('synced');
        /* Reabre o artigo com a versão do servidor, que pode ser mais nova. */
        const openIdAfter = getOpenPostId();
        if (openIdAfter) {
          const fresh = postsResult.data.find((p) => p.id === openIdAfter);
          if (fresh?.status === 'completed') setCurrentPost(fresh);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Mantém o ponteiro do artigo aberto em sincronia com a tela. */
  useEffect(() => {
    setOpenPostId(currentPost?.status === 'completed' ? currentPost.id : null);
  }, [currentPost?.id, currentPost?.status]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (
      type: ToastMessage['type'],
      title: string,
      description?: string,
      action?: ToastMessage['action']
    ) => {
      const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      setToasts((prev) => [...prev, { id, type, title, description, action }]);
      /* Avisos com ação ficam mais tempo — o usuário precisa de margem para
         decidir se vai desfazer. */
      const ttl = action ? 8000 : 4500;
      setTimeout(() => dismissToast(id), ttl);
    },
    [dismissToast]
  );

  /* Grava e devolve se realmente gravou. Falha de armazenamento vira aviso
     visível — nunca um "salvo" silencioso sobre uma escrita que não aconteceu. */
  const persist = useCallback(
    (post: ArticlePost): boolean => {
      try {
        // Local e síncrono: garantia mínima de não perder o texto.
        setPosts(savePostToStorage(post));
      } catch (e) {
        addToast(
          'error',
          'Não foi possível salvar',
          e instanceof StorageWriteError
            ? e.message
            : 'O navegador recusou a gravação local.'
        );
        return false;
      }

      // Remoto em segundo plano: não bloqueia a interface.
      if (isSupabaseConfigured) {
        setSyncState('syncing');
        pushPost(post).then((remoteError) => {
          if (remoteError) {
            setSyncState('offline');
            addToast('error', 'Salvo só neste navegador', remoteError);
          } else {
            setSyncState('synced');
          }
        });
      }

      return true;
    },
    [addToast]
  );

  const handleSaveManifesto = async (updated: UserManifesto) => {
    setManifesto(updated);
    const { remoteError } = await saveManifesto(updated);

    if (remoteError) {
      setSyncState('offline');
      addToast('error', 'Visão salva só neste navegador', remoteError);
    } else {
      if (isSupabaseConfigured) setSyncState('synced');
      addToast('success', 'Visão de mundo salva', 'Suas diretrizes foram atualizadas.');
    }
  };

  const runPipeline = async (input: PostGenerationInput) => {
    setIsGenerating(true);
    setLastInput(input);

    const basePost: ArticlePost = {
      id: `post_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      topic: input.topic,
      tone: manifesto.toneOfVoice,
      depthLevel: input.depthLevel,
      targetAudience: input.targetAudience,
      input,
      status: 'drafting',
    };

    setCurrentPost(basePost);

    try {
      // Etapa 1 — rascunho
      const draftRes = await fetch('/api/generate-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: input.topic,
          targetAudience: input.targetAudience,
          depthLevel: input.depthLevel,
          articleLength: input.articleLength,
          customWriterPrompt: input.customWriterPrompt,
          userManifesto: manifesto,
        }),
      });
      const draftData = await draftRes.json();
      if (!draftData.success) throw new Error(draftData.error || 'Erro na etapa de redação.');

      const draftResult = draftData.data;
      const postWithDraft: ArticlePost = {
        ...basePost,
        draft: draftResult,
        status: 'reviewing',
      };
      setCurrentPost(postWithDraft);
      /* Grava assim que o rascunho existe. Cada etapa é uma chamada de modelo
         paga: atualizar a página no meio não deve jogar fora o que já veio. */
      persist(postWithDraft);

      // Etapa 2 — revisão
      const reviewRes = await fetch('/api/review-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: input.topic,
          draftTitle: draftResult.title,
          draftSubtitle: draftResult.subtitle,
          draftText: draftResult.rawText,
          customReviewerPrompt: input.customReviewerPrompt,
          userManifesto: manifesto,
        }),
      });
      const reviewData = await reviewRes.json();
      if (!reviewData.success) throw new Error(reviewData.error || 'Erro na revisão clínica.');

      const reviewResult = reviewData.data;
      const postWithReview: ArticlePost = {
        ...postWithDraft,
        review: reviewResult,
        status: 'generating_image',
      };
      setCurrentPost(postWithReview);
      persist(postWithReview);

      // Etapa 3 — imagem. Falha aqui não derruba o artigo: cai numa capa padrão.
      const selectedStyle =
        VISUAL_STYLES.find((s) => s.id === input.visualStyle) || VISUAL_STYLES[0];

      const imgRes = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: reviewResult.revisedTitle || draftResult.title,
          summary: reviewResult.metaDescription || draftResult.subtitle,
          visualStyle: selectedStyle.name,
          promptModifier: selectedStyle.promptModifier,
          customImagePrompt: input.customImagePrompt,
        }),
      });
      const imgData = await imgRes.json();

      if (!imgData.success) {
        addToast(
          'info',
          'Capa gerada com imagem padrão',
          'A ilustração por IA falhou; o artigo foi preservado. Você pode regerar a capa na tela do artigo.'
        );
      }

      const completedPost: ArticlePost = {
        ...postWithReview,
        image: imgData.data || {
          imageUrl: FALLBACK_IMAGE,
          promptUsed: 'Ilustração editorial de psicologia',
          conceptExplanation: 'Imagem conceitual de reserva.',
          altText: `Ilustração sobre ${input.topic}`,
          styleUsed: selectedStyle.id,
        },
        status: 'completed',
        updatedAt: new Date().toISOString(),
      };

      setCurrentPost(completedPost);
      persist(completedPost);
      addToast('success', 'Artigo pronto', 'Salvo automaticamente na sua biblioteca.');
    } catch (err: any) {
      console.error('Pipeline error:', err);
      setCurrentPost((prev) =>
        prev
          ? { ...prev, status: 'error', errorMessage: err.message || 'Falha ao processar o artigo.' }
          : null
      );
      addToast('error', 'A produção do artigo falhou', err.message || 'Erro desconhecido.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerateImage = async (styleId: string) => {
    if (!currentPost || isRegeneratingImage) return;

    setIsRegeneratingImage(true);
    const selectedStyle = VISUAL_STYLES.find((s) => s.id === styleId) || VISUAL_STYLES[0];
    const title = currentPost.review?.revisedTitle || currentPost.draft?.title || currentPost.topic;
    const summary = currentPost.review?.metaDescription || currentPost.draft?.subtitle || title;

    try {
      const imgRes = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          summary,
          visualStyle: selectedStyle.name,
          promptModifier: selectedStyle.promptModifier,
        }),
      });
      const imgData = await imgRes.json();

      if (imgData.success && imgData.data) {
        const updated: ArticlePost = {
          ...currentPost,
          image: imgData.data,
          updatedAt: new Date().toISOString(),
        };
        setCurrentPost(updated);
        persist(updated);
        addToast('success', 'Nova capa gerada');
      } else {
        addToast('error', 'Não foi possível gerar a capa', imgData.error);
      }
    } catch (e: any) {
      console.error('Error regenerating image:', e);
      addToast('error', 'Falha de conexão ao gerar a capa');
    } finally {
      setIsRegeneratingImage(false);
    }
  };

  /* Igual ao salvamento manual, mas sem aviso: o automático não deve encher a
     tela de confirmações a cada pausa na digitação. */
  const handlePostAutoSaved = useCallback(
    (updated: ArticlePost) => {
      setCurrentPost(updated);
      persist(updated);
    },
    [persist]
  );

  const handlePostUpdated = (updated: ArticlePost) => {
    setCurrentPost(updated);
    persist(updated);
    addToast('success', 'Artigo salvo');
  };

  const handleClonePost = (postToClone: ArticlePost) => {
    const clonedTitle = postToClone.review?.revisedTitle
      ? `${postToClone.review.revisedTitle} (Cópia)`
      : `${postToClone.topic} (Cópia)`;

    const cloned: ArticlePost = {
      ...postToClone,
      id: `post_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      topic: `${postToClone.topic} (Cópia)`,
      review: postToClone.review
        ? { ...postToClone.review, revisedTitle: clonedTitle }
        : undefined,
      draft: postToClone.draft
        ? { ...postToClone.draft, title: `${postToClone.draft.title} (Cópia)` }
        : undefined,
    };

    persist(cloned);
    setCurrentPost(cloned);
    setSection('escrever');
    addToast('success', 'Artigo duplicado', 'A cópia foi aberta para edição.');
  };

  /* Exclusão sem diálogo bloqueante: remove na hora e oferece desfazer.
     Antes era um window.confirm nativo, que trava a página e destoa do resto. */
  const handleDeletePost = (id: string) => {
    const removed = posts.find((p) => p.id === id);
    if (!removed) return;

    setPosts(deletePostFromStorage(id));
    if (currentPost?.id === id) setCurrentPost(null);

    if (isSupabaseConfigured) {
      removePost(id).then((remoteError) => {
        if (remoteError) {
          setSyncState('offline');
          addToast('error', 'Excluído só neste navegador', remoteError);
        } else {
          setSyncState('synced');
        }
      });
    }

    addToast('info', 'Artigo excluído', removed.review?.revisedTitle || removed.topic, {
      label: 'Desfazer',
      onClick: () => {
        persist(removed);
        addToast('success', 'Exclusão desfeita');
      },
    });
  };

  const startNewPost = () => {
    setCurrentPost(null);
    setLastInput(null);
    setSection('escrever');
  };

  const openPostInStudio = (post: ArticlePost) => {
    setCurrentPost(post);
    setSection('escrever');
  };

  const hasPipelineError = currentPost?.status === 'error';

  return (
    <div className="min-h-screen bg-canvas text-ink font-sans flex flex-col">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      <Navbar
        section={section}
        onNavigate={(next) => {
          setSection(next);
          /* Voltar para "Escrever" com um artigo já concluído abre uma tela em
             branco, pronta para o próximo texto. */
          if (next === 'escrever' && !isGenerating && currentPost?.status === 'completed') {
            setCurrentPost(null);
          }
        }}
        savedCount={posts.length}
        isGenerating={isGenerating}
        syncState={syncState}
      />

      <main
        id="conteudo"
        className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 pb-24 md:pb-10"
      >
        {section === 'escrever' && (
          <>
            {/* Pipeline em andamento, ou parado num erro. O rastreador
                permanece montado no erro para que a mensagem seja lida — antes
                ele desaparecia e o motivo da falha ia junto. */}
            {(isGenerating || hasPipelineError) && currentPost && (
              <div className="space-y-4">
                <PipelineTracker
                  status={currentPost.status}
                  errorMessage={currentPost.errorMessage}
                  draftResult={currentPost.draft}
                  reviewResult={currentPost.review}
                  imageResult={currentPost.image}
                  authorName={manifesto.authorName}
                  topic={currentPost.topic}
                />

                {hasPipelineError && (
                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <Button
                      variant="primary"
                      onClick={() => lastInput && runPipeline(lastInput)}
                      disabled={!lastInput}
                    >
                      Tentar novamente
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => setCurrentPost(null)}
                    >
                      Voltar ao formulário
                    </Button>
                  </div>
                )}
              </div>
            )}

            {!isGenerating && currentPost?.status === 'completed' && (
              <ArticleResultView
                post={currentPost}
                onPostUpdated={handlePostUpdated}
                onAutoSave={handlePostAutoSaved}
                onRegenerateImage={handleRegenerateImage}
                onClonePost={handleClonePost}
                addToast={addToast}
                isRegeneratingImage={isRegeneratingImage}
              />
            )}

            {!isGenerating && !currentPost && (
              <CreatePostTab
                manifesto={manifesto}
                onSubmitInput={runPipeline}
                onOpenManifestoEditor={() => {
                  setSection('visao');
                  setVisionView('manifesto');
                }}
                isLoading={isGenerating}
                initialInput={lastInput}
              />
            )}
          </>
        )}

        {section === 'biblioteca' && (
          <div className="space-y-6">
            <ViewSwitcher
              options={[
                { id: 'estudio', label: 'Estúdio' },
                { id: 'portal', label: 'Portal público' },
              ]}
              value={libraryView}
              onChange={(v) => setLibraryView(v as LibraryView)}
            />

            {libraryView === 'estudio' ? (
              <ArticleHistoryTab
                posts={posts}
                onSelectPost={openPostInStudio}
                onDeletePost={handleDeletePost}
                onClonePost={handleClonePost}
                onStartNewPost={startNewPost}
              />
            ) : (
              <PublicBlogPortal
                posts={posts}
                manifesto={manifesto}
                onBackToStudio={() => setLibraryView('estudio')}
                onSelectPostToViewInStudio={openPostInStudio}
              />
            )}
          </div>
        )}

        {section === 'visao' && (
          <div className="space-y-6">
            <ViewSwitcher
              options={[
                { id: 'manifesto', label: 'Minha visão' },
                { id: 'equipe', label: 'Equipe virtual' },
              ]}
              value={visionView}
              onChange={(v) => setVisionView(v as VisionView)}
            />

            {visionView === 'manifesto' ? (
              <ManifestoEditor manifesto={manifesto} onSave={handleSaveManifesto} />
            ) : (
              <VirtualTeamInfo
                onStartCreate={startNewPost}
                onCustomizePrompts={() => setVisionView('manifesto')}
              />
            )}
          </div>
        )}
      </main>

      <footer className="border-t border-line py-6 text-center text-xs text-ink-faint">
        <p>PsicoContent Studio — conteúdo editorial de psicologia</p>
      </footer>
    </div>
  );
}

/* Alternador de sub-visão. Segmentado, não abas — a distinção importa: são
   duas formas de olhar o mesmo conjunto, não destinos diferentes. */
const ViewSwitcher: React.FC<{
  options: Array<{ id: string; label: string }>;
  value: string;
  onChange: (id: string) => void;
}> = ({ options, value, onChange }) => (
  <div
    role="tablist"
    className="inline-flex items-center gap-1 p-1 bg-surface border border-line rounded-control"
  >
    {options.map((opt) => {
      const active = opt.id === value;
      return (
        <button
          key={opt.id}
          role="tab"
          aria-selected={active}
          onClick={() => onChange(opt.id)}
          className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
            active
              ? 'bg-accent-soft text-accent-ink'
              : 'text-ink-muted hover:text-ink hover:bg-surface-raised'
          }`}
        >
          {opt.label}
        </button>
      );
    })}
  </div>
);
