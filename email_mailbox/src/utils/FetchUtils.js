import { apiCriptextRequest } from './ApiUtils';
import { checkExpiredSession } from './ipc';
import signal from './../libs/signal';

const STATUS_OK = 200;
const PENDING_EVENTS_STATUS_MORE = 201;
const NO_EVENTS_STATUS = 204;
const EVENTS_BATCH = 25;
const NOT_FOUND = 404;
const EXPIRED_SESSION = 401;

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
    case EXPIRED_SESSION: {
      return await checkExpiredSession({
        response: { status: res.status },
        initialRequest: fetchEmailBody,
        requestParams: { bodyKey, optionalToken }
      });
    }
    default: {
      throw new Error(signal.CONTENT_NOT_AVAILABLE);
    }
  }
};

export const fetchEventAction = async ({ cmd, action, optionalToken }) => {
  const res = await apiCriptextRequest({
    endpoint: `/event/${cmd}/${action}`,
    method: 'GET',
    optionalToken
  });
  switch (res.status) {
    case STATUS_OK: {
      const jsonRes = await res.json();
      return { status: STATUS_OK, body: jsonRes };
    }
    case EXPIRED_SESSION: {
      return await checkExpiredSession({
        response: { status: res.status },
        initialRequest: fetchEventAction,
        requestParams: { cmd, action, optionalToken }
      });
    }
    default: {
      return { status: res.status };
    }
  }
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
    case EXPIRED_SESSION: {
      return await checkExpiredSession({
        response: { status: res.status },
        initialRequest: fetchEvents,
        requestParams: optionalToken
      });
    }
    default: {
      return { status: res.status };
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
  switch (res.status) {
    case STATUS_OK: {
      return { status: STATUS_OK };
    }
    case EXPIRED_SESSION: {
      return await checkExpiredSession({
        response: { status: res.status },
        initialRequest: fetchAcknowledgeEvents,
        requestParams: { eventIds, optionalToken }
      });
    }
    default: {
      return { status: res.status };
    }
  }
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
    case EXPIRED_SESSION: {
      return await checkExpiredSession({
        response: { status: res.status },
        initialRequest: fetchGetSingleEvent,
        requestParams: { rowId, optionalToken }
      });
    }
    default: {
      return { status: res.status };
    }
  }
};
