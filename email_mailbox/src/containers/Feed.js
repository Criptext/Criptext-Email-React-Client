import { connect } from 'react-redux';
import * as actions from '../actions/index';
import FeedWrapperView from '../components/FeedWrapper';
import * as TimeUtils from '../utils/TimeUtils';


const mapStateToProps = state => {
  const feeds = state.get('feeds');
  const threads = state.get('threads');
  return {
  	feeds: feeds,
  	threads: threads
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onSelectFeed: feedPos => {
      dispatch(actions.selectFeed(feedPos));
    },
    onRemoveFeed: feedId => {
      dispatch(actions.removeFeed(feedId));
    },
    toggleMute: (threadId, feedId) => {
      dispatch(actions.muteNotifications(threadId));
    }
  };
};

const Feed = connect(mapStateToProps, mapDispatchToProps)(
  FeedWrapperView
);

export default Feed;