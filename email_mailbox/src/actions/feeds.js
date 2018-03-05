import { Feed } from './types';
import {
  deleteFeedById,
  getAllFeeds,
  getEmailById,
  getUserByUsername,
  markFeedAsReadById
} from './../utils/electronInterface';
import { addEmails } from './emails';
import { addUsers } from './users';

export const addFeeds = feeds => {
  return {
    type: Feed.ADD_BATCH,
    feeds: feeds
  };
};

export const removeFeed = feedId => {
  return {
    type: Feed.REMOVE,
    targetFeed: feedId
  };
};

export const selectFeed = feedId => {
  return {
    type: Feed.SELECT,
    selectedFeed: feedId
  };
};

export const loadFeeds = () => {
  return async dispatch => {
    try {
      const feeds = await getAllFeeds();
      const emailsToState = {};
      const usersToState = {};
      for (const feed of feeds) {
        const emailResponse = await getEmailById(feed.emailId);
        const userResponse = await getUserByUsername(feed.username);
        const email = emailResponse[0];
        const user = userResponse[0];
        emailsToState[email.id] = email;
        usersToState[user.username] = user;
      }
      dispatch(addEmails(emailsToState));
      dispatch(addUsers(usersToState));
      dispatch(addFeeds(feeds));
    } catch (e) {
      // TO DO
    }
  };
};

export const markFeedAsSelected = feedId => {
  return async dispatch => {
    try {
      await markFeedAsReadById(feedId);
      dispatch(selectFeed(feedId));
    } catch (e) {
      // TO DO
    }
  };
};

export const removeFeedById = feedId => {
  return async dispatch => {
    try {
      await deleteFeedById(feedId);
      dispatch(removeFeed(feedId));
    } catch (e) {
      // TO DO
    }
  };
};
