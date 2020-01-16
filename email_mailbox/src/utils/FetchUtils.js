import { apiCriptextRequest } from './ApiUtils';
import { checkExpiredSession } from './ipc';
import signal from './../libs/signal';

const STATUS_OK = 200;
const PENDING_EVENTS_STATUS_MORE = 201;
const NO_EVENTS_STATUS = 204;
const EVENTS_BATCH = 25;
const NOT_FOUND = 404;

export const fetchEmailBody = async ({ bodyKey, optionalToken }) => {
  const res = await apiCriptextRequest({
    endpoint: '/email/body/' + bodyKey,
    method: 'GET',
    optionalToken
  });
  switch (res.status) {
    case STATUS_OK: {
      const jsonRes = await res.json();
      return { status: STATUS_OK, body: jsonRes };
    }
    case NOT_FOUND: {
      throw new Error(signal.CONTENT_NOT_AVAILABLE);
    }
    default: {
      return await checkExpiredSession({
        response: { status: res.status },
        initialRequest: fetchEmailBody,
        requestParams: { bodyKey, optionalToken }
      });
    }
  }
};

export const fetchEventAction = async ({ cmd, action, optionalToken }) => {
  const res = await apiCriptextRequest({
    endpoint: `/event/${cmd}/${action}`,
    method: 'GET',
    optionalToken
  });
  if (res.status === STATUS_OK) {
    const jsonRes = await res.json();
    return { status: STATUS_OK, body: jsonRes };
  }
  return await checkExpiredSession({
    response: { status: res.status },
    initialRequest: fetchEventAction,
    requestParams: { cmd, action, optionalToken }
  });
};

/* eslint no-empty: ["error", { "allowEmptyCatch": true }] */
const formEvents = events => {
  const eventsParsed = [];
  events.forEach(event => {
    try {
      const data = {
        cmd: event.cmd,
        params: JSON.parse(event.params),
        rowid: event.rowid
      };
      eventsParsed.push(data);
    } catch (e) {}
  });
  return eventsParsed;
};

export const fetchEvents = async optionalToken => {
  const res = await apiCriptextRequest({
    endpoint: '/event',
    querystring: `?count=${EVENTS_BATCH}`,
    method: 'GET',
    optionalToken
  });
  switch (res.status) {
    case STATUS_OK: {
      const jsonRes = await res.json();
      return { status: STATUS_OK, body: { events: formEvents(jsonRes) } };
    }
    case PENDING_EVENTS_STATUS_MORE: {
      const jsonRes = await res.json();
      return {
        status: STATUS_OK,
        body: { events: formEvents(jsonRes), hasMoreEvents: true }
      };
    }
    case NO_EVENTS_STATUS:
      return { status: STATUS_OK, body: { events: [] } };
    default: {
      return await checkExpiredSession({
        response: { status: res.status },
        initialRequest: fetchEvents,
        requestParams: optionalToken
      });
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
  if (res.status === STATUS_OK) {
    return { status: STATUS_OK };
  }
  return await checkExpiredSession({
    response: { status: res.status },
    initialRequest: fetchAcknowledgeEvents,
    requestParams: { eventIds, optionalToken }
  });
};

export const fetchGetSingleEvent = async ({ rowId, optionalToken }) => {
  const res = await apiCriptextRequest({
    endpoint: '/event/' + String(rowId),
    method: 'GET',
    optionalToken
  });
  switch (res.status) {
    case STATUS_OK: {
      const { cmd, rowid, params } = await res.json();
      const eventResponse = {
        cmd,
        rowid,
        params: JSON.parse(params)
      };
      return { status: STATUS_OK, body: eventResponse };
    }
    case NO_EVENTS_STATUS:
    case NOT_FOUND:
      return { status: res.status };
    default: {
      return await checkExpiredSession({
        response: { status: res.status },
        initialRequest: fetchGetSingleEvent,
        requestParams: { rowId, optionalToken }
      });
    }
  }
};
