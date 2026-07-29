import { ArticlePost, UserManifesto, AgentPrompts } from '../types';

const POSTS_KEY = 'psicocontent_posts_v2';
const MANIFESTO_KEY = 'psicocontent_user_manifesto_v2';
const PROMPTS_KEY = 'psicocontent_agent_prompts_v2';
const OPEN_POST_KEY = 'psicocontent_open_post_id';

export const DEFAULT_USER_MANIFESTO: UserManifesto = {
  authorName: 'Psicólogo Clínico',
  professionalTitle: 'Psicólogo Clínico e Ensaísta',
  worldviewDescription: `IDENTIDADE CLÍNICA E INTELECTUAL:
Sou psicólogo clínico. Minha base teórica passa pela psicanálise, mas minha atuação é fortemente influenciada pela Gestalt-terapia, pela fenomenologia, pelo existencialismo e pelo pensamento de Espinosa. Não sigo uma escola de forma rígida nem nomeio autores e abordagens — as referências devem estar assimiladas na escrita como modo de pensar, e não como desfile de citações. O sujeito não existe isolado: constitui-se nas relações, na história, na cultura e nas condições concretas.

COMPREENSÃO DO SOFRIMENTO E SINTOMA:
Existem necessidades afetivas fundamentais, especialmente a de ser amado. Quando não atendidas, surge sofrimento (ansiedade, depressão, burnout). Essas categorias não são essências, mas manifestações de experiências complexas. O sofrimento torna-se adoecimento na perda de movimento, cristalização e interrupção do fluxo afetivo. O sintoma é um sinal, índice e tentativa de adaptação/sobrevivência com sentido singular.

DIAGNÓSTICO E POSTURA CLÍNICA:
Sou contra diagnósticos frágeis ou tratados como verdades definitivas (bipolaridade, borderline, narcisismo). Pergunta central: Como essa experiência acontece para esse sujeito, em qual contexto, o que produz e que história/relações participam dela? Não reduzir a pessoa ao diagnóstico e nunca diagnosticar terceiros (ausentes, parceiros, celebridades).
Postura fenomenológica: compreender antes de explicar, descrever antes de enquadrar, situar antes de nomear. A relação terapêutica cria condições para o próprio sujeito perceber, sinta e elabore sua experiência.

AWARENESS, MUDANÇA E RESPONSABILIDADE:
A mudança acontece pela ampliação da awareness integrada (afetos, corpo, contexto, percepção de si no mundo). Pergunta sobre a infância/vida adulta: "O que alguém faz com aquilo que fizeram dele?". O sujeito é responsável em contexto, sem confundir com culpa individual, liberdade absoluta ou desconsideração do contexto social/histórico.

SAÚDE, SOCIEDADE E POLÍTICA:
Saúde é capacidade de encontro que amplia a potência de existir e o movimento. Adoecimento é perda de movimento e cristalização. A sociedade e o capitalismo participam diretamente da produção do sofrimento psíquico (isolamento, produtividade extrema, medicalização, obrigação de felicidade). A crítica social/política deve aparecer de forma implícita no modo de formular os problemas.

REGRA CENTRAL:
O texto não deve ensinar alguém a funcionar melhor dentro de uma realidade adoecedora. Deve criar condições para que algo seja percebido. Em vez de enquadrar rapidamente, desacelerar a compreensão. Em vez de eliminar o sintoma, escutar o que ele indica. Em vez de classificar pessoas, pensar relações. Em vez de oferecer controle, ampliar contato. Em vez de fechar respostas, sustentar perguntas.`,
  toneOfVoice: `Escrever em primeira pessoa com tom ensaístico, conceitual, acessível, crítico, provocador e reflexivo. NUNCA falar diretamente com o leitor usando "você" (preferir "há momentos em que", "podemos pensar", "é possível que"). Usar ironia sutil contra clichês sem ridicularizar quem sofre. Sem tom motivacional ou poético em excesso; a força vem da precisão das ideias.`,
  favoriteKeywords: [
    'Potência de existir',
    'Ampliação da awareness',
    'Capacidade de encontro',
    'Movimento e cristalização',
    'Sentido singular do sintoma',
    'Relações e vínculos',
    'O que alguém faz com o que fizeram dele',
    'Sofrimento socialmente produzido',
    'Deslocamento e reflexão',
  ],
  prohibitedTerms: [
    'Uso do pronome "você" diretamente',
    'Listas de 5 sinais ou 5 passos',
    'Red flags e testes psicológicos',
    'Fórmulas de relacionamento saudável e manuais de produtividade',
    'Ansiedade é excesso de futuro / Depressão é falta de propósito',
    'É preciso se amar antes de amar alguém',
    'Tudo depende da sua atitude / Sair da zona de conforto',
    'Basta colocar limites',
    'Diagnóstico de terceiros ou celebridades',
    'Autodiagnóstico e rotulagem moral (pessoa tóxica, narcisista)',
  ],
  targetAudienceDescription:
    'Leitores em busca de reflexão existencial profunda, autoconhecimento genuíno e crítica aos clichês contemporâneos sobre saúde mental e relacionamentos.',
  writerInstructions: `DIRETRIZES FUNDAMENTAIS DO REDATOR:
1. Escrever em primeira pessoa com estilo ensaístico, autoral e refinado.
2. NUNCA falar diretamente com o leitor usando a palavra "você". Use formulações impessoais ou coletivas ("há momentos em que", "podemos pensar", "talvez seja necessário perguntar", "é possível que").
3. Começar o artigo a partir de uma tensão, contradição, cena cotidiana, frase comum ou incômodo conceitual.
4. Desenvolver a ideia gradualmente relacionando a experiência individual, as relações e o contexto social/histórico.
5. NÃO citar autores ou escolas teóricas diretamente. As referências (Gestalt, fenomenologia, Espinosa, psicanálise) devem estar assimiladas na escrita como modo de pensar.
6. ABSOLUTAMENTE PROIBIDO criar listas de passos, red flags, manuais de produtividade, conselhos motivacionais ou frases feitas de autoajuda.
7. Terminar mantendo alguma abertura (uma pergunta, tensão ou formulação provocativa), NUNCA com resumo, moral, lição ou lista de recomendações.`,
  reviewerInstructions: `POSTURA DO REVISOR SÊNIOR (RÍGIDO E ANTI-GENÉRICO):
1. REESCRITA CRÍTICA CONTRA TEXTOS GENÉRICOS: Se o rascunho do Redator for superficial, genérico, usar tom de autoajuda ou parecer "gerado por IA", REESCREVA O TEXTO PROFUNDAMENTE para torná-lo um ensaio denso, autoral e filosoficamente refinado.
2. ELIMINAÇÃO SUMÁRIA DO PRONOME "VOCÊ": Substitua toda ocorrência de "você" por "há momentos em que", "podemos pensar" ou construções impessoais/coletivas.
3. EXTINÇÃO DE LISTAS E PASSO-A-PASSO: Dissolva qualquer lista de 5 passos, dicas ou regras comportamentais em parágrafos de prosa ensaística contínua.
4. EXPURGO DE CLICHÊS: Corte frases como "saia da zona de conforto", "ansiedade é excesso de futuro", "seja a sua melhor versão" e "busque o equilíbrio".
5. PARECER EDITORIAL EXPLICATIVO NAS CLINICAL NOTES: Detalhe nas 'clinicalNotes' as críticas ao rascunho e todas as intervenções e reestruturações conceituais realizadas.`,
  ethicsRules: `- Nunca diagnosticar terceiros (ausentes, parceiros, celebridades).
- Não patologizar reações humanas singulares (tristeza, raiva, ciúmes, luto).
- Não oferecer soluções estritamente individuais para sofrimentos produzidos socialmente.
- Tratar a clínica como fonte de reflexões gerais, sem expor histórias de pacientes.
- Recusar o adestramento comportamental ou promessas de cura rápida.`,
  themeCategories: [
    'Awareness & Fenomenologia da Experiência',
    'Potência de Existir & Afetos (Espinosa)',
    'Existência, Liberdade & Responsabilidade',
    'Vínculos, Afeto & Alteridade',
    'Sofrimento Social & Crítica à Cultura',
    'Luto, Impermanência & Transições',
  ],
  humanizerInstructions: `DIRETRIZES DE HUMANIZAÇÃO E CADÊNCIA TEXTUAL (EXPURGO DE IA):
1. Eliminar conectores artificiais de IA ("Além disso", "Portanto", "No entanto", "É importante destacar", "Vale ressaltar").
2. Variar a extensão dos parágrafos, criando momentos de pausa curta, respiração e assimetria oral natural.
3. Expurgar adjetivação genérica e entusiasmo sintético ("incrível jornada", "transformação profunda", "passo fundamental").
4. Garantir que a prosa soe como alguém pensando alto em uma conversa profunda, e não como um relatório automatizado.`,
  conceptualCuratorInstructions: `DIRETRIZES DE CURADORIA CONCEITUAL E FILOSÓFICA:
1. Assegurar o rigor dos conceitos (Espinosa: potência de agir, afeto; Gestalt/Fenomenologia: awareness, contato, campo, contexto).
2. Impedir que conceitos complexos sejam reduzidos a palavras de ordem ou clichês corporativos/de autoajuda.
3. Garantir a articulação do sofrimento individual com o contexto social e cultural, evitando a responsabilização ingênua.
4. Manter o caráter investigativo e ensaístico da escrita, sem pedantismo acadêmico nem desfile ostensivo de citações.`,
};

