import { addContacts, addContact } from './contacts';
import {
  addMoveThreadsLabel,
  addThreads,
  addThreadLabel,
  addThreadsLabel,
  filterThreadsByUnread,
  loadEvents,
  loadThreads,
  moveThreads,
  multiSelectThread,
  selectThread,
  removeThread,
  removeThreadLabel,
  deselectThreads,
  updateUnreadThread,
  updateUnreadThreads,
  searchThreads,
  selectThreads,
  removeThreads,
  removeThreadsLabel
} from './threads';
import {
  addEmails,
  loadEmails,
  markEmailUnread,
  muteEmail,
  muteNotifications,
  updateUnreadEmails
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
  addMoveThreadsLabel,
  addThreads,
  addThreadLabel,
  addThreadsLabel,
  deselectThreads,
  filterThreadsByUnread,
  loadEmails,
  loadEvents,
  loadFeeds,
  loadLabels,
  loadSuggestions,
  loadThreads,
  markEmailUnread,
  markFeedAsSelected,
  moveThreads,
  multiSelectThread,
  muteEmail,
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
  updateLabelSuccess,
  updateUnreadEmails,
  updateUnreadThread,
  updateUnreadThreads
};
