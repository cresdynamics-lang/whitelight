// Admin credentials - Replace with API authentication later
// This file can be easily swapped for API-based auth

export interface AdminCredentials {
  username: string;
  password: string;
}

// Default admin credentials (replace with secure API later)
export const ADMIN_CREDENTIALS: AdminCredentials = {
  username: "admin",
  password: "admin123",
};

// Validate credentials - modular for API replacement
export const validateCredentials = async (
  username: string,
  password: string
): Promise<boolean> => {
  // TODO: Replace with API call
  // Example: return await fetch('/api/auth/login', { ... })
  
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));
  
  return (
    username === ADMIN_CREDENTIALS.username &&
    password === ADMIN_CREDENTIALS.password
  );
};
