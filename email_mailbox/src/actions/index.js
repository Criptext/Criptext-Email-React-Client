import { addContacts, addContact } from './contacts';
import {
  addThreads,
  addThreadLabel,
  addThreadsLabel,
  closeThread,
  filterThreadsByUnread,
  loadEvents,
  loadThreads,
  markThreadsRead,
  moveThreads,
  multiSelectThread,
  selectThread,
  removeThread,
  removeThreadLabel,
  deselectThreads,
  searchThreads,
  selectThreads,
  removeThreads,
  removeThreadsLabel
} from './threads';
import {
  addEmails,
  loadEmails,
  muteEmailById,
  muteNotifications
} from './emails';
import {
  addLabels,
  addLabel,
  loadLabels,
  updateLabel,
  updateLabelSuccess
} from './labels';
import {
  addFeeds,
  loadFeeds,
  markFeedAsSelected,
  removeFeed,
  removeFeedById,
  selectFeed,
  toggleMuteFeed
} from './feeds';
import { setThreads, loadSuggestions } from './suggestions';

export {
  addContact,
  addContacts,
  addEmails,
  addFeeds,
  addLabel,
  addLabels,
  addThreads,
  addThreadLabel,
  addThreadsLabel,
  closeThread,
  deselectThreads,
  filterThreadsByUnread,
  loadEmails,
  loadEvents,
  loadFeeds,
  loadLabels,
  loadSuggestions,
  loadThreads,
  markFeedAsSelected,
  markThreadsRead,
  moveThreads,
  multiSelectThread,
  muteEmailById,
  muteNotifications,
  removeThread,
  removeThreadLabel,
  removeFeed,
  removeFeedById,
  removeThreads,
  removeThreadsLabel,
  selectThread,
  selectThreads,
  selectFeed,
  searchThreads,
  setThreads,
  toggleMuteFeed,
  updateLabel,
  updateLabelSuccess
};
