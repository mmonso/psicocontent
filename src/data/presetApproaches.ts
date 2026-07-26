import { VisualStyleOption } from '../types';

export const VISUAL_STYLES: VisualStyleOption[] = [
  {
    id: 'minimalist_vector',
    name: 'Ilustração Vetorial Minimalista',
    description: 'Formas orgânicas, paleta suave, estética moderna e acolhedora de editorial contemporâneo.',
    previewColor: 'from-amber-100 to-rose-100 border-amber-300 text-amber-900',
    promptModifier: 'Modern minimal vector illustration for a psychology blog, clean organic shapes, soft muted pastel color palette, gentle human symbolism, serene visual atmosphere, high editorial design quality, flat vector vectorart.'
  },
  {
    id: 'soft_watercolor',
    name: 'Aquarela Conceitual Soft',
    description: 'Pinceladas fluidas e poéticas que transmitem emoção, calmaria, interioridade e sensibilidade.',
    previewColor: 'from-sky-100 to-indigo-100 border-sky-300 text-sky-900',
    promptModifier: 'Soft watercolor conceptual painting, dreamy fluid brushstrokes, gentle gradients, poetic emotional metaphor, calming visual style for mental health article, soft pastel watercolor texture on fine art paper.'
  },
  {
    id: 'symbolic_abstract',
    name: 'Arte Abstrata Simbólica',
    description: 'Formas geométricas e curvas que representam pensamentos, luz, caminhos e clareza mental.',
    previewColor: 'from-teal-100 to-emerald-100 border-teal-300 text-teal-900',
    promptModifier: 'Symbolic abstract digital art piece for a psychology post, clean geometric and flowing line work, representing mind clarity, emotional transformation and balance, elegant typography-free visual composition.'
  },
  {
    id: 'cozy_editorial_photo',
    name: 'Fotografia Editorial Acolhedora',
    description: 'Imagens realistas de iluminação natural, ambientes confortáveis (xícara de chá, diário, plantas, luz do sol).',
    previewColor: 'from-orange-100 to-stone-100 border-orange-300 text-stone-900',
    promptModifier: 'Warm cozy editorial photography, soft natural morning sunlight, peaceful ambiance with journal, cup of tea, potted plants, serene atmosphere, photorealistic, 35mm shallow depth of field, warm soothing tones.'
  },
  {
    id: 'papercut_art',
    name: 'Arte em Recorte de Papel (Papercut)',
    description: 'Camadas de papel sobrepostas em 3D com sombras delicadas, criando profundidade visual.',
    previewColor: 'from-purple-100 to-pink-100 border-purple-300 text-purple-900',
    promptModifier: '3D layered papercut art style, delicate paper craft illustration for mental wellness article, soft shadows between paper layers, beautiful depth and texture, pastel color aesthetic.'
  }
];

export const DEFAULT_AGENT_PROMPTS = {
  writerSystemPrompt: `Você é o REDATOR VIRTUAL ESPECIALISTA EM PSICOLOGIA do blog.
Seu objetivo é criar um artigo envolvente, bem estruturado e focado na psicoeducação, adaptado rigorosamente à visão de mundo e tom de voz informados.`,

  reviewerSystemPrompt: `Você é o REVISOR CLÍNICO E EDITORIAL DE CONTEÚDO DE PSICOLOGIA.
Sua missão é analisar o artigo do Redator garantindo adequação ética e alinhamento com a visão de mundo e diretrizes do autor.`,

  imageDesignerSystemPrompt: `Você é o DESIGNER VISUAL EDITORIAL especialista em blogs de Psicologia e Bem-estar.
Sua tarefa é analisar o título e resumo do artigo e construir um prompt extremamente detalhado em inglês para geração de imagem conceitual.`
};
