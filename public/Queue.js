export class Queue {
  constructor() {
    this.queue = [];
  }

  add(item) {
    this.queue.push(item);
  }

  takeNext() {
    if (this.queue.length === 0) {
      return;
    }

    return this.queue.shift();
  }

  orderQueue(callback) {
    try {
      this.queue.sort(callback);
    } catch (e) {
      console.error(e.message);
    }
  }

  getLength() {
    return this.queue.length;
  }
}
