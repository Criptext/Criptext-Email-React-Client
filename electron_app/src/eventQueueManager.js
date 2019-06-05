const {
  getAccount,
  getPendingEvents,
  deletePendingEventsByIds
} = require('./DBManager');
const { mailformedEventRegex } = require('./utils/RegexUtils');
const globalManager = require('./globalManager');
let clientManager;

const QUEUE_BATCH = 3;
const MALFORMED_EVENT_STATUS = 202;
const SUCCESS_STATUS = 200;
let isProcessingQueue = false;

const processEventsQueue = async () => {
  if (globalManager.internetConnection.getStatus() === true) {
    if (isProcessingQueue) return;
    isProcessingQueue = true;

    if (!clientManager) {
      clientManager = require('./clientManager');
    }
    const [account] = await getAccount();
    const queuedEvents = await getPendingEvents(account.id);
    while (queuedEvents.length > 0) {
      const batch = queuedEvents.splice(0, QUEUE_BATCH);
      const { ids, parsedEvents } = await removeMalformedEvents(batch);
      if (!parsedEvents.length) continue;

      const { status } = await clientManager.pushPeerEvents(parsedEvents);
      if (status === MALFORMED_EVENT_STATUS) {
        continue;
      } else if (status === SUCCESS_STATUS) {
        await deletePendingEventsByIds({ ids, accountId: account.id });
      }
    }
    isProcessingQueue = false;
  }
};

const removeMalformedEvents = async batch => {
  const invalidIds = [];
  const validIds = [];
  const eventsData = batch
    .map(event => {
      const isMalformed = event.data.match(mailformedEventRegex);
      if (isMalformed) {
        invalidIds.push(event.id);
      } else {
        validIds.push(event.id);
        return JSON.parse(event.data);
      }
    })
    .filter(data => !!data);
  const [account] = await getAccount();
  if (invalidIds.length > 0) {
    await deletePendingEventsByIds({ ids: invalidIds, accountId: account.id });
  }
  return {
    ids: validIds,
    parsedEvents: eventsData
  };
};

module.exports = {
  processEventsQueue
};
