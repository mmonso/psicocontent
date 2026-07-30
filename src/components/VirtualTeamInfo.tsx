import React from 'react';
import { Feather, ShieldCheck, Palette, Sparkles, CheckCircle2, ArrowRight, Wand2, BookOpen, Repeat } from 'lucide-react';

interface VirtualTeamInfoProps {
  onStartCreate: () => void;
  onCustomizePrompts: () => void;
}

export const VirtualTeamInfo: React.FC<VirtualTeamInfoProps> = ({
  onStartCreate,
  onCustomizePrompts,
}) => {
  return (
    <div className="max-w-5xl mx-auto space-y-8 py-4">
      
      {/* Hero Banner */}
      <div className="bg-surface-raised rounded-panel p-8 sm:p-10 text-ink shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-accent/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center space-x-2 bg-accent/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium text-accent-ink border border-accent/50">
            <Sparkles className="w-3.5 h-3.5 text-accent-ink" />
            <span>Sua Equipe Editorial Exclusiva (5 Agentes)</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-ink leading-tight">
            Sua equipe virtual completa: Redação, Humanização, Teoria, Clínica e Arte Visual.
          </h1>
          <p className="text-ink-muted text-sm sm:text-base leading-relaxed">
            Cada artigo é gerado por especialistas com funções dedicadas. As análises voltam para o <strong>Redator Principal</strong>, que unifica todas as orientações em um único texto coeso e autoral — sem ser uma colcha de retalhos.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={onStartCreate}
              className="px-5 py-2.5 bg-accent hover:bg-accent text-canvas font-semibold text-sm rounded-control transition-all shadow-md flex items-center space-x-2 cursor-pointer"
            >
              <span>Criar Artigo Agora</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onCustomizePrompts}
              className="px-5 py-2.5 bg-surface-raised hover:bg-surface text-ink font-medium text-sm rounded-control border border-line transition-all cursor-pointer"
            >
               Minha Visão de Mundo
            </button>
          </div>
        </div>
      </div>

      {/* Team Members Grid - 5 Agents */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Agent 1: Redator Principal */}
        <div className="bg-surface rounded-panel p-6 border border-line shadow-sm space-y-4 flex flex-col justify-between hover:border-accent/40 transition-all">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-control bg-accent-soft border border-accent/40 flex items-center justify-center text-accent-ink">
              <Feather className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-accent-ink">Agente 01 • Redação & Síntese</span>
              <h3 className="font-serif font-bold text-lg text-ink">Redator Principal (O "Arquiteto da Prosa")</h3>
            </div>
            <p className="text-ink-muted text-xs sm:text-sm leading-relaxed">
              Cria a estrutura inicial do artigo e, ao final, absorve os pareceres de todos os especialistas para reescrever o texto do zero, garantindo voz fluida e coesa.
            </p>
            <ul className="space-y-1.5 text-xs text-ink-muted pt-2">
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-accent-ink shrink-0" />
                <span>Incorpora seu tom de voz autoral</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-accent-ink shrink-0" />
                <span>Garante coesão sem "colcha de retalhos"</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-accent-ink shrink-0" />
                <span>Abertura provocativa e encerramento aberto</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Agent 2: Editor de Humanização */}
        <div className="bg-surface rounded-panel p-6 border border-line shadow-sm space-y-4 flex flex-col justify-between hover:border-cyan-300 transition-all">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-control bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-700">
              <Wand2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-cyan-600">Agente 02 • Ritmo Textual</span>
              <h3 className="font-serif font-bold text-lg text-ink">Editor de Humanização (O "Des-AIzador")</h3>
            </div>
            <p className="text-ink-muted text-xs sm:text-sm leading-relaxed">
              Audita o rascunho em busca de vícios e conectores mecânicos de IA ("Além disso", "Portanto"), destruindo padrões previsíveis para devolver a respiração e cadence humana.
            </p>
            <ul className="space-y-1.5 text-xs text-ink-muted pt-2">
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                <span>Expurga conectores de transição de IA</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                <span>Cria assimetria e pausas orais naturais</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                <span>Elimina tom corporativo e otimismo sintético</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Agent 3: Curador Conceitual & Filosófico */}
        <div className="bg-surface rounded-panel p-6 border border-line shadow-sm space-y-4 flex flex-col justify-between hover:border-accent/40 transition-all">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-control bg-accent-soft border border-accent/40 flex items-center justify-center text-accent-ink">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-accent-ink">Agente 03 • Teoria & Filosofia</span>
              <h3 className="font-serif font-bold text-lg text-ink">Curador Conceitual (O "Guardião da Teoria")</h3>
            </div>
            <p className="text-ink-muted text-xs sm:text-sm leading-relaxed">
              Assegura que os fundamentos da sua visão de mundo (Espinosa, Gestalt, Fenomenologia, crítica ao sofrimento social) sejam abordados com rigor e densidade existencial.
            </p>
            <ul className="space-y-1.5 text-xs text-ink-muted pt-2">
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-accent-ink shrink-0" />
                <span>Impede simplificações e jargões rasos</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-accent-ink shrink-0" />
                <span>Valida a assimilação implícita dos autores</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-accent-ink shrink-0" />
                <span>Conecta sintoma ao contexto social</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Agent 4: Revisor Clínico & Ético */}
        <div className="bg-surface rounded-panel p-6 border border-line shadow-sm space-y-4 flex flex-col justify-between hover:border-accent/40 transition-all">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-control bg-accent-soft border border-accent/40 flex items-center justify-center text-accent-ink">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-accent-ink">Agente 04 • Ética & Prática</span>
              <h3 className="font-serif font-bold text-lg text-ink">Revisor Clínico & Ético</h3>
            </div>
            <p className="text-ink-muted text-xs sm:text-sm leading-relaxed">
              Audita a postura ética (proibição do 'você' prescritivo, ausência de rótulos/diagnósticos apressados) e gera os metadados de distribuição do post.
            </p>
            <ul className="space-y-1.5 text-xs text-ink-muted pt-2">
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-accent-ink shrink-0" />
                <span>Audita limitações e conduta clínica</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-accent-ink shrink-0" />
                <span>Gera SEO, hashtags e sugestões de tags</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-accent-ink shrink-0" />
                <span>Cria legendas de impacto para redes sociais</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Agent 5: Designer Editorial */}
        <div className="bg-surface rounded-panel p-6 border border-line shadow-sm space-y-4 flex flex-col justify-between hover:border-accent/40 transition-all md:col-span-2 lg:col-span-1">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-control bg-accent-soft border border-accent/40 flex items-center justify-center text-accent-ink">
              <Palette className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-accent-ink">Agente 05 • Arte & Capa</span>
              <h3 className="font-serif font-bold text-lg text-ink">Designer Editorial Visual</h3>
            </div>
            <p className="text-ink-muted text-xs sm:text-sm leading-relaxed">
              Traduz o núcleo poético e filosófico do ensaio em uma metáfora visual elegante, gerando a arte de capa ideal via Gemini Imagen.
            </p>
            <ul className="space-y-1.5 text-xs text-ink-muted pt-2">
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-accent-ink shrink-0" />
                <span>Ilustração poética sem clichês gráficos</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-accent-ink shrink-0" />
                <span>Estilos: minimalista, aquarela, colagem</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-accent-ink shrink-0" />
                <span>Geração direta com prompt otimizado</span>
              </li>
            </ul>
          </div>
        </div>

      </div>

      {/* Loop de Coesão Editorial Explanation */}
      <div className="bg-surface text-ink rounded-panel p-6 sm:p-8 space-y-4 border border-line shadow-lg">
        <div className="flex items-center space-x-3 text-accent-ink font-bold text-sm sm:text-base">
          <Repeat className="w-5 h-5 text-accent-ink shrink-0" />
          <span>Garantia de Coesão: Como o Fluxo Impede a "Colcha de Retalhos"</span>
        </div>

        <p className="text-ink-muted text-xs sm:text-sm leading-relaxed">
          Muitos leitores percebem quando um texto é editado por IA porque ele fica parecendo uma colcha de retalhos com parágrafos desalinhados. No PsicoContent Studio, adotamos a regra da <strong>Reescrita Integrada pelo Redator Principal</strong>:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 text-xs">
          <div className="bg-surface-raised/80 p-3.5 rounded-panel border border-line/60 space-y-1">
            <span className="text-accent-ink font-bold block">1. Rascunho Inicial</span>
            <p className="text-ink-faint">O Redator cria o primeiro esboço estrutural baseado no tema.</p>
          </div>

          <div className="bg-surface-raised/80 p-3.5 rounded-panel border border-line/60 space-y-1">
            <span className="text-cyan-400 font-bold block">2. Análise dos 3 Especialistas</span>
            <p className="text-ink-faint">Humanizador, Curador Conceitual e Revisor Clínico emitem pareceres.</p>
          </div>

          <div className="bg-surface-raised/80 p-3.5 rounded-panel border border-line/60 space-y-1">
            <span className="text-accent-ink font-bold block">3. Reescrita do Redator</span>
            <p className="text-ink-faint">O Redator lê os 3 pareceres e <strong>reescreve todo o ensaio do zero</strong> de forma unificada.</p>
          </div>

          <div className="bg-surface-raised/80 p-3.5 rounded-panel border border-line/60 space-y-1">
            <span className="text-accent-ink font-bold block">4. Artigo Final Coeso</span>
            <p className="text-ink-faint">Resultado: Um texto fluido, denso, autoral e com voz humana consistente.</p>
          </div>
        </div>
      </div>

      {/* Customization Highlight Box */}
      <div className="bg-accent-soft border border-accent/40 rounded-panel p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors">
        <div className="space-y-1">
          <h4 className="font-bold text-accent-ink text-sm sm:text-base">Escreva e edite sua visão de mundo detalhada</h4>
          <p className="text-accent-ink text-xs sm:text-sm">
            Na aba <strong>Minha Visão de Mundo</strong>, você ajusta as diretrizes do Redator, do Editor de Humanização e do Curador Conceitual.
          </p>
        </div>
        <button
          onClick={onCustomizePrompts}
          className="px-4 py-2 bg-accent hover:bg-accent text-canvas font-medium text-xs sm:text-sm rounded-control shrink-0 transition-all shadow-xs cursor-pointer"
        >
          Minha Visão de Mundo
        </button>
      </div>

    </div>
  );
};
