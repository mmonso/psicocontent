# PsicoContent Studio

Estúdio de escrita para um blog de psicologia autoral. Você define uma vez como
pensa e como escreve; o sistema produz ensaios nessa voz, submete cada um a um
comitê editorial e barra o que não passa na auditoria ética.

Não é um gerador de posts. É um pipeline com controle de qualidade, feito para
texto longo — ensaios de 800 a 1600 palavras que sustentam uma pergunta em vez
de fechar numa lição.

---

## Como rodar

```bash
npm install
PORT=3001 HMR_PORT=24679 npm run dev
```

Abra **http://localhost:3001** — não `0.0.0.0`, que é o endereço de bind e o
navegador recusa com `ERR_ADDRESS_INVALID`.

`PORT` e `HMR_PORT` só são necessários se outro projeto já ocupar 3000 e 24678.
Sem eles, `npm run dev` usa os padrões. Se a porta estiver tomada, o servidor
falha com uma mensagem dizendo o que fazer — não sobe pela metade.

> No Windows, um servidor pode fazer bind em `0.0.0.0:3000` sem erro enquanto
> outro processo segura `localhost:3000`. O log diz "rodando" e o navegador
> entrega o app errado. Se algo parecer estranho, confira o `<title>` da página.

### Variáveis de ambiente

Copie `.env.example` para `.env` e preencha:

| Variável | Obrigatória | Para quê |
|---|---|---|
| `GEMINI_API_KEY` | sim | Todas as chamadas ao modelo |
| `VITE_SUPABASE_URL` | não | Persistência na nuvem |
| `VITE_SUPABASE_ANON_KEY` | não | Persistência na nuvem |
| `PORT` | não | Porta do servidor (padrão 3000) |
| `HMR_PORT` | não | Porta do hot reload (padrão 24678) |

Sem as duas do Supabase o app funciona normalmente, gravando só no navegador —
o indicador no cabeçalho mostra "Só neste navegador".

Variáveis `VITE_*` são lidas **na inicialização** e embutidas no bundle. Mexeu
no `.env`, reinicie o servidor.

### Comandos

```bash
npm run dev     # desenvolvimento
npm run build   # produção -> dist/
npm start       # roda o build
npm run lint    # tsc --noEmit
```

Use **npm**. O `package-lock.json` é versionado e deve ser commitado junto
quando dependências mudarem.

---

## O pipeline editorial

Produzir um artigo dispara **8 chamadas ao modelo** — 6 delas na fase de
revisão. A arquitetura existe por um motivo específico: a versão anterior
descrevia um "comitê de especialistas" que era, na prática, uma única chamada
produzindo os pareceres e o texto no mesmo fôlego. Três seções de uma resposta
não são três perspectivas — não podem discordar entre si.

```
  ┌─ Fase 1 ─────────────────────────────────────────┐
  │  Rascunho                          1 chamada     │
  │  Prosa livre, sem schema JSON                    │
  └──────────────────────┬───────────────────────────┘
                         ▼
  ┌─ Fase 2 ─────────────────────────────────────────┐
  │  Comitê — 3 chamadas PARALELAS E INDEPENDENTES   │
  │                                                  │
  │    Humanização    ritmo, marcas de IA, abertura  │
  │    Conceitual     rigor dos conceitos            │
  │    Clínico        limites éticos                 │
  │                                                  │
  │  Nenhum vê o parecer do outro.                   │
  │  Cada um devolve: notes, approved, severity,     │
  │  issues[]                                        │
  └──────────────────────┬───────────────────────────┘
                         │
   O especialista de humanização não julga por            
   impressão: precisa CONTAR e relatar cinco itens,       
   e cada um sozinho reprova.                             
     1  marcas de primeira pessoa (zero = reprova)        
     2  impessoal com "se" (mais de duas = reprova)       
     3  ritmo de parágrafo (todos iguais = reprova)       
     4  a cena de abertura retorna depois?                
     5  a última linha é pergunta, e depende do texto?    
                         │
                         ▼
  ┌─ Fase 3 ─────────────────────────────────────────┐
  │  Reescrita                         1 chamada     │
  │  O redator recebe os 3 pareceres e reescreve     │
  │  do zero. Prosa livre.                           │
  │                                                  │
  │  Metadados                         1 chamada     │
  │  SEO, hashtags, tags, takeaways — extraídos      │
  │  do texto pronto, onde schema JSON faz sentido   │
  └──────────────────────┬───────────────────────────┘
                         ▼
  ┌─ Fase 4 ─────────────────────────────────────────┐
  │  Auditoria final                   1 chamada     │
  │                                                  │
  │  Lê APENAS o texto reescrito. Sem o rascunho,    │
  │  sem os pareceres — para não herdar a            │
  │  complacência de quem acabou de escrever.        │
  │                                                  │
  │  Devolve: approved, ethicsCheckPassed, issues[]  │
  └──────────────────────┬───────────────────────────┘
                         ▼
                    Capa editorial            1 chamada
                    Falha aqui não derruba o artigo:
                    cai numa capa padrão.
```

