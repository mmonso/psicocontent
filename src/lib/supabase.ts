import { createClient, SupabaseClient } from '@supabase/supabase-js';

/* Cliente Supabase.

   Só as variáveis com prefixo VITE_ chegam ao navegador — as demais ficam no
   servidor. A chave usada aqui é a anon/public, feita para ser exposta; a
   service_role nunca deve aparecer neste arquivo nem em qualquer código que
   vá para o cliente.

   Quando as credenciais não estão preenchidas, `supabase` é null e o app
   continua funcionando apenas com o armazenamento local. Isso mantém o projeto
   utilizável antes do setup e resistente a uma queda do Supabase. */

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

const isConfigured =
  !!url &&
  !!anonKey &&
  !url.includes('MY_SUPABASE') &&
  !anonKey.includes('MY_SUPABASE');

export const supabase: SupabaseClient | null = isConfigured
  ? createClient(url!, anonKey!, {
      auth: { persistSession: false },
    })
  : null;

export const isSupabaseConfigured = isConfigured;

/* Mensagem única para a interface explicar por que a sincronização não ocorre. */
export const SUPABASE_SETUP_HINT =
  'Supabase não configurado — seus artigos estão salvos apenas neste navegador. ' +
  'Preencha VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env e reinicie o servidor.';
