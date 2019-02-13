import { Map } from 'immutable';
import activities from './activity';
import contacts from './contacts';
import labels from './labels';
import feeditems from './feeditems';
import threads from './threads';
import {
  Activity,
  App,
  Contact,
  FeedItem,
  Label,
  Thread
} from './../actions/types';

export const crossReducer = (state = new Map(), action) => {
  switch (action.type) {
    case App.ADD_INIT_DATA: {
      const actionActivities = {
        type: Activity.STOP_LOAD_THREAD
      };
      const actionContacts = {
        type: Contact.ADD_BATCH,
        contacts: action.contacts
      };
      const actionFeedItems = {
        type: FeedItem.ADD_BATCH,
        feeds: action.feeditems,
        clear: action.clear
      };
      const actionLabels = {
        type: Label.ADD_BATCH,
        labels: action.labels
      };
      const actionThreads = {
        type: Thread.ADD_BATCH,
        threads: action.threads,
        clear: action.clear
      };
      return state.merge({
        activities: activities(state.get('activities'), actionActivities),
        contacts: contacts(state.get('contacts'), actionContacts),
        feeditems: feeditems(state.get('feeditems'), actionFeedItems),
        labels: labels(state.get('labels'), actionLabels),
        threads: threads(state.get('threads'), actionThreads)
      });
    }
    default:
      return state;
  }
};
