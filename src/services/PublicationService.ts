import type { Publication } from '../types';
import { eventBus } from './EventBus';
import { mockPublications } from '../data/mockData';

class PublicationService {
  private publications: Map<string, Publication> = new Map();

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    mockPublications.forEach(pub => {
      this.publications.set(pub.id, pub);
    });
  }

  async createPublication(publicationData: Omit<Publication, 'id' | 'createdAt' | 'status'>): Promise<Publication> {
    await this.simulateLatency();

    const newPublication: Publication = {
      ...publicationData,
      id: `pub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      status: 'active'
    };

    this.publications.set(newPublication.id, newPublication);

    await eventBus.publish({
      type: 'PublicacionCreada',
      origin: 'PublicationService',
      destination: 'MatchingService',
      payload: { publication: newPublication }
    });

    return newPublication;
  }

  async updatePublication(publicationId: string, updates: Partial<Publication>): Promise<Publication> {
    await this.simulateLatency();

    const publication = this.publications.get(publicationId);
    if (!publication) {
      throw new Error('Publication not found');
    }

    const updatedPublication = { ...publication, ...updates };
    this.publications.set(publicationId, updatedPublication);

    await eventBus.publish({
      type: 'PublicacionActualizada',
      origin: 'PublicationService',
      destination: 'MatchingService',
      payload: { publication: updatedPublication }
    });

    return updatedPublication;
  }

  async deletePublication(publicationId: string): Promise<void> {
    await this.simulateLatency();
    this.publications.delete(publicationId);
  }

  async getPublication(publicationId: string): Promise<Publication | null> {
    await this.simulateLatency();
    return this.publications.get(publicationId) || null;
  }

  async getUserPublications(userId: string): Promise<Publication[]> {
    await this.simulateLatency();
    return Array.from(this.publications.values()).filter(pub => pub.userId === userId);
  }

  async searchPublications(criteria: {
    location?: string;
    city?: string;
    country?: string;
    maxPrice?: number;
    minPrice?: number;
    roomType?: string;
  }): Promise<Publication[]> {
    await this.simulateLatency(200, 800);

    return Array.from(this.publications.values()).filter(publication => {
      return Object.entries(criteria).every(([key, value]) => {
        if (value === undefined || value === '') return true;
        
        const publicationValue = (publication as any)[key];
        
        switch (key) {
          case 'maxPrice':
            // Asegurar que ambos son números
            return Number(publicationValue) <= Number(value);
          case 'minPrice':
            // Asegurar que ambos son números
            return Number(publicationValue) >= Number(value);
          case 'roomType':
            // Comparación de strings
            return publicationValue === value;
          case 'location':
          case 'city':
          case 'country':
            // Búsqueda case-insensitive en strings
            return publicationValue.toLowerCase().includes(String(value).toLowerCase());
          default:
            return publicationValue === value;
        }
      });
    });
  }

  async getActivePublications(): Promise<Publication[]> {
    await this.simulateLatency();
    return Array.from(this.publications.values()).filter(pub => pub.status === 'active');
  }

  private simulateLatency(min: number = 150, max: number = 600): Promise<void> {
    const delay = Math.random() * (max - min) + min;
    return new Promise(resolve => setTimeout(resolve, delay));
  }
}

export const publicationService = new PublicationService();