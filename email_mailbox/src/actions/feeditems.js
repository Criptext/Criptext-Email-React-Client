import { FeedItem } from './types';
import { deleteFeedItemById, updateFeedItem } from './../utils/ipc';
import { assembleFeedItems } from '../utils/FeedItemUtils';

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
      const feedItems = await assembleFeedItems();
      dispatch(addFeedItems(feedItems, clear));
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
