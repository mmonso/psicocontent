import React, { useState } from 'react';
import {
  Brain,
  Search,
  BookOpen,
  Calendar,
  Clock,
  Tag,
  ArrowLeft,
  Share2,
  Check,
  Globe,
  Sparkles,
  ExternalLink,
  Code2,
  Download,
  Copy,
  SlidersHorizontal,
  Bookmark,
  Send,
  User,
  Heart,
  Sun,
  Moon,
  LayoutGrid,
  ListFilter
} from 'lucide-react';
import Markdown from 'react-markdown';
import { ArticlePost, UserManifesto } from '../types';

interface PublicBlogPortalProps {
  posts: ArticlePost[];
  manifesto: UserManifesto;
  onBackToStudio: () => void;
  onSelectPostToViewInStudio?: (post: ArticlePost) => void;
}

export const PublicBlogPortal: React.FC<PublicBlogPortalProps> = ({
  posts,
  manifesto,
  onBackToStudio,
  onSelectPostToViewInStudio,
}) => {
  const [selectedPost, setSelectedPost] = useState<ArticlePost | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [copiedLink, setCopiedLink] = useState(false);
  const [showExportModal, setShowExportModal] = useState<ArticlePost | null>(null);
  const [webhookSimulated, setWebhookSimulated] = useState(false);

  // Minimalist Theme & Layout Mode
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [layoutMode, setLayoutMode] = useState<'grid' | 'list'>('grid');

  const isDark = theme === 'dark';

  // Filter published or available posts
  const publishedPosts = posts.filter(
    (p) => p.review && p.review.revisedText && p.review.revisedText.trim().length > 0
  );

  // Get all unique tags
  const allCategories = [
    'Todos',
    ...Array.from(
      new Set(
        publishedPosts.flatMap((p) => p.review?.suggestedTags || [])
      )
    ),
  ];

  const filteredPosts = publishedPosts.filter((post) => {
    const titleMatch = (post.review?.revisedTitle || post.draft?.title || post.topic)
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const textMatch = (post.review?.revisedText || post.draft?.rawText || '')
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesSearch = titleMatch || textMatch;

    const matchesCategory =
      selectedCategory === 'Todos' ||
      (post.review?.suggestedTags && post.review.suggestedTags.includes(selectedCategory));

    return matchesSearch && matchesCategory;
  });

  const featuredPost = filteredPosts.length > 0 ? filteredPosts[0] : null;
  const regularPosts = filteredPosts.length > 1 ? filteredPosts.slice(1) : [];

  const handleShare = (postTitle: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  const formatDate = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return 'Recentemente';
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 font-sans pb-24 ${
      isDark ? 'bg-[#101114] text-ink' : 'bg-[#fcfbf8] text-ink'
    }`}>
      {/* Top Banner & Control Bar */}
      <div className={`sticky top-0 z-50 border-b backdrop-blur-md transition-colors ${
        isDark ? 'bg-[#16171c]/90 border-line/80 text-ink' : 'bg-surface/90 border-line/80 text-ink'
      }`}>
        <div className="max-w-7xl mx-auto py-2.5 px-4 sm:px-6 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
            <span className={`font-bold uppercase tracking-wider text-[11px] text-accent-ink`}>
              Portal do Leitor
            </span>
            <span className="text-ink-faint hidden sm:inline">• Visualização Minimalista & Elegante</span>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Theme Toggle Button */}
            <button
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className={`p-1.5 rounded-control border flex items-center space-x-1.5 font-medium transition-all cursor-pointer ${
                isDark
                  ? 'bg-surface-raised text-accent-ink border-line hover:bg-surface'
                  : 'bg-surface-raised text-ink border-line hover:bg-surface-raised'
              }`}
              title={isDark ? 'Mudar para Modo Claro Minimalista' : 'Mudar para Modo Escuro Noturno'}
            >
              {isDark ? <Sun className="w-3.5 h-3.5 text-accent-ink" /> : <Moon className="w-3.5 h-3.5 text-accent-ink" />}
              <span className="hidden md:inline text-[11px] font-semibold">
                {isDark ? 'Modo Claro' : 'Modo Escuro'}
              </span>
            </button>

            {/* Layout Toggle */}
            <div className={`flex items-center rounded-control border p-0.5 ${
              isDark ? 'bg-surface border-line' : 'bg-surface-raised border-line'
            }`}>
              <button
                onClick={() => setLayoutMode('grid')}
                className={`p-1 rounded-md transition-all cursor-pointer ${
                  layoutMode === 'grid'
                    ? isDark ? 'bg-surface-raised text-accent-ink' : 'bg-surface text-accent-ink shadow-xs'
                    : 'text-ink-faint hover:text-ink'
                }`}
                title="Visualização em Grade"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setLayoutMode('list')}
                className={`p-1 rounded-md transition-all cursor-pointer ${
                  layoutMode === 'list'
                    ? isDark ? 'bg-surface-raised text-accent-ink' : 'bg-surface text-accent-ink shadow-xs'
                    : 'text-ink-faint hover:text-ink'
                }`}
                title="Visualização em Lista Minimalista"
              >
                <ListFilter className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Back to Studio */}
            <button
              onClick={onBackToStudio}
              className="bg-accent hover:bg-accent text-canvas font-bold px-3 py-1.5 rounded-control transition-all flex items-center space-x-1 cursor-pointer text-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Studio</span>
            </button>
          </div>
        </div>
      </div>

      {/* Reader Mode Header / Minimalist Masthead */}
      <header className={`py-12 px-4 sm:px-6 lg:px-8 border-b transition-colors ${
        isDark ? 'bg-[#14151a] border-line/80' : 'bg-surface border-line/80'
      }`}>
        <div className="max-w-4xl mx-auto space-y-5 text-center">
          <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest border ${
            isDark ? 'bg-surface text-accent-ink border-line' : 'bg-surface-raised text-accent-ink border-line'
          }`}>
            <Globe className="w-3.5 h-3.5" />
            <span>Cadernos Ensaísticos de Psicologia</span>
          </div>

          <h1 className={`font-serif text-3xl sm:text-5xl font-bold tracking-tight leading-tight ${
            'text-ink'
          }`}>
            {manifesto.authorName ? `Cadernos de ${manifesto.authorName}` : 'Cadernos de Psicologia & Subjetividade'}
          </h1>

          <p className={`text-base sm:text-lg max-w-2xl mx-auto font-serif italic leading-relaxed ${
            isDark ? 'text-ink-faint' : 'text-ink-muted'
          }`}>
            "{manifesto.worldviewDescription?.slice(0, 180) || 'Ensaios e reflexões sobre a clínica, os afetos, as contradições contemporâneas e a busca por sentido.'}..."
          </p>

          <div className={`pt-2 flex flex-wrap items-center justify-center gap-4 text-xs ${
            'text-ink-faint'
          }`}>
            <span className="flex items-center space-x-1">
              <User className={`w-3.5 h-3.5 text-accent-ink`} />
              <span>Por <strong>{manifesto.authorName || 'Profissional da Saúde Mental'}</strong></span>
            </span>
            <span>•</span>
            <span className="flex items-center space-x-1">
              <BookOpen className={`w-3.5 h-3.5 text-accent-ink`} />
              <span>{publishedPosts.length} Ensaios Publicados</span>
            </span>
          </div>
        </div>
      </header>

      {/* Article Detail Full View */}
      {selectedPost ? (
        <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-8 animate-fadeIn">
          {/* Back button */}
          <button
            onClick={() => setSelectedPost(null)}
            className={`inline-flex items-center space-x-2 px-4 py-2 rounded-control text-xs font-bold transition-all border cursor-pointer ${
              isDark
                ? 'bg-surface text-ink border-line hover:bg-surface-raised'
                : 'bg-surface text-ink-muted border-line hover:bg-surface-raised shadow-2xs'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar aos Ensaios</span>
          </button>

          {/* Article Reading Canvas */}
          <article className={`rounded-panel p-6 sm:p-12 border transition-colors space-y-8 ${
            isDark ? 'bg-[#18191e] border-line' : 'bg-surface border-line/80 shadow-xs'
          }`}>
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-ink-faint">
                <span className={`font-bold px-2.5 py-0.5 rounded-full border text-[11px] ${
                  isDark
                    ? 'bg-accent text-accent-ink border-accent/40'
                    : 'bg-accent-soft text-accent-ink border-accent/40'
                }`}>
                  Ensaio
                </span>
                <span>•</span>
                <span className="flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5 text-ink-faint" />
                  <span>{formatDate(selectedPost.createdAt)}</span>
                </span>
                <span>•</span>
                <span className="flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-ink-faint" />
                  <span>{selectedPost.review?.readingTimeMinutes || 5} min de leitura</span>
                </span>
              </div>

              <h1 className={`font-serif text-3xl sm:text-4xl font-bold leading-tight ${
                'text-ink'
              }`}>
                {selectedPost.review?.revisedTitle || selectedPost.draft?.title}
              </h1>

              {selectedPost.review?.revisedSubtitle && (
                <p className={`text-lg sm:text-xl font-serif italic leading-relaxed ${
                  'text-ink-muted'
                }`}>
                  {selectedPost.review.revisedSubtitle}
                </p>
              )}

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 pt-2">
                {selectedPost.review?.suggestedTags?.map((tag) => (
                  <span
                    key={tag}
                    className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-md border ${
                      isDark
                        ? 'bg-surface text-ink-muted border-line'
                        : 'bg-surface-raised text-ink-muted border-line'
                    }`}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Cover Image */}
            {selectedPost.image?.imageUrl && (
              <div className={`rounded-panel overflow-hidden border ${
                isDark ? 'border-line bg-surface' : 'border-line bg-surface-raised'
              }`}>
                <img
                  src={selectedPost.image.imageUrl}
                  alt={selectedPost.review?.revisedTitle || 'Capa do artigo'}
                  className="w-full max-h-[480px] object-cover"
                />
                {selectedPost.image.promptUsed && (
                  <div className={`p-3 text-[11px] italic flex items-center justify-between border-t ${
                    isDark ? 'bg-surface/80 border-line text-ink-faint' : 'bg-surface-sunken border-line text-ink-faint'
                  }`}>
                    <span>Ilustração poética gerada via Gemini Imagen</span>
                    <span className="font-sans font-semibold uppercase tracking-wider text-[10px]">
                      Estilo: {selectedPost.input.visualStyle}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Article Content */}
            <div className={`prose max-w-none pt-4 border-t ${
              isDark
                ? 'prose-invert prose-p:text-ink prose-p:leading-relaxed prose-p:text-base sm:prose-p:text-lg prose-headings:font-serif prose-headings:text-ink prose-blockquote:border-accent/40 prose-blockquote:text-ink-muted border-line/80'
                : 'prose-stone prose-p:text-ink prose-p:leading-relaxed prose-p:text-base sm:prose-p:text-lg prose-headings:font-serif prose-headings:text-ink prose-blockquote:border-accent/40 prose-blockquote:text-ink-muted border-line'
            }`}>
              <Markdown>
                {selectedPost.review?.revisedText || selectedPost.draft?.rawText || ''}
              </Markdown>
            </div>

            {/* Key Takeaways */}
            {selectedPost.review?.keyTakeaways && selectedPost.review.keyTakeaways.length > 0 && (
              <div className={`rounded-panel p-6 space-y-3 border ${
                isDark
                  ? 'bg-surface/90 border-accent/60 text-ink'
                  : 'bg-accent-soft/60 border-accent/40 text-accent-ink'
              }`}>
                <h3 className={`font-serif font-bold text-base flex items-center space-x-2 ${
                  'text-accent-ink'
                }`}>
                  <Sparkles className="w-4 h-4 text-accent-ink" />
                  <span>Síntese Reflexiva para a Vida Cotidiana:</span>
                </h3>
                <ul className="space-y-2 text-xs sm:text-sm">
                  {selectedPost.review.keyTakeaways.map((takeaway, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <span className={'text-accent-ink font-bold'}>•</span>
                      <span>{takeaway}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Author Footer Bio */}
            <div className={`rounded-panel p-6 sm:p-8 space-y-4 border ${
              isDark
                ? 'bg-canvas border-line text-ink'
                : 'bg-surface text-ink border-line'
            }`}>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-accent border-2 border-accent/40 flex items-center justify-center font-bold text-accent-ink font-serif text-xl shrink-0">
                  {(manifesto.authorName || 'P')[0]}
                </div>
                <div>
                  <h4 className="font-serif font-bold text-lg text-ink">{manifesto.authorName || 'Profissional da Saúde Mental'}</h4>
                  <p className="text-xs text-ink-faint">Escrito com fundamentação clínica, ética e profundidade autoral.</p>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-ink-muted leading-relaxed font-serif italic">
                "{manifesto.worldviewDescription || 'A clínica psicológica como espaço de escuta sem julgamentos e resgate da potência de agir.'}"
              </p>
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-line">
                <button
                  onClick={() => handleShare(selectedPost.review?.revisedTitle || '')}
                  className="bg-surface-raised hover:bg-surface text-ink px-4 py-2 rounded-control text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-accent-ink" /> : <Share2 className="w-3.5 h-3.5 text-accent-ink" />}
                  <span>{copiedLink ? 'Link Copiado!' : 'Compartilhar Ensaio'}</span>
                </button>

                <button
                  onClick={() => setShowExportModal(selectedPost)}
                  className="bg-accent hover:bg-accent text-canvas px-4 py-2 rounded-control text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer"
                >
                  <Code2 className="w-3.5 h-3.5 text-accent-ink" />
                  <span>Exportar para WordPress / Ghost</span>
                </button>
              </div>
            </div>
          </article>
        </main>
      ) : (
        /* Blog Main Landing View */
        <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-10">
          {/* Search & Categories */}
          <div className={`rounded-panel p-4 sm:p-6 border transition-colors space-y-4 ${
            isDark ? 'bg-[#18191e] border-line/80' : 'bg-surface border-line/80 shadow-xs'
          }`}>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              {/* Search Bar */}
              <div className="relative w-full sm:w-96">
                <Search className="w-4 h-4 text-ink-faint absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Buscar por temas, ansiedade, luto, clínica..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-control text-xs focus:outline-none focus:ring-2 font-medium border transition-colors ${
                    isDark
                      ? 'bg-surface border-line text-ink focus:ring-accent'
                      : 'bg-surface-sunken border-line text-ink focus:ring-accent'
                  }`}
                />
              </div>

              {/* Counter & Mode Badge */}
              <div className="flex items-center space-x-3 self-end sm:self-auto text-xs text-ink-faint font-medium">
                <span>{filteredPosts.length} ensaio(s)</span>
              </div>
            </div>

            {/* Category Tags */}
            {allCategories.length > 1 && (
              <div className={`flex flex-wrap gap-1.5 pt-2 border-t ${isDark ? 'border-line/60' : 'border-line'}`}>
                {allCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-control text-xs font-medium transition-all cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-accent text-canvas font-bold shadow-xs'
                        : isDark
                          ? 'bg-surface text-ink-muted hover:bg-surface-raised'
                          : 'bg-surface-raised text-ink-muted hover:bg-surface-raised'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* If No Published Posts */}
          {publishedPosts.length === 0 && (
            <div className={`rounded-panel p-12 text-center border space-y-4 max-w-xl mx-auto ${
              isDark ? 'bg-[#18191e] border-line' : 'bg-surface border-line'
            }`}>
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto border ${
                isDark ? 'bg-surface text-accent-ink border-line' : 'bg-accent-soft text-accent-ink border-accent/40'
              }`}>
                <BookOpen className="w-8 h-8" />
              </div>
              <h3 className={`font-serif font-bold text-2xl text-ink`}>
                Nenhum Ensaio Publicado Ainda
              </h3>
              <p className="text-ink-faint text-sm leading-relaxed">
                Você pode gerar seu primeiro artigo na aba <strong>Criar Artigo</strong> com sua equipe virtual e salvá-lo para aparecer aqui!
              </p>
              <button
                onClick={onBackToStudio}
                className="bg-accent hover:bg-accent text-canvas font-bold px-6 py-3 rounded-panel text-xs transition-all shadow-md cursor-pointer inline-flex items-center space-x-2"
              >
                <Sparkles className="w-4 h-4 text-accent-ink" />
                <span>Criar Meu Primeiro Ensaio Agora</span>
              </button>
            </div>
          )}

          {/* Featured Article */}
          {featuredPost && (
            <section className="space-y-3">
              <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-accent-ink">
                <Sparkles className={`w-4 h-4 text-accent-ink`} />
                <span className={'text-accent-ink'}>Ensaio em Destaque</span>
              </div>

              <div
                onClick={() => setSelectedPost(featuredPost)}
                className={`rounded-panel border overflow-hidden grid grid-cols-1 md:grid-cols-12 transition-all cursor-pointer group hover:border-accent/50 ${
                  isDark ? 'bg-[#18191e] border-line/80 shadow-lg' : 'bg-surface border-line/80 shadow-xs hover:shadow-md'
                }`}
              >
                {/* Image */}
                <div className="md:col-span-6 min-h-[260px] sm:min-h-[340px] relative overflow-hidden bg-surface">
                  {featuredPost.image?.imageUrl ? (
                    <img
                      src={featuredPost.image.imageUrl}
                      alt={featuredPost.review?.revisedTitle || 'Imagem de destaque'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-accent text-accent-ink p-8 text-center font-serif">
                      <span>"{featuredPost.review?.revisedTitle}"</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="md:col-span-6 p-6 sm:p-8 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-xs text-ink-faint font-medium">
                      <span className={`font-bold px-2.5 py-0.5 rounded-full text-[10px] ${
                        isDark ? 'bg-accent/20 text-accent-ink border border-accent/30' : 'bg-accent-soft text-accent-ink'
                      }`}>
                        Destaque
                      </span>
                      <span>•</span>
                      <span>{formatDate(featuredPost.createdAt)}</span>
                      <span>•</span>
                      <span>{featuredPost.review?.readingTimeMinutes || 5} min</span>
                    </div>

                    <h2 className={`font-serif text-2xl sm:text-3xl font-bold transition-colors leading-tight ${
                      'text-ink group-hover:text-accent-ink'
                    }`}>
                      {featuredPost.review?.revisedTitle || featuredPost.draft?.title}
                    </h2>

                    <p className={`text-sm font-serif italic line-clamp-3 leading-relaxed ${
                      isDark ? 'text-ink-faint' : 'text-ink-muted'
                    }`}>
                      {featuredPost.review?.revisedSubtitle || featuredPost.review?.metaDescription}
                    </p>
                  </div>

                  <div className={`pt-4 border-t flex items-center justify-between ${
                    'border-line'
                  }`}>
                    <div className="flex flex-wrap gap-1">
                      {featuredPost.review?.suggestedTags?.slice(0, 3).map((t) => (
                        <span
                          key={t}
                          className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                            isDark ? 'bg-surface text-ink-faint' : 'bg-surface-raised text-ink-muted'
                          }`}
                        >
                          #{t}
                        </span>
                      ))}
                    </div>

                    <span className={`text-xs font-bold flex items-center space-x-1 group-hover:translate-x-1 transition-transform ${
                      'text-accent-ink'
                    }`}>
                      <span>Ler Ensaio</span>
                      <span>→</span>
                    </span>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Regular Posts - Grid or List Minimalist View */}
          {regularPosts.length > 0 && (
            <section className="space-y-4">
              <h3 className={`font-serif font-bold text-xl text-ink`}>
                Outros Ensaios Publicados
              </h3>

              {layoutMode === 'grid' ? (
                /* Grid View */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {regularPosts.map((post) => (
                    <div
                      key={post.id}
                      onClick={() => setSelectedPost(post)}
                      className={`rounded-panel border overflow-hidden flex flex-col justify-between transition-all cursor-pointer group ${
                        isDark
                          ? 'bg-[#18191e] border-line/80 hover:border-line'
                          : 'bg-surface border-line/80 shadow-2xs hover:shadow-md'
                      }`}
                    >
                      <div className="space-y-3">
                        {/* Thumbnail Image */}
                        {post.image?.imageUrl && (
                          <div className="h-44 bg-surface overflow-hidden">
                            <img
                              src={post.image.imageUrl}
                              alt={post.review?.revisedTitle || 'Imagem do post'}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          </div>
                        )}

                        <div className="p-5 space-y-2">
                          <div className="flex items-center space-x-2 text-[11px] text-ink-faint font-medium">
                            <span>{formatDate(post.createdAt)}</span>
                            <span>•</span>
                            <span>{post.review?.readingTimeMinutes || 5} min</span>
                          </div>

                          <h4 className={`font-serif font-bold text-lg line-clamp-2 leading-snug transition-colors ${
                            'text-ink group-hover:text-accent-ink'
                          }`}>
                            {post.review?.revisedTitle || post.draft?.title}
                          </h4>

                          <p className={`text-xs font-serif italic line-clamp-2 leading-relaxed ${
                            isDark ? 'text-ink-faint' : 'text-ink-muted'
                          }`}>
                            {post.review?.revisedSubtitle || post.review?.metaDescription}
                          </p>
                        </div>
                      </div>

                      <div className={`p-5 pt-0 flex items-center justify-between border-t mt-2 ${
                        isDark ? 'border-line/80' : 'border-line'
                      }`}>
                        <span className="text-[11px] text-ink-faint font-medium">
                          #{post.review?.suggestedTags?.[0] || 'Ensaio'}
                        </span>
                        <span className={`text-xs font-bold flex items-center space-x-1 group-hover:translate-x-1 transition-transform ${
                          'text-accent-ink'
                        }`}>
                          <span>Ler</span>
                          <span>→</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* List Minimalist View (Style Substack / Medium / New Yorker) */
                <div className="space-y-4">
                  {regularPosts.map((post) => (
                    <article
                      key={post.id}
                      onClick={() => setSelectedPost(post)}
                      className={`rounded-panel p-6 border transition-all cursor-pointer group flex flex-col sm:flex-row items-start justify-between gap-6 ${
                        isDark
                          ? 'bg-[#18191e] border-line/80 hover:border-line'
                          : 'bg-surface border-line/80 shadow-2xs hover:shadow-xs'
                      }`}
                    >
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center space-x-2 text-[11px] text-ink-faint font-medium">
                          <span>{formatDate(post.createdAt)}</span>
                          <span>•</span>
                          <span>{post.review?.readingTimeMinutes || 5} min de leitura</span>
                          {post.review?.suggestedTags?.[0] && (
                            <>
                              <span>•</span>
                              <span className={'text-accent-ink'}>
                                #{post.review.suggestedTags[0]}
                              </span>
                            </>
                          )}
                        </div>

                        <h4 className={`font-serif font-bold text-xl sm:text-2xl transition-colors ${
                          'text-ink group-hover:text-accent-ink'
                        }`}>
                          {post.review?.revisedTitle || post.draft?.title}
                        </h4>

                        <p className={`text-xs sm:text-sm font-serif italic line-clamp-2 leading-relaxed ${
                          isDark ? 'text-ink-faint' : 'text-ink-muted'
                        }`}>
                          {post.review?.revisedSubtitle || post.review?.metaDescription}
                        </p>

                        <div className="pt-2 flex items-center space-x-1 text-xs font-bold text-accent-ink">
                          <span className={'text-accent-ink'}>Continuar leitura</span>
                          <span className={`group-hover:translate-x-1 transition-transform text-accent-ink`}>→</span>
                        </div>
                      </div>

                      {post.image?.imageUrl && (
                        <div className="w-full sm:w-36 h-28 rounded-control overflow-hidden bg-surface shrink-0">
                          <img
                            src={post.image.imageUrl}
                            alt={post.review?.revisedTitle || 'Thumb'}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </section>
          )}
        </main>
      )}

      {/* Export / Webhook Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-canvas/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className={`rounded-panel max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border max-h-[90vh] overflow-y-auto ${
            isDark ? 'bg-[#18191e] border-line text-ink' : 'bg-surface border-line text-ink'
          }`}>
            <div className={`flex items-center justify-between pb-4 border-b border-line`}>
              <div className={`flex items-center space-x-2 font-serif font-bold text-xl text-accent-ink`}>
                <Code2 className="w-5 h-5" />
                <h3>Exportar ou Integrar com Site Externo</h3>
              </div>
              <button
                onClick={() => {
                  setShowExportModal(null);
                  setWebhookSimulated(false);
                }}
                className="text-ink-faint hover:text-ink text-sm font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs sm:text-sm text-ink-faint leading-relaxed">
              Você pode publicar este ensaio diretamente no seu site próprio (WordPress, Ghost, Webflow ou plataforma customizada) exportando em JSON, Markdown ou disparando um Webhook.
            </p>

            {/* Webhook Test Simulation */}
            <div className="bg-canvas text-ink rounded-panel p-5 space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between text-accent-ink font-bold">
                <span>POST /api/webhooks/publish-article</span>
                <span className="text-[10px] bg-accent text-accent-ink px-2 py-0.5 rounded border border-accent/40">
                  PAYLOAD PRONTO
                </span>
              </div>

              <pre className="bg-surface p-3 rounded-control overflow-x-auto text-accent-ink text-[11px] leading-relaxed max-h-48">
{JSON.stringify(
  {
    title: showExportModal.review?.revisedTitle,
    subtitle: showExportModal.review?.revisedSubtitle,
    slug: showExportModal.review?.revisedTitle?.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    author: manifesto.authorName || 'Autor',
    content_markdown: showExportModal.review?.revisedText?.slice(0, 150) + '...',
    cover_image_url: showExportModal.image?.imageUrl || null,
    tags: showExportModal.review?.suggestedTags,
    published_at: showExportModal.createdAt,
  },
  null,
  2
)}
              </pre>

              <button
                onClick={() => setWebhookSimulated(true)}
                className="w-full bg-accent hover:bg-accent text-canvas font-sans font-bold py-2.5 rounded-control text-xs transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 text-accent-ink" />
                <span>Simular Disparo de Webhook para WordPress / Ghost</span>
              </button>

              {webhookSimulated && (
                <div className="bg-accent border border-accent/40 text-accent-ink p-3 rounded-control flex items-center space-x-2 font-sans text-xs">
                  <Check className="w-4 h-4 text-accent-ink shrink-0" />
                  <span><strong>Sucesso (200 OK)!</strong> Webhook disparado com sucesso. O artigo foi recebido pelo endpoint externo.</span>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => {
                  setShowExportModal(null);
                  setWebhookSimulated(false);
                }}
                className="bg-surface-raised hover:bg-surface text-ink font-bold px-5 py-2.5 rounded-control text-xs transition-all cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

