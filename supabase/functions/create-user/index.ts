// Edge Function: create-user
// Cria um novo usuário via admin API (requer Service Role Key).
// Apenas masters podem invocar.
//
// Body: { email, password, fullName, userType, unidadeResponsavel, organizationId?, organizationRole? }
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

    // Cliente admin para checagens e ações privilegiadas
    const admin = createClient(supabaseUrl, serviceRoleKey);

    // Verificar se caller é master
    const { data: callerProfile, error: callerErr } = await admin
      .from('profiles')
      .select('is_master')
      .eq('id', caller.id)
      .single();

    if (callerErr || !callerProfile?.is_master) {
      return jsonResponse({ error: 'Apenas usuários MASTER podem criar usuários' }, 403);
    }

    // Parse body
    const body = await req.json();
    const { email, password, fullName, userType, unidadeResponsavel, organizationId, organizationRole } = body;

    if (!email || !password || !fullName) {
      return jsonResponse({ error: 'email, password e fullName são obrigatórios' }, 400);
    }

    // Verificar se email já existe
    const { data: existingUsers } = await admin.auth.admin.listUsers();
    const emailExists = existingUsers?.users?.some(
      (u: any) => u.email?.toLowerCase() === email.toLowerCase()
    );
    if (emailExists) {
      return jsonResponse({ error: 'Email já cadastrado no sistema' }, 400);
    }

    // Criar usuário via admin API (email já confirmado)
    const { data: newUser, error: createError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
      },
    });

    if (createError) {
      return jsonResponse({ error: `Erro ao criar usuário: ${createError.message}` }, 500);
    }

    const newUserId = newUser.user.id;

    // O trigger handle_new_user já cria o profile automaticamente.
    // Agora atualizar os campos adicionais do profile (user_type, unidade_responsavel, is_approved).
    const profileUpdate: Record<string, any> = {
      is_approved: true,
      updated_at: new Date().toISOString(),
    };

    // Mapear userType do frontend para o enum do banco
    if (userType === 'admin') {
      profileUpdate.user_type = 'admin';
    } else if (userType === 'gerente') {
      profileUpdate.user_type = 'gerente';
    } else {
      profileUpdate.user_type = 'viewer';
    }

    // unidade_responsavel: se "todas", setar null (acesso global)
    if (unidadeResponsavel && unidadeResponsavel !== 'todas') {
      profileUpdate.unidade_responsavel = unidadeResponsavel;
    } else if (unidadeResponsavel === 'todas') {
      profileUpdate.unidade_responsavel = null;
    }

    const { error: profileError } = await admin
      .from('profiles')
      .update(profileUpdate)
      .eq('id', newUserId);

    if (profileError) {
      console.error('Erro ao atualizar profile:', profileError);
      // Não falhar — o user já foi criado
    }

    // Adicionar a organização se selecionada
    if (organizationId) {
      const role = organizationRole || 'member';

      // Gerar permissões baseadas no role
      const permissions: Record<string, boolean> = {};
      switch (role) {
        case 'owner':
        case 'admin':
          permissions.manage_members = true;
          permissions.manage_inventory = true;
          permissions.manage_orders = true;
          permissions.view_reports = true;
          permissions.manage_settings = true;
          break;
        case 'manager':
          permissions.manage_inventory = true;
          permissions.manage_orders = true;
          permissions.view_reports = true;
          break;
        case 'member':
        default:
          permissions.manage_inventory = true;
          permissions.view_reports = true;
          break;
      }

      const { error: orgError } = await admin
        .from('organization_members')
        .insert({
          organization_id: organizationId,
          user_id: newUserId,
          role,
          permissions,
          is_active: true,
          invited_by: caller.id,
          joined_at: new Date().toISOString(),
        });

      if (orgError) {
        console.error('Erro ao adicionar à organização:', orgError);
        // Não falhar — o user já foi criado
      }
    }

    return jsonResponse({
      success: true,
      user: {
        id: newUserId,
        email,
        fullName,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('create-user error:', message);
    return jsonResponse({ error: message }, 500);
  }
});

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
