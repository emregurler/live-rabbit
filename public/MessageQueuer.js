import { Queue } from './Queue.js';
import { API_EVENT_TYPE } from './api.js';
import { addMessage, isPossiblyAnimatingGift, animateGift } from './dom_updates.js';

const MESSAGE_TIMEOUT_MS = 20000;

export class MessageQueuer {
  constructor(disableDuplicate) {
    this.animationQueue = new Queue(disableDuplicate);
    this.messagesQueue = new Queue(disableDuplicate);
    this.disableDuplicate = disableDuplicate;

    this.runner = null;
  }

  add(messages) {
    messages.forEach((message) => {
      if (API_EVENT_TYPE.ANIMATED_GIFT === message.type) {
        this.animationQueue.add(message);
      } else {
        this.messagesQueue.add(message);
      }
    });
  }

  run() {
    this.runner = setInterval(() => {
      this._queueRunner();
    }, 500);
  }

  stop() {
    clearInterval(this.runner);
  }

  takeValidMessage() {
    const nextMessage = this.messagesQueue.takeNext();
    if (nextMessage && nextMessage.type === API_EVENT_TYPE.MESSAGE) {
      if (Date.now() - nextMessage.timestamp.getTime() < MESSAGE_TIMEOUT_MS) {
        return nextMessage;
      } else {
        console.warn('20 seconds passed');
        return this.takeValidMessage();
      }
    } else {
      return nextMessage;
    }
  }

  _queueRunner() {
    if (this.disableDuplicate) {
      this.animationQueue.makeUniqueQueueById();
      this.messagesQueue.makeUniqueQueueById();
    }
    if (this.animationQueue.getLength() > 0) {
      if (!isPossiblyAnimatingGift()) {
        const animatingGift = this.animationQueue.takeNext();
        animatingGift && animateGift(animatingGift);
      }
    }

    if (this.messagesQueue.getLength() > 0) {
      const message = this.takeValidMessage();
      message && addMessage(message);
    }
  }
}
