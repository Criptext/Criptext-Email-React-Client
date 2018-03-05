import { connect } from 'react-redux';
import * as actions from '../actions/index';
import ActivityPanelView from '../components/ActivityPanel';
import * as TimeUtils from '../utils/TimeUtils';

const orderFeedsByDate = feeds => {
  return feeds.sortBy(feed => feed.get('time')).reverse();
};

const setFeedTime = (feed, field) => {
  return feed.set(field, TimeUtils.defineTimeByToday(feed.get(field)));
};

const clasifyFeeds = feeds => {
  const newsFiltered = feeds.filter(item => item.get('time') === 'Today');
  const oldsFiltered = feeds.filter(item => item.get('time') !== 'Today');
  return { newsFiltered, oldsFiltered };
};

const populateFeeds = (state, feeds) => {
  const emails = state.get('emails');
  return feeds.map(feed => {
    const emailFeed = emails.get(feed.get('emailId'));
    if (emailFeed !== undefined) {
      feed = feed.set('emailFeed', emailFeed);
      feed = feed.set('isMuted', emailFeed.get('isMuted'));
    }
    return feed;
  });
};

const mapStateToProps = state => {
  const orderedFeeds = orderFeedsByDate(state.get('feeds'));
  const populated = populateFeeds(state, orderedFeeds);
  const feeds = populated.map(feed => {
    return setFeedTime(feed, 'time');
  });
  const { newsFiltered, oldsFiltered } = clasifyFeeds(feeds);
  return {
    newFeeds: newsFiltered,
    oldFeeds: oldsFiltered
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onLoadFeeds: () => {
      dispatch(actions.loadFeeds());
    }
  };
};

const ActivityPanel = connect(mapStateToProps, mapDispatchToProps)(
  ActivityPanelView
);

export default ActivityPanel;
