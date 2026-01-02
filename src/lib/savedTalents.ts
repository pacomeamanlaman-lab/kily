// localStorage-based Save/Unsave system for recruiters

const SAVED_TALENTS_KEY = "kily_saved_talents";

interface SavedTalentsState {
  [recruiterId: string]: string[]; // recruiterId -> array of saved talent user IDs
}

// Load saved talents from localStorage
const loadSavedTalents = (): SavedTalentsState => {
  if (typeof window === "undefined") return {};

  const stored = localStorage.getItem(SAVED_TALENTS_KEY);
  return stored ? JSON.parse(stored) : {};
};

// Save talents to localStorage
const saveSavedTalents = (savedTalents: SavedTalentsState): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(SAVED_TALENTS_KEY, JSON.stringify(savedTalents));
};

// Check if talent is saved by recruiter
export const isTalentSaved = (recruiterId: string, talentId: string): boolean => {
  const savedTalents = loadSavedTalents();
  const recruiterSaves = savedTalents[recruiterId] || [];
  return recruiterSaves.includes(talentId);
};

// Toggle save/unsave talent
export const toggleSaveTalent = (
  recruiterId: string,
  talentId: string
): { saved: boolean; savedCount: number } => {
  const savedTalents = loadSavedTalents();

  if (!savedTalents[recruiterId]) {
    savedTalents[recruiterId] = [];
  }

  const alreadySaved = savedTalents[recruiterId].includes(talentId);

  if (alreadySaved) {
    // Unsave
    savedTalents[recruiterId] = savedTalents[recruiterId].filter((id) => id !== talentId);
  } else {
    // Save
    savedTalents[recruiterId].push(talentId);
  }

  saveSavedTalents(savedTalents);

  return {
    saved: !alreadySaved,
    savedCount: savedTalents[recruiterId].length,
  };
};

// Get all saved talents for a recruiter
export const getSavedTalents = (recruiterId: string): string[] => {
  const savedTalents = loadSavedTalents();
  return savedTalents[recruiterId] || [];
};

// Get saved talents count for a recruiter
export const getSavedTalentsCount = (recruiterId: string): number => {
  const savedTalents = loadSavedTalents();
  return (savedTalents[recruiterId] || []).length;
};

// Remove all saved talents for a recruiter (e.g., when account is deleted)
export const removeAllSavedTalents = (recruiterId: string): void => {
  const savedTalents = loadSavedTalents();
  delete savedTalents[recruiterId];
  saveSavedTalents(savedTalents);
};

// Remove a talent from all recruiters' saved lists (e.g., when talent account is deleted)
export const removeTalentFromAllSaves = (talentId: string): void => {
  const savedTalents = loadSavedTalents();

  Object.keys(savedTalents).forEach((recruiterId) => {
    savedTalents[recruiterId] = savedTalents[recruiterId].filter((id) => id !== talentId);
  });

  saveSavedTalents(savedTalents);
};

// Check if multiple talents are saved (for bulk operations)
export const areTalentsSaved = (recruiterId: string, talentIds: string[]): Record<string, boolean> => {
  const savedTalents = loadSavedTalents();
  const recruiterSaves = savedTalents[recruiterId] || [];

  const result: Record<string, boolean> = {};
  talentIds.forEach((talentId) => {
    result[talentId] = recruiterSaves.includes(talentId);
  });

  return result;
};
