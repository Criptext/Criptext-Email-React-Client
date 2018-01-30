import { connect } from 'react-redux';
import { muteNotifications, removeFeed, selectFeed, selectThread } from '../actions/index';
import FeedWrapperView from '../components/FeedWrapper';

const mapStateToProps = (state, ownProps) => {
  const feed = ownProps.feed;
  const threads = state.get('threads');
  const item = threads.find(
    thread => thread.get('id') === feed.get('threadId')
  );
  const isMuted = item === undefined ? false : !item.get('allowNotifications');
  return { isMuted, item };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onOpenThread: thread => {
      dispatch(selectThread(thread));
    },
    onSelectFeed: feedPos => {
      dispatch(selectFeed(feedPos));
    },
    onRemoveFeed: feedId => {
      dispatch(removeFeed(feedId));
    },
    toggleMute: threadId => {
      dispatch(muteNotifications(threadId));
    }
  };
};

const Feed = connect(mapStateToProps, mapDispatchToProps)(FeedWrapperView);

export default Feed;
