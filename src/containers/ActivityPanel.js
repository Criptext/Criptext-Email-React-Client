import { connect } from 'react-redux';
import * as actions from '../actions/index';
import ActivityPanelView from '../components/ActivityPanel';
import * as TimeUtils from '../utils/TimeUtils';

const setFeedTime = (feed, field) => {
  return feed.set(field, TimeUtils.defineTimeByToday(feed.get(field)));
};

const clasifyFeeds = feeds => {
  const newsFiltered = feeds.filter(item => item.get('state') === 'new');
  const oldsFiltered = feeds.filter(item => item.get('state') === 'older');
  return {
    newFeeds: newsFiltered,
    oldFeeds: oldsFiltered
  };
};

const mapStateToProps = (state, ownProps) => {
  const feeds = state.get('feeds').map(feed => {
    return setFeedTime(feed, 'time');
  });
  return clasifyFeeds(feeds);
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onLoadFeeds: () => dispatch(actions.loadFeeds())
  };
};

const ActivityPanel = connect(mapStateToProps, mapDispatchToProps)(
  ActivityPanelView
);

export default ActivityPanel;
