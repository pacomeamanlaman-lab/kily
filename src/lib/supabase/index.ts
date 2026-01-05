// Export central de tous les services Supabase

// Client et utilitaires
export { supabase, handleSupabaseError } from '../supabase';
export type { SupabaseError } from '../supabase';

// Services Auth
export * from './auth.service';

// Services Users
export * from './users.service';

// Services Admin
export {
  isAdmin,
  isUserAdmin,
  getAllAdmins,
  promoteToAdmin,
  demoteFromAdmin,
  createUser as createUserAdmin,
  getAdminStats,
  getUserGrowthData,
  getContentData,
  getUserTypeData,
  getTopCitiesData,
  getAllConversations,
  getMessagesData,
  getMessagesHourlyData,
  getCitiesStats,
  getCategoriesStats,
  getTopTalents,
  getAllReports,
} from './admin.service';

// Services Posts
export * from './posts.service';

// Services Videos
export * from './videos.service';

// Services Messages
export * from './messages.service';

// Services Stories
export * from './stories.service';

// Services Follows & Saved Talents
export * from './follows.service';
