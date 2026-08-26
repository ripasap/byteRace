// src/utils/EventBus.ts
type EventCallback = (...args: any[]) => void;

class EventBus {
    private events: { [key: string]: EventCallback[] };

    constructor() {
        this.events = {};
    }

    // Subscribe to an event
    on(event: string, callback: EventCallback): void {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
    }

    // Unsubscribe from an event
    off(event: string, callback: EventCallback): void {
        if (!this.events[event]) return;

        this.events[event] = this.events[event].filter(listener => listener !== callback);

        if (this.events[event].length === 0) {
            delete this.events[event];
        }
    }

    // Emit an event to all subscribers
    emit(event: string, ...args: any[]): void {
        if (!this.events[event]) return;

        this.events[event].forEach(callback => {
            callback(...args);
        });
    }

    // Clear all listeners for a given event
    clear(event: string): void {
        if (!this.events[event]) return;

        delete this.events[event];
    }
}

export const eventBus = new EventBus();
