import type { Match, User, Publication } from "../types";
import { eventBus } from "./EventBus";
import { userService } from "./UserService";
import { publicationService } from "./PublicationService";
import { mockMatches } from "../data/mockData";

class MatchingService {
  private matches: Map<string, Match> = new Map();

  constructor() {
    this.initializeMockData();
    this.setupEventListeners();
  }

  private initializeMockData() {
    // Inicializar con matches de ejemplo
    mockMatches.forEach(match => {
      this.matches.set(match.id, match);
    });
  }

  private setupEventListeners() {
    eventBus.subscribe(
      "PublicacionCreada",
      this.handleNewPublication.bind(this)
    );
    eventBus.subscribe(
      "PublicacionActualizada",
      this.handleUpdatedPublication.bind(this)
    );
    eventBus.subscribe("UsuarioRegistrado", this.handleNewUser.bind(this));
  }

  private async handleNewPublication(event: any) {
    const publication: Publication = event.payload.publication;

    // Buscar matches potenciales para la nueva publicación
    const potentialMatches = await this.findPotentialMatches(publication);

    for (const match of potentialMatches) {
      if (match.score > 0.7) {
        // Umbral de matching
        await this.createMatch({
          user1Id: publication.userId,
          user2Id: match.userId,
          publicationId: publication.id,
          score: match.score,
        });
      }
    }
  }

  private async handleUpdatedPublication(event: any) {
    // Recalcular matches para publicación actualizada
    await this.handleNewPublication(event);
  }

  private async handleNewUser(event: any) {
    const user: User = event.payload.user;

    if (user.type === "busco_lugar") {
      // Buscar publicaciones que coincidan con el nuevo usuario
      const publications = await publicationService.getActivePublications();

      for (const publication of publications) {
        if (publication.userId !== user.id) {
          const score = await this.calculateMatchScore(user, publication);
          if (score > 0.7) {
            await this.createMatch({
              user1Id: user.id,
              user2Id: publication.userId,
              publicationId: publication.id,
              score,
            });
          }
        }
      }
    }
  }

  private async findPotentialMatches(
    publication: Publication
  ): Promise<Array<{ userId: string; score: number }>> {
    const users = await userService.searchUsers({
      location: publication.location,
      city: publication.city,
      maxPrice: publication.price * 1.2, // +20% de flexibilidad
      minPrice: publication.price * 0.8, // -20% de flexibilidad
    });

    const matches = [];
    for (const user of users) {
      if (user.type === "busco_lugar" && user.id !== publication.userId) {
        const score = await this.calculateMatchScore(user, publication);
        matches.push({ userId: user.id, score });
      }
    }

    return matches.sort((a, b) => b.score - a.score);
  }

  private async calculateMatchScore(
    user: User,
    publication: Publication
  ): Promise<number> {
    let score = 0;
    let factors = 0;

    // Precio (peso: 30%)
    if (
      user.preferences.minPrice <= publication.price &&
      user.preferences.maxPrice >= publication.price
    ) {
      const priceRange = user.preferences.maxPrice - user.preferences.minPrice;
      const priceDiff = Math.abs(
        publication.price - (user.preferences.minPrice + priceRange / 2)
      );
      const priceScore = 1 - priceDiff / (priceRange / 2);
      score += Math.max(0, priceScore) * 0.3;
    }
    factors += 0.3;

    // Ubicación (peso: 25%)
    if (user.preferences.location === publication.location) {
      score += 0.25;
    } else if (user.preferences.city === publication.city) {
      score += 0.15;
    }
    factors += 0.25;

    // Hábitos compatibles (peso: 20%)
    const habitCompatibility = this.calculateHabitCompatibility(
      user,
      publication
    );
    score += habitCompatibility * 0.2;
    factors += 0.2;

    // Tipo de habitación (peso: 15%)
    if (publication.roomType === "single") {
      score += 0.15; // Asumir que single es preferido
    }
    factors += 0.15;

    // Disponibilidad (peso: 10%)
    if (publication.availableFrom <= new Date()) {
      score += 0.1;
    }
    factors += 0.1;

    return score / factors;
  }

  private calculateHabitCompatibility(
    user: User,
    publication: Publication
  ): number {
    let compatibility = 0;
    let factors = 0;

    // Fumador/no fumador
    if (publication.rules.includes("no_smoking") && !user.preferences.smoking) {
      compatibility += 1;
    }
    factors += 1;

    // Mascotas
    if (publication.rules.includes("pets_allowed") && user.preferences.pets) {
      compatibility += 1;
    } else if (
      !publication.rules.includes("pets_allowed") &&
      !user.preferences.pets
    ) {
      compatibility += 1;
    }
    factors += 1;

    return compatibility / factors;
  }

  async createMatch(
    matchData: Omit<Match, "id" | "status" | "createdAt" | "updatedAt">
  ): Promise<Match> {
    await this.simulateLatency();

    // Verificar si el match ya existe
    const existingMatch = Array.from(this.matches.values()).find(
      (match) =>
        (match.user1Id === matchData.user1Id &&
          match.user2Id === matchData.user2Id) ||
        (match.user1Id === matchData.user2Id &&
          match.user2Id === matchData.user1Id)
    );

    if (existingMatch) {
      return existingMatch;
    }

    const newMatch: Match = {
      ...matchData,
      id: `match_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.matches.set(newMatch.id, newMatch);

    await eventBus.publish({
      type: "MatchEncontrado",
      origin: "MatchingService",
      destination: "NotificationService",
      payload: { match: newMatch },
    });

    return newMatch;
  }

  async acceptMatch(matchId: string): Promise<Match> {
    await this.simulateLatency();

    const match = this.matches.get(matchId);
    if (!match) {
      throw new Error("Match not found");
    }

    match.status = "accepted";
    match.updatedAt = new Date();
    this.matches.set(matchId, match);

    await eventBus.publish({
      type: "MatchAceptado",
      origin: "MatchingService",
      destination: "NotificationService",
      payload: { match },
    });

    return match;
  }

  async rejectMatch(matchId: string): Promise<Match> {
    await this.simulateLatency();

    const match = this.matches.get(matchId);
    if (!match) {
      throw new Error("Match not found");
    }

    match.status = "rejected";
    match.updatedAt = new Date();
    this.matches.set(matchId, match);

    await eventBus.publish({
      type: "MatchRechazado",
      origin: "MatchingService",
      destination: "AnalyticsService",
      payload: { match },
    });

    return match;
  }

  async getUserMatches(userId: string): Promise<Match[]> {
    await this.simulateLatency();
    return Array.from(this.matches.values()).filter(
      (match) => match.user1Id === userId || match.user2Id === userId
    );
  }

  async getMatch(matchId: string): Promise<Match | null> {
    await this.simulateLatency();
    return this.matches.get(matchId) || null;
  }

  private simulateLatency(
    min: number = 200,
    max: number = 1000
  ): Promise<void> {
    const delay = Math.random() * (max - min) + min;
    return new Promise((resolve) => setTimeout(resolve, delay));
  }
}

export const matchingService = new MatchingService();
