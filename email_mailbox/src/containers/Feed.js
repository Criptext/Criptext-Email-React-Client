import { connect } from 'react-redux';
import { muteNotifications, removeFeed, selectFeed } from '../actions/index';
import FeedWrapperView from '../components/FeedWrapper';

const mapStateToProps = (state, ownProps) => {
  const feed = ownProps.feed;
  const isMuted = feed.get('isMuted');
  const title = ownProps.feed.get('username');
  const subtitle = ownProps.feed.get('emailFeed').get('subject');
  return { isMuted, subtitle, title };
};

const mapDispatchToProps = dispatch => {
  return {
    onOpenThread: () => {
      dispatch();
    },
    onSelectFeed: feed => {
      dispatch(selectFeed(feed.get('id')));
    },
    onRemoveFeed: feedId => {
      dispatch(removeFeed(feedId));
    },
    toggleMute: emailId => {
      dispatch(muteNotifications(emailId));
    }
  };
};

const Feed = connect(mapStateToProps, mapDispatchToProps)(FeedWrapperView);

export default Feed;
