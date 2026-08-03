/* Eixo relacional: um lugar da vida de onde falar, com os assuntos que cabem
   nele. Substitui a lista de escolas teóricas — "Relação com o tempo → Luto"
   dá ao redator uma situação humana; "Potência de Existir (Espinosa)" pede que
   ele demonstre uma teoria, e o resultado sai falando de conceitos. */
export interface ThematicAxis {
  axis: string;
  topics: string[];
}

export interface UserManifesto {
  authorName: string;
  professionalTitle: string;
  worldviewDescription: string; // "Sua visão de mundo, como pensa, detalhada"
  toneOfVoice: string; // "Tom de voz característico"
  favoriteKeywords: string[]; // "Vocabulário que você costuma usar"
  prohibitedTerms: string[]; // "Termos ou clichês que você evita"
  targetAudienceDescription: string; // "Descrição do leitor/paciente ideal"
  writerInstructions: string; // "Diretrizes específicas para o Redator"
  reviewerInstructions: string; // "Diretrizes para a Revisão"
  ethicsRules: string; // "Suas regras éticas"
  themeCategories?: string[]; // "Eixos temáticos e categorias personalizadas do autor"
  humanizerInstructions?: string; // "Diretrizes específicas do Editor de Humanização & Cadência (Des-AIzador)"
  conceptualCuratorInstructions?: string; // "Diretrizes do Curador Conceitual & Filosófico (Guardião da Teoria)"

  /* Eixos relacionais com seus assuntos. Alimentam o gerador de pautas e o
     briefing do redator. */
  thematicAxes?: ThematicAxis[];

  /* Efeito pretendido no leitor, em linguagem sensorial. O prompt precisa de um
     lugar para mirar, não só de uma lista do que evitar. */
  intendedEffect?: string;

  /* Referências de calibração: onde está a régua. Adjetivos como "denso" e
     "autoral" não têm referente; um padrão nomeado tem. Isto calibra o prompt,
     não autoriza citar autores no texto final. */
  calibrationReferences?: string;
}

export interface AgentPrompts {
  writerSystemPrompt: string;
  reviewerSystemPrompt: string;
  imageDesignerSystemPrompt: string;
}

export interface PostGenerationInput {
  topic: string;
  targetAudience?: string;
  tone?: string;
  depthLevel: 'iniciante' | 'intermediario' | 'aprofundado';
  articleLength: 'curto' | 'medio' | 'longo';
  includePracticalExercise?: boolean;
  includeFAQ?: boolean;
  visualStyle: string;
  customWriterPrompt?: string;
  customReviewerPrompt?: string;
  customImagePrompt?: string;
}

export interface DraftResult {
  title: string;
  subtitle: string;
  rawText: string;
  outline: string[];
  generatedAt: string;
}

/* Parecer de um especialista. `approved: null` significa que a chamada falhou —
   distinto de reprovado, e nunca tratado como aprovação. */
export interface SpecialistVerdict {
  notes: string;
  approved: boolean | null;
  severity: string;
  issues: string[];
  failed?: boolean;
}

/* Auditoria do texto final, feita depois da reescrita. É o único veredito que
   olha para aquilo que efetivamente será publicado. */
export interface AuditResult {
  approved: boolean;
  ethicsCheckPassed: boolean;
  severity: string;
  summary: string;
  issues: string[];
}

export interface ReviewResult {
  revisedTitle: string;
  revisedSubtitle: string;
  revisedText: string;
  clinicalNotes: string;
  humanizationNotes?: string;
  conceptualNotes?: string;
  writerSynthesisNotes?: string;
  ethicsCheckPassed: boolean;
  ethicsDetails: string;
  metaDescription: string;
  socialCaption: string;
  hashtags: string[];
  suggestedTags?: string[];
  keyTakeaways: string[];
  readingTimeMinutes: number;

  /* Opcionais: artigos gerados antes da revisão do comitê não os possuem. */
  specialists?: {
    humanization: SpecialistVerdict;
    conceptual: SpecialistVerdict;
    clinical: SpecialistVerdict;
  };
  audit?: AuditResult;
}

export interface ImageResult {
  imageUrl: string;
  promptUsed: string;
  conceptExplanation: string;
  altText: string;
  styleUsed: string;
}

export interface CarouselSlide {
  slideNumber: number;
  slideTitle: string;
  bodyText: string;
  visualCue?: string;
}

export interface CarouselFormat {
  slides: CarouselSlide[];
  caption: string;
}

export interface ReelsScriptFormat {
  hook: string;
  coreNarrative: string;
  visualInstructions?: string;
  callToReflection: string;
}

export interface DerivedFormats {
  carousel?: CarouselFormat;
  reelsScript?: ReelsScriptFormat;
}

export interface ArticlePost {
  id: string;
  createdAt: string;
  updatedAt: string;
  topic: string;
  authorName?: string;
  tone: string;
  depthLevel: string;
  targetAudience: string;
  tags?: string[];
  approachName?: string;
  input: PostGenerationInput;
  draft?: DraftResult;
  review?: ReviewResult;
  image?: ImageResult;
  derivedFormats?: DerivedFormats;
  status: 'drafting' | 'reviewing' | 'generating_image' | 'completed' | 'error';
  errorMessage?: string;
}

export interface VisualStyleOption {
  id: string;
  name: string;
  description: string;
  previewColor: string;
  promptModifier: string;
}
