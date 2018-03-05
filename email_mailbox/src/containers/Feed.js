import { connect } from 'react-redux';
import {
  markFeedAsSelected,
  muteEmailById,
  removeFeedById
} from '../actions/index';
import FeedWrapperView from '../components/FeedWrapper';

const mapStateToProps = (state, ownProps) => {
  const feed = ownProps.feed;
  const isMuted = feed.get('isMuted');
  const title = ownProps.feed.get('name') + ' ' + ownProps.feed.get('action');
  const subtitle = ownProps.feed.get('emailFeed').get('subject');
  return { isMuted, subtitle, title };
};

const mapDispatchToProps = dispatch => {
  return {
    onOpenThread: () => {
      dispatch();
    },
    onSelectFeed: feedId => {
      dispatch(markFeedAsSelected(feedId));
    },
    onRemoveFeed: feedId => {
      dispatch(removeFeedById(feedId));
    },
    toggleMute: feed => {
      dispatch(muteEmailById(feed));
    }
  };
};

const Feed = connect(mapStateToProps, mapDispatchToProps)(FeedWrapperView);

export default Feed;
