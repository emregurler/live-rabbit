// @ts-check

import { APIWrapper } from './api.js';
import { EventQueue } from './EventQueue.js';

const apiOptions = {
  seed: null,
  slowMode: true,
  possibleDuplicateEvent: true,
};

const api = new APIWrapper(apiOptions);

const eventQueue = new EventQueue();

eventQueue.start();

api.setEventHandler((events) => {
  eventQueue.addEventsToQueue(events);
});

// NOTE: UI helper methods from `dom_updates` are already imported above.
