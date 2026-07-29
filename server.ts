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

=== TERMOS E CONSTRUÇÕES ESTRITAMENTE PROIBIDOS ===
ABSOLUTAMENTE PROIBIDO USAR OU FAZER: ${probTerms}

=== DIRETRIZES DE ESCRITA ANTI-GENÉRICA DO AUTOR ===
${writerInst}

=== PARÂMETROS DO ARTIGO ===
Nível de Profundidade: ${depthLevel}
Extensão do Texto: ${lengthGuide}

=== REGRAS DE OURO CONTRA TEXTO GENÉRICO ===
1. NUNCA use o pronome "você" nem se dirija diretamente ao leitor ("você sente", "você precisa"). Prefira a 1ª pessoa do plural ("podemos pensar", "vemos aqui") ou construções ensaísticas ("há momentos em que", "observa-se").
2. NUNCA comece com introduções clichês ("No mundo acelerado de hoje...", "É muito comum sentir..."). Comece imediatamente por uma tensão, paradoxo, cena do cotidiano ou citação implícita.
3. NUNCA crie listas de "5 passos", "dicas de bem-estar" ou "red flags". Mantenha o texto em prosa fluida, contínua e ensaística.
4. NUNCA cite nomes de autores ou escolas teóricas diretamente. As referências (Gestalt, fenomenologia, psicanálise, Espinosa) devem surgir assimiladas como modo de pensar e de olhar para o mundo.
5. NUNCA termine com resumos burocráticos ("Em suma...", "Em conclusão...") ou morais da história. Mantenha o encerramento aberto com uma pergunta provocativa ou tensão existencial.
6. Mantenha o texto em prosa fluida, densa, contínua e ensaística do início ao fim, evitando FAQs ou sessões artificiais de autoajuda.

${customWriterPrompt ? `\nINSTRUÇÕES ADICIONAIS DO USUÁRIO:\n${customWriterPrompt}` : ''}`;

    const userPrompt = `Por favor, elabore o artigo completo baseado no tema: "${topic}".`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: 'Título provocativo, poético e conceitual do artigo' },
            subtitle: { type: Type.STRING, description: 'Subtítulo reflexivo' },
            outline: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Eixos conceituais abordados no artigo',
            },
            rawText: { type: Type.STRING, description: 'Texto completo do artigo formatado em Markdown' },
          },
          required: ['title', 'subtitle', 'outline', 'rawText'],
        },
      },
    });

    const text = response.text || '{}';
    const parsedData = JSON.parse(text);

    res.json({
      success: true,
      data: {
        title: parsedData.title,
        subtitle: parsedData.subtitle,
        outline: parsedData.outline || [],
        rawText: parsedData.rawText,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Error generating draft:', error);
    res.status(500).json({ success: false, error: error.message || 'Falha ao gerar rascunho.' });
  }
});

// 2. REVISOR CLÍNICO: Revisa e Polir o Artigo + Parecer Ético segundo a Visão de Mundo
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

    const systemPrompt = `Você opera como um COMITÊ EDITORIAL E DE REDAÇÃO SÊNIOR para o blog do(a) profissional ${authorName}.
Este comitê é composto por 3 ESPECIALISTAS AVALIADORES e pelo REDATOR PRINCIPAL, que unifica tudo:

=== 1. EDITOR DE HUMANIZAÇÃO & CADÊNCIA TEXTUAL ("DES-AIZADOR") ===
- Função: Identificar e destruir qualquer vestígio de linguagem robótica, frases de transição de IA ("Além disso", "Portanto", "No entanto", "Vale ressaltar"), simetria mecânica de parágrafos e entusiasmo artificial.
- Diretrizes do Autor: ${humanizerInst}
- Saída: Escreva um parecer detalhado no campo "humanizationNotes" indicando os vícios de IA identificados e como o ritmo deve ser humanizado e oxigenado.

=== 2. CURADOR CONCEITUAL & FILOSÓFICO ("GUARDIÃO DA TEORIA") ===
- Função: Avaliar a profundidade teórica, fenomenológica e existencial. Garantir que os conceitos do manifesto (Espinosa, Gestalt, crítica social, sentido do sintoma) não sejam superficiais nem slogans de autoajuda.
- Diretrizes do Autor: ${conceptualInst}
- Saída: Escreva um parecer detalhado no campo "conceptualNotes" indicando pontos a aprofundar e alinhamento filosófico.

