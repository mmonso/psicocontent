import React, { useState } from 'react';
import { UserManifesto } from '../types';
import { DEFAULT_USER_MANIFESTO } from '../lib/storage';
import {
  Heart,
  Save,
  CheckCircle2,
  Sparkles,
  User,
  MessageSquare,
  ShieldCheck,
  AlertTriangle,
  Lightbulb,
  Tag,
  BookOpen,
  RotateCcw,
} from 'lucide-react';

interface ManifestoEditorProps {
  manifesto: UserManifesto;
  onSave: (updated: UserManifesto) => void;
}

export const ManifestoEditor: React.FC<ManifestoEditorProps> = ({ manifesto, onSave }) => {
  const [formData, setFormData] = useState<UserManifesto>(manifesto);
  const [newKeyword, setNewKeyword] = useState('');
  const [newProhibited, setNewProhibited] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const addCategory = () => {
    if (!newCategory.trim()) return;
    setFormData((prev) => ({
      ...prev,
      themeCategories: [...(prev.themeCategories || []), newCategory.trim()],
    }));
    setNewCategory('');
  };

  const removeCategory = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      themeCategories: (prev.themeCategories || []).filter((_, i) => i !== idx),
    }));
  };

  const addKeyword = () => {
    if (!newKeyword.trim()) return;
    setFormData((prev) => ({
      ...prev,
      favoriteKeywords: [...prev.favoriteKeywords, newKeyword.trim()],
    }));
    setNewKeyword('');
  };

  const removeKeyword = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      favoriteKeywords: prev.favoriteKeywords.filter((_, i) => i !== idx),
    }));
  };

  const addProhibited = () => {
    if (!newProhibited.trim()) return;
    setFormData((prev) => ({
      ...prev,
      prohibitedTerms: [...prev.prohibitedTerms, newProhibited.trim()],
    }));
    setNewProhibited('');
  };

  const removeProhibited = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      prohibitedTerms: prev.prohibitedTerms.filter((_, i) => i !== idx),
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8 py-4">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-teal-900 via-stone-900 to-teal-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-teal-800/40 space-y-3 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Heart className="w-64 h-64 text-teal-300" />
        </div>

        <div className="flex items-center space-x-2 text-teal-300 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
          <span>Sua Identidade & Estilo Único</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white">
          Sua Visão de Mundo & Tom de Voz
        </h1>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-teal-800/60">
          <p className="text-xs sm:text-sm text-stone-300 max-w-xl leading-relaxed">
            Sua equipe virtual (Redator, Revisor e Designer) consultará este manifesto em <strong>cada artigo gerado</strong>.
          </p>
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Deseja carregar a Identidade Clínica e Intelectual padrão completa (fenomenologia, Gestalt, Espinosa, ensaística em 1ª pessoa)?')) {
                setFormData(DEFAULT_USER_MANIFESTO);
              }
            }}
            className="px-3.5 py-1.5 bg-teal-800/80 hover:bg-teal-700 text-teal-100 text-xs font-semibold rounded-xl border border-teal-600/50 flex items-center space-x-1.5 transition-all cursor-pointer shadow-2xs"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-300" />
            <span>Carregar Manifesto Clínico Completo</span>
          </button>
        </div>

        {savedSuccess && (
          <div className="bg-emerald-500/20 border border-emerald-400/50 text-emerald-200 text-xs sm:text-sm font-semibold p-3 rounded-2xl flex items-center space-x-2 animate-fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
            <span>Sua visão de mundo foi salva com sucesso! Os próximos artigos usarão este estilo.</span>
          </div>
        )}
      </div>

      {/* SECTION 1: PERFIL DO AUTOR */}
      <div className="bg-white dark:bg-[#18191e] rounded-3xl p-6 sm:p-8 border border-stone-200 dark:border-stone-800 shadow-sm space-y-6 transition-colors">
        <div className="flex items-center space-x-2 text-stone-900 dark:text-stone-100 font-bold text-lg border-b border-stone-100 dark:border-stone-800 pb-3">
          <User className="w-5 h-5 text-teal-700 dark:text-teal-400" />
          <h2>1. Quem é Você</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1.5">
              Seu Nome / Assinatura
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Dra. Juliana Silveira"
              value={formData.authorName}
              onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
              className="w-full px-4 py-2.5 bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 text-sm font-medium focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1.5">
              Título Profissional
            </label>
            <input
              type="text"
              placeholder="Ex: Psicóloga Clínica • CRP 06/12345"
              value={formData.professionalTitle}
              onChange={(e) => setFormData({ ...formData, professionalTitle: e.target.value })}
              className="w-full px-4 py-2.5 bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 text-sm font-medium focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1.5">
            Descrição do Leitor ou Paciente Ideal (Público-Alvo)
          </label>
          <input
            type="text"
            placeholder="Ex: Pessoas com cobrança pessoal elevada, ansiedade cotidiana, buscando autocompaixão..."
            value={formData.targetAudienceDescription}
            onChange={(e) => setFormData({ ...formData, targetAudienceDescription: e.target.value })}
            className="w-full px-4 py-2.5 bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 text-sm font-medium focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      {/* SECTION 2: A MINHA VISÃO DE MUNDO & FILOSOFIA */}
      <div className="bg-white dark:bg-[#18191e] rounded-3xl p-6 sm:p-8 border border-stone-200 dark:border-stone-800 shadow-sm space-y-6 transition-colors">
        <div className="flex items-center space-x-2 text-stone-900 dark:text-stone-100 font-bold text-lg border-b border-stone-100 dark:border-stone-800 pb-3">
          <BookOpen className="w-5 h-5 text-amber-700 dark:text-amber-400" />
          <h2>2. Minha Visão de Mundo (Como Penso a Psicologia)</h2>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
            Escreva detalhadamente sua visão sobre o ser humano, o sofrimento e o processo de mudança *
          </label>
          <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
            Seja espontâneo(a)! Explique no que você acredita (ex: não prometo cura milagrosa, defendo a aceitação das emoções, foco no acolhimento sem julgamentos, a dor faz parte mas o sofrimento pode ser ressignificado).
          </p>
          <textarea
            rows={7}
            required
            placeholder="Descreva aqui sua visão de mundo com detalhes..."
            value={formData.worldviewDescription}
            onChange={(e) => setFormData({ ...formData, worldviewDescription: e.target.value })}
            className="w-full p-4 bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-2xl text-stone-900 dark:text-stone-100 text-sm leading-relaxed font-sans focus:ring-2 focus:ring-amber-500 focus:bg-white dark:focus:bg-stone-900 transition-all"
          />
        </div>

        {/* Tone of voice */}
        <div>
          <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1.5">
            Tom de Voz Principal
          </label>
          <input
            type="text"
            placeholder="Ex: Acolhedor, poético, humano, fundamentado mas prático..."
            value={formData.toneOfVoice}
            onChange={(e) => setFormData({ ...formData, toneOfVoice: e.target.value })}
            className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 text-sm font-medium focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* SECTION 3: VOCABULÁRIO PERSONALIZADO & TERMOS PROIBIDOS */}
      <div className="bg-white dark:bg-[#18191e] rounded-3xl p-6 sm:p-8 border border-stone-200 dark:border-stone-800 shadow-sm space-y-6 transition-colors">
        <div className="flex items-center space-x-2 text-stone-900 dark:text-stone-100 font-bold text-lg border-b border-stone-100 dark:border-stone-800 pb-3">
          <Tag className="w-5 h-5 text-teal-600 dark:text-teal-400" />
          <h2>3. Dicionário Pessoal & Termos a Evitar</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Favorite keywords */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-teal-800 dark:text-teal-300 uppercase tracking-wider flex items-center space-x-1">
              <Lightbulb className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>Vocabulário que gosto de usar</span>
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Ex: Ressignificação"
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addKeyword();
                  }
                }}
                className="flex-1 px-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-stone-100"
              />
              <button
                type="button"
                onClick={addKeyword}
                className="px-3 py-2 bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs rounded-xl"
              >
                + Adicionar
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {formData.favoriteKeywords.map((kw, idx) => (
                <span
                  key={idx}
                  className="bg-teal-50 text-teal-900 border border-teal-200 text-xs px-2.5 py-1 rounded-lg flex items-center space-x-1"
                >
                  <span>{kw}</span>
                  <button
                    type="button"
                    onClick={() => removeKeyword(idx)}
                    className="text-stone-400 hover:text-rose-600 font-bold ml-1"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Prohibited terms */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-rose-800 uppercase tracking-wider flex items-center space-x-1">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Termos ou clichês que NUNCA uso</span>
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Ex: Cura rápida em 5 passos"
                value={newProhibited}
                onChange={(e) => setNewProhibited(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addProhibited();
                  }
                }}
                className="flex-1 px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs"
              />
              <button
                type="button"
                onClick={addProhibited}
                className="px-3 py-2 bg-rose-700 hover:bg-rose-800 text-white font-semibold text-xs rounded-xl"
              >
                + Bloquear
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {formData.prohibitedTerms.map((pt, idx) => (
                <span
                  key={idx}
                  className="bg-rose-50 text-rose-900 border border-rose-200 text-xs px-2.5 py-1 rounded-lg flex items-center space-x-1"
                >
                  <span>{pt}</span>
                  <button
                    type="button"
                    onClick={() => removeProhibited(idx)}
                    className="text-stone-400 hover:text-rose-600 font-bold ml-1"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* SECTION 3.5: EIXOS TEMÁTICOS & CATEGORIAS */}
      <div className="bg-white dark:bg-[#18191e] rounded-3xl p-6 sm:p-8 border border-stone-200 dark:border-stone-800 shadow-sm space-y-6 transition-colors">
        <div className="flex items-center space-x-2 text-stone-900 dark:text-stone-100 font-bold text-lg border-b border-stone-100 dark:border-stone-800 pb-3">
          <BookOpen className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          <h2>4. Eixos Temáticos & Categorias do Blog</h2>
        </div>

        <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
          Estes são os eixos conceituais que alimentam o <strong>Gerador de Tópicos e Pautas</strong>. Defina as categorias que realmente refletem os temas clínicos e existenciais que você ama escrever.
        </p>

        <div className="space-y-3">
          <div className="flex space-x-2 max-w-xl">
            <input
              type="text"
              placeholder="Ex: Potência de Existir & Afetos (Espinosa)"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addCategory();
                }
              }}
              className="flex-1 px-4 py-2.5 bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500"
            />
            <button
              type="button"
              onClick={addCategory}
              className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
            >
              + Adicionar Eixo
            </button>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {(formData.themeCategories || []).map((cat, idx) => (
              <span
                key={idx}
                className="bg-amber-50 dark:bg-stone-900 text-amber-950 dark:text-amber-300 border border-amber-200/80 dark:border-stone-700 text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center space-x-2 shadow-2xs"
              >
                <span>{cat}</span>
                <button
                  type="button"
                  onClick={() => removeCategory(idx)}
                  className="text-stone-400 hover:text-rose-600 font-bold ml-1 cursor-pointer"
                  title="Remover Categoria"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#18191e] rounded-3xl p-6 sm:p-8 border border-stone-200 dark:border-stone-800 shadow-sm space-y-6 transition-colors">
        <div className="flex items-center space-x-2 text-stone-900 dark:text-stone-100 font-bold text-lg border-b border-stone-100 dark:border-stone-800 pb-3">
          <MessageSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h2>5. Instruções Diretas para Redator & Revisor</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
              Como o Redator Virtual deve se comportar
            </label>
            <textarea
              rows={3}
              value={formData.writerInstructions}
              onChange={(e) => setFormData({ ...formData, writerInstructions: e.target.value })}
              className="w-full p-3 bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
              Regras Éticas & Clínicas para o Revisor
            </label>
            <textarea
              rows={3}
              value={formData.ethicsRules}
              onChange={(e) => setFormData({ ...formData, ethicsRules: e.target.value })}
              className="w-full p-3 bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* SAVE BUTTON */}
      <div className="flex justify-center pt-2">
        <button
          type="submit"
          className="px-10 py-4 bg-teal-800 hover:bg-teal-900 text-white font-bold text-base rounded-2xl shadow-xl flex items-center space-x-3 transition-all cursor-pointer"
        >
          <Save className="w-5 h-5 text-amber-300" />
          <span>Salvar Minha Visão de Mundo</span>
        </button>
      </div>

    </form>
  );
};
