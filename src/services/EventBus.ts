import type { Event, EventType } from "../types";

type EventHandler = (event: Event) => void;

class EventBus {
  private handlers: Map<EventType, EventHandler[]> = new Map();
  private eventQueue: Event[] = [];
  private isProcessing = false;

  subscribe(eventType: EventType, handler: EventHandler) {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler);
  }

  unsubscribe(eventType: EventType, handler: EventHandler) {
    const handlers = this.handlers.get(eventType);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  async publish(event: Omit<Event, "id" | "timestamp">) {
    const fullEvent: Event = {
      ...event,
      id: this.generateId(),
      timestamp: new Date(),
    };

    // Simular latencia de red (100-500ms)
    const latency = Math.random() * 400 + 100;
    await this.delay(latency);

    this.eventQueue.push(fullEvent);
    this.processQueue();
  }

  private async processQueue() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    while (this.eventQueue.length > 0) {
      const event = this.eventQueue.shift()!;

      // Simular procesamiento asíncrono
      await this.delay(50);

      const handlers = this.handlers.get(event.type) || [];
      handlers.forEach((handler) => {
        try {
          handler(event);
        } catch (error) {
          console.error(`Error in event handler for ${event.type}:`, error);
        }
      });

      // Simular posible fallo (1% de probabilidad)
      if (Math.random() < 0.01) {
        console.warn(`Simulated failure processing event: ${event.type}`);
        break;
      }
    }

    this.isProcessing = false;
  }

  private generateId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Método para debugging
  getQueueLength(): number {
    return this.eventQueue.length;
  }

  getSubscribersCount(eventType: EventType): number {
    return this.handlers.get(eventType)?.length || 0;
  }
}

export const eventBus = new EventBus();
