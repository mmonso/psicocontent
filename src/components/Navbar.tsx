import React from 'react';
import { PenTool, Heart, BookOpen, Users, Brain, Globe, Sun, Moon } from 'lucide-react';

interface NavbarProps {
  activeTab: 'create' | 'manifesto' | 'history' | 'team' | 'blog';
  setActiveTab: (tab: 'create' | 'manifesto' | 'history' | 'team' | 'blog') => void;
  savedCount: number;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  savedCount,
  theme,
  onToggleTheme,
}) => {
  const isDark = theme === 'dark';

  return (
    <>
      {/* Top Header */}
      <header className={`sticky top-0 z-40 transition-colors duration-300 border-b backdrop-blur-md shadow-xs ${
        isDark ? 'bg-[#141519]/95 border-stone-800/80 text-stone-100' : 'bg-white/95 border-stone-200/80 text-stone-900'
      }`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            
            {/* Logo & Branding */}
            <div className="flex items-center space-x-2.5 cursor-pointer" onClick={() => setActiveTab('create')}>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-teal-700 to-emerald-800 flex items-center justify-center text-white shadow-md shadow-teal-900/20 shrink-0">
                <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300" />
              </div>
              <div className="flex flex-col justify-center">
                <div className="flex items-center space-x-1.5">
                  <span className={`font-serif font-bold text-lg sm:text-xl tracking-tight leading-tight ${
                    isDark ? 'text-stone-100' : 'text-stone-900'
                  }`}>
                    PsicoContent
                  </span>
                  <span className="bg-teal-800 text-amber-300 text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">Studio</span>
                </div>
                <div className={`flex items-center space-x-2 text-[10px] hidden md:flex ${
                  isDark ? 'text-stone-400' : 'text-stone-500'
                }`}>
                  <span>Visão de Mundo • Artigos & Imagens</span>
                  <span className={`font-medium px-1.5 py-0.2 rounded-md flex items-center space-x-1 border ${
                    isDark ? 'bg-stone-900 text-emerald-400 border-emerald-900/50' : 'bg-emerald-50 text-emerald-800 border-emerald-200/60'
                  }`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Salvamento Automático</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Desktop / Tablet Navigation Links */}
            <nav className="hidden md:flex items-center space-x-1 sm:space-x-2">
              <button
                onClick={() => setActiveTab('create')}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer min-h-[40px] ${
                  activeTab === 'create'
                    ? 'bg-teal-800 text-white shadow-md font-semibold'
                    : isDark ? 'text-stone-300 hover:text-stone-100 hover:bg-stone-800' : 'text-stone-700 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                <PenTool className="w-4 h-4 text-amber-300" />
                <span>Criar Artigo</span>
              </button>

              <button
                onClick={() => setActiveTab('manifesto')}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer min-h-[40px] ${
                  activeTab === 'manifesto'
                    ? 'bg-teal-800 text-white shadow-md font-semibold'
                    : isDark ? 'text-stone-300 hover:text-stone-100 hover:bg-stone-800' : 'text-stone-700 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                <Heart className="w-4 h-4 text-rose-400" />
                <span>Minha Visão</span>
              </button>

              <button
                onClick={() => setActiveTab('history')}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all relative cursor-pointer min-h-[40px] ${
                  activeTab === 'history'
                    ? 'bg-teal-800 text-white shadow-md font-semibold'
                    : isDark ? 'text-stone-300 hover:text-stone-100 hover:bg-stone-800' : 'text-stone-700 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                <BookOpen className="w-4 h-4 text-indigo-400" />
                <span>Histórico</span>
                {savedCount > 0 && (
                  <span className="ml-1 bg-amber-400 text-stone-900 text-xs font-bold px-1.5 py-0.2 rounded-full">
                    {savedCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('team')}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer min-h-[40px] ${
                  activeTab === 'team'
                    ? 'bg-teal-800 text-white shadow-md font-semibold'
                    : isDark ? 'text-stone-300 hover:text-stone-100 hover:bg-stone-800' : 'text-stone-700 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                <Users className="w-4 h-4 text-teal-300" />
                <span>Equipe</span>
              </button>

              <button
                onClick={() => setActiveTab('blog')}
                className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer min-h-[40px] ${
                  activeTab === 'blog'
                    ? 'bg-amber-400 text-stone-950 shadow-md'
                    : isDark ? 'bg-stone-800 text-amber-300 hover:bg-stone-700' : 'bg-stone-900 text-stone-100 hover:bg-stone-800'
                }`}
              >
                <Globe className="w-4 h-4 text-teal-300" />
                <span>Portal Público</span>
                <span className="bg-emerald-500 text-stone-950 text-[9px] font-extrabold px-1.5 py-0.2 rounded-full uppercase">
                  Ao Vivo
                </span>
              </button>

              {/* Theme Switcher Button */}
              <button
                onClick={onToggleTheme}
                className={`ml-2 p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
                  isDark
                    ? 'bg-stone-800 text-amber-300 border-stone-700 hover:bg-stone-700'
                    : 'bg-stone-100 text-stone-800 border-stone-200 hover:bg-stone-200'
                }`}
                title={isDark ? 'Alternar para Modo Claro Minimalista' : 'Alternar para Modo Escuro Noturno'}
              >
                {isDark ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-indigo-900" />}
              </button>
            </nav>

            {/* Mobile Header Right Controls */}
            <div className="flex md:hidden items-center space-x-2">
              <button
                onClick={onToggleTheme}
                className={`p-1.5 rounded-lg border transition-all ${
                  isDark ? 'bg-stone-800 text-amber-300 border-stone-700' : 'bg-stone-100 text-stone-800 border-stone-200'
                }`}
              >
                {isDark ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-indigo-900" />}
              </button>

              <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${
                isDark ? 'bg-stone-800 text-stone-200 border-stone-700' : 'bg-stone-100 text-stone-700 border-stone-200'
              }`}>
                {activeTab === 'create' && '✍️ Criar'}
                {activeTab === 'manifesto' && '🤍 Visão'}
                {activeTab === 'history' && `📚 Histórico (${savedCount})`}
                {activeTab === 'team' && '👥 Equipe'}
                {activeTab === 'blog' && '🌐 Portal'}
              </span>
            </div>

          </div>
        </div>
      </header>

      {/* Mobile Fixed Bottom Navigation Bar */}
      <nav className={`md:hidden fixed bottom-0 left-0 right-0 border-t z-50 px-2 py-1.5 flex items-center justify-around transition-colors duration-300 ${
        isDark ? 'bg-[#141519]/95 backdrop-blur-md border-stone-800 text-stone-200 shadow-xl' : 'bg-white/95 backdrop-blur-md border-stone-200 text-stone-700 shadow-lg'
      }`}>
        <button
          onClick={() => setActiveTab('create')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl min-w-[56px] min-h-[48px] transition-all cursor-pointer ${
            activeTab === 'create'
              ? isDark ? 'text-amber-300 font-bold bg-stone-800' : 'text-teal-800 font-bold bg-teal-50'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <PenTool className={`w-5 h-5 ${activeTab === 'create' ? 'text-amber-400 scale-110' : ''}`} />
          <span className="text-[10px] mt-0.5 tracking-tight">Criar</span>
        </button>

        <button
          onClick={() => setActiveTab('manifesto')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl min-w-[56px] min-h-[48px] transition-all cursor-pointer ${
            activeTab === 'manifesto'
              ? isDark ? 'text-amber-300 font-bold bg-stone-800' : 'text-teal-800 font-bold bg-teal-50'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Heart className={`w-5 h-5 ${activeTab === 'manifesto' ? 'text-rose-400 scale-110' : ''}`} />
          <span className="text-[10px] mt-0.5 tracking-tight">Visão</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl min-w-[56px] min-h-[48px] transition-all relative cursor-pointer ${
            activeTab === 'history'
              ? isDark ? 'text-amber-300 font-bold bg-stone-800' : 'text-teal-800 font-bold bg-teal-50'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <div className="relative">
            <BookOpen className={`w-5 h-5 ${activeTab === 'history' ? 'text-indigo-400 scale-110' : ''}`} />
            {savedCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-amber-500 text-stone-950 text-[9px] font-extrabold px-1 rounded-full min-w-[14px] text-center">
                {savedCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">Histórico</span>
        </button>

        <button
          onClick={() => setActiveTab('team')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl min-w-[56px] min-h-[48px] transition-all cursor-pointer ${
            activeTab === 'team'
              ? isDark ? 'text-amber-300 font-bold bg-stone-800' : 'text-teal-800 font-bold bg-teal-50'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Users className={`w-5 h-5 ${activeTab === 'team' ? 'text-teal-400 scale-110' : ''}`} />
          <span className="text-[10px] mt-0.5 tracking-tight">Equipe</span>
        </button>

        <button
          onClick={() => setActiveTab('blog')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl min-w-[56px] min-h-[48px] transition-all cursor-pointer ${
            activeTab === 'blog'
              ? 'text-stone-950 font-bold bg-amber-400'
              : 'text-teal-400 font-medium hover:text-teal-300'
          }`}
        >
          <Globe className={`w-5 h-5 ${activeTab === 'blog' ? 'text-stone-900 scale-110' : ''}`} />
          <span className="text-[10px] mt-0.5 tracking-tight font-bold">Portal</span>
        </button>
      </nav>
    </>
  );
};


