import { Feed } from './types';
import {
  deleteFeedItemById,
  getAllFeedItems,
  getEmailById,
  markFeedItemAsReadById,
  getContactByIds
} from './../utils/electronInterface';

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
      const allFeeds = await getAllFeedItems();
      const feedsToState = await Promise.all(
        allFeeds.map(async feed => {
          const [emailData] = await getEmailById(feed.emailId);
          const [contactData] = await getContactByIds([feed.contactId]);
          return { ...feed, emailData, contactData };
        })
      );
      dispatch(addFeeds(feedsToState));
    } catch (e) {
      // TO DO
    }
  };
};

export const markFeedAsSelected = feedId => {
  return async dispatch => {
    try {
      await markFeedItemAsReadById(feedId);
      dispatch(selectFeed(feedId));
    } catch (e) {
      // TO DO
    }
  };
};

export const removeFeedById = feedId => {
  return async dispatch => {
    try {
      await deleteFeedItemById(feedId);
      dispatch(removeFeed(feedId));
    } catch (e) {
      // TO DO
    }
  };
};
