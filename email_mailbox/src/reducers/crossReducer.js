import { Map } from 'immutable';
import accounts from './accounts';
import activities from './activity';
import contacts from './contacts';
import emails from './emails';
import files from './files';
import feeditems from './feeditems';
import labels from './labels';
import threads from './threads';
import { App } from './../actions/types';

export const crossReducer = (state = new Map(), action) => {
  switch (action.type) {
    case App.ADD_DATA: {
      const {
        account,
        activity,
        contact,
        email,
        file,
        feeditem,
        label,
        thread
      } = action;
      const accountsState = state.get('accounts');
      const activitiesState = state.get('activities');
      const contactsState = state.get('contacts');
      const emailsState = state.get('emails');
      const filesState = state.get('files');
      const feeditemsState = state.get('feeditems');
      const labelsState = state.get('labels');
      const threadsState = state.get('threads');
      return state.merge({
        accounts: account ? accounts(accountsState, account) : accountsState,
        activities: activity
          ? activities(activitiesState, activity)
          : activitiesState,
        contacts: contact ? contacts(contactsState, contact) : contactsState,
        emails: email ? emails(emailsState, email) : emailsState,
        files: file ? files(filesState, file) : filesState,
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