export const DEFAULT_AGENT_PROMPTS: AgentPrompts = {
  writerSystemPrompt:
    'Você é o Redator Virtual Oficial do blog. Sua missão é escrever um ensaio denso, autoral e sem clichês, capturando perfeitamente a visão de mundo do autor.',
  reviewerSystemPrompt:
    'Você é o Revisor Clínico, Literário e Editorial Sênior do blog. Sua missão é ser um crítico extremamente exigente, expurgando clichês e reescrevendo profundamente qualquer texto genérico para garantir ensaística impecável e rigor ético.',
  imageDesignerSystemPrompt:
    'Você é o Designer Visual do blog. Sua missão é traduzir a essência conceitual do artigo em uma metáfora visual poética e acolhedora.',
};

export function getStoredManifesto(): UserManifesto {
  try {
    const data = localStorage.getItem(MANIFESTO_KEY);
    return data ? JSON.parse(data) : DEFAULT_USER_MANIFESTO;
  } catch (e) {
    console.error('Error reading user manifesto from storage:', e);
    return DEFAULT_USER_MANIFESTO;
  }
}

export function saveManifestoToStorage(manifesto: UserManifesto): UserManifesto {
  try {
    localStorage.setItem(MANIFESTO_KEY, JSON.stringify(manifesto));
  } catch (e) {
    console.error('Error saving user manifesto to storage:', e);
  }
  return manifesto;
}

