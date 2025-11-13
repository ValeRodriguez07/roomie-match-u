import { eventBus } from "./EventBus";

class SecurityService {
  private bannedWords = [
    "spam",
    "estafa",
    "fraude",
    "mentira",
    "odio",
    "violencia",
    "acoso",
    "abusar",
    "ilegal",
    "prohibido",
    "droga",
    "armas",
  ];

  private suspiciousPatterns = [
    /(\d{16})/, // Números de tarjeta de crédito
    /(\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b)/,
    /(http|https):\/\/[^\s]+/, // URLs
    /[\w\.-]+@[\w\.-]+\.\w+/, // Emails
    /(\+?\d{1,3}[- ]?)?\(?\d{3}\)?[- ]?\d{3}[- ]?\d{4}/, // Teléfonos
  ];

  constructor() {
    this.setupEventListeners();
  }

  private setupEventListeners() {
    eventBus.subscribe("MensajeEnviado", this.analyzeMessage.bind(this));
    eventBus.subscribe("PublicacionCreada", this.analyzePublication.bind(this));
  }

  async analyzeMessage(event: any) {
    const message = event.payload.message;

    const analysis = await this.analyzeContent(
      message.content,
      message.senderId
    );

    if (analysis.riskLevel > 0.7) {
      await eventBus.publish({
        type: "AlertaDeSeguridad",
        origin: "SecurityService",
        destination: "NotificationService",
        payload: {
          alert: {
            userId: message.senderId,
            message: `Contenido potencialmente peligroso detectado: ${analysis.reason}`,
            riskLevel: analysis.riskLevel,
            content: message.content,
          },
        },
      });
    }
  }

  async analyzePublication(event: any) {
    const publication = event.payload.publication;

    const titleAnalysis = await this.analyzeContent(
      publication.title,
      publication.userId
    );
    const descAnalysis = await this.analyzeContent(
      publication.description,
      publication.userId
    );

    const maxRisk = Math.max(titleAnalysis.riskLevel, descAnalysis.riskLevel);

    if (maxRisk > 0.8) {
      await eventBus.publish({
        type: "AlertaDeSeguridad",
        origin: "SecurityService",
        destination: "NotificationService",
        payload: {
          alert: {
            userId: publication.userId,
            message:
              "Publicación marcada para revisión por contenido sospechoso",
            riskLevel: maxRisk,
            content: `${publication.title} - ${publication.description}`,
          },
        },
      });
    }
  }

  async analyzeContent(
    content: string,
    userId: string
  ): Promise<{
    riskLevel: number;
    reason: string;
    moderated: boolean;
  }> {
    await this.simulateLatency();

    let riskLevel = 0;
    const reasons: string[] = [];

    // Detectar palabras prohibidas
    const foundBannedWords = this.bannedWords.filter((word) =>
      content.toLowerCase().includes(word.toLowerCase())
    );

    if (foundBannedWords.length > 0) {
      riskLevel += 0.3;
      reasons.push(`Palabras prohibidas: ${foundBannedWords.join(", ")}`);
    }

    // Detectar patrones sospechosos
    const foundPatterns = this.suspiciousPatterns.filter((pattern) =>
      pattern.test(content)
    );

    if (foundPatterns.length > 0) {
      riskLevel += 0.4;
      reasons.push("Patrones sospechosos detectados");
    }

    // Análisis de longitud y repetición (spam simple)
    if (content.length > 500) {
      riskLevel += 0.1;
      reasons.push("Contenido muy extenso");
    }

    const words = content.split(" ");
    const uniqueWords = new Set(words.map((w) => w.toLowerCase()));
    if (uniqueWords.size / words.length < 0.3) {
      riskLevel += 0.2;
      reasons.push("Posible contenido repetitivo");
    }

    return {
      riskLevel: Math.min(riskLevel, 1),
      reason: reasons.join("; "),
      moderated: foundBannedWords.length > 0,
    };
  }

  async moderateContent(content: string): Promise<string> {
    await this.simulateLatency();

    let moderatedContent = content;

    // Reemplazar palabras prohibidas
    this.bannedWords.forEach((word) => {
      const regex = new RegExp(`\\b${word}\\b`, "gi");
      moderatedContent = moderatedContent.replace(
        regex,
        "*".repeat(word.length)
      );
    });

    return moderatedContent;
  }

  async logSecurityEvent(event: {
    type: string;
    userId: string;
    severity: "low" | "medium" | "high";
    description: string;
    metadata?: any;
  }): Promise<void> {
    await this.simulateLatency();

    console.log("🔒 Security Event:", event);
  }

  private simulateLatency(min: number = 50, max: number = 200): Promise<void> {
    const delay = Math.random() * (max - min) + min;
    return new Promise((resolve) => setTimeout(resolve, delay));
  }
}

export const securityService = new SecurityService();
