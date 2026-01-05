// Script pour créer le compte admin initial
// Usage: node scripts/create-admin.js

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

// Créer un client Supabase avec la clé service (permissions admin)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const ADMIN_EMAIL = 'admin@gmail.com';
const ADMIN_PASSWORD = '12345678';
const ADMIN_FIRST_NAME = 'Admin';
const ADMIN_LAST_NAME = 'Kily';

async function createAdmin() {
  try {
    console.log('🚀 Création du compte admin...');
    console.log(`📧 Email: ${ADMIN_EMAIL}`);

    // 1. Vérifier si l'utilisateur existe déjà
    let existingUser = null;
    try {
      const { data, error } = await supabase.auth.admin.getUserByEmail(ADMIN_EMAIL);
      if (data?.user) {
        existingUser = data;
      } else if (error && error.message && !error.message.includes('User not found')) {
        throw error;
      }
    } catch (error) {
      // Si l'API n'est pas disponible, on continue
      console.log('ℹ️  Vérification de l\'existence de l\'utilisateur...');
    }
    
    if (existingUser?.user) {
      console.log('⚠️  L\'utilisateur existe déjà dans Auth');
      
      // Vérifier si l'utilisateur existe dans la table users
      const { data: userProfile, error: profileCheckError } = await supabase
        .from('users')
        .select('*')
        .eq('email', ADMIN_EMAIL)
        .single();

      if (userProfile) {
        // Mettre à jour pour s'assurer qu'il est admin
        const { error: updateError } = await supabase
          .from('users')
          .update({ is_admin: true })
          .eq('id', existingUser.user.id);

        if (updateError) {
          console.error('❌ Erreur lors de la mise à jour:', updateError);
          return;
        }
        console.log('✅ Compte admin mis à jour avec succès!');
        console.log(`👤 ID: ${existingUser.user.id}`);
        return;
      } else {
        // Créer le profil utilisateur
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: existingUser.user.id,
            email: ADMIN_EMAIL,
            first_name: ADMIN_FIRST_NAME,
            last_name: ADMIN_LAST_NAME,
            user_type: 'talent',
            is_admin: true,
            verified: true,
            bio: 'Administrateur de la plateforme Kily',
          });

        if (profileError) {
          console.error('❌ Erreur lors de la création du profil:', profileError);
          return;
        }
        console.log('✅ Profil admin créé avec succès!');
        return;
      }
    }

    // 2. Créer l'utilisateur dans Supabase Auth
    console.log('📝 Création de l\'utilisateur dans Auth...');
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true, // Confirmer l'email automatiquement
      user_metadata: {
        first_name: ADMIN_FIRST_NAME,
        last_name: ADMIN_LAST_NAME,
      }
    });

    if (authError) {
      console.error('❌ Erreur lors de la création dans Auth:', authError);
      return;
    }

    if (!authData.user) {
      console.error('❌ Aucun utilisateur créé');
      return;
    }

    console.log('✅ Utilisateur créé dans Auth');
    console.log(`👤 ID: ${authData.user.id}`);

    // 3. Créer le profil utilisateur dans la table users avec is_admin = true
    console.log('📝 Création du profil utilisateur...');
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: ADMIN_EMAIL,
        first_name: ADMIN_FIRST_NAME,
        last_name: ADMIN_LAST_NAME,
        user_type: 'talent',
        is_admin: true,
        verified: true,
        bio: 'Administrateur de la plateforme Kily',
        rating: 0,
        review_count: 0,
        completed_projects: 0,
        has_completed_onboarding: true,
      });

    if (profileError) {
      console.error('❌ Erreur lors de la création du profil:', profileError);
      // Essayer de supprimer l'utilisateur Auth créé
      try {
        await supabase.auth.admin.deleteUser(authData.user.id);
      } catch (deleteError) {
        console.error('⚠️  Impossible de supprimer l\'utilisateur Auth créé:', deleteError);
      }
      return;
    }

    console.log('✅ Profil utilisateur créé avec succès!');

    // 4. Résumé
    console.log('\n🎉 Compte admin créé avec succès!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📧 Email: ${ADMIN_EMAIL}`);
    console.log(`🔑 Mot de passe: ${ADMIN_PASSWORD}`);
    console.log(`👤 ID: ${authData.user.id}`);
    console.log(`🔐 Admin: Oui`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n⚠️  IMPORTANT: Change le mot de passe après la première connexion!');

  } catch (error) {
    console.error('❌ Erreur inattendue:', error);
  }
}

// Exécuter le script
createAdmin()
  .then(() => {
    console.log('\n✅ Script terminé');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  });
