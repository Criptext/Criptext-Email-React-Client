import { apiCriptextRequest } from './ApiUtils';
import { checkExpiredSession } from './ipc';
import signal from './../libs/signal';

const PENDING_EVENTS_STATUS_OK = 200;
const PENDING_EVENTS_STATUS_MORE = 201;
const NO_EVENTS_STATUS = 204;
const INITIAL_REQUEST_EMPTY_STATUS = 499;
const EVENTS_BATCH = 25;
const BODY_NOT_FOUND = 404;

export const fetchEmailBody = async ({ bodyKey, optionalToken }) => {
  const res = await apiCriptextRequest({
    endpoint: '/email/body/' + bodyKey,
    method: 'GET',
    optionalToken
  });
  if (res.status === 200) {
    const jsonRes = await res.json();
    return { status: 200, body: jsonRes };
  }
  const expiredResponse = await checkExpiredSession({
    response: { status: res.status },
    initialRequest: fetchEmailBody,
    requestParams: { bodyKey, optionalToken }
  });
  if (expiredResponse.status === INITIAL_REQUEST_EMPTY_STATUS) {
    let newSessionToken = null;
    if (expiredResponse.newSessionToken) {
      newSessionToken = expiredResponse.newSessionToken;
    }
    return await fetchEmailBody({ bodyKey, optionalToken: newSessionToken });
  }
  if (expiredResponse.status === BODY_NOT_FOUND)
    throw new Error(signal.CONTENT_NOT_AVAILABLE);
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
    let newSessionToken = null;
    if (expiredResponse.newSessionToken) {
      newSessionToken = expiredResponse.newSessionToken;
    }
    return await fetchEventAction({
      cmd,
      action,
      optionalToken: newSessionToken
    });
  }
};

const formEvents = events =>
  events.map(event => ({
    cmd: event.cmd,
    params: JSON.parse(event.params),
    rowid: event.rowid
  }));

export const fetchEvents = async optionalToken => {
  const res = await apiCriptextRequest({
    endpoint: '/event',
    querystring: `?count=${EVENTS_BATCH}`,
    method: 'GET',
    optionalToken
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
        requestParams: optionalToken
      });
      if (expiredResponse.status === INITIAL_REQUEST_EMPTY_STATUS) {
        let newSessionToken = null;
        if (expiredResponse.newSessionToken) {
          newSessionToken = expiredResponse.newSessionToken;
        }
        return await fetchEvents(newSessionToken);
      }
    }
  }
};

export const fetchAcknowledgeEvents = async ({ eventIds, optionalToken }) => {
  const res = await apiCriptextRequest({
    endpoint: '/event/ack',
    method: 'POST',
    params: { ids: eventIds },
    optionalToken
  });
  if (res.status === 200) {
    return { status: 200 };
  }
  const expiredResponse = await checkExpiredSession({
    response: { status: res.status },
    initialRequest: fetchAcknowledgeEvents,
    requestParams: { eventIds, optionalToken }
  });
  if (expiredResponse.status === INITIAL_REQUEST_EMPTY_STATUS) {
    let newSessionToken = null;
    if (expiredResponse.newSessionToken) {
      newSessionToken = expiredResponse.newSessionToken;
    }
    return await fetchAcknowledgeEvents({
      eventIds,
      optionalToken: newSessionToken
    });
  }
};

export const fetchGetSingleEvent = async ({ rowId, optionalToken }) => {
  const res = await apiCriptextRequest({
    endpoint: '/event/' + String(rowId),
    method: 'GET',
    optionalToken
  });
  switch (res.status) {
    case PENDING_EVENTS_STATUS_OK: {
      const jsonRes = await res.json();
      const eventResponse = {
        cmd: jsonRes.cmd,
        rowid: jsonRes.rowid,
        params: JSON.parse(jsonRes.params)
      };
      return eventResponse;
    }
    case NO_EVENTS_STATUS:
    case 404:
      return undefined;
    default: {
      const expiredResponse = await checkExpiredSession({
        response: { status: res.status },
        initialRequest: fetchGetSingleEvent,
        requestParams: { rowId, optionalToken }
      });
      if (expiredResponse.status === INITIAL_REQUEST_EMPTY_STATUS) {
        return await fetchGetSingleEvent({ rowId, optionalToken });
      }
    }
  }
};
