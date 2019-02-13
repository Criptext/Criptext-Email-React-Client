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
    case App.ADD_DATA: {
      const { activity, contact, feeditem, label, thread } = action;
      const activitiesState = state.get('activities');
      const contactsState = state.get('contacts');
      const feeditemsState = state.get('feeditems');
      const labelsState = state.get('labels');
      const threadsState = state.get('threads');
      return state.merge({
        activities: activity
          ? activities(activitiesState, activity)
          : activitiesState,
        contacts: contact ? contacts(contactsState, contact) : contactsState,
        feeditems: feeditem
          ? feeditems(feeditemsState, feeditem)
          : feeditemsState,
        labels: label ? labels(labelsState, label) : labelsState,
        threads: thread ? threads(threadsState, thread) : threadsState
      });
    }
    default:
      return state;
  }
};
