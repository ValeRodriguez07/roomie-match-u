import type { User, UserPreferences, UserProfile } from "../types";
import { eventBus } from "./EventBus";
import { mockUsers } from "../data/mockData";

class UserService {
  private users: Map<string, User> = new Map();
  private currentUser: User | null = null;

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    mockUsers.forEach((user) => {
      this.users.set(user.id, user);
    });
  }

  async register(
    userData: Omit<User, "id" | "createdAt" | "verified">
  ): Promise<User> {
    // Simular latencia de API
    await this.simulateLatency();

    const newUser: User = {
      ...userData,
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      verified: false,
    };

    this.users.set(newUser.id, newUser);

    // Emitir evento de usuario registrado
    await eventBus.publish({
      type: "UsuarioRegistrado",
      origin: "UserService",
      destination: "*",
      payload: { user: newUser },
    });

    return newUser;
  }

  async login(email: string, password: string): Promise<User | null> {
    await this.simulateLatency();

    // Simulación simple de login
    const user = Array.from(this.users.values()).find((u) => u.email === email);

    if (user) {
      this.currentUser = user;

      await eventBus.publish({
        type: "UsuarioConectado",
        origin: "UserService",
        destination: "AnalyticsService",
        payload: { userId: user.id },
      });

      return user;
    }

    return null;
  }

  async logout(): Promise<void> {
    if (this.currentUser) {
      await eventBus.publish({
        type: "UsuarioDesconectado",
        origin: "UserService",
        destination: "AnalyticsService",
        payload: { userId: this.currentUser.id },
      });
    }
    this.currentUser = null;
  }

  async updateProfile(
    userId: string,
    updates: Partial<UserProfile>
  ): Promise<User> {
    await this.simulateLatency();

    const user = this.users.get(userId);
    if (!user) {
      throw new Error("User not found");
    }

    user.profile = { ...user.profile, ...updates };
    this.users.set(userId, user);

    return user;
  }

  async updatePreferences(
    userId: string,
    preferences: Partial<UserPreferences>
  ): Promise<User> {
    await this.simulateLatency();

    const user = this.users.get(userId);
    if (!user) {
      throw new Error("User not found");
    }

    user.preferences = { ...user.preferences, ...preferences };
    this.users.set(userId, user);

    return user;
  }

  async getUser(userId: string): Promise<User | null> {
    await this.simulateLatency();
    return this.users.get(userId) || null;
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  async searchUsers(criteria: Partial<UserPreferences>): Promise<User[]> {
    await this.simulateLatency(300); // Búsqueda más lenta

    return Array.from(this.users.values()).filter((user) => {
      if (user.id === this.currentUser?.id) return false;

      return Object.entries(criteria).every(([key, value]) => {
        if (value === undefined) return true;
        return (user.preferences as any)[key] === value;
      });
    });
  }

  private simulateLatency(min: number = 100, max: number = 500): Promise<void> {
    const delay = Math.random() * (max - min) + min;
    return new Promise((resolve) => setTimeout(resolve, delay));
  }
}

export const userService = new UserService();
