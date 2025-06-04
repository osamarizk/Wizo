// utils/eventEmitter.js

class EventEmitter {
  constructor() {
    this.listeners = {};
  }

  /**
   * Registers an event listener.
   * @param {string} eventName - The name of the event to listen for.
   * @param {function} callback - The function to call when the event is emitted.
   */
  on(eventName, callback) {
    if (!this.listeners[eventName]) {
      this.listeners[eventName] = [];
    }
    this.listeners[eventName].push(callback);
  }

  /**
   * Removes an event listener.
   * @param {string} eventName - The name of the event.
   * @param {function} callback - The specific callback function to remove.
   */
  off(eventName, callback) {
    if (!this.listeners[eventName]) {
      return;
    }
    this.listeners[eventName] = this.listeners[eventName].filter(
      (listener) => listener !== callback
    );
  }

  /**
   * Emits an event, calling all registered listeners for that event.
   * @param {string} eventName - The name of the event to emit.
   * @param {...any} args - Arguments to pass to the listeners.
   */
  emit(eventName, ...args) {
    if (!this.listeners[eventName]) {
      return;
    }
    this.listeners[eventName].forEach((listener) => {
      try {
        listener(...args);
      } catch (error) {
        console.error(`Error in event listener for ${eventName}:`, error);
      }
    });
  }
}

const eventEmitter = new EventEmitter();

export default eventEmitter;
