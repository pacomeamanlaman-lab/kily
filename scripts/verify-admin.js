// Script pour vérifier et corriger le statut admin
// Usage: node scripts/verify-admin.js

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Lire les variables d'environnement depuis .env.local
function loadEnv() {
  const envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) {
    console.error('❌ Fichier .env.local non trouvé');
    process.exit(1);
  }

  const envContent = fs.readFileSync(envPath, 'utf-8');
  const env = {};

  envContent.split('\n').forEach(line => {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const [key, ...valueParts] = trimmedLine.split('=');
      if (key && valueParts.length > 0) {
        env[key.trim()] = valueParts.join('=').trim();
      }
    }
  });

  return env;
}

const env = loadEnv();
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Erreur: NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY doivent être définis dans .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const ADMIN_EMAIL = 'admin@gmail.com';

async function verifyAdmin() {
  try {
    console.log('🔍 Vérification du compte admin...');
    console.log(`📧 Email: ${ADMIN_EMAIL}\n`);

    // 1. Vérifier dans la table users directement
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('email', ADMIN_EMAIL)
      .single();

    if (profileError) {
      console.error('❌ Erreur lors de la récupération du profil:', profileError);
      if (profileError.message && profileError.message.includes('column') && profileError.message.includes('is_admin')) {
        console.error('\n⚠️  La colonne is_admin n\'existe pas dans la table users!');
        console.error('   Tu dois exécuter le script SQL: supabase/11_admin_system.sql');
      }
      return;
    }

    if (!userProfile) {
      console.error('❌ Profil utilisateur non trouvé');
      return;
    }

    console.log('✅ Profil utilisateur trouvé');
    console.log(`   ID: ${userProfile.id}`);
    console.log(`   is_admin: ${userProfile.is_admin}`);
    console.log(`   user_type: ${userProfile.user_type}`);
    console.log(`   verified: ${userProfile.verified}\n`);

    // 2. Vérifier et corriger si nécessaire
    if (userProfile.is_admin !== true) {
      console.log('⚠️  Le champ is_admin n\'est pas défini à true');
      console.log('🔧 Correction en cours...\n');

      const { error: updateError } = await supabase
        .from('users')
        .update({ is_admin: true })
        .eq('id', userProfile.id);

      if (updateError) {
        console.error('❌ Erreur lors de la mise à jour:', updateError);
        return;
      }

      console.log('✅ Compte admin corrigé avec succès!');
    } else {
      console.log('✅ Le compte est bien configuré comme admin');
    }

    // 3. Vérifier que le champ is_admin existe dans la table
    console.log('🔍 Vérification de la structure de la table...');
    const { data: testQuery, error: testError } = await supabase
      .from('users')
      .select('is_admin')
      .limit(1);

    if (testError) {
      if (testError.message && testError.message.includes('column') && testError.message.includes('is_admin')) {
        console.error('❌ La colonne is_admin n\'existe pas dans la table users!');
        console.error('   Tu dois exécuter le script SQL: supabase/11_admin_system.sql');
        return;
      }
      console.error('❌ Erreur:', testError);
      return;
    }

    console.log('✅ La colonne is_admin existe dans la table\n');

    // 4. Résumé final
    const { data: finalCheck } = await supabase
      .from('users')
      .select('is_admin')
      .eq('email', ADMIN_EMAIL)
      .single();

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 État final:');
    console.log(`   Email: ${ADMIN_EMAIL}`);
    console.log(`   ID: ${userProfile.id}`);
    console.log(`   is_admin: ${finalCheck?.is_admin === true ? '✅ Oui' : '❌ Non'}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  } catch (error) {
    console.error('❌ Erreur inattendue:', error);
  }
}

verifyAdmin()
  .then(() => {
    console.log('\n✅ Vérification terminée');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  });

