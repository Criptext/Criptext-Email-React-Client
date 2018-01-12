import { connect } from 'react-redux';
import * as actions from '../actions/index';
import ActivityPanelView from '../components/ActivityPanel';
import * as TimeUtils from '../utils/TimeUtils';
import { List } from 'immutable';


const setFeedTime = (feed, field) => {
  return feed.set(field, TimeUtils.defineTimeByToday(feed.get(field)));
}


const clasifyFeeds = feeds => {
  const newsFiltered = feeds.filter( item => item.get("state")==="new" );
  const oldsFiltered = feeds.filter( item => item.get("state")==="older" );
  const news = newsFiltered.map(newFeed => { 
    return setFeedTime(newFeed, "time");
  });
  const olds = oldsFiltered.map(oldFeed => { 
    return setFeedTime(oldFeed, "time")
  });
  return {
    newFeeds: List(news),
    oldFeeds: List(olds)
  }
}

const mapStateToProps = (state, ownProps) => {
  return clasifyFeeds(state.get('feeds'));
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
