import { Map } from 'immutable';
import activities from './activity';
import contacts from './contacts';
import labels from './labels';
import feeditems from './feeditems';
import threads from './threads';
import { App } from './../actions/types';

export const crossReducer = (state = new Map(), action) => {
  console.log('crossReducer', action.type);
  switch (action.type) {
    case App.ADD_INIT_DATA: {
      return state.merge({
        activities: activities(state.get('activities'), action.activity),
        contacts: contacts(state.get('contacts'), action.contact),
        feeditems: feeditems(state.get('feeditems'), action.feeditem),
        labels: labels(state.get('labels'), action.label),
        threads: threads(state.get('threads'), action.thread)
      });
    }
    default:
      return state;
  }
};
