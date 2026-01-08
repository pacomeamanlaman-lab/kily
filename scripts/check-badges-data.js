// Script Node.js pour vérifier les données de badges depuis Supabase
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkBadgesData() {
  console.log('🔍 Vérification des données de badges...\n');

  // 1. Compter les badges
  const { data: badges, error: badgesError } = await supabase
    .from('badges')
    .select('id, name');

  if (badgesError) {
    console.error('❌ Erreur badges:', badgesError);
    return;
  }

  console.log(`📛 Total badges: ${badges?.length || 0}`);

  // 2. Compter les attributions
  const { data: userBadges, error: userBadgesError } = await supabase
    .from('user_badges')
    .select('badge_id');

  if (userBadgesError) {
    console.error('❌ Erreur user_badges:', userBadgesError);
    return;
  }

  console.log(`🎖️  Total attributions: ${userBadges?.length || 0}`);

  // 3. Compter par badge
  const counts = {};
  userBadges?.forEach(ub => {
    counts[ub.badge_id] = (counts[ub.badge_id] || 0) + 1;
  });

  console.log('\n📊 Attributions par badge:');
  for (const badge of badges || []) {
    const count = counts[badge.id] || 0;
    console.log(`  - ${badge.name}: ${count} attribution(s)`);
  }

  // 4. Compter les utilisateurs
  const { count: usersCount, error: usersError } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true });

  if (usersError) {
    console.error('❌ Erreur users:', usersError);
  } else {
    console.log(`\n👥 Total utilisateurs: ${usersCount || 0}`);
  }

  // 5. Vérifier si les attributions correspondent aux utilisateurs
  if (userBadges && userBadges.length > 0) {
    const uniqueUserIds = new Set(userBadges.map(ub => ub.user_id));
    console.log(`\n🔗 Utilisateurs uniques avec badges: ${uniqueUserIds.size}`);
    
    if (uniqueUserIds.size > (usersCount || 0)) {
      console.log('⚠️  ATTENTION: Plus d\'attributions que d\'utilisateurs !');
      console.log('   Il y a probablement des données orphelines dans user_badges.');
    }
  }
}

checkBadgesData()
  .then(() => {
    console.log('\n✅ Vérification terminée');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erreur:', error);
    process.exit(1);
  });

