const { getPendingEvents, deletePendingEventsByIds } = require('./DBManager');
const globalManager = require('./globalManager');
let clientManager;

const QUEUE_BATCH = 5;

const processEventsQueue = async () => {
  if (globalManager.internetConnection.getStatus() === true) {
    if (!clientManager) {
      clientManager = require('./clientManager');
    }
    const queuedEvents = await getPendingEvents();
    while (queuedEvents.length > 0) {
      const batch = queuedEvents.splice(0, QUEUE_BATCH);
      const eventsData = batch.map(event => JSON.parse(event.data));
      const ids = batch.map(event => event.id);
      const { status } = await clientManager.pushPeerEvents(eventsData);
      if (status !== 200) {
        break;
      } else {
        await deletePendingEventsByIds(ids);
      }
    }
  }
};

module.exports = {
  processEventsQueue
};
