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

const countUnreadFeeds = feeds => {
  return feeds.filter(item => item.get('unread') === true).size;
};

const getBadgeClass = unreadFeeds => {
  switch (true) {
    case unreadFeeds > 0 && unreadFeeds < 10:
      return 'badge small-badge';
    case unreadFeeds > 9 && unreadFeeds < 100:
      return 'badge medium-badge';
    case unreadFeeds > 99:
      return 'badge large-badge';
    default:
      return '';
  }
};

const getBadgeData = unreadFeeds => {
  switch (true) {
    case unreadFeeds > 0 && unreadFeeds < 10:
      return String(unreadFeeds);
    case unreadFeeds > 9 && unreadFeeds < 100:
      return String(unreadFeeds);
    case unreadFeeds > 99:
      return '+99';
    default:
      return '';
  }
};

const clasifyFeeds = feeds => {
  const newsFiltered = feeds.filter(item => item.get('state') === 'new');
  const oldsFiltered = feeds.filter(item => item.get('state') === 'older');
  return { newsFiltered, oldsFiltered };
};

const mapStateToProps = state => {
  const orderedFeeds = orderFeedsByDate(state.get('feeds'));
  const feeds = orderedFeeds.map(feed => {
    return setFeedTime(feed, 'time');
  });
  const { newsFiltered, oldsFiltered } = clasifyFeeds(feeds);
  const unreadFeeds = countUnreadFeeds(feeds);
  return {
    newFeeds: newsFiltered,
    oldFeeds: oldsFiltered,
    unreadFeeds: unreadFeeds,
    badgeClass: getBadgeClass(unreadFeeds),
    badgeData: getBadgeData(unreadFeeds)
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onLoadFeeds: () => {
      dispatch(actions.loadFeeds());
    },
    onSelectFeed: feedPos => {
      dispatch(actions.selectFeed(feedPos));
    },
    removeFeed: feedId => {
      dispatch(actions.removeFeed(feedId));
    }
  };
};

const ActivityPanel = connect(mapStateToProps, mapDispatchToProps)(
  ActivityPanelView
);

export default ActivityPanel;
