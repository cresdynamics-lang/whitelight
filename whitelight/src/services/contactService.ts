// Contact Submissions Service - Modular for API replacement
// Currently uses localStorage to store submissions

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  isRead: boolean;
}

const STORAGE_KEY = "contact_submissions";

const getStoredSubmissions = (): ContactSubmission[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

const saveSubmissions = (submissions: ContactSubmission[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(submissions));
};

// TODO: Replace these with API calls
export const contactService = {
  // Get all submissions
  getAll: async (): Promise<ContactSubmission[]> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return getStoredSubmissions().sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  // Create new submission (called from contact form)
  create: async (
    submission: Omit<ContactSubmission, "id" | "createdAt" | "isRead">
  ): Promise<ContactSubmission> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const submissions = getStoredSubmissions();
    
    const newSubmission: ContactSubmission = {
      ...submission,
      id: String(Date.now()),
      createdAt: new Date().toISOString(),
      isRead: false,
    };
    
    submissions.push(newSubmission);
    saveSubmissions(submissions);
    return newSubmission;
  },

  // Mark as read
  markAsRead: async (id: string): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const submissions = getStoredSubmissions();
    const index = submissions.findIndex((s) => s.id === id);
    
    if (index === -1) return false;
    
    submissions[index].isRead = true;
    saveSubmissions(submissions);
    return true;
  },

  // Delete submission
  delete: async (id: string): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const submissions = getStoredSubmissions();
    const filtered = submissions.filter((s) => s.id !== id);
    
    if (filtered.length === submissions.length) return false;
    
    saveSubmissions(filtered);
    return true;
  },

  // Get unread count
  getUnreadCount: async (): Promise<number> => {
    const submissions = getStoredSubmissions();
    return submissions.filter((s) => !s.isRead).length;
  },
};
