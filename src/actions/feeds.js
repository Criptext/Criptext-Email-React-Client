import * as Types from './types';

export const addFeeds = feeds => {
  return {
    type: Types.Feed.ADD_BATCH,
    feeds: feeds
  };
};

export const loadFeeds = () => {
  return dispatch => {
    return fetch('/feeds.json')
      .then(response => {
        if (response.status === 200) {
          return response.json();
        }
        return Promise.reject(response.status);
      })
      .then(json => {
        dispatch(addFeeds(json.feeds));
      })
      .catch(err => {
        console.log(err);
      });
  };
};