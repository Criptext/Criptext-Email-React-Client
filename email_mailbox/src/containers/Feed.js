import { connect } from 'react-redux';
import {
  markFeedAsSelected,
  muteEmail,
  removeFeedById
} from '../actions/index';
import FeedWrapperView from '../components/FeedWrapper';

const mapStateToProps = (state, ownProps) => {
  const feed = ownProps.feed;
  const isMuted = feed.get('isMuted');
  const title = feed.get('name') + ' ' + feed.get('action');
  const subtitle = feed.get('emailFeed').get('subject');
  const emailId = feed.get('emailFeed').get('id');
  const findedThread = state
    .get('threads')
    .filter(thread => thread.get('emails').indexOf(emailId) > -1);
  const threadId = findedThread.get(0).get('id');
  return { isMuted, subtitle, title, threadId };
};

const mapDispatchToProps = dispatch => {
  return {
    onSelectFeed: feedId => {
      dispatch(markFeedAsSelected(feedId));
    },
    onRemoveFeed: feedId => {
      dispatch(removeFeedById(feedId));
    },
    toggleMute: feed => {
      const emailId = String(feed.get('emailId'));
      const valueToSet = feed.get('isMuted') === 1 ? false : true;
      dispatch(muteEmail(emailId, valueToSet));
    }
  };
};

const Feed = connect(mapStateToProps, mapDispatchToProps)(FeedWrapperView);

export default Feed;
