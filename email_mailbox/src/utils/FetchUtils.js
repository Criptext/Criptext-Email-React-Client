import { apiCriptextRequest } from './ApiUtils';
import { checkExpiredSession } from './ipc';

const PENDING_EVENTS_STATUS_OK = 200;
const PENDING_EVENTS_STATUS_MORE = 201;
const NO_EVENTS_STATUS = 204;
const INITIAL_REQUEST_EMPTY_STATUS = 499;
const EVENTS_BATCH = 25;

export const fetchEmailBody = async bodyKey => {
  const res = await apiCriptextRequest({
    endpoint: '/email/body/' + bodyKey,
    method: 'GET'
  });
  if (res.status === 200) {
    const jsonRes = await res.json();
    return { status: 200, body: jsonRes };
  }
  const expiredResponse = await checkExpiredSession({
    response: { status: res.status },
    initialRequest: fetchEmailBody,
    requestParams: bodyKey
  });
  if (expiredResponse.status === INITIAL_REQUEST_EMPTY_STATUS) {
    return await fetchEmailBody(bodyKey);
  }
};

export const fetchEventAction = async ({ cmd, action, optionalToken }) => {
  const res = await apiCriptextRequest({
    endpoint: `/event/${cmd}/${action}`,
    method: 'GET',
    optionalToken
  });
  if (res.status === 200) {
    const jsonRes = await res.json();
    return jsonRes;
  }
  const expiredResponse = await checkExpiredSession({
    response: { status: res.status },
    initialRequest: fetchEventAction,
    requestParams: { cmd, action, optionalToken }
  });
  if (expiredResponse.status === INITIAL_REQUEST_EMPTY_STATUS) {
    let sessionToken = null;
    if (expiredResponse.newSessionToken) {
      sessionToken = expiredResponse.newSessionToken;
    }
    return await fetchEventAction({ cmd, action, optionalToken: sessionToken });
  }
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
    querystring: `?count=${EVENTS_BATCH}`,
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
  if (res.status === 200) {
    return { status: 200 };
  }
  const expiredResponse = await checkExpiredSession({
    response: { status: res.status },
    initialRequest: fetchAcknowledgeEvents,
    requestParams: eventIds
  });
  if (expiredResponse.status === INITIAL_REQUEST_EMPTY_STATUS) {
    return await fetchAcknowledgeEvents(eventIds);
  }
};
