import express from 'express';
import path from 'path';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json({ limit: '10mb' }));

// Lazy initializer for Gemini client
let genAIClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!genAIClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY is not defined in environment variables.');
    }
    genAIClient = new GoogleGenAI({
      apiKey: apiKey || '',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return genAIClient;
}

// API Health
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', hasKey: !!process.env.GEMINI_API_KEY });
});

// 0. GERADOR DE TÓPICOS E IDEIAS DE ARTIGOS
app.post('/api/generate-topics', async (req, res) => {
  try {
    const ai = getGeminiClient();
    const { keyword, category, userManifesto } = req.body;

    const authorName = userManifesto?.authorName || 'Autor(a)';
    const worldview = userManifesto?.worldviewDescription || 'Visão humanizada da psicologia e bem-estar';
    const authorTone = userManifesto?.toneOfVoice || 'Acolhedor, empático e reflexivo';
    const targetAudience = userManifesto?.targetAudienceDescription || 'Pessoas em busca de autoconhecimento';
    const favKeywords = userManifesto?.favoriteKeywords?.join(', ') || 'Ressignificação, Acolhimento, Autocompaixão';
    const probTerms = userManifesto?.prohibitedTerms?.join(', ') || 'Cura milagrosa em 5 passos';

    const systemPrompt = `Você é um Estrategista de Conteúdo Editorial e Psicoeducativo de Psicologia.
Seu objetivo é gerar 6 ideias de tópicos/pautas de artigos inovadoras, profundas e extremamente atrativas para o blog de um profissional de psicologia.

=== VISÃO DE MUNDO DO AUTOR (${authorName}) ===
"${worldview}"

=== TOM DE VOZ ===
${authorTone}

=== PÚBLICO-ALVO ===
${targetAudience}

=== VOCABULÁRIO RECOMENDADO ===
${favKeywords}

=== TERMOS A EVITAR ===
${probTerms}

DIRETRIZES DE CRIAÇÃO:
1. Os tópicos DEVEM ressoar com as dores reais do público-alvo e se conectar diretamente com a visão de mundo do autor.
2. Evite títulos clichês ou superficiais ("Como ser feliz em 5 passos").
3. Prefira abordagens reflexivas, acolhedoras, sobre dilemas humanos autênticos (ansiedade, cobrança interna, limites saudáveis, luto, solidão, sentido da vida, dinâmicas relacionais).
4. Para cada tópico, forneça um título marcante, o ângulo de abordagem psicoeducativo e a explicação de por que esse tema combina com a filosofia do autor.`;

    const userPrompt = `Gere 6 tópicos de artigos inspiradores e alinhados.
${keyword ? `Foco na palavra-chave ou assunto especificado: "${keyword}".` : ''}
${category ? `Categoria ou eixo de interesse: "${category}".` : ''}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            topics: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING, description: 'Título atrativo e acolhedor do artigo' },
                  angle: { type: Type.STRING, description: 'Ângulo de abordagem psicoeducativo' },
                  whyItFits: { type: Type.STRING, description: 'Por que encaixa na visão de mundo do autor' },
                  category: { type: Type.STRING, description: 'Categoria do tema' },
                },
                required: ['title', 'angle', 'whyItFits', 'category'],
              },
            },
          },
          required: ['topics'],
        },
      },
    });

    const resultText = response.text || '{}';
    const parsed = JSON.parse(resultText);
    res.json({ success: true, topics: parsed.topics || [] });
  } catch (error: any) {
    console.error('Erro ao gerar tópicos:', error);
    res.status(500).json({ success: false, error: error.message || 'Erro ao gerar tópicos' });
  }
});

// 1. REDATOR: Gera Rascunho do Artigo baseado na Visão de Mundo do Autor
app.post('/api/generate-draft', async (req, res) => {
  try {
    const ai = getGeminiClient();
    const {
      topic,
      targetAudience,
      tone,
      depthLevel,
      articleLength,
      customWriterPrompt,
      userManifesto,
    } = req.body;

    const lengthGuide =
      articleLength === 'longo'
        ? 'Artigo aprofundado com cerca de 1200 a 1600 palavras, vários subtítulos e explicações minuciosas.'
        : articleLength === 'curto'
        ? 'Artigo direto e conciso com cerca de 500 a 700 palavras, leitura rápida.'
        : 'Artigo médio e bem equilibrado com cerca de 800 a 1100 palavras.';

    const authorName = userManifesto?.authorName || 'Autor(a)';
    const worldview = userManifesto?.worldviewDescription || 'Visão humanizada e acolhedora da psicologia.';
    const authorTone = tone || userManifesto?.toneOfVoice || 'Acolhedor, Profundo e Empático';
    const favKeywords = Array.isArray(userManifesto?.favoriteKeywords)
      ? userManifesto.favoriteKeywords.join(', ')
      : 'potência de existir, capacidade de encontro, movimento';
    const probTerms = Array.isArray(userManifesto?.prohibitedTerms)
      ? userManifesto.prohibitedTerms.join(', ')
      : 'uso do pronome você, clichês, fórmulas mágicas, 5 passos';
    const writerInst = userManifesto?.writerInstructions || 'Escrever com densidade ensaística e estilo autoral.';
    const intendedEffect =
      userManifesto?.intendedEffect ||
      'O leitor deve terminar o texto mais lento do que começou, com a sensação de ter sido acompanhado e não instruído.';
    const calibration =
      userManifesto?.calibrationReferences ||
      'A régua é o ensaio literário publicado em revista séria, não o post de blog.';

    const systemPrompt = `Você é o REDATOR VIRTUAL OFICIAL do(a) profissional de psicologia: ${authorName}.
Sua missão é escrever o rascunho de um ensaio autoral, profundo e provocativo, fugindo categoricamente de clichês de inteligência artificial e textos genéricos de internet.

=== VISÃO DE MUNDO DO AUTOR (COMO ELE/ELA PENSA) ===
${worldview}

=== TOM DE VOZ E ESTILO DO AUTOR ===
${authorTone}

=== PÚBLICO-ALVO ===
${targetAudience || userManifesto?.targetAudienceDescription || 'Leitores interessados em reflexão existencial e psicologia profunda'}

=== VOCABULÁRIO RECOMENDADO DO AUTOR ===
${favKeywords}

=== O EFEITO PRETENDIDO NO LEITOR ===
${intendedEffect}

=== ONDE ESTÁ A RÉGUA ===
${calibration}

=== COMO ESTE TEXTO SE COMPORTA ===
${writerInst}

=== VOCABULÁRIO DA CASA ===
Palavras e formulações que pertencem a esta voz: ${favKeywords}

=== O QUE DENUNCIA UM TEXTO FRACO ===
Se aparecer, o texto falhou: ${probTerms}

=== EXTENSÃO ===
${lengthGuide}
Profundidade: ${depthLevel}
${customWriterPrompt ? `\n=== PEDIDO ESPECÍFICO PARA ESTE TEXTO ===\n${customWriterPrompt}` : ''}`;

    /* Prosa livre, sem schema JSON.

       Antes o ensaio era um campo entre quatro, produzido com
       responseMimeType 'application/json' — mil palavras de prosa literária
       escritas dentro de uma string escapada, dividindo a mesma passada de
       geração com título, subtítulo e outline. A atenção do modelo é finita e
       o schema cobrava parte dela. Os metadados agora são extraídos depois,
       numa chamada que lê o texto pronto. */
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: `Escreva o ensaio sobre: "${topic}".

Comece pelo título numa linha iniciada por "# ", depois o subtítulo em itálico numa linha iniciada por "_", e então o texto. Nada além disso — sem preâmbulo, sem comentário sobre o que você vai fazer.`,
      config: { systemInstruction: systemPrompt },
    });

    const raw = (response.text || '').trim();

    /* Extrai título e subtítulo do próprio Markdown. */
    const titleMatch = raw.match(/^#\s+(.+)$/m);
    const subtitleMatch = raw.match(/^_(.+)_\s*$/m);

    const title = titleMatch?.[1]?.trim() || topic;
    const subtitle = subtitleMatch?.[1]?.trim() || '';

    const body = raw
      .replace(/^#\s+.+$/m, '')
      .replace(/^_.+_\s*$/m, '')
      .trim();

    res.json({
      success: true,
      data: {
        title,
        subtitle,
        outline: [],
        rawText: body,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Error generating draft:', error);
    res.status(500).json({ success: false, error: error.message || 'Falha ao gerar rascunho.' });
  }
});

// 2. REVISOR CLÍNICO: Revisa e Polir o Artigo + Parecer Ético segundo a Visão de Mundo
const REVIEW_MODEL = 'gemini-3.6-flash';

/* Uma chamada ao modelo com saída JSON validada por schema. */
async function callJson(
  ai: any,
  opts: { system: string; user: string; schema: any; model?: string }
): Promise<any> {
  const response = await ai.models.generateContent({
    model: opts.model || REVIEW_MODEL,
    contents: opts.user,
    config: {
      systemInstruction: opts.system,
      responseMimeType: 'application/json',
      responseSchema: opts.schema,
    },
  });
  return JSON.parse(response.text || '{}');
}

/* Schema comum aos pareceres. Cada especialista precisa se comprometer com um
   veredito, não só escrever prosa: sem `approved` e `severity` não há como
   nenhum portão a jusante decidir coisa alguma. */
const VERDICT_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    notes: { type: Type.STRING, description: 'Parecer técnico, direto e específico' },
    approved: {
      type: Type.BOOLEAN,
      description: 'false se o texto viola a diretriz desta especialidade de forma relevante',
    },
    severity: {
      type: Type.STRING,
      description: "'ok' | 'menor' | 'grave' — gravidade do que foi encontrado",
    },
    issues: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Problemas concretos encontrados, citando o trecho quando possível',
    },
  },
  required: ['notes', 'approved', 'severity', 'issues'],
};

app.post('/api/review-draft', async (req, res) => {
  try {
    const ai = getGeminiClient();
    const {
      topic,
      draftTitle,
      draftSubtitle,
      draftText,
      customReviewerPrompt,
      userManifesto,
    } = req.body;

    const authorName = userManifesto?.authorName || 'Autor';
    const worldview = userManifesto?.worldviewDescription || 'Visão humanizada';
    const ethicsRules = userManifesto?.ethicsRules || 'Garantir não realizar diagnósticos précoces.';
    const reviewerInst = userManifesto?.reviewerInstructions || 'Garantir tom acolhedor e ético.';
    const humanizerInst = userManifesto?.humanizerInstructions || 'Eliminar marcas de IA, conectores burocráticos e variar o ritmo.';
    const conceptualInst = userManifesto?.conceptualCuratorInstructions || 'Assegurar rigor dos conceitos de Espinosa, Gestalt e Fenomenologia.';

    /* ---------------------------------------------------------------------
       FASE 1 — Os três especialistas, em chamadas independentes e paralelas.

       Antes eram três seções de um mesmo JSON, produzidas pela mesma passada do
       modelo junto com a reescrita. Três seções de uma resposta não são três
       perspectivas: não há como discordarem entre si, e o veredito nascia no
       mesmo fôlego que o texto que ele deveria julgar.

       Cada um recebe apenas o rascunho e a própria diretriz — nenhum vê o
       parecer do outro, então a convergência (quando ocorre) significa algo.
       Rodam em paralelo, de modo que três chamadas custam o tempo da mais
       lenta, não a soma delas.
    --------------------------------------------------------------------- */

    const draftForReview = `TEMA: ${topic}
TÍTULO: ${draftTitle}
SUBTÍTULO: ${draftSubtitle}

TEXTO:
${draftText}`;

    const SPECIALISTS = [
      {
        key: 'humanization',
        system: `Você é o EDITOR DE HUMANIZAÇÃO E CADÊNCIA de um blog de psicologia.
Sua única função é avaliar: o texto soa como pessoa pensando, ou como máquina redigindo?

Procure e aponte: conectores burocráticos ("Além disso", "Portanto", "No entanto", "Vale ressaltar", "É importante destacar"), simetria mecânica de parágrafos, entusiasmo sintético, adjetivação genérica, encerramentos que resumem em vez de abrir.

Duas verificações estruturais, e cada uma sozinha basta para reprovar:

1. ABERTURA. A primeira frase é uma cena concreta, ou é um anúncio abstrato de cena? Reprove se ela começar com "Há", "Existe", "Quando", "No mundo", ou se o sujeito for um substantivo abstrato (fenômeno, questão, experiência, sociedade). "Há um gesto mínimo que revela a mecânica da nossa época" é anúncio, não cena — reprove.

2. FECHO. A última linha é uma pergunta? Se não for, reprove. Se for, verifique se ela depende do que este texto construiu: uma pergunta que caberia em qualquer ensaio sobre o tema é decorativa e também reprova.

Diretrizes do autor: ${humanizerInst}

Seja específico e severo. Cite os trechos. Se o texto está limpo, diga que está limpo — mas não invente elogios para agradar. Reprove (approved: false) quando as marcas de IA comprometerem a leitura.`,
      },
      {
        key: 'conceptual',
        system: `Você é o CURADOR CONCEITUAL E FILOSÓFICO de um blog de psicologia.
Sua única função é avaliar o rigor dos conceitos e a fidelidade à visão de mundo do autor.

Visão de mundo do autor:
${worldview}

Diretrizes do autor: ${conceptualInst}

Verifique se conceitos densos (potência de existir, awareness, contato, sentido do sintoma, sofrimento socialmente produzido) foram reduzidos a slogan ou autoajuda. Verifique se o sofrimento individual está articulado ao contexto social sem responsabilização ingênua.

Seja específico. Reprove (approved: false) quando houver deformação conceitual relevante ou quando o texto virar manual de comportamento.`,
      },
      {
        key: 'clinical',
        system: `Você é o REVISOR CLÍNICO E ÉTICO de um blog de psicologia, e o mais rigoroso do comitê.
Sua única função é verificar limites éticos da comunicação clínica.

Regras éticas do autor:
${ethicsRules}

Diretrizes do autor: ${reviewerInst}

Verifique: diagnóstico de terceiros ou de leitores; patologização de reações humanas normais; promessa de cura ou solução; conselho prescritivo disfarçado; exposição de caso clínico; uso do pronome "você" dirigido ao leitor; solução individual para sofrimento de origem social.

Reprove (approved: false) diante de QUALQUER violação ética, ainda que pontual. Aqui o custo de um falso negativo é maior que o de um falso positivo.`,
      },
    ];

    const specialistResults = await Promise.allSettled(
      SPECIALISTS.map((s) =>
        callJson(ai, {
          system: s.system,
          user: `Avalie o rascunho abaixo dentro da sua especialidade.\n\n${draftForReview}`,
          schema: VERDICT_SCHEMA,
        })
      )
    );

    /* A falha de um especialista não derruba a produção, mas também não é
       tratada como aprovação: fica registrada como não avaliada. */
    const specialists: Record<string, any> = {};
    SPECIALISTS.forEach((s, i) => {
      const r = specialistResults[i];
      specialists[s.key] =
        r.status === 'fulfilled'
          ? r.value
          : {
              notes: 'Este especialista não pôde ser consultado nesta execução.',
              approved: null,
              severity: 'não avaliado',
              issues: [],
              failed: true,
            };
    });

    const allIssues = Object.values(specialists).flatMap((s: any) => s.issues || []);

    /* ---------------------------------------------------------------------
       FASE 2 — O redator principal reescreve, com os pareceres em mãos.
    --------------------------------------------------------------------- */

    const writerSystem = `Você é o REDATOR PRINCIPAL do blog de ${authorName}.

Você recebe um rascunho e os pareceres de três especialistas independentes. Sua tarefa é REESCREVER O ARTIGO DO ZERO, dissolvendo as correções numa única voz autoral.

O texto final NUNCA pode ser uma colcha de retalhos: nada de trechos remendados. As três críticas devem desaparecer dentro de uma prosa contínua.

Visão de mundo do autor:
${worldview}

Regras inegociáveis: Markdown limpo; sem o pronome "você" dirigido ao leitor; sem listas de passos ou de sinais; sem clichê de autoajuda; encerramento que sustenta uma pergunta em vez de resumir.
${customReviewerPrompt ? `\nINSTRUÇÕES ADICIONAIS DO USUÁRIO:\n${customReviewerPrompt}` : ''}`;

    /* Como no rascunho: a reescrita sai em prosa livre. Ela carregava nove
       campos obrigatórios no mesmo JSON — meta description, hashtags, tags,
       takeaways — competindo com o ensaio pela mesma passada de geração. */
    const rewriteResponse = await ai.models.generateContent({
      model: REVIEW_MODEL,
      config: { systemInstruction: writerSystem },
      contents: `${draftForReview}

=== PARECER — HUMANIZAÇÃO (${specialists.humanization.severity}) ===
${specialists.humanization.notes}

=== PARECER — CONCEITUAL (${specialists.conceptual.severity}) ===
${specialists.conceptual.notes}

=== PARECER — CLÍNICO E ÉTICO (${specialists.clinical.severity}) ===
${specialists.clinical.notes}

${allIssues.length ? `PROBLEMAS CONCRETOS A CORRIGIR:\n- ${allIssues.join('\n- ')}` : ''}

Reescreva o artigo inteiro atendendo aos três pareceres.

Comece pelo título numa linha iniciada por "# ", depois o subtítulo em itálico numa linha iniciada por "_", e então o texto. Nada além disso.`,
    });

    const rewriteRaw = (rewriteResponse.text || '').trim();
    const rewrittenTitle = rewriteRaw.match(/^#\s+(.+)$/m)?.[1]?.trim() || draftTitle;
    const rewrittenSubtitle = rewriteRaw.match(/^_(.+)_\s*$/m)?.[1]?.trim() || draftSubtitle;
    const rewrittenBody = rewriteRaw
      .replace(/^#\s+.+$/m, '')
      .replace(/^_.+_\s*$/m, '')
      .trim();

    /* Metadados extraídos numa chamada própria, que lê o texto já pronto.
       Aqui o schema JSON é apropriado: são dados estruturados, não prosa. */
    const meta = await callJson(ai, {
      system:
        'Você extrai metadados editoriais de um artigo já publicado. Não opine sobre o texto nem o reescreva: apenas descreva o que está lá.',
      user: `Extraia os metadados do artigo abaixo.\n\nTÍTULO: ${rewrittenTitle}\n\n${rewrittenBody}`,
      schema: {
        type: Type.OBJECT,
        properties: {
          writerSynthesisNotes: {
            type: Type.STRING,
            description: 'Uma ou duas frases sobre o movimento central do texto',
          },
          metaDescription: { type: Type.STRING, description: 'Meta descrição SEO até 155 caracteres' },
          socialCaption: { type: Type.STRING, description: 'Legenda para redes sociais, no mesmo tom do texto' },
          hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
          suggestedTags: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: '2 a 4 tags temáticas',
          },
          keyTakeaways: { type: Type.ARRAY, items: { type: Type.STRING } },
          readingTimeMinutes: { type: Type.NUMBER },
        },
        required: [
          'writerSynthesisNotes',
          'metaDescription',
          'socialCaption',
          'hashtags',
          'suggestedTags',
          'keyTakeaways',
          'readingTimeMinutes',
        ],
      },
    });

    const rewrite = {
      ...meta,
      revisedTitle: rewrittenTitle,
      revisedSubtitle: rewrittenSubtitle,
      revisedText: rewrittenBody,
    };

    /* ---------------------------------------------------------------------
       FASE 3 — Auditoria do TEXTO FINAL.

       Esta fase não existia, e era o buraco mais sério: os pareceres julgavam
       o rascunho, mas o que ia ao ar era a reescrita — um texto que nenhum
       avaliador jamais leu. O auditor recebe apenas o resultado final, sem o
       rascunho e sem os pareceres, para não herdar a complacência de quem
       acabou de escrever.
    --------------------------------------------------------------------- */

    const audit = await callJson(ai, {
      system: `Você é o AUDITOR FINAL de um blog de psicologia clínica, e é a última instância antes da publicação.

Você recebe um artigo pronto. Não sabe quem o escreveu nem por quantas revisões passou, e isso é proposital: julgue o que está diante de você.

Regras éticas que o texto precisa cumprir:
${ethicsRules}

Reprove (approved: false) se encontrar: diagnóstico de terceiros ou do leitor; patologização de reação humana normal; promessa de cura; conselho prescritivo; exposição de caso clínico; uso do pronome "você" dirigido ao leitor; solução individual para sofrimento socialmente produzido; ou linguagem de autoajuda.

Sua função é barrar, não elogiar. Um texto medíocre porém ético passa; um texto brilhante porém antiético não passa. Na dúvida sobre uma violação ética, reprove.`,
      user: `Audite o artigo abaixo para publicação.

TÍTULO: ${rewrite.revisedTitle}
SUBTÍTULO: ${rewrite.revisedSubtitle}

${rewrite.revisedText}`,
      schema: {
        type: Type.OBJECT,
        properties: {
          approved: { type: Type.BOOLEAN, description: 'O artigo pode ser publicado?' },
          ethicsCheckPassed: { type: Type.BOOLEAN, description: 'Cumpre todas as regras éticas?' },
          severity: { type: Type.STRING, description: "'ok' | 'menor' | 'grave'" },
          summary: { type: Type.STRING, description: 'Veredito em uma ou duas frases' },
          issues: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'Cada violação encontrada, citando o trecho',
          },
        },
        required: ['approved', 'ethicsCheckPassed', 'severity', 'summary', 'issues'],
      },
    });

    /* Compatibilidade: a interface e os artigos já salvos leem os campos
       antigos. Eles continuam existindo, agora alimentados pelos pareceres
       independentes. */
    res.json({
      success: true,
      data: {
        ...rewrite,
        humanizationNotes: specialists.humanization.notes,
        conceptualNotes: specialists.conceptual.notes,
        clinicalNotes: specialists.clinical.notes,
        ethicsDetails: audit.summary,
        ethicsCheckPassed: audit.ethicsCheckPassed,
        specialists,
        audit,
      },
    });
  } catch (error: any) {
    console.error('Error reviewing draft:', error);
    res.status(500).json({ success: false, error: error.message || 'Falha ao revisar rascunho.' });
  }
});

// 3. GERADOR DE IMAGEM EDITORIAL
app.post('/api/generate-image', async (req, res) => {
  try {
    const ai = getGeminiClient();
    const { title, summary, visualStyle, promptModifier, customImagePrompt } = req.body;

    let finalImagePrompt = '';
    let conceptDesc = '';
    let altTextDesc = '';

    // Ask Gemini for a refined concise image prompt in English
    const promptCraftResponse = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: `Gere um prompt em inglês conciso e límpido (máximo 25 palavras) para um gerador de imagem editorial de psicologia:
TÍTULO: ${title}
RESUMO: ${summary}
ESTILO VISUAL: ${visualStyle} (${promptModifier})
${customImagePrompt ? `DIRETRIZ EXTRA: ${customImagePrompt}` : ''}

DIRETRIZES DE CRIAÇÃO:
- Deve ser uma imagem artística, acolhedora e poética.
- Sem texto ou palavras na imagem.
- Retorne em JSON.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            imagePromptInEnglish: { type: Type.STRING, description: 'Concise English prompt under 25 words' },
            conceptExplanation: { type: Type.STRING, description: 'Explicação poética da metáfora visual em português' },
            altText: { type: Type.STRING, description: 'Descrição acessível da imagem' },
          },
          required: ['imagePromptInEnglish', 'conceptExplanation', 'altText'],
        },
      },
    });

    const craftData = JSON.parse(promptCraftResponse.text || '{}');
    finalImagePrompt = craftData.imagePromptInEnglish || `Minimalist editorial illustration for ${title}, soft warm lighting, fine art`;
    conceptDesc = craftData.conceptExplanation || 'Ilustração editorial conceitual acolhedora.';
    altTextDesc = craftData.altText || `Ilustração de capa sobre ${title}`;

    // Clean prompt for URL construction
    const cleanPrompt = finalImagePrompt
      .replace(/[^\w\s,.-]/gi, '')
      .slice(0, 150);

    const uniqueSeed = Math.floor(Math.random() * 900000) + 100000;
    const encodedPrompt = encodeURIComponent(cleanPrompt);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1200&height=675&nologo=true&seed=${uniqueSeed}`;

    res.json({
      success: true,
      data: {
        imageUrl,
        promptUsed: finalImagePrompt,
        conceptExplanation: conceptDesc,
        altText: altTextDesc,
        styleUsed: visualStyle,
      },
    });
  } catch (error: any) {
    console.error('Error generating image:', error);
    res.status(500).json({ success: false, error: error.message || 'Falha ao gerar imagem.' });
  }
});

// 4. REFINAMENTO PONTUAL DE SELEÇÃO DE TEXTO
app.post('/api/refine-selection', async (req, res) => {
  try {
    const ai = getGeminiClient();
    const { selectedText, instruction, fullText, userManifesto } = req.body;

    if (!selectedText || !instruction) {
      return res.status(400).json({ success: false, error: 'Texto selecionado e instrução são obrigatórios.' });
    }

    const authorName = userManifesto?.authorName || 'Autor(a)';
    const worldview = userManifesto?.worldviewDescription || 'Visão ensaística e clínica';
    const authorTone = userManifesto?.toneOfVoice || 'Acolhedor, ensaístico, denso e profundo';
    const probTerms = userManifesto?.prohibitedTerms?.join(', ') || 'uso do pronome você, conselhos rápidos';

    const systemPrompt = `Você é um Revisor e Escritor Clínico/Editorial de Psicologia do autor ${authorName}.
