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

  makeUniqueQueueById() {
    if (this.queue.length > 1) {
      const uniqueQueue = this.queue.filter((v, i, a) => a.findIndex((v2) => v2.id === v.id) === i);
      this.queue = uniqueQueue;
    }
  }
}
