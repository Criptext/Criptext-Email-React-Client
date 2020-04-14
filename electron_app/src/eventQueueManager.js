const { getPendingEvents, deletePendingEventsByIds } = require('./database');
const { mailformedEventRegex } = require('./utils/RegexUtils');
const { NUCLEUS_EVENTS, addEventError } = require('./nucleusManager');
let clientManager;

const QUEUE_BATCH = 100;
const MALFORMED_EVENT_STATUS = 202;
const SUCCESS_STATUS = 200;
let isProcessingQueue = false;

const processEventsQueue = async ({ accountId, recipientId }) => {
  if (isProcessingQueue) return;
  isProcessingQueue = true;

  if (!clientManager) {
    clientManager = require('./clientManager');
  }
  const queuedEvents = await getPendingEvents(accountId).catch(ex => {
    addEventError(NUCLEUS_EVENTS.POST_PEER_EVENT, ex);
  });
  while (queuedEvents && queuedEvents.length > 0) {
    try {
      const batch = queuedEvents.splice(0, QUEUE_BATCH);
      const { ids, parsedEvents } = await removeMalformedEvents(batch);
      if (!parsedEvents.length) continue;

      const { status } = await clientManager.pushPeerEvents({
        events: parsedEvents,
        recipientId
      });
      if (status === MALFORMED_EVENT_STATUS) {
        continue;
      } else if (status === SUCCESS_STATUS) {
        await deletePendingEventsByIds(ids);
      }
    } catch (ex) {
      addEventError(NUCLEUS_EVENTS.POST_PEER_EVENT, ex);
    }
  }
  isProcessingQueue = false;
};

const removeMalformedEvents = async batch => {
  const invalidIds = [];
  const validIds = [];
  const eventsData = batch
    .map(event => {
      const isMalformed = event.data.match(mailformedEventRegex);
      const data = JSON.parse(event.data);
      const metadataKeysMalformed = hasMetadataKeysMalformed(data.params);
      if (isMalformed || metadataKeysMalformed) {
        invalidIds.push(event.id);
      } else {
        validIds.push(event.id);
        if (data.cmd === 500) {
          if (data.params.unread === 0) {
            const params = { metadataKeys: data.params.metadataKeys };
            const d = { cmd: data.cmd, params };
            return d;
          }
        }
        return data;
      }
    })
    .filter(data => !!data);

  if (invalidIds.length > 0) {
    await deletePendingEventsByIds(invalidIds);
  }
  return {
    ids: validIds,
    parsedEvents: eventsData
  };
};

const hasMetadataKeysMalformed = params => {
  if (!params.metadataKeys) return false;
  return params.metadataKeys.some(metadataKey => metadataKey.length === 1);
};

module.exports = {
  processEventsQueue
};
