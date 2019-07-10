import { connect } from 'react-redux';
import { loadFeedItems } from './../actions/index';
import ActivityPanelView from './../components/ActivityPanel';

const orderFeedsByDate = feeds => {
  return feeds.sortBy(feed => feed.get('date')).reverse();
};

const clasifyFeeds = feeds => {
  const newFeeds = feeds.filter(feed => !feed.get('seen'));
  const oldFeeds = feeds.filter(feed => feed.get('seen'));
  return { newFeeds, oldFeeds };
};

const mapStateToProps = state => {
  const feedItems = state.get('feeditems');
  const feeds = feedItems.get('list').toList();
  const orderedFeeds = orderFeedsByDate(feeds);
  const { newFeeds, oldFeeds } = clasifyFeeds(orderedFeeds);
  const newFeedsPlain = newFeeds.toJS();
  const feedItemIds = newFeedsPlain.map(feedItem => feedItem.id);
  return {
    newFeeds: newFeedsPlain,
    oldFeeds: oldFeeds.toJS(),
    feedItemIds
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onLoadFeeds: () => {
      dispatch(loadFeedItems());
    }
  };
};

const ActivityPanel = connect(
  mapStateToProps,
  mapDispatchToProps
)(ActivityPanelView);

export default ActivityPanel;
