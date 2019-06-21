import { FeedItem } from './types';
import {
  deleteFeedItemById,
  updateFeedItems as updateFeedItemsDB
} from './../utils/ipc';
import { defineFeedItems } from '../utils/FeedItemUtils';

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

export const updateFeedItemSuccess = ({ id, seen }) => {
  return {
    type: FeedItem.UPDATE,
    feed: { id, seen }
  };
};

export const updateFeedItems = ({ ids, seen }) => {
  return async dispatch => {
    try {
      await updateFeedItemsDB({ ids, seen });
      dispatch(updateFeedItemsSuccess({ ids, seen }));
    } catch (e) {
      // TO DO
    }
  };
};

export const updateFeedItemsSuccess = ({ ids, seen }) => {
  return {
    type: FeedItem.UPDATE_FEED_ITEMS,
    feed: { ids, seen }
  };
};

export const loadFeedItems = clear => {
  return async dispatch => {
    try {
      const feedItems = await defineFeedItems();
      dispatch(addFeedItems(feedItems, clear));
    } catch (e) {
      // TO DO
    }
  };
};

export const updateFeedItem = ({ id, seen }) => {
  return async dispatch => {
    try {
      await updateFeedItemsDB({ ids: [id], seen });
      dispatch(updateFeedItemSuccess({ id, seen }));
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
