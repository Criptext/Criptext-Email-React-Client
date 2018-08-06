import { connect } from 'react-redux';
import {
  loadFeedItems,
  muteEmail,
  removeFeedItem,
  selectFeedItem
} from '../actions/index';
import FeedItemWrapperView from '../components/FeedItemWrapper';
import { loadContacts } from '../actions/contacts';

const mapStateToProps = (state, ownProps) => {
  const feed = ownProps.feed;
  const { isMuted, title, emailData, seen, date } = feed;
  const { subject, threadId } = emailData;
  const subtitle = subject;
  return {
    id: feed.id,
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
    onLoadContactData: () => {
      dispatch(loadContacts([feed.contactId]));
    },
    onSelectFeed: () => {
      dispatch(selectFeedItem(feed.id));
    },
    onRemoveFeed: () => {
      dispatch(removeFeedItem(feed.id));
    },
    toggleMute: () => {
      const { isMuted, id } = feed.emailData;
      const emailId = String(id);
      const valueToSet = isMuted === 1 ? false : true;
      dispatch(muteEmail(emailId, valueToSet)).then(() =>
        dispatch(loadFeedItems())
      );
    }
  };
};

const FeedItem = connect(
  mapStateToProps,
  mapDispatchToProps
)(FeedItemWrapperView);

export default FeedItem;