Sua tarefa é REESCREVER estritamente o trecho de texto selecionado pelo usuário, aplicando com rigor a instrução de correção fornecida.

=== VISÃO DE MUNDO E TOM DE VOZ ===
${worldview}
Tom: ${authorTone}

=== REGRAS DE OURO ===
1. Mantenha o formato em Markdown se for o caso.
2. NUNCA use a palavra "você" nem se dirija diretamente ao leitor de forma prescritiva.
3. Não use clichês de autoajuda nem listas numeradas de conselhos.
4. O trecho reescrito deve se integrar de forma fluida ao restante do ensaio.
5. Retorne APENAS o trecho reescrito atualizado em JSON no campo "rewrittenText", acompanhado de uma breve explicação em "explanation".`;

    const userPrompt = `TRECHO SELECCIONADO PELO AUTOR PARA CORREÇÃO:
"${selectedText}"

INSTRUÇÃO DE MUDANÇA / CORREÇÃO:
"${instruction}"

${fullText ? `CONTEXTO AO ENTORNO (APENAS REFERÊNCIA):\n${fullText.slice(0, 1000)}...` : ''}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            rewrittenText: { type: Type.STRING, description: 'Novo trecho reescrito com as correções aplicadas' },
            explanation: { type: Type.STRING, description: 'Resumo da alteração realizada' },
          },
          required: ['rewrittenText', 'explanation'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Erro ao reescrever seleção:', error);
    res.status(500).json({ success: false, error: error.message || 'Falha ao reescrever seleção.' });
  }
});