=== 3. REVISOR CLÍNICO & ÉTICO ("GUARDIÃO ÉTICO") ===
- Função: Verificar o cumprimento de limites éticos (sem diagnósticos précoces, sem uso direto de 'você', sem conselhos prescritivos).
- Regras Éticas: ${ethicsRules}
- Diretrizes: ${reviewerInst}
- Saída: Escreva seu parecer técnico no campo "clinicalNotes" e o resultado ético em "ethicsDetails".

=== 4. REDATOR PRINCIPAL — REESCRITA E SÍNTESE UNIFICADA (MANDATO ABSOLUTO DE COESÃO) ===
CRÍTICO: O texto final ("revisedText") NUNCA PODE SER UMA COLCHA DE RETALHOS com retalhos e trechos colados sem nexo.
O Redator Principal recebe os pareceres dos 3 especialistas acima e REESCREVE O ARTIGO DO ZERO de forma totalmente integrada, fluida, visceral e coesa.
- Todas as correções de humanização, rigor conceitual e postura clínica devem ser dissolvidas organicamente em uma única voz autoral.
- O texto final deve ser formatado em Markdown impecável, sem listas numeradas de 5 passos, sem o pronome 'você' e sem clichês.
- No campo "writerSynthesisNotes", o Redator explica resumidamente como unificou as orientações dos especialistas em uma única narrativa fluida.

${customReviewerPrompt ? `\nINSTRUÇÕES ADICIONAIS DO USUÁRIO PARA A REVISÃO:\n${customReviewerPrompt}` : ''}`;

    const userPrompt = `Realize a análise multidisciplinar pelos 3 especialistas e execute a REESCRITA UNIFICADA E COESA pelo Redator Principal para o seguinte rascunho:

TEMA: ${topic}
TÍTULO ATUAL: ${draftTitle}
SUBTÍTULO ATUAL: ${draftSubtitle}

TEXTO RASCUNHO PARA REVISÃO E REESCRITA:
${draftText}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            revisedTitle: { type: Type.STRING, description: 'Título final polido e provocativo' },
            revisedSubtitle: { type: Type.STRING, description: 'Subtítulo final refinado' },
            revisedText: { type: Type.STRING, description: 'Texto completamente reescrito e unificado pelo Redator Principal em Markdown, sem clichês, marcas de IA ou "você"' },
            humanizationNotes: { type: Type.STRING, description: 'Parecer do Editor de Humanização: marcas de IA expurgadas, conectores cortados e ritmo oxigenado' },
            conceptualNotes: { type: Type.STRING, description: 'Parecer do Curador Conceitual: alinhamento com a visão de mundo, Espinosa, Gestalt e fenomenologia' },
            clinicalNotes: { type: Type.STRING, description: 'Parecer do Revisor Clínico: adequação ética, ausência de conselhos de autoajuda e limites da prática' },
            writerSynthesisNotes: { type: Type.STRING, description: 'Explicativo do Redator Principal sobre como fundiu as orientações dos especialistas em uma prosa única e coesa' },
            ethicsCheckPassed: { type: Type.BOOLEAN },
            ethicsDetails: { type: Type.STRING, description: 'Comentários sobre a adequação ética e recusa de diagnósticos rasos' },
            metaDescription: { type: Type.STRING, description: 'Meta descrição para SEO até 155 caracteres' },
            socialCaption: { type: Type.STRING, description: 'Legenda pronta para redes sociais alinhada ao tom crítico do autor' },
            hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
            suggestedTags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '2 a 4 tags temáticas para categorização (ex: Ansiedade, Luto, Relacionamentos, Clínica, Existencialismo, Depressão, Autoestima, Vínculos)',
            },
            keyTakeaways: { type: Type.ARRAY, items: { type: Type.STRING } },
            readingTimeMinutes: { type: Type.NUMBER },
          },
          required: [
            'revisedTitle',
            'revisedSubtitle',
            'revisedText',
            'humanizationNotes',
            'conceptualNotes',
            'clinicalNotes',
            'writerSynthesisNotes',
            'ethicsCheckPassed',
            'ethicsDetails',
            'metaDescription',
            'socialCaption',
            'hashtags',
            'keyTakeaways',
            'readingTimeMinutes',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');

    res.json({
      success: true,
      data: parsed,
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