Somando: 1 rascunho + 3 pareceres + 1 reescrita + 1 metadados + 1 auditoria +
1 capa = **8 chamadas**. A fase de revisão sozinha (`/api/review-draft`)
concentra 6 delas e leva cerca de 40 segundos.

### Por que a auditoria lê só o texto final

Este era o buraco mais sério da versão anterior. Os pareceres julgavam o
rascunho, mas o que ia ao ar era a reescrita — um texto que nenhum avaliador
jamais tinha lido. Você abria a aba de pareceres e lia a análise de uma versão
que não existia mais.

### O portão tem consequência

`audit.approved === false` faz três coisas: avisa explicitamente na tela,
marca o artigo, e **o exclui do Portal Público**.

Isso é deliberado. Antes existia um campo `ethicsCheckPassed` obrigatório no
schema que nenhuma linha de código lia — e o painel exibia "Filtro Ético
Aprovado" com um check verde fixo no código, independentemente do resultado.
Uma aprovação fabricada, mostrada ao autor como se fosse verificação.

Artigos gerados antes do comitê existir não têm auditoria e passam: nunca foram
avaliados, e barrá-los retroativamente esvaziaria o Portal sem aviso.

### Retentativa

As seis chamadas passam por `withRetry`: três tentativas com recuo exponencial
e ruído aleatório, para os especialistas paralelos não voltarem todos no mesmo
instante e recriarem o pico de carga.

Só reexecuta o que é transitório — `429`, `5xx`, `UNAVAILABLE`,
`RESOURCE_EXHAUSTED`, resets de conexão. Chave inválida ou cota estourada não
melhoram com repetição e falham na hora.

---

## O manifesto

`DEFAULT_USER_MANIFESTO` em [`src/lib/storage.ts`](src/lib/storage.ts) é o
coração do sistema: define quem escreve. Editável pela interface em
**Minha visão**.

| Campo | Papel |
|---|---|
| `toneOfVoice` | **Quem fala.** Primeira pessoa como regra principal |
| `worldviewDescription` | Como o autor pensa. Vai para todos os agentes. |
| `writerInstructions` | Como o texto se comporta — com exemplos contrastantes |
| `intendedEffect` | O efeito pretendido no leitor, em linguagem sensorial |
| `calibrationReferences` | Onde está a régua: publicações e autores de referência |
| `thematicAxes` | Eixos relacionais e seus assuntos |
| `ethicsRules` | Regras que a auditoria aplica |
| `prohibitedTerms` | O que denuncia um texto fraco |
| `humanizerInstructions` / `conceptualCuratorInstructions` | Diretrizes por especialista |

### Quatro decisões de prompt que mediram diferença

Testadas contra as mesmas pautas e o mesmo modelo. Os ganhos são reais, mas a
amostra é pequena — uma geração por tema, sem repetição por condição, e só a
etapa de rascunho.

**Prosa livre em vez de schema JSON.** O ensaio era um campo entre quatro (nove
na reescrita), escrito como string escapada enquanto a mesma passada produzia
hashtags e SEO. Extensão foi de 607 para 793–932 palavras contra um alvo de
800–1100.

**Direção em vez de proibição.** O manifesto tinha 41 marcadores de proibição e
o prompt abria com "ABSOLUTAMENTE PROIBIDO". Um modelo otimizando contra isso
escreve defensivamente: evita o erro em vez de alcançar a frase. Conectores
burocráticos foram de 5 para 0.

