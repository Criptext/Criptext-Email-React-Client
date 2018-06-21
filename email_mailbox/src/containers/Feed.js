import { connect } from 'react-redux';
import {
  markFeedAsSelected,
  muteEmail,
  removeFeedById
} from '../actions/index';
import FeedWrapperView from '../components/FeedWrapper';

const mapStateToProps = (state, ownProps) => {
  const feed = ownProps.feed;
  const { isMuted, action, emailData, contactData, seen, date } = feed;
  const { subject, threadId } = emailData;
  const { name, email } = contactData;
  const title = `${name || email} ${action}`;
  const subtitle = subject;
  return {
    isMuted,
    title,
    subtitle,
    threadId,
    seen,
    date
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  const feed = ownProps.feed;
  return {
    onSelectFeed: () => {
      dispatch(markFeedAsSelected(feed.id));
    },
    onRemoveFeed: () => {
      dispatch(removeFeedById(feed.id));
    },
    toggleMute: () => {
      const { isMuted, id } = feed.emailData;
      const emailId = String(id);
      const valueToSet = isMuted === 1 ? false : true;
      dispatch(muteEmail(emailId, valueToSet));
    }
  };
};

const Feed = connect(mapStateToProps, mapDispatchToProps)(FeedWrapperView);

export default Feed;
