import { apiCriptextRequest } from './ApiUtils';
import { checkExpiredSession } from './ipc';

const PENDING_EVENTS_STATUS_OK = 200;
const PENDING_EVENTS_STATUS_MORE = 201;
const NO_EVENTS_STATUS = 204;
const INITIAL_REQUEST_EMPTY_STATUS = 202;

export const fetchEmailBody = async bodyKey => {
  const res = await apiCriptextRequest({
    endpoint: '/email/body/' + bodyKey,
    method: 'GET'
  });
  const jsonRes = await res.json();
  return res.status === 200
    ? { status: 200, body: jsonRes }
    : await checkExpiredSession({
        response: { status: res.status },
        initialRequest: fetchEmailBody,
        requestParams: bodyKey
      });
};

const formEvents = events =>
  events.map(event => ({
    cmd: event.cmd,
    params: JSON.parse(event.params),
    rowid: event.rowid
  }));

export const fetchEvents = async () => {
  const res = await apiCriptextRequest({
    endpoint: '/event',
    method: 'GET'
  });
  switch (res.status) {
    case PENDING_EVENTS_STATUS_OK: {
      const jsonRes = await res.json();
      return { events: formEvents(jsonRes) };
    }
    case PENDING_EVENTS_STATUS_MORE: {
      const jsonRes = await res.json();
      return { events: formEvents(jsonRes), hasMoreEvents: true };
    }
    case NO_EVENTS_STATUS:
      return { events: [] };
    default: {
      const expiredResponse = await checkExpiredSession({
        response: { status: res.status },
        initialRequest: fetchEvents,
        requestParams: null
      });
      if (expiredResponse.status === INITIAL_REQUEST_EMPTY_STATUS) {
        return await fetchEvents();
      }
    }
  }
};

export const fetchAcknowledgeEvents = async eventIds => {
  const res = await apiCriptextRequest({
    endpoint: '/event/ack',
    method: 'POST',
    params: { ids: eventIds }
  });
  return res.status === 200
    ? { status: 200 }
    : await checkExpiredSession({
        response: { status: res.status },
        initialRequest: fetchAcknowledgeEvents,
        requestParams: eventIds
      });
};