**Exemplos contrastantes em vez de descrição.** "Comece dentro de uma cena" era
obedecido ao pé da letra enquanto o hábito sintático sobrevivia — todo texto
começava com "Há um fenômeno…". Mostrar pares ✗/✓ resolveu: aberturas em cena
foram de 0/1 para 3/3, fechos em pergunta idem.

**Uma proibição alta engole uma exigência baixa.** Este é o achado mais
transferível dos quatro, e o mais fácil de reintroduzir por engano.

O `toneOfVoice` começava com "Escrever em primeira pessoa" e, na frase
seguinte, proibia "você" oferecendo `"há momentos em que"` e `"podemos pensar"`
como alternativas. Medido em três textos, marcas de primeira pessoa: **zero**.
Não escassas — ausentes.

A proibição era alta e específica; a exigência de autoria era oração de
passagem; e as alternativas sugeridas são elas próprias impessoais. O modelo
obedeceu a parte alta e derivou para `trata-se de`, `observa-se`, `nota-se` —
doze construções em três textos. Cada uma apaga quem fala, e é isso que faz a
prosa soar como máquina.

O campo agora abre pelo autor e trata "você" como limite de fechamento, com
pares ✗/✓ mostrando a construção impessoal ao lado da equivalente em primeira
pessoa.

Junto veio o ritmo de parágrafo: eram dez a doze parágrafos de 78–88 palavras
cada, todos uma pequena dissertação completa. Forma de relatório. As
instruções agora exigem ao menos dois parágrafos de uma ou duas frases,
permitem parágrafos que deslocam sem concluir, e exigem que a cena de abertura
retorne — cena que aparece uma vez e nunca mais é decoração.

| | Antes | Depois |
|---|---|---|
| Marcas de 1ª pessoa | 0 | 14 |
| Impessoal com "se" | 12 | 0 |
| Parágrafos curtos (≤2 frases) | 3 | 11 |
| Variação de parágrafo (CV) | 0,24 | 0,53 |

> **Se for editar o manifesto:** cuidado ao acrescentar proibições. Elas
> competem por atenção com o que você pede de fato, e a proibição costuma
> vencer. Prefira descrever o comportamento desejado e deixar os limites no
> fim, curtos.

---

## Onde os dados ficam

**Supabase é a fonte de verdade; `localStorage` é um espelho síncrono.**

Os dois existem de propósito. `ArticleResultView` lê o manifesto de forma
síncrona durante a renderização em seis pontos, e o app precisa continuar
utilizável se a rede cair — em vez de abrir vazio.

Toda escrita vai primeiro para o disco local (síncrona, garantia mínima de não
perder texto) e sobe em segundo plano. Falha de sincronia nunca é silenciosa: o
indicador no cabeçalho mostra *Só neste navegador · Sincronizando · Salvo na
nuvem · Sem conexão*.

O artigo é guardado como **JSONB** numa coluna `dados`, com `topico`, `titulo`,
`status` e datas ao lado para ordenar e filtrar. A estrutura tem partes
opcionais e aninhadas que ainda mudam; normalizar tudo em colunas obrigaria a
uma migração a cada ajuste no produto.

### Configurar o Supabase

1. Crie um projeto em https://supabase.com/dashboard
2. Rode [`supabase/schema.sql`](supabase/schema.sql) no SQL Editor
3. Em *Project Settings → API*, copie a URL e a chave anon para o `.env`
4. Reinicie o servidor

Na primeira abertura com as chaves preenchidas, o que já existia no navegador
sobe sozinho — uma vez só, com aviso de quantos artigos foram enviados. Cada
navegador roda a própria migração.

### ⚠️ Segurança

As políticas RLS estão **abertas para escrita**, por escolha. A chave anon é
visível no JavaScript entregue ao navegador, então quem tiver a URL do projeto
e essa chave pode apagar a biblioteca inteira.

Isso é aceitável enquanto o app rodar só na sua máquina. **Antes de publicar em
qualquer lugar acessível pela internet**, ative o Supabase Auth e troque pelas
políticas do bloco "VERSÃO PROTEGIDA", já escritas e comentadas no final do
`schema.sql`.

---

## Estrutura

