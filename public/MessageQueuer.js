import { Queue } from './Queue.js';
import { API_EVENT_TYPE } from './api.js';
import { addMessage, isPossiblyAnimatingGift, animateGift } from './dom_updates.js';
import { getUniqueArray } from './utils.js';

const MESSAGE_TIMEOUT_MS = 20000;

export const QUEUE_TYPE = Object.freeze({
  ANIMATION_QUEUE: 'animationQueue',
  MESSAGES_QUEUE: 'messagesQueue',
});

export class MessageQueuer {
  #asyncQueues;
  #disableDuplicate;

  constructor(disableDuplicate, debugMode = false) {
    const animationQueue = new Queue();
    const messagesQueue = new Queue();
    const renderedEvents = new Set();

    this.#asyncQueues = {
      [QUEUE_TYPE.ANIMATION_QUEUE]: animationQueue,
      [QUEUE_TYPE.MESSAGES_QUEUE]: messagesQueue,
    };

    this.#disableDuplicate = disableDuplicate;

    this.runner = null;

    window.debugOn = debugMode;
    if (window.debugOn) {
      window.allEvents = [];
      window.animatedEvents = [];
      window.notValidEvents = [];
    }
  }

  run() {
    this.runner = setInterval(() => {
      this.#queueRunner();
    }, 500);
  }

  stop() {
    clearInterval(this.runner);
  }

  add(events = []) {
    let messages = events;
    console.log(events);
    if (this.#disableDuplicate) {
      messages = getUniqueArray(messages);
    }
    messages.forEach((message) => {
      const queueType = this.#getQueueTypeFromMessageType(message.type);
      this.#asyncQueues[queueType].add(message);
    });

    if (window.debugOn) {
      window.allEvents.push(...messages);
    }
  }

  #getQueueTypeFromMessageType(messageType) {
    switch (messageType) {
      case API_EVENT_TYPE.ANIMATED_GIFT:
        return QUEUE_TYPE.ANIMATION_QUEUE;
      case API_EVENT_TYPE.GIFT:
      case API_EVENT_TYPE.MESSAGE:
        return QUEUE_TYPE.MESSAGES_QUEUE;
    }
  }

  #queueRunner() {
    Object.keys(this.#asyncQueues).forEach(async (queueKey) => {
      const queue = this.#asyncQueues[queueKey];
      if (queue.getLength() > 0) {
        const nextMessage = this.#takeNextMessage(queueKey);
        console.log('###afterTakeNextMessage', nextMessage);
        this.#renderEvent(nextMessage, queueKey);
      }
    });
  }

  #takeNextMessage(queueKey) {
    const queue = this.#asyncQueues[queueKey];
    switch (queueKey) {
      case QUEUE_TYPE.ANIMATION_QUEUE:
        if (!isPossiblyAnimatingGift()) {
          const ag = queue.takeNext();
          console.log(ag);
          return ag;
        }
      case QUEUE_TYPE.MESSAGES_QUEUE:
        return this.#takeValidMessageInMiliseconds(
          queue,
          [API_EVENT_TYPE.MESSAGE],
          MESSAGE_TIMEOUT_MS,
        );
    }
  }

  #takeValidMessageInMiliseconds(queue, restrictedTypes, limitInMiliseconds) {
    const nextMessage = queue.takeNext();
    if (nextMessage) {
      if (restrictedTypes.includes(nextMessage.type)) {
        if (Date.now() - nextMessage.timestamp.getTime() < limitInMiliseconds) {
          return nextMessage;
        } else {
          console.warn('20 seconds passed');
          if (debugOn) {
            window.notValidEvents.push(nextMessage);
          }
          return this.#takeValidMessageInMiliseconds();
        }
      } else {
        return nextMessage;
      }
    }
  }

  #renderEvent(message, queueKey) {
    if (message) {
      console.log('#######', message, queueKey);
      switch (queueKey) {
        case QUEUE_TYPE.ANIMATION_QUEUE:
          animateGift(message);
          addMessage(message);
          break;
        case QUEUE_TYPE.MESSAGES_QUEUE:
          addMessage(message);
          break;
      }

      if (window.debugOn) {
        window.animatedEvents.push(message);
      }
    }
  }
}
