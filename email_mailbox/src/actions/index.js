import { addUsers, addUser } from './users';
import {
  addThreads,
  addThreadLabel,
  addThreadsLabel,
  closeThread,
  filterThreadsByUnread,
  loadThreads,
  markThreadsRead,
  moveThreads,
  multiSelectThread,
  muteNotifications,
  selectThread,
  removeThread,
  removeThreadLabel,
  deselectThreads,
  searchThreads,
  selectThreads,
  removeThreads,
  removeThreadsLabel
} from './threads';
import { addEmails, loadEmails } from './emails';
import {
  addLabels,
  addLabel,
  loadLabels,
  modifyLabel,
  updateLabel
} from './labels';
import {
  addFeeds,
  loadFeeds,
  removeFeed,
  selectFeed,
  toggleMuteFeed
} from './feeds';
import { setThreads, loadSuggestions } from './suggestions';

export {
  addEmails,
  addFeeds,
  addLabel,
  addLabels,
  addThreads,
  addThreadLabel,
  addThreadsLabel,
  addUser,
  addUsers,
  closeThread,
  filterThreadsByUnread,
  loadEmails,
  loadFeeds,
  loadLabels,
  loadSuggestions,
  loadThreads,
  markThreadsRead,
  modifyLabel,
  moveThreads,
  multiSelectThread,
  muteNotifications,
  removeThread,
  removeThreadLabel,
  deselectThreads,
  searchThreads,
  selectThreads,
  removeFeed,
  removeThreads,
  removeThreadsLabel,
  selectThread,
  selectFeed,
  setThreads,
  toggleMuteFeed,
  updateLabel
};
