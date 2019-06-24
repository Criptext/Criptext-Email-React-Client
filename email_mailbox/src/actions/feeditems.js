import { FeedItem } from './types';
import {
  deleteFeedItemById,
  getFeedItemsCounterBySeen,
  updateFeedItems as updateFeedItemsDB
} from './../utils/ipc';
import { defineFeedItems } from '../utils/FeedItemUtils';

export const addFeedItems = (feeds, badge, clear) => {
  return {
    type: FeedItem.ADD_BATCH,
    badge,
    feeds,
    clear
  };
};

export const loadFeedItems = clear => {
  return async dispatch => {
    try {
      const { feedItems, badge } = await defineFeedItems();
      dispatch(addFeedItems(feedItems, badge, clear));
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

export const removeFeedItemSuccess = feedItemId => {
  return {
    type: FeedItem.REMOVE_SUCCESS,
    feed: { id: feedItemId }
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
      const badge = await getFeedItemsCounterBySeen(0);
      dispatch(updateFeedItemsSuccess({ ids, seen, badge: badge[0].count }));
    } catch (e) {
      // TO DO
    }
  };
};

export const updateFeedItemsSuccess = ({ ids, seen, badge }) => {
  return {
    type: FeedItem.UPDATE_FEED_ITEMS,
    badge,
    feed: { ids, seen }
  };
};
