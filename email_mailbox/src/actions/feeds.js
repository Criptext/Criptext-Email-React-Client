import { Feed } from './types';
import { getAllFeeds, getEmailById } from './../utils/electronInterface';
import { addEmails } from './emails';

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
      for (const feed of feeds) {
        const response = await getEmailById(feed.emailId);
        const email = response[0];
        const emailToState = {
          [email.id]: email
        };
        dispatch(addEmails(emailToState));
      }
      dispatch(addFeeds(feeds));
    } catch (e) {
      // TO DO
    }
  };
};
