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
      isDark ? 'bg-[#101114] text-stone-100' : 'bg-[#fcfbf8] text-stone-900'
    }`}>
      {/* Top Banner & Control Bar */}
      <div className={`sticky top-0 z-50 border-b backdrop-blur-md transition-colors ${
        isDark ? 'bg-[#16171c]/90 border-stone-800/80 text-stone-200' : 'bg-white/90 border-stone-200/80 text-stone-800'
      }`}>
        <div className="max-w-7xl mx-auto py-2.5 px-4 sm:px-6 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className={`font-bold uppercase tracking-wider text-[11px] ${isDark ? 'text-amber-300' : 'text-teal-800'}`}>
              Portal do Leitor
            </span>
            <span className="text-stone-400 hidden sm:inline">• Visualização Minimalista & Elegante</span>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Theme Toggle Button */}
            <button
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className={`p-1.5 rounded-lg border flex items-center space-x-1.5 font-medium transition-all cursor-pointer ${
                isDark
                  ? 'bg-stone-800 text-amber-300 border-stone-700 hover:bg-stone-700'
                  : 'bg-stone-100 text-stone-800 border-stone-200 hover:bg-stone-200'
              }`}
              title={isDark ? 'Mudar para Modo Claro Minimalista' : 'Mudar para Modo Escuro Noturno'}
            >
              {isDark ? <Sun className="w-3.5 h-3.5 text-amber-300" /> : <Moon className="w-3.5 h-3.5 text-indigo-900" />}
              <span className="hidden md:inline text-[11px] font-semibold">
                {isDark ? 'Modo Claro' : 'Modo Escuro'}
              </span>
            </button>

            {/* Layout Toggle */}
            <div className={`flex items-center rounded-lg border p-0.5 ${
              isDark ? 'bg-stone-900 border-stone-800' : 'bg-stone-100 border-stone-200'
            }`}>
              <button
                onClick={() => setLayoutMode('grid')}
                className={`p-1 rounded-md transition-all cursor-pointer ${
                  layoutMode === 'grid'
                    ? isDark ? 'bg-stone-800 text-amber-300' : 'bg-white text-teal-900 shadow-xs'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
                title="Visualização em Grade"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setLayoutMode('list')}
                className={`p-1 rounded-md transition-all cursor-pointer ${
                  layoutMode === 'list'
                    ? isDark ? 'bg-stone-800 text-amber-300' : 'bg-white text-teal-900 shadow-xs'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
                title="Visualização em Lista Minimalista"
              >
                <ListFilter className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Back to Studio */}
            <button
              onClick={onBackToStudio}
              className="bg-teal-800 hover:bg-teal-700 text-white font-bold px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1 cursor-pointer text-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Studio</span>
            </button>
          </div>
        </div>
      </div>

      {/* Reader Mode Header / Minimalist Masthead */}
      <header className={`py-12 px-4 sm:px-6 lg:px-8 border-b transition-colors ${
        isDark ? 'bg-[#14151a] border-stone-800/80' : 'bg-white border-stone-200/80'
      }`}>
        <div className="max-w-4xl mx-auto space-y-5 text-center">
          <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest border ${
            isDark ? 'bg-stone-900 text-amber-300 border-stone-800' : 'bg-stone-100 text-teal-900 border-stone-200'
          }`}>
            <Globe className="w-3.5 h-3.5" />
            <span>Cadernos Ensaísticos de Psicologia</span>
          </div>

          <h1 className={`font-serif text-3xl sm:text-5xl font-bold tracking-tight leading-tight ${
            isDark ? 'text-stone-100' : 'text-stone-950'
          }`}>
            {manifesto.authorName ? `Cadernos de ${manifesto.authorName}` : 'Cadernos de Psicologia & Subjetividade'}
          </h1>

          <p className={`text-base sm:text-lg max-w-2xl mx-auto font-serif italic leading-relaxed ${
            isDark ? 'text-stone-400' : 'text-stone-600'
          }`}>
            "{manifesto.worldviewDescription?.slice(0, 180) || 'Ensaios e reflexões sobre a clínica, os afetos, as contradições contemporâneas e a busca por sentido.'}..."
          </p>

          <div className={`pt-2 flex flex-wrap items-center justify-center gap-4 text-xs ${
            isDark ? 'text-stone-500' : 'text-stone-500'
          }`}>
            <span className="flex items-center space-x-1">
              <User className={`w-3.5 h-3.5 ${isDark ? 'text-amber-300' : 'text-teal-800'}`} />
              <span>Por <strong>{manifesto.authorName || 'Profissional da Saúde Mental'}</strong></span>
            </span>
            <span>•</span>
            <span className="flex items-center space-x-1">
              <BookOpen className={`w-3.5 h-3.5 ${isDark ? 'text-teal-400' : 'text-indigo-600'}`} />
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
            className={`inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
              isDark
                ? 'bg-stone-900 text-stone-200 border-stone-800 hover:bg-stone-800'
                : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100 shadow-2xs'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar aos Ensaios</span>
          </button>

          {/* Article Reading Canvas */}
          <article className={`rounded-3xl p-6 sm:p-12 border transition-colors space-y-8 ${
            isDark ? 'bg-[#18191e] border-stone-800' : 'bg-white border-stone-200/80 shadow-xs'
          }`}>
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-stone-400">
                <span className={`font-bold px-2.5 py-0.5 rounded-full border text-[11px] ${
                  isDark
                    ? 'bg-teal-950 text-teal-300 border-teal-800'
                    : 'bg-teal-50 text-teal-900 border-teal-200'
                }`}>
                  Ensaio
                </span>
                <span>•</span>
                <span className="flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5 text-stone-400" />
                  <span>{formatDate(selectedPost.createdAt)}</span>
                </span>
                <span>•</span>
                <span className="flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-stone-400" />
                  <span>{selectedPost.review?.readingTimeMinutes || 5} min de leitura</span>
                </span>
              </div>

              <h1 className={`font-serif text-3xl sm:text-4xl font-bold leading-tight ${
                isDark ? 'text-stone-100' : 'text-stone-950'
              }`}>
                {selectedPost.review?.revisedTitle || selectedPost.draft?.title}
              </h1>

              {selectedPost.review?.revisedSubtitle && (
                <p className={`text-lg sm:text-xl font-serif italic leading-relaxed ${
                  isDark ? 'text-stone-300' : 'text-stone-600'
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
                        ? 'bg-stone-900 text-stone-300 border-stone-800'
                        : 'bg-stone-100 text-stone-700 border-stone-200'
                    }`}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Cover Image */}
            {selectedPost.image?.imageUrl && (
              <div className={`rounded-2xl overflow-hidden border ${
                isDark ? 'border-stone-800 bg-stone-900' : 'border-stone-200 bg-stone-100'
              }`}>
                <img
                  src={selectedPost.image.imageUrl}
                  alt={selectedPost.review?.revisedTitle || 'Capa do artigo'}
                  className="w-full max-h-[480px] object-cover"
                />
                {selectedPost.image.promptUsed && (
                  <div className={`p-3 text-[11px] italic flex items-center justify-between border-t ${
                    isDark ? 'bg-stone-900/80 border-stone-800 text-stone-400' : 'bg-stone-50 border-stone-200 text-stone-500'
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
                ? 'prose-invert prose-p:text-stone-200 prose-p:leading-relaxed prose-p:text-base sm:prose-p:text-lg prose-headings:font-serif prose-headings:text-stone-100 prose-blockquote:border-amber-400 prose-blockquote:text-stone-300 border-stone-800/80'
                : 'prose-stone prose-p:text-stone-800 prose-p:leading-relaxed prose-p:text-base sm:prose-p:text-lg prose-headings:font-serif prose-headings:text-stone-900 prose-blockquote:border-teal-800 prose-blockquote:text-stone-700 border-stone-100'
            }`}>
              <Markdown>
                {selectedPost.review?.revisedText || selectedPost.draft?.rawText || ''}
              </Markdown>
            </div>

            {/* Key Takeaways */}
            {selectedPost.review?.keyTakeaways && selectedPost.review.keyTakeaways.length > 0 && (
              <div className={`rounded-2xl p-6 space-y-3 border ${
                isDark
                  ? 'bg-stone-900/90 border-teal-800/60 text-stone-200'
                  : 'bg-teal-50/60 border-teal-200 text-teal-950'
              }`}>
                <h3 className={`font-serif font-bold text-base flex items-center space-x-2 ${
                  isDark ? 'text-teal-300' : 'text-teal-950'
                }`}>
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Síntese Reflexiva para a Vida Cotidiana:</span>
                </h3>
                <ul className="space-y-2 text-xs sm:text-sm">
                  {selectedPost.review.keyTakeaways.map((takeaway, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <span className={isDark ? 'text-teal-400 font-bold' : 'text-teal-700 font-bold'}>•</span>
                      <span>{takeaway}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Author Footer Bio */}
            <div className={`rounded-2xl p-6 sm:p-8 space-y-4 border ${
              isDark
                ? 'bg-stone-950 border-stone-800 text-stone-200'
                : 'bg-stone-900 text-stone-100 border-stone-800'
            }`}>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-teal-800 border-2 border-amber-300 flex items-center justify-center font-bold text-amber-300 font-serif text-xl shrink-0">
                  {(manifesto.authorName || 'P')[0]}
                </div>
                <div>
                  <h4 className="font-serif font-bold text-lg text-white">{manifesto.authorName || 'Profissional da Saúde Mental'}</h4>
                  <p className="text-xs text-stone-400">Escrito com fundamentação clínica, ética e profundidade autoral.</p>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-serif italic">
                "{manifesto.worldviewDescription || 'A clínica psicológica como espaço de escuta sem julgamentos e resgate da potência de agir.'}"
              </p>
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-stone-800">
                <button
                  onClick={() => handleShare(selectedPost.review?.revisedTitle || '')}
                  className="bg-stone-800 hover:bg-stone-700 text-stone-200 px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-amber-300" />}
                  <span>{copiedLink ? 'Link Copiado!' : 'Compartilhar Ensaio'}</span>
                </button>

                <button
                  onClick={() => setShowExportModal(selectedPost)}
                  className="bg-teal-700 hover:bg-teal-600 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer"
                >
                  <Code2 className="w-3.5 h-3.5 text-amber-300" />
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
          <div className={`rounded-2xl p-4 sm:p-6 border transition-colors space-y-4 ${
            isDark ? 'bg-[#18191e] border-stone-800/80' : 'bg-white border-stone-200/80 shadow-xs'
          }`}>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              {/* Search Bar */}
              <div className="relative w-full sm:w-96">
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Buscar por temas, ansiedade, luto, clínica..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs focus:outline-none focus:ring-2 font-medium border transition-colors ${
                    isDark
                      ? 'bg-stone-900 border-stone-800 text-stone-100 focus:ring-amber-400'
                      : 'bg-stone-50 border-stone-200 text-stone-900 focus:ring-teal-500'
                  }`}
                />
              </div>

              {/* Counter & Mode Badge */}
              <div className="flex items-center space-x-3 self-end sm:self-auto text-xs text-stone-400 font-medium">
                <span>{filteredPosts.length} ensaio(s)</span>
              </div>
            </div>

            {/* Category Tags */}
            {allCategories.length > 1 && (
              <div className={`flex flex-wrap gap-1.5 pt-2 border-t ${isDark ? 'border-stone-800/60' : 'border-stone-100'}`}>
                {allCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                      selectedCategory === cat
                        ? isDark
                          ? 'bg-amber-400 text-stone-950 font-bold shadow-xs'
                          : 'bg-teal-900 text-white font-bold shadow-xs'
                        : isDark
                          ? 'bg-stone-900 text-stone-300 hover:bg-stone-800'
                          : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
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
            <div className={`rounded-3xl p-12 text-center border space-y-4 max-w-xl mx-auto ${
              isDark ? 'bg-[#18191e] border-stone-800' : 'bg-white border-stone-200'
            }`}>
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto border ${
                isDark ? 'bg-stone-900 text-amber-300 border-stone-800' : 'bg-teal-50 text-teal-800 border-teal-200'
              }`}>
                <BookOpen className="w-8 h-8" />
              </div>
              <h3 className={`font-serif font-bold text-2xl ${isDark ? 'text-stone-100' : 'text-stone-900'}`}>
                Nenhum Ensaio Publicado Ainda
              </h3>
              <p className="text-stone-400 text-sm leading-relaxed">
                Você pode gerar seu primeiro artigo na aba <strong>Criar Artigo</strong> com sua equipe virtual e salvá-lo para aparecer aqui!
              </p>
              <button
                onClick={onBackToStudio}
                className="bg-teal-800 hover:bg-teal-700 text-white font-bold px-6 py-3 rounded-2xl text-xs transition-all shadow-md cursor-pointer inline-flex items-center space-x-2"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Criar Meu Primeiro Ensaio Agora</span>
              </button>
            </div>
          )}

          {/* Featured Article */}
          {featuredPost && (
            <section className="space-y-3">
              <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-teal-800">
                <Sparkles className={`w-4 h-4 ${isDark ? 'text-amber-400' : 'text-amber-500'}`} />
                <span className={isDark ? 'text-amber-300' : 'text-teal-900'}>Ensaio em Destaque</span>
              </div>

              <div
                onClick={() => setSelectedPost(featuredPost)}
                className={`rounded-3xl border overflow-hidden grid grid-cols-1 md:grid-cols-12 transition-all cursor-pointer group hover:border-teal-500/50 ${
                  isDark ? 'bg-[#18191e] border-stone-800/80 shadow-lg' : 'bg-white border-stone-200/80 shadow-xs hover:shadow-md'
                }`}
              >
                {/* Image */}
                <div className="md:col-span-6 min-h-[260px] sm:min-h-[340px] relative overflow-hidden bg-stone-900">
                  {featuredPost.image?.imageUrl ? (
                    <img
                      src={featuredPost.image.imageUrl}
                      alt={featuredPost.review?.revisedTitle || 'Imagem de destaque'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-teal-900 text-teal-200 p-8 text-center font-serif">
                      <span>"{featuredPost.review?.revisedTitle}"</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="md:col-span-6 p-6 sm:p-8 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-xs text-stone-400 font-medium">
                      <span className={`font-bold px-2.5 py-0.5 rounded-full text-[10px] ${
                        isDark ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30' : 'bg-teal-100 text-teal-900'
                      }`}>
                        Destaque
                      </span>
                      <span>•</span>
                      <span>{formatDate(featuredPost.createdAt)}</span>
                      <span>•</span>
                      <span>{featuredPost.review?.readingTimeMinutes || 5} min</span>
                    </div>

                    <h2 className={`font-serif text-2xl sm:text-3xl font-bold transition-colors leading-tight ${
                      isDark ? 'text-stone-100 group-hover:text-amber-300' : 'text-stone-950 group-hover:text-teal-900'
                    }`}>
                      {featuredPost.review?.revisedTitle || featuredPost.draft?.title}
                    </h2>

                    <p className={`text-sm font-serif italic line-clamp-3 leading-relaxed ${
                      isDark ? 'text-stone-400' : 'text-stone-600'
                    }`}>
                      {featuredPost.review?.revisedSubtitle || featuredPost.review?.metaDescription}
                    </p>
                  </div>

                  <div className={`pt-4 border-t flex items-center justify-between ${
                    isDark ? 'border-stone-800' : 'border-stone-100'
                  }`}>
                    <div className="flex flex-wrap gap-1">
                      {featuredPost.review?.suggestedTags?.slice(0, 3).map((t) => (
                        <span
                          key={t}
                          className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                            isDark ? 'bg-stone-900 text-stone-400' : 'bg-stone-100 text-stone-600'
                          }`}
                        >
                          #{t}
                        </span>
                      ))}
                    </div>

                    <span className={`text-xs font-bold flex items-center space-x-1 group-hover:translate-x-1 transition-transform ${
                      isDark ? 'text-amber-300' : 'text-teal-900'
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
              <h3 className={`font-serif font-bold text-xl ${isDark ? 'text-stone-100' : 'text-stone-900'}`}>
                Outros Ensaios Publicados
              </h3>

              {layoutMode === 'grid' ? (
                /* Grid View */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {regularPosts.map((post) => (
                    <div
                      key={post.id}
                      onClick={() => setSelectedPost(post)}
                      className={`rounded-2xl border overflow-hidden flex flex-col justify-between transition-all cursor-pointer group ${
                        isDark
                          ? 'bg-[#18191e] border-stone-800/80 hover:border-stone-700'
                          : 'bg-white border-stone-200/80 shadow-2xs hover:shadow-md'
                      }`}
                    >
                      <div className="space-y-3">
                        {/* Thumbnail Image */}
                        {post.image?.imageUrl && (
                          <div className="h-44 bg-stone-900 overflow-hidden">
                            <img
                              src={post.image.imageUrl}
                              alt={post.review?.revisedTitle || 'Imagem do post'}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          </div>
                        )}

                        <div className="p-5 space-y-2">
                          <div className="flex items-center space-x-2 text-[11px] text-stone-400 font-medium">
                            <span>{formatDate(post.createdAt)}</span>
                            <span>•</span>
                            <span>{post.review?.readingTimeMinutes || 5} min</span>
                          </div>

                          <h4 className={`font-serif font-bold text-lg line-clamp-2 leading-snug transition-colors ${
                            isDark ? 'text-stone-100 group-hover:text-amber-300' : 'text-stone-950 group-hover:text-teal-900'
                          }`}>
                            {post.review?.revisedTitle || post.draft?.title}
                          </h4>

                          <p className={`text-xs font-serif italic line-clamp-2 leading-relaxed ${
                            isDark ? 'text-stone-400' : 'text-stone-600'
                          }`}>
                            {post.review?.revisedSubtitle || post.review?.metaDescription}
                          </p>
                        </div>
                      </div>

                      <div className={`p-5 pt-0 flex items-center justify-between border-t mt-2 ${
                        isDark ? 'border-stone-800/80' : 'border-stone-100'
                      }`}>
                        <span className="text-[11px] text-stone-400 font-medium">
                          #{post.review?.suggestedTags?.[0] || 'Ensaio'}
                        </span>
                        <span className={`text-xs font-bold flex items-center space-x-1 group-hover:translate-x-1 transition-transform ${
                          isDark ? 'text-amber-300' : 'text-teal-900'
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
                      className={`rounded-2xl p-6 border transition-all cursor-pointer group flex flex-col sm:flex-row items-start justify-between gap-6 ${
                        isDark
                          ? 'bg-[#18191e] border-stone-800/80 hover:border-stone-700'
                          : 'bg-white border-stone-200/80 shadow-2xs hover:shadow-xs'
                      }`}
                    >
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center space-x-2 text-[11px] text-stone-400 font-medium">
                          <span>{formatDate(post.createdAt)}</span>
                          <span>•</span>
                          <span>{post.review?.readingTimeMinutes || 5} min de leitura</span>
                          {post.review?.suggestedTags?.[0] && (
                            <>
                              <span>•</span>
                              <span className={isDark ? 'text-amber-300' : 'text-teal-800'}>
                                #{post.review.suggestedTags[0]}
                              </span>
                            </>
                          )}
                        </div>

                        <h4 className={`font-serif font-bold text-xl sm:text-2xl transition-colors ${
                          isDark ? 'text-stone-100 group-hover:text-amber-300' : 'text-stone-950 group-hover:text-teal-900'
                        }`}>
                          {post.review?.revisedTitle || post.draft?.title}
                        </h4>

                        <p className={`text-xs sm:text-sm font-serif italic line-clamp-2 leading-relaxed ${
                          isDark ? 'text-stone-400' : 'text-stone-600'
                        }`}>
                          {post.review?.revisedSubtitle || post.review?.metaDescription}
                        </p>

                        <div className="pt-2 flex items-center space-x-1 text-xs font-bold text-teal-800">
                          <span className={isDark ? 'text-amber-300' : 'text-teal-900'}>Continuar leitura</span>
                          <span className={`group-hover:translate-x-1 transition-transform ${isDark ? 'text-amber-300' : 'text-teal-900'}`}>→</span>
                        </div>
                      </div>

                      {post.image?.imageUrl && (
                        <div className="w-full sm:w-36 h-28 rounded-xl overflow-hidden bg-stone-900 shrink-0">
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
        <div className="fixed inset-0 bg-stone-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className={`rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border max-h-[90vh] overflow-y-auto ${
            isDark ? 'bg-[#18191e] border-stone-800 text-stone-100' : 'bg-white border-stone-200 text-stone-900'
          }`}>
            <div className={`flex items-center justify-between pb-4 border-b ${isDark ? 'border-stone-800' : 'border-stone-100'}`}>
              <div className={`flex items-center space-x-2 font-serif font-bold text-xl ${isDark ? 'text-amber-300' : 'text-teal-950'}`}>
                <Code2 className="w-5 h-5" />
                <h3>Exportar ou Integrar com Site Externo</h3>
              </div>
              <button
                onClick={() => {
                  setShowExportModal(null);
                  setWebhookSimulated(false);
                }}
                className="text-stone-400 hover:text-stone-200 text-sm font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs sm:text-sm text-stone-400 leading-relaxed">
              Você pode publicar este ensaio diretamente no seu site próprio (WordPress, Ghost, Webflow ou plataforma customizada) exportando em JSON, Markdown ou disparando um Webhook.
            </p>

            {/* Webhook Test Simulation */}
            <div className="bg-stone-950 text-stone-100 rounded-2xl p-5 space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between text-teal-400 font-bold">
                <span>POST /api/webhooks/publish-article</span>
                <span className="text-[10px] bg-teal-950 text-teal-300 px-2 py-0.5 rounded border border-teal-800">
                  PAYLOAD PRONTO
                </span>
              </div>

              <pre className="bg-stone-900 p-3 rounded-xl overflow-x-auto text-amber-200 text-[11px] leading-relaxed max-h-48">
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
                className="w-full bg-teal-800 hover:bg-teal-700 text-white font-sans font-bold py-2.5 rounded-xl text-xs transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 text-amber-300" />
                <span>Simular Disparo de Webhook para WordPress / Ghost</span>
              </button>

              {webhookSimulated && (
                <div className="bg-emerald-950 border border-emerald-800 text-emerald-300 p-3 rounded-xl flex items-center space-x-2 font-sans text-xs">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
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
                className="bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold px-5 py-2.5 rounded-xl text-xs transition-all cursor-pointer"
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

