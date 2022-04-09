// @ts-check

import { APIWrapper } from './api.js';
import { MessageQueuer } from './MessageQueuer.js';

const disableDuplication = false;
const apiOptions = {
  seed: null,
  slowMode: true,
  possibleDuplicateEvent: !disableDuplication,
};

const api = new APIWrapper(apiOptions);
const messageQueuer = new MessageQueuer(disableDuplication);

messageQueuer.run();

api.setEventHandler((events) => {
  messageQueuer.add(events);
});

// NOTE: UI helper methods from `dom_updates` are already imported above.
