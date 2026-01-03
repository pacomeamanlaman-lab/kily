// localStorage-based system for saved talents (recruiter dashboard)

const SAVED_TALENTS_KEY = "kily_saved_talents";
const CONTACTED_TALENTS_KEY = "kily_contacted_talents";

// Load saved talents from localStorage
export const loadSavedTalents = (): string[] => {
  if (typeof window === "undefined") return [];
  
  const stored = localStorage.getItem(SAVED_TALENTS_KEY);
  return stored ? JSON.parse(stored) : [];
};

// Save saved talents to localStorage
const saveSavedTalents = (talentIds: string[]): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(SAVED_TALENTS_KEY, JSON.stringify(talentIds));
};

// Load contacted talents from localStorage
export const loadContactedTalents = (): string[] => {
  if (typeof window === "undefined") return [];
  
  const stored = localStorage.getItem(CONTACTED_TALENTS_KEY);
  return stored ? JSON.parse(stored) : [];
};

// Save contacted talents to localStorage
const saveContactedTalents = (talentIds: string[]): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(CONTACTED_TALENTS_KEY, JSON.stringify(talentIds));
};

// Add talent to saved
export const addSavedTalent = (talentId: string): boolean => {
  const saved = loadSavedTalents();
  
  if (!saved.includes(talentId)) {
    saved.push(talentId);
    saveSavedTalents(saved);
    return true;
  }
  
  return false;
};

// Remove talent from saved
export const removeSavedTalent = (talentId: string): boolean => {
  const saved = loadSavedTalents();
  const index = saved.indexOf(talentId);
  
  if (index > -1) {
    saved.splice(index, 1);
    saveSavedTalents(saved);
    return true;
  }
  
  return false;
};

// Check if talent is saved
export const isTalentSaved = (talentId: string): boolean => {
  const saved = loadSavedTalents();
  return saved.includes(talentId);
};

// Add talent to contacted
export const addContactedTalent = (talentId: string): boolean => {
  const contacted = loadContactedTalents();
  
  if (!contacted.includes(talentId)) {
    contacted.push(talentId);
    saveContactedTalents(contacted);
    return true;
  }
  
  return false;
};

// Remove talent from contacted
export const removeContactedTalent = (talentId: string): boolean => {
  const contacted = loadContactedTalents();
  const index = contacted.indexOf(talentId);
  
  if (index > -1) {
    contacted.splice(index, 1);
    saveContactedTalents(contacted);
    return true;
  }
  
  return false;
};

// Check if talent is contacted
export const isTalentContacted = (talentId: string): boolean => {
  const contacted = loadContactedTalents();
  return contacted.includes(talentId);
};

// Toggle save/unsave talent
export const toggleSaveTalent = (talentId: string): { saved: boolean } => {
  const isSaved = isTalentSaved(talentId);
  
  if (isSaved) {
    removeSavedTalent(talentId);
    return { saved: false };
  } else {
    addSavedTalent(talentId);
    return { saved: true };
  }
};