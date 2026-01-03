// localStorage-based reporting system

const REPORTS_KEY = "kily_reports";

export interface Report {
  id: string;
  type: "post" | "video" | "user" | "comment";
  contentId: string; // ID of the reported content
  reportedBy: string; // User ID who reported
  reason: string; // Reason for reporting
  description?: string; // Additional details
  timestamp: string;
  status: "pending" | "reviewed" | "resolved" | "dismissed";
}

// Load reports from localStorage
const loadReports = (): Report[] => {
  if (typeof window === "undefined") return [];
  
  const stored = localStorage.getItem(REPORTS_KEY);
  return stored ? JSON.parse(stored) : [];
};

// Save reports to localStorage
const saveReports = (reports: Report[]): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
};

// Create a new report
export const createReport = (
  type: "post" | "video" | "user" | "comment",
  contentId: string,
  reportedBy: string,
  reason: string,
  description?: string
): Report => {
  const reports = loadReports();
  
  const newReport: Report = {
    id: `report_${Date.now()}`,
    type,
    contentId,
    reportedBy,
    reason,
    description,
    timestamp: new Date().toISOString(),
    status: "pending",
  };
  
  reports.push(newReport);
  saveReports(reports);
  
  return newReport;
};

// Get all reports
export const getAllReports = (): Report[] => {
  return loadReports();
};

// Get reports by type
export const getReportsByType = (type: "post" | "video" | "user" | "comment"): Report[] => {
  const reports = loadReports();
  return reports.filter((r) => r.type === type);
};

// Get reports by status
export const getReportsByStatus = (status: "pending" | "reviewed" | "resolved" | "dismissed"): Report[] => {
  const reports = loadReports();
  return reports.filter((r) => r.status === status);
};

// Get report by ID
export const getReportById = (reportId: string): Report | null => {
  const reports = loadReports();
  return reports.find((r) => r.id === reportId) || null;
};

// Update report status
export const updateReportStatus = (
  reportId: string,
  status: "pending" | "reviewed" | "resolved" | "dismissed"
): boolean => {
  const reports = loadReports();
  const report = reports.find((r) => r.id === reportId);
  
  if (!report) return false;
  
  report.status = status;
  saveReports(reports);
  
  return true;
};

// Check if content has been reported by user
export const hasUserReported = (contentId: string, userId: string): boolean => {
  const reports = loadReports();
  return reports.some((r) => r.contentId === contentId && r.reportedBy === userId);
};

// Get report count for content
export const getReportCount = (contentId: string): number => {
  const reports = loadReports();
  return reports.filter((r) => r.contentId === contentId).length;
};

