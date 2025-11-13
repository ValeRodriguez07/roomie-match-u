import type { Notification } from "../types";
import { eventBus } from "./EventBus";

class NotificationService {
  private notifications: Map<string, Notification> = new Map();
  private userNotifications: Map<string, string[]> = new Map(); // userId -> notificationIds

  constructor() {
    this.setupEventListeners();
  }

  private setupEventListeners() {
    eventBus.subscribe("MatchEncontrado", this.handleNewMatch.bind(this));
    eventBus.subscribe("MatchAceptado", this.handleMatchAccepted.bind(this));
    eventBus.subscribe("MensajeEnviado", this.handleNewMessage.bind(this));
    eventBus.subscribe(
      "AlertaDeSeguridad",
      this.handleSecurityAlert.bind(this)
    );
  }

  private async handleNewMatch(event: any) {
    const match = event.payload.match;

    // Notificar a ambos usuarios
    await this.createNotification({
      userId: match.user1Id,
      title: "¡Nuevo match potencial!",
      message: "Has encontrado un posible compañero de vivienda.",
      type: "match",
      actionUrl: `/matches/${match.id}`,
    });

    await this.createNotification({
      userId: match.user2Id,
      title: "¡Nuevo match potencial!",
      message: "Has encontrado un posible compañero de vivienda.",
      type: "match",
      actionUrl: `/matches/${match.id}`,
    });
  }

  private async handleMatchAccepted(event: any) {
    const match = event.payload.match;

    await this.createNotification({
      userId: match.user1Id,
      title: "¡Match aceptado!",
      message: "Tu match ha sido aceptado. ¡Pueden comenzar a chatear!",
      type: "match",
      actionUrl: `/chat/${match.id}`,
    });

    await this.createNotification({
      userId: match.user2Id,
      title: "¡Match aceptado!",
      message: "Tu match ha sido aceptado. ¡Pueden comenzar a chatear!",
      type: "match",
      actionUrl: `/chat/${match.id}`,
    });
  }

  private async handleNewMessage(event: any) {
    const message = event.payload.message;

    if (message.type === "system") return;

    // En una app real, aquí obtendríamos el userId del otro participante del match
    // Por simplicidad, simulamos una notificación genérica
    await this.createNotification({
      userId: "user_2", // Usuario simulado
      title: "Nuevo mensaje",
      message: "Tienes un nuevo mensaje en el chat.",
      type: "message",
      actionUrl: `/chat/${message.matchId}`,
    });
  }

  private async handleSecurityAlert(event: any) {
    const alert = event.payload.alert;

    await this.createNotification({
      userId: alert.userId,
      title: "Alerta de seguridad",
      message: alert.message,
      type: "security",
    });
  }

  async createNotification(
    notificationData: Omit<Notification, "id" | "timestamp" | "read">
  ): Promise<Notification> {
    await this.simulateLatency();

    const newNotification: Notification = {
      ...notificationData,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false,
    };

    this.notifications.set(newNotification.id, newNotification);

    // Actualizar índice de notificaciones por usuario
    if (!this.userNotifications.has(newNotification.userId)) {
      this.userNotifications.set(newNotification.userId, []);
    }
    this.userNotifications
      .get(newNotification.userId)!
      .push(newNotification.id);

    // Simular notificación push
    this.simulatePushNotification(newNotification);

    return newNotification;
  }

  async getUserNotifications(userId: string): Promise<Notification[]> {
    await this.simulateLatency();

    const notificationIds = this.userNotifications.get(userId) || [];
    const notifications = notificationIds
      .map((id) => this.notifications.get(id))
      .filter(Boolean) as Notification[];

    return notifications.sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );
  }

  async markAsRead(notificationId: string): Promise<void> {
    await this.simulateLatency();

    const notification = this.notifications.get(notificationId);
    if (notification) {
      notification.read = true;
      this.notifications.set(notificationId, notification);
    }
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.simulateLatency();

    const notifications = await this.getUserNotifications(userId);
    for (const notification of notifications) {
      if (!notification.read) {
        await this.markAsRead(notification.id);
      }
    }
  }

  async getUnreadCount(userId: string): Promise<number> {
    await this.simulateLatency();

    const notifications = await this.getUserNotifications(userId);
    return notifications.filter((n) => !n.read).length;
  }

  private simulatePushNotification(notification: Notification) {
    // En un navegador real, aquí usaríamos la API de notificaciones
    console.log("📢 Push Notification:", {
      title: notification.title,
      body: notification.message,
      icon: "/icon.png",
    });

    // Mostrar notificación nativa del navegador si está soportada
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(notification.title, {
        body: notification.message,
        icon: "/icon.png",
      });
    }
  }

  private simulateLatency(min: number = 100, max: number = 400): Promise<void> {
    const delay = Math.random() * (max - min) + min;
    return new Promise((resolve) => setTimeout(resolve, delay));
  }
}

export const notificationService = new NotificationService();