export function getStoredPosts(): ArticlePost[] {
  try {
    const data = localStorage.getItem(POSTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Error reading posts from storage:', e);
    return [];
  }
}

/* Sinaliza se a escrita realmente chegou ao disco. Antes o erro era engolido e
   a função devolvia a lista atualizada de qualquer jeito — a interface exibia
   "salvo automaticamente" enquanto nada tinha sido persistido, e o texto sumia
   no reload seguinte. */
export class StorageWriteError extends Error {
  constructor(cause: unknown) {
    super(
      cause instanceof Error && cause.name === 'QuotaExceededError'
        ? 'O armazenamento local do navegador está cheio. Exclua artigos antigos da Biblioteca para liberar espaço.'
        : 'O navegador recusou a gravação. Em janela anônima ou com cookies bloqueados o armazenamento local fica indisponível.'
    );
    this.name = 'StorageWriteError';
  }
}

export function savePostToStorage(post: ArticlePost): ArticlePost[] {
  const current = getStoredPosts();
  const index = current.findIndex((p) => p.id === post.id);
  const updated = index >= 0 ? current.map((p, i) => (i === index ? post : p)) : [post, ...current];

  try {
    localStorage.setItem(POSTS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Error saving post to storage:', e);
    throw new StorageWriteError(e);
  }
  return updated;
}

/* Substitui o espelho local inteiro pelo que veio do servidor. */
export function replaceAllPosts(posts: ArticlePost[]): ArticlePost[] {
  try {
    localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
  } catch (e) {
    console.error('Error mirroring posts to storage:', e);
    throw new StorageWriteError(e);
  }
  return posts;
}

/* Artigo aberto no momento, para que atualizar a página não devolva o usuário
   a um formulário em branco. Guarda só o id — o conteúdo já vive em POSTS_KEY. */
export function getOpenPostId(): string | null {
  try {
    return localStorage.getItem(OPEN_POST_KEY);
  } catch {
    return null;
  }
}

export function setOpenPostId(id: string | null): void {
  try {
    if (id) localStorage.setItem(OPEN_POST_KEY, id);
    else localStorage.removeItem(OPEN_POST_KEY);
  } catch (e) {
    console.error('Error persisting open post id:', e);
  }
}

export function deletePostFromStorage(id: string): ArticlePost[] {
  const current = getStoredPosts();
  const updated = current.filter((p) => p.id !== id);
  try {
    localStorage.setItem(POSTS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Error deleting post from storage:', e);
  }
  return updated;
}

export function getStoredAgentPrompts(): AgentPrompts {
  try {
    const data = localStorage.getItem(PROMPTS_KEY);
    return data ? JSON.parse(data) : DEFAULT_AGENT_PROMPTS;
  } catch (e) {
    return DEFAULT_AGENT_PROMPTS;
  }
}

export function saveAgentPrompts(prompts: AgentPrompts): void {
  try {
    localStorage.setItem(PROMPTS_KEY, JSON.stringify(prompts));
  } catch (e) {
    console.error('Error saving agent prompts:', e);
  }
}
