// @ts-check

import { APIWrapper } from './api.js';
import { MessageQueuer } from './MessageQueuer.js';

const apiOptions = {
  seed: null,
  slowMode: true,
  possibleDuplicateEvent: false,
};

const api = new APIWrapper(apiOptions);

const disableDuplication = true;
const messageQueuer = new MessageQueuer(disableDuplication, false);

messageQueuer.run();

api.setEventHandler((events) => {
  messageQueuer.add(events);
});

// NOTE: UI helper methods from `dom_updates` are already imported above.
