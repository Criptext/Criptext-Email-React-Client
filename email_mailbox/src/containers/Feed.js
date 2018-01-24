import { connect } from 'react-redux';
import * as actions from '../actions/index';
import FeedWrapperView from '../components/FeedWrapper';

const mapStateToProps = (state, ownProps) => {
  const feed = ownProps.feed;
  const threads = state.get('threads');
  let isMuted = false;
  threads.forEach(thread => {
    if (thread.get('id') === feed.get('threadId')) {
      isMuted = thread.get('allowNotifications');
    }
  });
  return {
    isMuted: isMuted
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
    toggleMute: threadId => {
      dispatch(actions.muteNotifications(threadId));
    }
  };
};

const Feed = connect(mapStateToProps, mapDispatchToProps)(FeedWrapperView);

export default Feed;
