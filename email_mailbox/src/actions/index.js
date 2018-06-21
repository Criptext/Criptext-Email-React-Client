import { addContacts, addContact } from './contacts';
import { addFiles, loadFiles } from './files';
import {
  addMoveThreadsLabel,
  addThreads,
  addThreadLabel,
  addThreadsLabel,
  filterThreadsByUnread,
  loadEvents,
  loadThreads,
  moveThreads,
  selectThread,
  removeThread,
  removeThreadLabel,
  deselectThreads,
  updateUnreadThread,
  updateUnreadThreads,
  searchThreads,
  selectThreads,
  removeThreads,
  removeThreadsLabel,
  sendOpenEvent
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
  addFiles,
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
  loadFiles,
  loadLabels,
  loadSuggestions,
  loadThreads,
  markEmailUnread,
  markFeedAsSelected,
  moveThreads,
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
  sendOpenEvent,
  setThreads,
  toggleMuteFeed,
  updateLabel,
  updateLabelSuccess,
  updateUnreadEmails,
  updateUnreadThread,
  updateUnreadThreads
};
