import { connect } from 'react-redux';
import { loadFeeds } from './../actions/index';
import ActivityPanelView from './../components/ActivityPanel';
import * as TimeUtils from './../utils/TimeUtils';
import { FeedItemType } from './../utils/const';

const orderFeedsByDate = feeds => {
  return feeds.sortBy(feed => feed.get('date')).reverse();
};

const setFeedTime = (feed, field) => {
  return feed.set(field, TimeUtils.defineTimeByToday(feed.get(field)));
};

const isNew = date => {
  return date === 'Today' || date.indexOf(':') > -1;
};

const clasifyFeeds = feeds => {
  const newFeeds = feeds.filter(item => isNew(item.get('date')));
  const oldFeeds = feeds.filter(item => !isNew(item.get('date')));
  return { newFeeds, oldFeeds };
};

const defineFeedAction = feed => {
  switch (feed.get('type')) {
    case FeedItemType.DOWNLOADED.value:
      return feed.set('action', 'downloaded');
    default:
      return feed.set('action', 'opened');
  }
};

const populateFeeds = feeds => {
  return feeds.map(feed => {
    feed = feed.set('isMuted', feed.get('emailData').get('isMuted'));
    feed = setFeedTime(feed, 'date');
    return defineFeedAction(feed);
  });
};

const mapStateToProps = state => {
  const feeds = state.get('feeds');
  const orderedFeeds = orderFeedsByDate(feeds);
  const populated = populateFeeds(orderedFeeds);
  const { newFeeds, oldFeeds } = clasifyFeeds(populated);
  return {
    newFeeds: newFeeds.toJS(),
    oldFeeds: oldFeeds.toJS()
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onLoadFeeds: () => {
      dispatch(loadFeeds());
    }
  };
};

const ActivityPanel = connect(mapStateToProps, mapDispatchToProps)(
  ActivityPanelView
);

export default ActivityPanel;
