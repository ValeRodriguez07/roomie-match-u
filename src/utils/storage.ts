/**
 * Storage utility for persisting user data
 * Uses localStorage as the primary storage mechanism
 */

const STORAGE_KEY = 'roomie_match_users';

export interface StoredUser {
  id: string;
  email: string;
  name: string;
  username?: string;
  phone?: string;
  preferredLanguage?: "en" | "es";
  type: "busco_lugar" | "tengo_lugar";
  avatar?: string;
  profileComplete?: boolean;
  preferences: any;
  profile: any;
  createdAt: string;
  verified: boolean;
  acceptedTerms?: boolean;
}

export class StorageService {
  /**
   * Load all users from localStorage
   */
  static loadUsers(): StoredUser[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        return [];
      }
      return JSON.parse(data);
    } catch (error) {
      console.error('Error loading users from storage:', error);
      return [];
    }
  }

  /**
   * Save all users to localStorage
   */
  static saveUsers(users: StoredUser[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    } catch (error) {
      console.error('Error saving users to storage:', error);
    }
  }

  /**
   * Add or update a user
   */
  static saveUser(user: StoredUser): void {
    const users = this.loadUsers();
    const index = users.findIndex(u => u.id === user.id);
    
    if (index >= 0) {
      users[index] = user;
    } else {
      users.push(user);
    }
    
    this.saveUsers(users);
  }

  /**
   * Get a specific user by ID
   */
  static getUser(userId: string): StoredUser | null {
    const users = this.loadUsers();
    return users.find(u => u.id === userId) || null;
  }

  /**
   * Get a user by email
   */
  static getUserByEmail(email: string): StoredUser | null {
    const users = this.loadUsers();
    return users.find(u => u.email === email) || null;
  }

  /**
   * Delete a user
   */
  static deleteUser(userId: string): void {
    const users = this.loadUsers();
    const filtered = users.filter(u => u.id !== userId);
    this.saveUsers(filtered);
  }

  /**
   * Clear all users (for testing)
   */
  static clearAll(): void {
    localStorage.removeItem(STORAGE_KEY);
  }

  /**
   * Get current logged in user from session
   */
  static getCurrentUser(): StoredUser | null {
    try {
      const data = sessionStorage.getItem('current_user');
      if (!data) return null;
      return JSON.parse(data);
    } catch (error) {
      console.error('Error loading current user:', error);
      return null;
    }
  }

  /**
   * Set current logged in user in session
   */
  static setCurrentUser(user: StoredUser | null): void {
    try {
      if (user) {
        sessionStorage.setItem('current_user', JSON.stringify(user));
      } else {
        sessionStorage.removeItem('current_user');
      }
    } catch (error) {
      console.error('Error saving current user:', error);
    }
  }
}
