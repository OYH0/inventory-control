// Edge Function: delete-user
// Deleta um usuário por completo (auth.users + profile + dependências).
// Apenas masters podem invocar. Não pode deletar a si mesmo nem outro master.
//
// Body: { userId: string }
//
// Auth: Bearer <user JWT>. A função valida via service role que o caller é master.

import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return jsonResponse({ error: 'Missing Authorization header' }, 401);
    }

    // Cliente com JWT do usuário para validar identidade
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user: caller }, error: authError } = await userClient.auth.getUser();
    if (authError || !caller) {
      return jsonResponse({ error: 'Invalid auth' }, 401);
    }

    const body = await req.json();
    const targetId = body?.userId;
    if (!targetId || typeof targetId !== 'string') {
      return jsonResponse({ error: 'userId é obrigatório' }, 400);
    }

    if (targetId === caller.id) {
      return jsonResponse({ error: 'Você não pode deletar a si mesmo' }, 400);
    }

    // Cliente admin para checagens e ações privilegiadas
    const admin = createClient(supabaseUrl, serviceRoleKey);

    const { data: callerProfile, error: callerErr } = await admin
      .from('profiles')
      .select('is_master')
      .eq('id', caller.id)
      .single();

    if (callerErr || !callerProfile?.is_master) {
      return jsonResponse({ error: 'Apenas usuários MASTER podem deletar' }, 403);
    }

    const { data: targetProfile, error: targetErr } = await admin
      .from('profiles')
      .select('id, email, full_name, is_master')
      .eq('id', targetId)
      .single();

    // Se profile não existe, ainda assim tentamos limpar auth.users
    const targetIsMaster = targetProfile?.is_master === true;
    if (targetIsMaster) {
      return jsonResponse({ error: 'Usuários MASTER não podem ser deletados' }, 400);
    }

    // Limpeza em ordem: dependências → profile → auth
    await admin.from('user_unit_permissions').delete().eq('user_id', targetId);
    await admin.from('organization_members').delete().eq('user_id', targetId);

    if (targetProfile) {
      const { error: profDelErr } = await admin
        .from('profiles')
        .delete()
        .eq('id', targetId);
      if (profDelErr) {
        return jsonResponse({ error: `Erro ao deletar profile: ${profDelErr.message}` }, 500);
      }
    }

    const { error: authDelErr } = await admin.auth.admin.deleteUser(targetId);
    if (authDelErr) {
      return jsonResponse({ error: `Erro ao deletar de auth: ${authDelErr.message}` }, 500);
    }

    return jsonResponse({
      success: true,
      deleted: targetProfile?.email ?? targetId,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return jsonResponse({ error: message }, 500);
  }
});

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
