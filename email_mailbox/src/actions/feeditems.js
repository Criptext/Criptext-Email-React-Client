import { FeedItem } from './types';
import {
  getAllFeedItems,
  getEmailsByIds,
  updateFeedItem
} from './../utils/electronInterface';
import { deleteFeedItemById } from './../utils/ipc';
import { getSeenTimestamp } from '../utils/storage';

export const addFeedItems = (feeds, clear) => {
  return {
    type: FeedItem.ADD_BATCH,
    feeds,
    clear
  };
};

export const removeFeedItemSuccess = feedItemId => {
  return {
    type: FeedItem.REMOVE_SUCCESS,
    feed: { id: feedItemId }
  };
};

export const updateFeedItemSuccess = ({ feedItemId, seen }) => {
  return {
    type: FeedItem.UPDATE_SUCCESS,
    feed: { id: feedItemId, seen }
  };
};

export const updateAllFeedItemsAsOlder = () => {
  return {
    type: FeedItem.UPDATE_ALL,
    field: 'isNew',
    value: false
  };
};

export const loadFeedItems = clear => {
  return async dispatch => {
    try {
      const allFeeds = await getAllFeedItems();
      const feeds = await Promise.all(
        allFeeds.map(async feed => {
          const [emailData] = await getEmailsByIds([feed.emailId]);
          const lastTimestamp = new Date(getSeenTimestamp());
          const feedDate = new Date(feed.date);
          const isNew = feedDate.getTime() > lastTimestamp.getTime();
          return { ...feed, emailData, isNew };
        })
      );
      const feedsToState = feeds.reduce((result, feedItem) => {
        result[feedItem.id] = feedItem;
        return result;
      }, {});
      dispatch(addFeedItems(feedsToState, clear));
    } catch (e) {
      // TO DO
    }
  };
};

export const selectFeedItem = feedItemId => {
  return async dispatch => {
    try {
      const seen = true;
      await updateFeedItem({ feedItemId, seen });
      dispatch(updateFeedItemSuccess({ feedItemId, seen }));
    } catch (e) {
      // TO DO
    }
  };
};

export const removeFeedItem = feedItemId => {
  return async dispatch => {
    try {
      await deleteFeedItemById(feedItemId);
      dispatch(removeFeedItemSuccess(feedItemId));
    } catch (e) {
      // TO DO
    }
  };
};
