import { ArticlePost, UserManifesto } from '../types';
import { supabase, isSupabaseConfigured } from './supabase';
import {
  getStoredPosts,
  savePostToStorage,
  deletePostFromStorage,
  getStoredManifesto,
  saveManifestoToStorage,
  replaceAllPosts,
} from './storage';

/* Camada de acesso a dados.

   O Supabase é a fonte de verdade; o localStorage é um espelho síncrono. Duas
   razões para manter os dois:

   1. Vários componentes leem o manifesto de forma síncrona durante a
      renderização (ArticleResultView faz isso em seis pontos). Um espelho local
      evita reescrever tudo para async.
   2. Se a rede ou o Supabase caírem, o app continua utilizável com os dados que
      já estão na máquina, em vez de abrir vazio.

   Toda escrita vai para os dois lados. Quando a remota falha, a local já
   aconteceu e a função devolve o erro para a interface avisar — nunca fingimos
   que salvou. */

export interface SyncResult<T> {
  data: T;
  /* Preenchido quando a gravação remota falhou mas a local funcionou. */
  remoteError?: string;
}

const describe = (e: unknown) =>
  e instanceof Error ? e.message : typeof e === 'string' ? e : 'Erro desconhecido';

/* Artigos ------------------------------------------------------------------ */

const toRow = (post: ArticlePost) => ({
  id: post.id,
  criado_em: post.createdAt,
  atualizado_em: post.updatedAt ?? new Date().toISOString(),
  topico: post.topic ?? '',
  titulo: post.review?.revisedTitle || post.draft?.title || post.topic || '',
  status: post.status ?? 'completed',
  dados: post as unknown as Record<string, unknown>,
});

const fromRow = (row: { dados: unknown }): ArticlePost => row.dados as ArticlePost;

/** Carrega a biblioteca. Em caso de falha remota, devolve o espelho local. */
export async function loadPosts(): Promise<SyncResult<ArticlePost[]>> {
  const local = getStoredPosts();

  if (!supabase) return { data: local };

  try {
    const { data, error } = await supabase
      .from('artigos')
      .select('dados')
      .order('atualizado_em', { ascending: false });

    if (error) throw error;

    const remote = (data ?? []).map(fromRow).filter(Boolean);
    /* O remoto manda: espelha localmente para que a próxima leitura síncrona e
       uma eventual queda de rede já encontrem os dados atualizados. */
    replaceAllPosts(remote);
    return { data: remote };
  } catch (e) {
    return { data: local, remoteError: describe(e) };
  }
}

/* Envio ao servidor. A gravação local é feita pelo chamador, de forma síncrona,
   para que a tela reaja na hora; estas funções cuidam só do lado remoto e
   devolvem a mensagem de erro quando ele falha (undefined quando dá certo). */

export async function pushPost(post: ArticlePost): Promise<string | undefined> {
  if (!supabase) return undefined;
  try {
    const { error } = await supabase.from('artigos').upsert(toRow(post), { onConflict: 'id' });
    if (error) throw error;
    return undefined;
  } catch (e) {
    return describe(e);
  }
}

export async function removePost(id: string): Promise<string | undefined> {
  if (!supabase) return undefined;
  try {
    const { error } = await supabase.from('artigos').delete().eq('id', id);
    if (error) throw error;
    return undefined;
  } catch (e) {
    return describe(e);
  }
}

/* Manifesto ---------------------------------------------------------------- */

export async function loadManifesto(): Promise<SyncResult<UserManifesto>> {
  const local = getStoredManifesto();

  if (!supabase) return { data: local };

  try {
    const { data, error } = await supabase
      .from('manifesto')
      .select('dados')
      .eq('id', 'singleton')
      .maybeSingle();

    if (error) throw error;
    if (!data) return { data: local }; // ainda não migrado

    const remote = data.dados as UserManifesto;
    saveManifestoToStorage(remote);
    return { data: remote };
  } catch (e) {
    return { data: local, remoteError: describe(e) };
  }
}

export async function saveManifesto(
  manifesto: UserManifesto
): Promise<SyncResult<UserManifesto>> {
  saveManifestoToStorage(manifesto);

  if (!supabase) return { data: manifesto };

  try {
    const { error } = await supabase.from('manifesto').upsert(
      {
        id: 'singleton',
        atualizado_em: new Date().toISOString(),
        dados: manifesto as unknown as Record<string, unknown>,
      },
      { onConflict: 'id' }
    );
    if (error) throw error;
    return { data: manifesto };
  } catch (e) {
    return { data: manifesto, remoteError: describe(e) };
  }
}

/* Migração ------------------------------------------------------------------
   Envia para o Supabase o que já existia só no navegador. Roda uma vez, na
   primeira vez que o app abre com as credenciais preenchidas. */

const MIGRATION_FLAG = 'psicocontent_supabase_migrado_v1';

export interface MigrationOutcome {
  ran: boolean;
  articlesSent: number;
  error?: string;
}

export async function migrateLocalDataIfNeeded(): Promise<MigrationOutcome> {
  if (!supabase) return { ran: false, articlesSent: 0 };

  try {
    if (localStorage.getItem(MIGRATION_FLAG)) return { ran: false, articlesSent: 0 };
  } catch {
    return { ran: false, articlesSent: 0 };
  }

  const localPosts = getStoredPosts();

  try {
    /* Só migra o que ainda não existe lá, para não sobrescrever uma versão
       remota mais nova com uma cópia local antiga. */
    const { data: existing, error: readError } = await supabase.from('artigos').select('id');
    if (readError) throw readError;

    const known = new Set((existing ?? []).map((r: { id: string }) => r.id));
    const pending = localPosts.filter((p) => !known.has(p.id));

    if (pending.length > 0) {
      const { error } = await supabase.from('artigos').upsert(pending.map(toRow), {
        onConflict: 'id',
      });
      if (error) throw error;
    }

    // O manifesto só sobe se ainda não houver um lá.
    const { data: manifestoRow, error: manifestoReadError } = await supabase
      .from('manifesto')
      .select('id')
      .eq('id', 'singleton')
      .maybeSingle();
    if (manifestoReadError) throw manifestoReadError;

    if (!manifestoRow) {
      await supabase.from('manifesto').upsert({
        id: 'singleton',
        atualizado_em: new Date().toISOString(),
        dados: getStoredManifesto() as unknown as Record<string, unknown>,
      });
    }

    localStorage.setItem(MIGRATION_FLAG, new Date().toISOString());
    return { ran: true, articlesSent: pending.length };
  } catch (e) {
    // Sem marcar a flag: tenta de novo no próximo carregamento.
    return { ran: false, articlesSent: 0, error: describe(e) };
  }
}
