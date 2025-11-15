import type { Message } from "../types";
import { securityService } from "./SecurityService";
import { eventBus } from "./EventBus";

class MessageService {
  private messages: Map<string, Message> = new Map();
  private matchMessages: Map<string, string[]> = new Map(); // matchId -> messageIds

  constructor() {
    // No mock messages: solo intercambio usuario-usuario
  }

  async sendMessage(
    messageData: Omit<Message, "id" | "timestamp" | "read">
  ): Promise<Message> {
    await this.simulateLatency();

    // Moderación de  contenido
    const moderatedContent = await securityService.moderateContent(
      messageData.content
    );

    const newMessage: Message = {
      ...messageData,
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content: moderatedContent,
      timestamp: new Date(),
      read: false,
    };

    this.messages.set(newMessage.id, newMessage);

    // Actualizar índice de mensajes por match
    if (!this.matchMessages.has(newMessage.matchId)) {
      this.matchMessages.set(newMessage.matchId, []);
    }
    this.matchMessages.get(newMessage.matchId)!.push(newMessage.id);

    await eventBus.publish({
      type: "MensajeEnviado",
      origin: "MessageService",
      destination: "NotificationService",
      payload: { message: newMessage },
    });

    return newMessage;
  }

  async getMatchMessages(matchId: string): Promise<Message[]> {
    await this.simulateLatency();

    const messageIds = this.matchMessages.get(matchId) || [];
    const messages = messageIds
      .map((id) => this.messages.get(id))
      .filter(Boolean) as Message[];

    return messages.sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
    );
  }

  async markMessageAsRead(messageId: string): Promise<void> {
    await this.simulateLatency();

    const message = this.messages.get(messageId);
    if (message) {
      message.read = true;
      this.messages.set(messageId, message);
    }
  }

  async markAllMessagesAsRead(matchId: string, userId: string): Promise<void> {
    await this.simulateLatency();

    const messages = await this.getMatchMessages(matchId);
    for (const message of messages) {
      if (message.senderId !== userId && !message.read) {
        await this.markMessageAsRead(message.id);
      }
    }
  }

  async getUnreadCount(userId: string): Promise<number> {
    await this.simulateLatency();

    let count = 0;
    for (const message of this.messages.values()) {
      if (message.senderId !== userId && !message.read) {
        count++;
      }
    }
    return count;
  }

  private simulateLatency(min: number = 50, max: number = 300): Promise<void> {
    const delay = Math.random() * (max - min) + min;
    return new Promise((resolve) => setTimeout(resolve, delay));
  }
}

export const messageService = new MessageService();
