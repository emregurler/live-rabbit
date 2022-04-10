import { API_EVENT_TYPE } from './api.js';
import { addMessage, animateGift, isPossiblyAnimatingGift } from './dom_updates.js';

const MESSAGE_TIMEOUT_MS = 20000;

export class EventQueue {
  #queue;

  constructor() {
    this.#queue = [];

    this.runner;
  }

  addEventsToQueue(events) {
    events.forEach((event) => {
      if (event.type === API_EVENT_TYPE.ANIMATED_GIFT) {
        this.#queue.unshift(event);
      } else {
        this.#queue.push(event);
      }
    });
    this.#queue = this.#getUniqueList();
  }

  stop() {
    clearInterval(this.runner);
  }

  start() {
    this.runner = setInterval(() => {
      if (window['stopQueue']) return;

      const nextEvent = this.#getNextEvent();
      this.#renderEvent(nextEvent);
    }, 500);
  }

  #renderEvent(event) {
    if (event) {
      switch (event.type) {
        case API_EVENT_TYPE.ANIMATED_GIFT:
          animateGift(event);
          addMessage(event);
          break;
        case API_EVENT_TYPE.MESSAGE:
        case API_EVENT_TYPE.GIFT:
          addMessage(event);
          break;
      }
    }
  }

  #getNextEvent() {
    if (this.#queue.length > 0) {
      let nextEvent;
      const animationEvents = this.#queue.filter(
        (event) => event.type === API_EVENT_TYPE.ANIMATED_GIFT,
      );
      let otherMessageEvents = this.#queue.filter(
        (event) => event.type !== API_EVENT_TYPE.ANIMATED_GIFT,
      );
      if (!isPossiblyAnimatingGift() && animationEvents.length > 0) {
        nextEvent = animationEvents.pop();
      } else {
        const { event, remainingEvents } = this.#takeValidMessage(otherMessageEvents);
        nextEvent = event;
        otherMessageEvents = remainingEvents;
      }
      this.#queue = [...animationEvents, ...otherMessageEvents];
      return nextEvent;
    }
  }

  #takeValidMessage(messageEvents = []) {
    const copyMessageEvents = [...messageEvents];
    const possibleNextMessage = copyMessageEvents.shift();
    if (possibleNextMessage) {
      if (possibleNextMessage.type === API_EVENT_TYPE.MESSAGE) {
        if (Date.now() - possibleNextMessage.timestamp.getTime() < MESSAGE_TIMEOUT_MS) {
          return { event: possibleNextMessage, remainingEvents: copyMessageEvents };
        } else {
          const warnMessage = `${MESSAGE_TIMEOUT_MS} ms passed`;
          console.warn(warnMessage);
          return this.#takeValidMessage(copyMessageEvents);
        }
      } else {
        return { event: possibleNextMessage, remainingEvents: copyMessageEvents };
      }
    } else {
      return { event: undefined, remainingEvents: copyMessageEvents };
    }
  }

  #getUniqueList() {
    return this.#queue.filter((v, i, a) => a.findIndex((v2) => v2.id === v.id) === i);
  }
}
