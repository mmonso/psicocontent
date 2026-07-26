import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { CreatePostTab } from './components/CreatePostTab';
import { PipelineTracker } from './components/PipelineTracker';
import { ArticleResultView } from './components/ArticleResultView';
import { ManifestoEditor } from './components/ManifestoEditor';
import { ArticleHistoryTab } from './components/ArticleHistoryTab';
import { VirtualTeamInfo } from './components/VirtualTeamInfo';
import { PublicBlogPortal } from './components/PublicBlogPortal';
import { ToastContainer, ToastMessage } from './components/Toast';

import {
  PostGenerationInput,
  ArticlePost,
  UserManifesto,
} from './types';
import {
  getStoredPosts,
  savePostToStorage,
  deletePostFromStorage,
  getStoredManifesto,
  saveManifestoToStorage,
} from './lib/storage';
import { VISUAL_STYLES } from './data/presetApproaches';

export default function App() {
  const [activeTab, setActiveTab] = useState<'create' | 'manifesto' | 'history' | 'team' | 'blog'>('create');
  
  // Theme state ('light' | 'dark')
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('psicocontent_theme') as 'light' | 'dark') || 'light';
  });

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('psicocontent_theme', next);
      return next;
    });
  };

  const isDark = theme === 'dark';

  // Storage state
  const [posts, setPosts] = useState<ArticlePost[]>([]);
  const [manifesto, setManifesto] = useState<UserManifesto>(getStoredManifesto());

  // Toast notifications state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', title: string, description?: string) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { id, type, title, description }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Active generation / viewing state
  const [currentPost, setCurrentPost] = useState<ArticlePost | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRegeneratingImage, setIsRegeneratingImage] = useState(false);

  useEffect(() => {
    setPosts(getStoredPosts());
    setManifesto(getStoredManifesto());
  }, []);

  const handleSaveManifesto = (updated: UserManifesto) => {
    setManifesto(updated);
    saveManifestoToStorage(updated);
    addToast('success', 'Visão de mundo salva!', 'Suas preferências e diretrizes éticas foram atualizadas.');
  };

  // Handle Starting Production of a New Post (Full Step-by-Step Pipeline)
  const handleStartPipeline = async (input: PostGenerationInput) => {
    setIsGenerating(true);

    const newPostId = `post_${Date.now()}`;

    const newPost: ArticlePost = {
      id: newPostId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      topic: input.topic,
      tone: manifesto.toneOfVoice,
      depthLevel: input.depthLevel,
      targetAudience: input.targetAudience,
      input,
      status: 'drafting',
    };

    setCurrentPost(newPost);

    try {
      // -------------------------------------------------------------
      // STEP 1: REDATOR VIRTUAL (Geração do Rascunho com o Manifesto)
      // -------------------------------------------------------------
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
      if (!draftData.success) {
        throw new Error(draftData.error || 'Erro na etapa de redação.');
      }

      const draftResult = draftData.data;

      // Update post state with Draft
      const postWithDraft: ArticlePost = {
        ...newPost,
        draft: draftResult,
        status: 'reviewing',
      };
      setCurrentPost(postWithDraft);

      // -------------------------------------------------------------
      // STEP 2: REVISOR CLÍNICO & ÉTICO (Revisão e Polimento)
      // -------------------------------------------------------------
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
      if (!reviewData.success) {
        throw new Error(reviewData.error || 'Erro na etapa de revisão clínica.');
      }

      const reviewResult = reviewData.data;

      // Update post state with Review
      const postWithReview: ArticlePost = {
        ...postWithDraft,
        review: reviewResult,
        status: 'generating_image',
      };
      setCurrentPost(postWithReview);

      // -------------------------------------------------------------
      // STEP 3: DESIGNER VISUAL (Criação de Imagem Editorial)
      // -------------------------------------------------------------
      const selectedStyle = VISUAL_STYLES.find((s) => s.id === input.visualStyle) || VISUAL_STYLES[0];

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
        console.warn('Falha na geração da imagem via Imagen API, usando imagem temática suave.');
      }

      const imageResult = imgData.data || {
        imageUrl: `https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80`,
        promptUsed: 'Ilustração editorial poética de psicologia',
        conceptExplanation: 'Imagem conceitual acolhedora.',
        altText: `Ilustração sobre ${input.topic}`,
        styleUsed: selectedStyle.id,
      };

      // Completed Post
      const completedPost: ArticlePost = {
        ...postWithReview,
        image: imageResult,
        status: 'completed',
        updatedAt: new Date().toISOString(),
      };

      setCurrentPost(completedPost);
      const updatedPosts = savePostToStorage(completedPost);
      setPosts(updatedPosts);
    } catch (err: any) {
      console.error('Pipeline error:', err);
      setCurrentPost((prev) =>
        prev
          ? {
              ...prev,
              status: 'error',
              errorMessage: err.message || 'Falha ao processar o artigo.',
            }
          : null
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // Regenerate image
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
        const updatedPost: ArticlePost = {
          ...currentPost,
          image: imgData.data,
          updatedAt: new Date().toISOString(),
        };
        setCurrentPost(updatedPost);
        const updatedList = savePostToStorage(updatedPost);
        setPosts(updatedList);
      }
    } catch (e) {
      console.error('Error regenerating image:', e);
    } finally {
      setIsRegeneratingImage(false);
    }
  };

  // Handle post updates from Result view (e.g. text edits)
  const handlePostUpdated = (updated: ArticlePost) => {
    setCurrentPost(updated);
    const updatedList = savePostToStorage(updated);
    setPosts(updatedList);
    addToast('success', 'Artigo salvo!', 'As alterações no texto e metadados foram salvas.');
  };

  // Handle clone post
  const handleClonePost = (postToClone: ArticlePost) => {
    const clonedTitle = postToClone.review?.revisedTitle
      ? `${postToClone.review.revisedTitle} (Cópia)`
      : `${postToClone.topic} (Cópia)`;

    const clonedPost: ArticlePost = {
      ...postToClone,
      id: `post_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      topic: `${postToClone.topic} (Cópia)`,
      review: postToClone.review
        ? {
            ...postToClone.review,
            revisedTitle: clonedTitle,
          }
        : undefined,
      draft: postToClone.draft
        ? {
            ...postToClone.draft,
            title: `${postToClone.draft.title} (Cópia)`,
          }
        : undefined,
    };

    const updatedList = savePostToStorage(clonedPost);
    setPosts(updatedList);
    setCurrentPost(clonedPost);
    setActiveTab('create');
    addToast('success', 'Artigo duplicado com sucesso!', 'Uma cópia pronta para novas edições foi carregada.');
  };

  // Handle delete post from history
  const handleDeletePost = (id: string) => {
    if (window.confirm('Excluir este artigo do histórico?')) {
      const updated = deletePostFromStorage(id);
      setPosts(updated);
      if (currentPost?.id === id) {
        setCurrentPost(null);
      }
      addToast('info', 'Artigo excluído do histórico');
    }
  };

  return (
    <div className={`min-h-screen font-sans flex flex-col transition-colors duration-300 selection:bg-teal-200 selection:text-teal-900 ${
      isDark ? 'bg-[#101114] text-stone-100 dark' : 'bg-[#fbfbfa] text-stone-900'
    }`}>
      
      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />

      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          // Reset current active view if going back to create
          if (tab === 'create' && !isGenerating && currentPost?.status === 'completed') {
            setCurrentPost(null);
          }
        }}
        savedCount={posts.length}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 pb-20 md:pb-6">
        
        {/* VIEW 1: CREATE TAB */}
        {activeTab === 'create' && (
          <div>
            {/* If pipeline is currently running */}
            {isGenerating && currentPost && (
              <PipelineTracker
                status={currentPost.status}
                errorMessage={currentPost.errorMessage}
                draftResult={currentPost.draft}
                reviewResult={currentPost.review}
                imageResult={currentPost.image}
                authorName={manifesto.authorName}
                topic={currentPost.topic}
              />
            )}

            {/* If pipeline completed or ready for preview */}
            {!isGenerating && currentPost && currentPost.status === 'completed' && (
              <ArticleResultView
                post={currentPost}
                onPostUpdated={handlePostUpdated}
                onRegenerateImage={handleRegenerateImage}
                onClonePost={handleClonePost}
                addToast={addToast}
                isRegeneratingImage={isRegeneratingImage}
              />
            )}

            {/* Default Form Input View */}
            {!isGenerating && (!currentPost || currentPost.status === 'error') && (
              <CreatePostTab
                manifesto={manifesto}
                onSubmitInput={handleStartPipeline}
                onOpenManifestoEditor={() => setActiveTab('manifesto')}
                isLoading={isGenerating}
              />
            )}
          </div>
        )}

        {/* VIEW 2: MANIFESTO & WORLDVIEW TAB */}
        {activeTab === 'manifesto' && (
          <ManifestoEditor
            manifesto={manifesto}
            onSave={handleSaveManifesto}
          />
        )}

        {/* VIEW 3: ARTICLE HISTORY TAB */}
        {activeTab === 'history' && (
          <ArticleHistoryTab
            posts={posts}
            onSelectPost={(post) => {
              setCurrentPost(post);
              setActiveTab('create');
            }}
            onDeletePost={handleDeletePost}
            onClonePost={handleClonePost}
            onStartNewPost={() => {
              setCurrentPost(null);
              setActiveTab('create');
            }}
          />
        )}

        {/* VIEW 4: VIRTUAL TEAM INFO TAB */}
        {activeTab === 'team' && (
          <VirtualTeamInfo
            onStartCreate={() => {
              setCurrentPost(null);
              setActiveTab('create');
            }}
            onCustomizePrompts={() => setActiveTab('manifesto')}
          />
        )}

        {/* VIEW 5: PUBLIC BLOG PORTAL TAB */}
        {activeTab === 'blog' && (
          <PublicBlogPortal
            posts={posts}
            manifesto={manifesto}
            onBackToStudio={() => setActiveTab('create')}
            onSelectPostToViewInStudio={(post) => {
              setCurrentPost(post);
              setActiveTab('create');
            }}
          />
        )}

      </main>

      {/* Footer */}
      <footer className={`border-t py-6 text-center text-xs transition-colors duration-300 ${
        isDark ? 'border-stone-800/80 bg-[#141519] text-stone-400' : 'border-stone-200 bg-white text-stone-500'
      }`}>
        <p>PsicoContent Studio • Gerador de Conteúdo Personalizado para Blogs de Psicologia</p>
      </footer>

    </div>
  );
}
