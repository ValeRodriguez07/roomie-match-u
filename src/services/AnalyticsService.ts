import type { AnalyticsData } from '../types';
import { eventBus } from './EventBus';

class AnalyticsService {
  private analytics: AnalyticsData = {
    totalMatches: 0,
    totalMessages: 0,
    activePublications: 0,
    securityAlerts: 0,
    userEngagement: 0
  };

  private userSessions: Map<string, { start: Date; end?: Date }> = new Map();
  private dailyStats: Map<string, AnalyticsData> = new Map();

  constructor() {
    this.setupEventListeners();
    this.initializeMockData();
  }

  private setupEventListeners() {
    eventBus.subscribe('UsuarioConectado', this.handleUserConnected.bind(this));
    eventBus.subscribe('UsuarioDesconectado', this.handleUserDisconnected.bind(this));
    eventBus.subscribe('MatchEncontrado', this.handleMatchFound.bind(this));
    eventBus.subscribe('MensajeEnviado', this.handleMessageSent.bind(this));
    eventBus.subscribe('PublicacionCreada', this.handlePublicationCreated.bind(this));
    eventBus.subscribe('AlertaDeSeguridad', this.handleSecurityAlert.bind(this));
  }

  private initializeMockData() {
    // Datos iniciales simulados
    this.analytics = {
      totalMatches: 42,
      totalMessages: 156,
      activePublications: 23,
      securityAlerts: 2,
      userEngagement: 0.68
    };
  }

  private async handleUserConnected(event: any) {
    const userId = event.payload.userId;
    this.userSessions.set(userId, { start: new Date() });
    
    this.analytics.userEngagement = this.calculateEngagementScore();
    await this.logEvent('user_connected', { userId });
  }

  private async handleUserDisconnected(event: any) {
    const userId = event.payload.userId;
    const session = this.userSessions.get(userId);
    
    if (session) {
      session.end = new Date();
      const duration = session.end.getTime() - session.start.getTime();
      
      await this.logEvent('user_disconnected', { 
        userId, 
        duration: Math.round(duration / 1000 / 60) // minutos
      });
    }
  }

  private async handleMatchFound(event: any) {
    this.analytics.totalMatches++;
    await this.logEvent('match_created', { matchId: event.payload.match.id });
  }

  private async handleMessageSent(event: any) {
    if (event.payload.message.type !== 'system') {
      this.analytics.totalMessages++;
      await this.logEvent('message_sent', { 
        matchId: event.payload.message.matchId,
        length: event.payload.message.content.length
      });
    }
  }

  private async handlePublicationCreated(event: any) {
    this.analytics.activePublications++;
    await this.logEvent('publication_created', { 
      publicationId: event.payload.publication.id 
    });
  }

  private async handleSecurityAlert(event: any) {
    this.analytics.securityAlerts++;
    await this.logEvent('security_alert', { 
      riskLevel: event.payload.alert.riskLevel 
    });
  }

  private calculateEngagementScore(): number {
    // Simular cálculo de engagement basado en sesiones activas
    const activeSessions = Array.from(this.userSessions.values()).filter(
      session => !session.end
    ).length;

    return Math.min(activeSessions / 10, 1); // Normalizado a 0-1
  }

  async getAnalytics(): Promise<AnalyticsData> {
    await this.simulateLatency(500, 1500); // Analytics suele ser más lento
    
    // Simular variación en los datos
    this.analytics.totalMatches += Math.floor(Math.random() * 3);
    this.analytics.totalMessages += Math.floor(Math.random() * 10);
    this.analytics.userEngagement = this.calculateEngagementScore();
    
    return { ...this.analytics };
  }

  async getRecommendations(userId: string): Promise<string[]> {
    await this.simulateLatency(300, 800);

    const recommendations = [
      "Completa tu perfil para obtener mejores matches",
      "Actualiza tus preferencias de búsqueda",
      "Revisa las nuevas publicaciones en tu área",
      "Responde a tus matches pendientes",
      "Comparte Roomie Match U con tus amigos"
    ];

    // Seleccionar 2-3 recomendaciones aleatorias
    const count = Math.floor(Math.random() * 2) + 2;
    const shuffled = [...recommendations].sort(() => 0.5 - Math.random());
    
    return shuffled.slice(0, count);
  }

  private async logEvent(eventType: string, metadata: any): Promise<void> {
    // En una implementación real, esto enviaría datos a un servicio de analytics
    console.log('📊 Analytics Event:', eventType, metadata);
  }

  private simulateLatency(min: number = 200, max: number = 800): Promise<void> {
    const delay = Math.random() * (max - min) + min;
    return new Promise(resolve => setTimeout(resolve, delay));
  }
}

export const analyticsService = new AnalyticsService();