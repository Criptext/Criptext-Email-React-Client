import { connect } from 'react-redux';
import { loadFeeds } from '../actions/index';
import ActivityPanelView from '../components/ActivityPanel';
import * as TimeUtils from '../utils/TimeUtils';


const clasifyFeeds = (feeds) => {
  const newFeeds = [], oldFeeds = [];
  let myfeeds = feeds.map(feed => {
    return feed.set("feedtime", TimeUtils.defineTimeByToday(feed.get('time')));
  });
  myfeeds.map(feed => {
    feed.get("state") === "new" ? newFeeds.push(feed) : oldFeeds.push(feed);
  })
  return {
    newFeeds: newFeeds,
    oldFeeds: oldFeeds
  }
}

const mapStateToProps = (state, ownProps) => {
  return clasifyFeeds(state.get('feeds'));
};

const mapDispatchToProps = dispatch => {
  return {
    onLoadFeeds: () => {
      dispatch(loadFeeds(dispatch));
    }
  };
};


const ActivityPanel = connect(mapStateToProps, mapDispatchToProps)(ActivityPanelView);

export default ActivityPanel;