```
server.ts                  Express + Vite; todos os endpoints do Gemini
src/
  App.tsx                  Orquestra o pipeline, portão de qualidade, sincronia
  types.ts                 Contratos de dados
  index.css                Tokens de design
  lib/
    storage.ts             localStorage + manifesto padrão
    supabase.ts            Cliente; null quando não configurado
    repository.ts          Camada de dados: local síncrono + remoto assíncrono
  components/
    ui/index.tsx           Button, Card, Badge, Field, SectionHeader, EmptyState
    Navbar.tsx             3 seções + indicador de sincronia
    CreatePostTab.tsx      Formulário de produção
    PipelineTracker.tsx    Progresso com cronômetro
    ArticleResultView.tsx  Leitura, edição, pareceres, exportação (2269 linhas)
    ArticleHistoryTab.tsx  Biblioteca
    PublicBlogPortal.tsx   Prévia pública
    ManifestoEditor.tsx    Edição da visão de mundo
supabase/schema.sql        Tabelas e políticas RLS
```

### Endpoints

| Rota | O que faz |
|---|---|
| `GET /api/health` | Status e presença da chave |
| `POST /api/generate-topics` | Sugestões de pauta |
| `POST /api/generate-draft` | Rascunho (prosa livre) |
| `POST /api/review-draft` | **Orquestra comitê + reescrita + auditoria** |
| `POST /api/generate-image` | Capa editorial |
| `POST /api/refine-selection` | Reescreve um trecho selecionado |
| `POST /api/generate-derived-formats` | Carrossel e roteiro de reels |

---

## Sistema visual

Tema escuro único, acento único. A hierarquia vem da tipografia e do
espaçamento; a cor entra só onde há ação ou estado.

Os tokens ficam em [`src/index.css`](src/index.css) — `surface`, `ink`, `line`,
`accent`, `danger`, `success`. **Não use paleta crua do Tailwind** (`bg-teal-700`,
`text-stone-400`): o projeto passou por uma migração dolorosa justamente para
sair disso, e classes cruas reintroduzem a inconsistência.

O modo de leitura do artigo tem tema próprio — Noturno, Sépia e Papel — que é
independente da interface. Dentro do corpo do artigo, **o texto herda a cor da
superfície** e a hierarquia vem de opacidade e `border-current`. Fixar
`text-ink` ali torna o texto invisível nos temas claros.

---

## Estado atual e limitações conhecidas

**O pipeline completo nunca foi medido de ponta a ponta.** Todas as métricas de
qualidade acima vêm da etapa de rascunho isolada. O comitê e a auditoria
rodaram uma vez em teste próprio, mas nunca numa produção completa.

**Os cinco critérios contáveis do especialista de humanização nunca rodaram.**
Foram escritos e nunca executados. Não se sabe se o modelo consegue contar
marcas de primeira pessoa e construções impessoais de forma confiável — é
plausível que erre, e nesse caso reprovaria texto bom ou aprovaria texto ruim.
Vale conferir os números que ele relata contra o texto antes de confiar neles.

**O caminho de reprovação nunca foi exercitado.** A lógica que barra um artigo
reprovado está escrita e tipada, mas nunca se viu a auditoria barrar de fato —
nos testes o texto reescrito sempre passou.

**As métricas desta documentação são heurísticas escritas à mão**, não
ferramentas estabelecidas. Uma delas chegou a reprovar aberturas corretas
porque o regex proibia frases começando com artigo definido — que é
exatamente a forma de uma boa abertura concreta. Números aqui merecem
conferência contra o texto.

**A nota de ética no rodapé do artigo é fixa no código** e trata o leitor por
"você", contrariando o manifesto. Ficou por ter função protetiva, mas pode ser
reescrita sem o pronome.

**`ArticleResultView` tem ~2180 linhas** e concentra leitura, edição, correção
por seleção, exportação em quatro formatos, carrossel e reels. É o principal
candidato a divisão.

**`PublicBlogPortal` e `ArticleResultView` foram normalizados por codemod**, não
reescritos: as cores estão coerentes, mas layout e espaçamento não passaram por
revisão de design.

**`package.json` ainda se chama `react-example`**, resíduo do scaffold original.

---

## Créditos

Gemini para geração de texto e imagem, React 19, Vite 6, Tailwind CSS 4,
Express, Supabase.
