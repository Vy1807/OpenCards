import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carrega variáveis do .env.local
dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'http://localhost:54321';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpC810k';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const TEST_USERS = [
  {
    email: 'usera@test.local',
    password: 'TestPass123!',
    user_metadata: { name: 'Usuário Teste A' },
  },
  {
    email: 'userb@test.local',
    password: 'TestPass123!',
    user_metadata: { name: 'Usuário Teste B' },
  },
];

async function seedUsers() {
  console.log('🌱 Iniciando seed de usuários de teste...');
  console.log(`📡 Conectando em: ${SUPABASE_URL}`);

  const results: Array<{ email: string; success: boolean; userId?: string; accessToken?: string; error?: string }> = [];

  for (const user of TEST_USERS) {
    console.log(`\n👤 Processando: ${user.email}`);

    try {
      // Tenta criar o usuário
      const { data, error } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true, // Usuário já confirmado
        user_metadata: user.user_metadata,
      });

      if (error) {
        // Se já existe, tenta fazer login para obter token
        if (error.message.includes('already registered') || error.message.includes('already exists')) {
          console.log(`   ⚠️ Usuário já existe, fazendo login...`);
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: user.email,
            password: user.password,
          });

          if (signInError) {
            console.error(`   ❌ Erro no login: ${signInError.message}`);
            results.push({ email: user.email, success: false, error: signInError.message });
            continue;
          }

          console.log(`   ✅ Login realizado`);
          results.push({
            email: user.email,
            success: true,
            userId: signInData.user.id,
            accessToken: signInData.session.access_token,
          });
        } else {
          console.error(`   ❌ Erro ao criar: ${error.message}`);
          results.push({ email: user.email, success: false, error: error.message });
        }
      } else {
        console.log(`   ✅ Usuário criado: ${data.user.id}`);
        results.push({
          email: user.email,
          success: true,
          userId: data.user.id,
          accessToken: undefined, // Admin API não retorna sessão
        });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`   ❌ Erro inesperado: ${message}`);
      results.push({ email: user.email, success: false, error: message });
    }
  }

  console.log('\n📋 Resumo:');
  results.forEach((r) => {
    const status = r.success ? '✅' : '❌';
    console.log(`   ${status} ${r.email}${r.userId ? ` (${r.userId})` : ''}`);
  });

  const successful = results.filter((r) => r.success);
  if (successful.length === TEST_USERS.length) {
    console.log('\n🎉 Todos os usuários criados/validados com sucesso!');
    process.exit(0);
  } else {
    console.log('\n⚠️ Alguns usuários falharam.');
    process.exit(1);
  }
}

seedUsers();