// 5. GERADOR MULTIFORMATO: Converte artigo em Roteiro de Carrossel (5-8 slides) e Roteiro de Vídeo/Reels
app.post('/api/generate-derived-formats', async (req, res) => {
  try {
    const ai = getGeminiClient();
    const { title, text, userManifesto } = req.body;

    if (!title || !text) {
      return res.status(400).json({ success: false, error: 'Título e texto são obrigatórios.' });
    }

    const authorName = userManifesto?.authorName || 'Autor(a)';
    const worldview = userManifesto?.worldviewDescription || 'Visão ensaística e clínica de psicologia';
    const authorTone = userManifesto?.toneOfVoice || 'Acolhedor, profundo e provocativo';

    const systemPrompt = `Você é um Especialista em Adaptação de Conteúdo Editorial para Mídias Sociais de Psicologia.
Seu objetivo é transformar o ensaio de psicologia do autor (${authorName}) em dois formatos dinâmicos sem perder a elegância, a densidade e o tom ensaístico:
1. ROTEIRO DE CARROSSEL DE 5 A 8 SLIDES: Cada slide com um título forte, um parágrafo reflexivo curto (sem clichês) e uma indicação de elemento visual/atmosfera.
2. ROTEIRO DE VÍDEO CURTO / REELS (60s): Com gancho inicial impactante, 3 momentos de fala contínua e uma chamada reflexiva para comentários.

=== VISÃO E TOM DO AUTOR ===
${worldview}
Tom: ${authorTone}
NUNCA use a palavra "você" de forma apelativa ou conselhos em 5 passos. Mantenha a elegância.`;

    const userPrompt = `ARTIGO DE ORIGEM:
TÍTULO: ${title}

CONTEÚDO:
${text}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            carousel: {
              type: Type.OBJECT,
              properties: {
                slides: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      slideNumber: { type: Type.NUMBER },
                      slideTitle: { type: Type.STRING, description: 'Título/Gatilho do slide' },
                      bodyText: { type: Type.STRING, description: 'Texto provocativo curto do slide' },
                      visualCue: { type: Type.STRING, description: 'Sugestão de cor/atmosfera do slide' },
                    },
                    required: ['slideNumber', 'slideTitle', 'bodyText'],
                  },
                },
                caption: { type: Type.STRING, description: 'Legenda para o carrossel no Instagram/LinkedIn' },
              },
              required: ['slides', 'caption'],
            },
            reelsScript: {
              type: Type.OBJECT,
              properties: {
                hook: { type: Type.STRING, description: 'Frase inicial nos primeiros 3 segundos para capturar atenção' },
                coreNarrative: { type: Type.STRING, description: 'Texto completo de fala em prosa fluida (~60 segundos)' },
                visualInstructions: { type: Type.STRING, description: 'Sugestão de enquadramento, iluminação e postura' },
                callToReflection: { type: Type.STRING, description: 'Provocação final para o leitor responder nos comentários' },
              },
              required: ['hook', 'coreNarrative', 'callToReflection'],
            },
          },
          required: ['carousel', 'reelsScript'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Erro ao gerar formatos derivados:', error);
    res.status(500).json({ success: false, error: error.message || 'Falha ao converter em carrossel/reels.' });
  }
});

// Vite middleware logic for dev vs prod
async function startServer() {
  const PORT = Number(process.env.PORT) || 3000;

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    // Endereço navegável, não o de bind: http://0.0.0.0 não resolve no navegador.
    console.log(`PsicoContent Studio: http://localhost:${PORT}`);
  });

  server.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
      console.error(
        `A porta ${PORT} já está em uso. Rode com outra porta: PORT=3100 npm run dev`
      );
      process.exit(1);
    }
    throw err;
  });
}

startServer();
